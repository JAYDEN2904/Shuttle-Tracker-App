export {
  createDatabaseClient,
  createTypedSupabaseClient,
  getTypedSupabase,
  initializeSupabase,
  supabase,
  type DatabaseClient,
  type DatabaseClientOptions,
  type SupabaseClientConfig,
  type TypedSupabaseClient,
} from "./client";
export type {
  CapacityStatus,
  Database,
  Json,
  Profile,
  Route,
  Shuttle,
  ShuttleLocation,
  Stop,
  StopAlert,
  TablesInsert,
  TablesRow,
  TablesUpdate,
  Trip,
  UserRole,
} from "./database.types";
export { getLiveShuttles, getShuttleById } from "./queries/shuttles";
export { getLiveShuttlesWithRoutes } from "./queries/live-shuttles";
export type { LiveShuttleWithRoute } from "./queries/live-shuttles";
export { getActiveRoutes, getRouteById } from "./queries/routes";
export { getStopsByRoute, getStopById } from "./queries/stops";
export { getProfileById, getProfilesByRole } from "./queries/profiles";
export {
  getAdminDrivers,
  getAllRoutes,
  getFleetOverview,
  getStopsForRouteAdmin,
} from "./queries/admin";
export type { AdminDriverRow, FleetShuttleRow } from "./queries/admin";
export { upsertShuttleLocation, updateShuttleLiveStatus } from "./queries/shuttle-locations";
export {
  PROFILE_COLUMNS,
  ROUTE_COLUMNS,
  STOP_ALERT_COLUMNS,
  STOP_COLUMNS,
} from "./select-columns";
