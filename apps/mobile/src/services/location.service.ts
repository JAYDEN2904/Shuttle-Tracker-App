import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import type { LocationSubscription } from "expo-location";
import { updateShuttleLiveStatus } from "@shuttle/database";
import type { Coordinates } from "@shuttle/shared-types";
import { getTypedSupabase } from "@/lib/supabase";
import { USE_MOCK_DATA } from "@/lib/mock";
import {
  SHUTTLE_LOCATION_TASK_NAME,
  LOCATION_UPDATE_INTERVAL_MS,
  UG_LEGON_CENTER,
} from "@/utils/constants";

export { SHUTTLE_LOCATION_TASK_NAME as TASK_NAME };

const ACTIVE_SHUTTLE_KEY = "active_shuttle_id";

export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export interface LocationPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

export async function requestForegroundPermission(): Promise<LocationPermissionResult> {
  if (USE_MOCK_DATA) {
    return { granted: true, canAskAgain: false };
  }

  const { status, canAskAgain } =
    await Location.requestForegroundPermissionsAsync();
  return { granted: status === "granted", canAskAgain };
}

export async function requestBackgroundPermission(): Promise<LocationPermissionResult> {
  if (USE_MOCK_DATA) {
    return { granted: true, canAskAgain: false };
  }

  const { status, canAskAgain } =
    await Location.requestBackgroundPermissionsAsync();
  return { granted: status === "granted", canAskAgain };
}

export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  if (USE_MOCK_DATA) {
    return { ...UG_LEGON_CENTER };
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

async function ensureLocationPermissions(): Promise<void> {
  const foreground = await requestForegroundPermission();
  if (!foreground.granted) {
    throw new PermissionDeniedError(
      "Location access is required to broadcast your shuttle. Enable location in Settings.",
    );
  }

  const background = await requestBackgroundPermission();
  if (!background.granted) {
    throw new PermissionDeniedError(
      "Background location is required so students can see you while the app is in the background. Choose “Always Allow” in Settings.",
    );
  }
}

export async function startBroadcast(shuttleId: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_SHUTTLE_KEY, shuttleId);

  if (USE_MOCK_DATA) {
    return;
  }

  await ensureLocationPermissions();

  const isRegistered = await Location.hasStartedLocationUpdatesAsync(
    SHUTTLE_LOCATION_TASK_NAME,
  );
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(SHUTTLE_LOCATION_TASK_NAME);
  }

  await Location.startLocationUpdatesAsync(SHUTTLE_LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: LOCATION_UPDATE_INTERVAL_MS,
    distanceInterval: 5,
    foregroundService: {
      notificationTitle: "Shuttle tracking active",
      notificationBody: "Broadcasting your shuttle location to students.",
    },
  });
}

export async function stopBroadcast(shuttleId: string | null): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SHUTTLE_KEY);

  if (!USE_MOCK_DATA) {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(
      SHUTTLE_LOCATION_TASK_NAME,
    );
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(SHUTTLE_LOCATION_TASK_NAME);
    }

    if (shuttleId !== null) {
      await updateShuttleLiveStatus(getTypedSupabase(), shuttleId, {
        isLive: false,
      });
    }
  }
}

function getMockMovingCoordinates(progress: number): Coordinates {
  const path = [
    UG_LEGON_CENTER,
    { latitude: 5.6514, longitude: -0.1882 },
    { latitude: 5.6528, longitude: -0.1848 },
    { latitude: 5.6502, longitude: -0.1862 },
  ];
  const segmentCount = path.length;
  const scaled = progress * segmentCount;
  const segmentIndex = Math.floor(scaled) % segmentCount;
  const nextIndex = (segmentIndex + 1) % segmentCount;
  const t = scaled - Math.floor(scaled);
  const start = path[segmentIndex] ?? UG_LEGON_CENTER;
  const end = path[nextIndex] ?? UG_LEGON_CENTER;
  return {
    latitude: start.latitude + (end.latitude - start.latitude) * t,
    longitude: start.longitude + (end.longitude - start.longitude) * t,
  };
}

export async function watchPosition(
  callback: (
    coordinates: Coordinates,
    heading: number,
    speed: number,
  ) => void,
): Promise<LocationSubscription> {
  if (USE_MOCK_DATA) {
    let progress = 0;
    callback(getMockMovingCoordinates(progress), 90, 4.5);
    const interval = setInterval(() => {
      progress = (progress + 0.05) % 1;
      callback(getMockMovingCoordinates(progress), 90, 4.5);
    }, LOCATION_UPDATE_INTERVAL_MS);
    return {
      remove: () => {
        clearInterval(interval);
      },
    };
  }

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: LOCATION_UPDATE_INTERVAL_MS,
      distanceInterval: 5,
    },
    (location) => {
      callback(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        location.coords.heading ?? 0,
        location.coords.speed ?? 0,
      );
    },
  );
}
