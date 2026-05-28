import type { ShuttleWithLocation } from "@/types/app.types";
import type { Route, Shuttle, Stop, StopAlert } from "@shuttle/shared-types";
import { MOCK_DRIVER_PROFILE, MOCK_STUDENT_PROFILE } from "@/lib/mock/profiles";

const timestamp = "2026-01-15T08:00:00.000Z";
const UG_FALLBACK = { lat: 5.6508, lng: -0.187 };

export const MOCK_ROUTE_A_ID = "mock-route-a";
export const MOCK_ROUTE_B_ID = "mock-route-b";

export const MOCK_ROUTES = [
  {
    id: MOCK_ROUTE_A_ID,
    name: "Main Gate Loop",
    code: "A",
    color: "#2563EB",
  },
  {
    id: MOCK_ROUTE_B_ID,
    name: "Medical School Express",
    code: "B",
    color: "#12B95A",
  },
] as const;

export const MOCK_SCHEDULE_ROUTES: Route[] = [
  {
    id: MOCK_ROUTE_A_ID,
    name: "Main Gate Loop",
    code: "A",
    color: "#2563EB",
    isActive: true,
    operatingStart: "06:30",
    operatingEnd: "22:00",
    frequencyPeakMins: 8,
    frequencyOffpeakMins: 15,
    createdAt: timestamp,
  },
  {
    id: MOCK_ROUTE_B_ID,
    name: "Medical School Express",
    code: "B",
    color: "#12B95A",
    isActive: true,
    operatingStart: "07:00",
    operatingEnd: "20:00",
    frequencyPeakMins: 10,
    frequencyOffpeakMins: 20,
    createdAt: timestamp,
  },
];

export const MOCK_STOPS: Stop[] = [
  {
    id: "mock-stop-main-gate",
    routeId: MOCK_ROUTE_A_ID,
    name: "Main Gate",
    coordinates: { latitude: 5.6502, longitude: -0.1862 },
    sequenceOrder: 1,
    createdAt: timestamp,
  },
  {
    id: "mock-stop-balme",
    routeId: MOCK_ROUTE_A_ID,
    name: "Balme Library",
    coordinates: { latitude: 5.6514, longitude: -0.1882 },
    sequenceOrder: 2,
    createdAt: timestamp,
  },
  {
    id: "mock-stop-sarbah",
    routeId: MOCK_ROUTE_A_ID,
    name: "Mensah Sarbah Hall",
    coordinates: { latitude: 5.6528, longitude: -0.1848 },
    sequenceOrder: 3,
    createdAt: timestamp,
  },
  {
    id: "mock-stop-volta",
    routeId: MOCK_ROUTE_A_ID,
    name: "Volta Hall",
    coordinates: { latitude: 5.6501, longitude: -0.182 },
    sequenceOrder: 4,
    createdAt: timestamp,
  },
  {
    id: "mock-stop-science",
    routeId: MOCK_ROUTE_A_ID,
    name: "Science Block",
    coordinates: { latitude: 5.6482, longitude: -0.1835 },
    sequenceOrder: 5,
    createdAt: timestamp,
  },
  {
    id: "mock-stop-medical",
    routeId: MOCK_ROUTE_A_ID,
    name: "Medical School",
    coordinates: { latitude: 5.647, longitude: -0.186 },
    sequenceOrder: 6,
    createdAt: timestamp,
  },
];

const MOCK_SHUTTLE_PATHS = [
  {
    id: "mock-shuttle-1",
    routeId: MOCK_ROUTE_A_ID,
    plateNumber: "GR-1234-20",
    capacityStatus: "available" as const,
    path: [
      { latitude: 5.6514, longitude: -0.1882 },
      { latitude: 5.6528, longitude: -0.1848 },
      { latitude: 5.6501, longitude: -0.182 },
      { latitude: 5.6482, longitude: -0.1835 },
    ],
  },
  {
    id: "mock-shuttle-2",
    routeId: MOCK_ROUTE_B_ID,
    plateNumber: "GR-5678-21",
    capacityStatus: "half_full" as const,
    path: [
      { latitude: 5.6502, longitude: -0.1862 },
      { latitude: 5.6528, longitude: -0.1848 },
      { latitude: 5.647, longitude: -0.186 },
      { latitude: 5.6502, longitude: -0.1862 },
    ],
  },
  {
    id: "mock-shuttle-3",
    routeId: MOCK_ROUTE_A_ID,
    plateNumber: "GR-9012-22",
    capacityStatus: "available" as const,
    path: [
      { latitude: 5.6482, longitude: -0.1835 },
      { latitude: 5.647, longitude: -0.186 },
      { latitude: 5.6502, longitude: -0.1862 },
      { latitude: 5.6514, longitude: -0.1882 },
    ],
  },
];

function getPathPosition(
  path: Array<{ latitude: number; longitude: number }>,
  progress: number,
): { latitude: number; longitude: number; heading: number } {
  if (path.length === 0) {
    return { latitude: 5.6508, longitude: -0.187, heading: 0 };
  }

  const segmentCount = path.length;
  const scaledProgress = progress * segmentCount;
  const segmentIndex = Math.floor(scaledProgress) % segmentCount;
  const nextIndex = (segmentIndex + 1) % segmentCount;
  const segmentProgress = scaledProgress - Math.floor(scaledProgress);

  const start = path[segmentIndex];
  const end = path[nextIndex];

  if (start === undefined || end === undefined) {
    return { latitude: 5.6508, longitude: -0.187, heading: 0 };
  }

  const latitude =
    start.latitude + (end.latitude - start.latitude) * segmentProgress;
  const longitude =
    start.longitude + (end.longitude - start.longitude) * segmentProgress;

  const heading =
    (Math.atan2(
      end.longitude - start.longitude,
      end.latitude - start.latitude,
    ) *
      180) /
    Math.PI;

  return { latitude, longitude, heading: (heading + 360) % 360 };
}

export function getMockLiveShuttles(): ShuttleWithLocation[] {
  return getMockShuttles().map((shuttle) => {
    const route =
      MOCK_ROUTES.find((entry) => entry.id === shuttle.routeId) ?? null;

    return {
      id: shuttle.id,
      routeId: shuttle.routeId,
      driverId: shuttle.driverId,
      plateNumber: shuttle.plateNumber,
      capacityStatus: shuttle.capacityStatus,
      isLive: shuttle.isLive,
      tripStartedAt: shuttle.tripStartedAt,
      createdAt: shuttle.createdAt,
      location: {
        lat: shuttle.lastLocation?.latitude ?? UG_FALLBACK.lat,
        lng: shuttle.lastLocation?.longitude ?? UG_FALLBACK.lng,
        heading: shuttle.heading,
        speedKmh: shuttle.speedKmh,
        updatedAt: shuttle.lastLocationAt ?? new Date().toISOString(),
      },
      route:
        route === null
          ? null
          : {
              id: route.id,
              name: route.name,
              code: route.code,
              color: route.color,
            },
    };
  });
}

/** @deprecated Use getMockLiveShuttles for map views. */
export function getMockShuttles(): Shuttle[] {
  const cycleSeconds = 120;
  const progress = (Date.now() / 1000 / cycleSeconds) % 1;
  const updatedAt = new Date().toISOString();

  return MOCK_SHUTTLE_PATHS.map((shuttle, index) => {
    const shuttleProgress = (progress + index * 0.22) % 1;
    const position = getPathPosition(shuttle.path, shuttleProgress);

    return {
      id: shuttle.id,
      routeId: shuttle.routeId,
      driverId: shuttle.id === "mock-shuttle-1" ? MOCK_DRIVER_PROFILE.id : null,
      plateNumber: shuttle.plateNumber,
      capacityStatus: shuttle.capacityStatus,
      isLive: true,
      tripStartedAt: timestamp,
      createdAt: timestamp,
      lastLocation: {
        latitude: position.latitude,
        longitude: position.longitude,
      },
      lastLocationAt: updatedAt,
      heading: position.heading,
      speedKmh: 16 + index * 2,
    };
  });
}

export function getMockStopById(stopId: string): Stop | null {
  return MOCK_STOPS.find((stop) => stop.id === stopId) ?? null;
}

export function getMockStopName(stopId: string): string {
  return getMockStopById(stopId)?.name ?? "Campus stop";
}

const notifySoon = (): string =>
  new Date(Date.now() + 12 * 60 * 1000).toISOString();
const notifyLater = (): string =>
  new Date(Date.now() + 45 * 60 * 1000).toISOString();
const sentAt = (): string =>
  new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

let mockAlertsStore: StopAlert[] = [
  {
    id: "mock-alert-1",
    studentId: MOCK_STUDENT_PROFILE.id,
    stopId: "mock-stop-balme",
    shuttleId: "mock-shuttle-1",
    notifyAt: notifySoon(),
    isSent: false,
    createdAt: timestamp,
  },
  {
    id: "mock-alert-2",
    studentId: MOCK_STUDENT_PROFILE.id,
    stopId: "mock-stop-sarbah",
    shuttleId: "mock-shuttle-2",
    notifyAt: notifyLater(),
    isSent: false,
    createdAt: timestamp,
  },
  {
    id: "mock-alert-3",
    studentId: MOCK_STUDENT_PROFILE.id,
    stopId: "mock-stop-main-gate",
    shuttleId: "mock-shuttle-3",
    notifyAt: sentAt(),
    isSent: true,
    createdAt: timestamp,
  },
];

export function getMockAlerts(stopId?: string): StopAlert[] {
  if (stopId === undefined) {
    return [...mockAlertsStore];
  }

  return mockAlertsStore.filter((alert) => alert.stopId === stopId);
}

export function addMockStopAlert(input: {
  stopId: string;
  shuttleId: string;
  notifyAt: string;
}): StopAlert {
  const existing = mockAlertsStore.find(
    (alert) =>
      alert.stopId === input.stopId &&
      alert.shuttleId === input.shuttleId &&
      !alert.isSent,
  );

  if (existing !== undefined) {
    return existing;
  }

  const alert: StopAlert = {
    id: `mock-alert-${Date.now()}`,
    studentId: MOCK_STUDENT_PROFILE.id,
    stopId: input.stopId,
    shuttleId: input.shuttleId,
    notifyAt: input.notifyAt,
    isSent: false,
    createdAt: new Date().toISOString(),
  };

  mockAlertsStore = [...mockAlertsStore, alert];
  return alert;
}

export function removeMockStopAlert(alertId: string): void {
  mockAlertsStore = mockAlertsStore.filter((alert) => alert.id !== alertId);
}

export function getMockActiveRoutes(): Route[] {
  return MOCK_SCHEDULE_ROUTES;
}

export const MOCK_DRIVER_SHUTTLE_ID = "mock-shuttle-1";
