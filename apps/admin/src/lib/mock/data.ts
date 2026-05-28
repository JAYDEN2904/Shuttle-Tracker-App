import type { AdminDriverRow, FleetShuttleRow } from "@shuttle/database";
import type { Route, Stop } from "@shuttle/shared-types";

const timestamp = "2026-01-15T08:00:00.000Z";

export const MOCK_ADMIN_PROFILE = {
  userId: "mock-admin-001",
  email: "estates.admin@ug.edu.gh",
  name: "Estate Admin",
  avatarUrl: null as string | null,
};

export const MOCK_ROUTE_A_ID = "mock-route-a";
export const MOCK_ROUTE_B_ID = "mock-route-b";

const MOCK_ROUTES: Route[] = [
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

let mockStopsStore: Stop[] = [
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
  {
    id: "mock-stop-b-main-gate",
    routeId: MOCK_ROUTE_B_ID,
    name: "Main Gate",
    coordinates: { latitude: 5.6502, longitude: -0.1862 },
    sequenceOrder: 1,
    createdAt: timestamp,
  },
  {
    id: "mock-stop-b-medical",
    routeId: MOCK_ROUTE_B_ID,
    name: "Medical School",
    coordinates: { latitude: 5.647, longitude: -0.186 },
    sequenceOrder: 2,
    createdAt: timestamp,
  },
];

let mockDriversStore: AdminDriverRow[] = [
  {
    id: "mock-driver-001",
    name: "Kwame Boateng",
    email: "kwame.boateng@shuttle.ug.edu.gh",
    employeeId: "DRV-00142",
    shuttleId: "mock-shuttle-1",
    currentRoute: { id: MOCK_ROUTE_A_ID, name: "Main Gate Loop", code: "A" },
    isLive: true,
    tripsThisWeek: 18,
  },
  {
    id: "mock-driver-002",
    name: "Ama Osei",
    email: "ama.osei@shuttle.ug.edu.gh",
    employeeId: "DRV-00208",
    shuttleId: "mock-shuttle-2",
    currentRoute: {
      id: MOCK_ROUTE_B_ID,
      name: "Medical School Express",
      code: "B",
    },
    isLive: true,
    tripsThisWeek: 12,
  },
  {
    id: "mock-driver-003",
    name: "Kofi Mensah",
    email: "kofi.mensah@shuttle.ug.edu.gh",
    employeeId: "DRV-00315",
    shuttleId: null,
    currentRoute: null,
    isLive: false,
    tripsThisWeek: 6,
  },
];

const MOCK_SHUTTLE_PATHS = [
  {
    id: "mock-shuttle-1",
    routeId: MOCK_ROUTE_A_ID,
    plateNumber: "GR-1234-20",
    capacityStatus: "available" as const,
    driverId: "mock-driver-001",
    driverName: "Kwame Boateng",
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
    driverId: "mock-driver-002",
    driverName: "Ama Osei",
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
    driverId: null,
    driverName: null,
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

function routeMeta(routeId: string) {
  const route = MOCK_ROUTES.find((entry) => entry.id === routeId);
  if (route === undefined) {
    return null;
  }
  return {
    id: route.id,
    name: route.name,
    code: route.code,
    color: route.color,
  };
}

export function getMockAnimatedShuttles(): FleetShuttleRow[] {
  const cycleSeconds = 120;
  const progress = (Date.now() / 1000 / cycleSeconds) % 1;
  const updatedAt = new Date().toISOString();

  return MOCK_SHUTTLE_PATHS.map((shuttle, index) => {
    const shuttleProgress = (progress + index * 0.22) % 1;
    const position = getPathPosition(shuttle.path, shuttleProgress);

    return {
      id: shuttle.id,
      plateNumber: shuttle.plateNumber,
      capacityStatus: shuttle.capacityStatus,
      isLive: true,
      driverId: shuttle.driverId,
      driverName: shuttle.driverName,
      route: routeMeta(shuttle.routeId),
      location: {
        lat: position.latitude,
        lng: position.longitude,
        heading: position.heading,
        speedKmh: 16 + index * 2,
        updatedAt,
      },
    };
  });
}

export function getMockFleetOverview(): {
  liveShuttles: FleetShuttleRow[];
  activeCount: number;
  inactiveCount: number;
  allStops: Stop[];
} {
  return {
    liveShuttles: getMockAnimatedShuttles(),
    activeCount: 3,
    inactiveCount: 1,
    allStops: [...mockStopsStore],
  };
}

export function getMockAdminDrivers(): AdminDriverRow[] {
  return [...mockDriversStore];
}

export function getMockRoutes(): Route[] {
  return [...MOCK_ROUTES];
}

export function getMockStops(): Stop[] {
  return [...mockStopsStore];
}

export function getMockStudentsOnline(): number {
  return 142;
}

export function addMockDriver(input: {
  name: string;
  employeeId: string;
  routeId: string;
}): void {
  const route = MOCK_ROUTES.find((entry) => entry.id === input.routeId);
  const id = `mock-driver-${Date.now()}`;

  mockDriversStore = [
    ...mockDriversStore,
    {
      id,
      name: input.name,
      email: `driver.${input.employeeId.toLowerCase()}@shuttle.ug.edu.gh`,
      employeeId: input.employeeId,
      shuttleId: null,
      currentRoute:
        route === undefined
          ? null
          : { id: route.id, name: route.name, code: route.code },
      isLive: false,
      tripsThisWeek: 0,
    },
  ];
}

export function updateMockDriver(input: {
  driverId: string;
  name: string;
  employeeId: string;
  routeId: string;
}): void {
  const route = MOCK_ROUTES.find((entry) => entry.id === input.routeId);

  mockDriversStore = mockDriversStore.map((driver) =>
    driver.id === input.driverId
      ? {
          ...driver,
          name: input.name,
          employeeId: input.employeeId,
          currentRoute:
            route === undefined
              ? null
              : { id: route.id, name: route.name, code: route.code },
        }
      : driver,
  );
}

export function deactivateMockDriver(driverId: string): void {
  mockDriversStore = mockDriversStore.map((driver) =>
    driver.id === driverId
      ? {
          ...driver,
          isLive: false,
          shuttleId: null,
          currentRoute: null,
        }
      : driver,
  );
}

export function updateMockStopPosition(input: {
  stopId: string;
  lat: number;
  lng: number;
}): void {
  mockStopsStore = mockStopsStore.map((stop) =>
    stop.id === input.stopId
      ? {
          ...stop,
          coordinates: { latitude: input.lat, longitude: input.lng },
        }
      : stop,
  );
}

export function addMockStop(input: {
  routeId: string;
  name: string;
  lat: number;
  lng: number;
}): void {
  const routeStops = mockStopsStore.filter(
    (stop) => stop.routeId === input.routeId,
  );
  const nextSequence =
    routeStops.reduce(
      (max, stop) => Math.max(max, stop.sequenceOrder),
      0,
    ) + 1;

  mockStopsStore = [
    ...mockStopsStore,
    {
      id: `mock-stop-${Date.now()}`,
      routeId: input.routeId,
      name: input.name,
      coordinates: { latitude: input.lat, longitude: input.lng },
      sequenceOrder: nextSequence,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function removeMockStop(stopId: string): void {
  mockStopsStore = mockStopsStore.filter((stop) => stop.id !== stopId);
}
