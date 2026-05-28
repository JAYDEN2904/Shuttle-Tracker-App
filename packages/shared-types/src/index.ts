export type UserRole = "student" | "driver" | "admin";

export type CapacityStatus = "available" | "half_full" | "full";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  employeeId: string | null;
  avatarUrl: string | null;
  expoPushToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  color: string;
  isActive: boolean;
  operatingStart: string;
  operatingEnd: string;
  frequencyPeakMins: number | null;
  frequencyOffpeakMins: number | null;
  createdAt: string;
}

export interface Stop {
  id: string;
  routeId: string;
  name: string;
  coordinates: Coordinates;
  sequenceOrder: number;
  createdAt: string;
}

export interface Shuttle {
  id: string;
  routeId: string | null;
  driverId: string | null;
  plateNumber: string | null;
  capacityStatus: CapacityStatus;
  isLive: boolean;
  tripStartedAt: string | null;
  createdAt: string;
  lastLocation: Coordinates | null;
  lastLocationAt: string | null;
  heading: number | null;
  speedKmh: number | null;
}

export interface ShuttleLocationUpdate {
  shuttleId: string;
  coordinates: Coordinates;
  heading: number;
  speedKmh: number;
  updatedAt: string;
}

export interface StopAlert {
  id: string;
  studentId: string;
  stopId: string;
  shuttleId: string;
  notifyAt: string;
  isSent: boolean;
  createdAt: string;
}

export interface Trip {
  id: string;
  shuttleId: string | null;
  routeId: string | null;
  driverId: string | null;
  startedAt: string;
  endedAt: string | null;
  distanceKm: number | null;
}

export interface ETAEstimate {
  stopId: string;
  shuttleId: string;
  estimatedArrivalAt: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface DriverSession {
  id: string;
  driverId: string;
  shuttleId: string;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
