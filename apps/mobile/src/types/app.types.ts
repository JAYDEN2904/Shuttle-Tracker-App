import type {
  AuthSession,
  CapacityStatus,
  Coordinates,
  Stop,
  StopAlert,
  UserRole,
} from "@shuttle/shared-types";

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ShuttleRouteInfo {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface ShuttleWithLocation {
  id: string;
  routeId: string | null;
  driverId: string | null;
  plateNumber: string | null;
  capacityStatus: CapacityStatus;
  isLive: boolean;
  tripStartedAt: string | null;
  createdAt: string;
  location: {
    lat: number;
    lng: number;
    heading: number | null;
    speedKmh: number | null;
    updatedAt: string;
  };
  route: ShuttleRouteInfo | null;
}

export interface ShuttleWithDistance extends ShuttleWithLocation {
  distanceMeters: number;
  etaMinutes: number;
}

export interface StopETAEntry {
  shuttle: ShuttleWithLocation;
  etaMinutes: number;
  distanceMetres: number;
}

export interface StopWithAlerts extends Stop {
  alerts: StopAlert[];
}

export interface AuthState {
  session: AuthSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
}

export interface DriverBroadcastPayload {
  shuttleId: string;
  coordinates: Coordinates;
  heading: number;
  speed: number;
  occupancy: number;
  recordedAt: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data: Record<string, string>;
}

export type SheetSnapPoint = "collapsed" | "half" | "expanded";

export interface AppTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}
