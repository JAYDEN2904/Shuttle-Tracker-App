import "@/lib/supabase";
import "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { upsertShuttleLocation } from "@shuttle/database";
import { getTypedSupabase } from "@/lib/supabase";
import { USE_MOCK_DATA } from "@/lib/mock";
import {
  SHUTTLE_LOCATION_TASK_NAME,
  LOCATION_UPDATE_INTERVAL_MS,
} from "@/utils/constants";

const ACTIVE_SHUTTLE_KEY = "active_shuttle_id";
const PENDING_LOCATIONS_KEY = "pending_shuttle_locations";
const MAX_RETRIES = 3;

interface PendingLocationRow {
  shuttleId: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  updatedAt: string;
  retries: number;
}

async function readPendingQueue(): Promise<PendingLocationRow[]> {
  const raw = await AsyncStorage.getItem(PENDING_LOCATIONS_KEY);
  if (raw === null) {
    return [];
  }
  try {
    return JSON.parse(raw) as PendingLocationRow[];
  } catch {
    return [];
  }
}

async function writePendingQueue(rows: PendingLocationRow[]): Promise<void> {
  await AsyncStorage.setItem(PENDING_LOCATIONS_KEY, JSON.stringify(rows));
}

async function flushPendingQueue(): Promise<void> {
  if (USE_MOCK_DATA) {
    return;
  }

  const queue = await readPendingQueue();
  if (queue.length === 0) {
    return;
  }

  const client = getTypedSupabase();
  const remaining: PendingLocationRow[] = [];

  for (const row of queue) {
    try {
      await upsertShuttleLocation(client, {
        shuttleId: row.shuttleId,
        lat: row.lat,
        lng: row.lng,
        heading: row.heading,
        speedKmh: row.speedKmh,
        updatedAt: row.updatedAt,
      });
    } catch {
      if (row.retries < MAX_RETRIES) {
        remaining.push({ ...row, retries: row.retries + 1 });
      }
    }
  }

  await writePendingQueue(remaining);
}

async function cacheLocation(row: PendingLocationRow): Promise<void> {
  const queue = await readPendingQueue();
  queue.push(row);
  await writePendingQueue(queue.slice(-20));
}

async function resolveBatteryLevel(): Promise<number | null> {
  try {
    const Battery = await import("expo-battery");
    const level = await Battery.getBatteryLevelAsync();
    return Math.round(level * 100);
  } catch {
    return null;
  }
}

function resolveAccuracy(batteryPercent: number | null): Location.Accuracy {
  if (batteryPercent !== null && batteryPercent < 15) {
    return Location.Accuracy.Balanced;
  }
  return Location.Accuracy.High;
}

TaskManager.defineTask(
  SHUTTLE_LOCATION_TASK_NAME,
  async ({ data, error }) => {
    if (error !== null) {
      return;
    }

    if (USE_MOCK_DATA) {
      return;
    }

    const shuttleId = await AsyncStorage.getItem(ACTIVE_SHUTTLE_KEY);
    if (shuttleId === null) {
      return;
    }

    const locations = (data as { locations?: Location.LocationObject[] })
      ?.locations;
    const latest = locations?.[locations.length - 1];
    if (latest === undefined) {
      return;
    }

    await flushPendingQueue();

    const batteryLevel = await resolveBatteryLevel();
    const accuracy = resolveAccuracy(batteryLevel);
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      SHUTTLE_LOCATION_TASK_NAME,
    );
    if (isRunning && batteryLevel !== null && batteryLevel < 15) {
      await Location.stopLocationUpdatesAsync(SHUTTLE_LOCATION_TASK_NAME);
      await Location.startLocationUpdatesAsync(SHUTTLE_LOCATION_TASK_NAME, {
        accuracy,
        timeInterval: LOCATION_UPDATE_INTERVAL_MS,
        distanceInterval: 5,
        foregroundService: {
          notificationTitle: "Shuttle tracking active",
          notificationBody: "Broadcasting your shuttle location to students.",
        },
      });
    }

    const speedKmh = Math.max(0, (latest.coords.speed ?? 0) * 3.6);
    const row: PendingLocationRow = {
      shuttleId,
      lat: latest.coords.latitude,
      lng: latest.coords.longitude,
      heading: latest.coords.heading ?? 0,
      speedKmh,
      updatedAt: new Date().toISOString(),
      retries: 0,
    };

    try {
      await upsertShuttleLocation(getTypedSupabase(), {
        shuttleId: row.shuttleId,
        lat: row.lat,
        lng: row.lng,
        heading: row.heading,
        speedKmh: row.speedKmh,
        updatedAt: row.updatedAt,
      });
    } catch {
      await cacheLocation(row);
    }
  },
);
