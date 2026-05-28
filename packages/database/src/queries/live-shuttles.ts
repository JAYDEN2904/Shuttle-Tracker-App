import type { TypedSupabaseClient } from "../client";
import type { TablesRow } from "../database.types";

type ShuttleRow = TablesRow<"shuttles">;
type ShuttleLocationRow = TablesRow<"shuttle_locations">;
type RouteRow = TablesRow<"routes">;

export interface LiveShuttleWithRoute {
  id: string;
  routeId: string | null;
  driverId: string | null;
  plateNumber: string | null;
  capacityStatus: ShuttleRow["capacity_status"];
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
  route: {
    id: string;
    name: string;
    code: string;
    color: string;
  } | null;
}

interface ShuttleWithLocationRow extends ShuttleRow {
  shuttle_locations: ShuttleLocationRow | ShuttleLocationRow[] | null;
  routes: RouteRow | RouteRow[] | null;
}

function normalizeLocation(
  location: ShuttleLocationRow | ShuttleLocationRow[] | null,
): ShuttleLocationRow | null {
  if (location === null) {
    return null;
  }
  if (Array.isArray(location)) {
    return location[0] ?? null;
  }
  return location;
}

function normalizeRoute(
  route: RouteRow | RouteRow[] | null,
): RouteRow | null {
  if (route === null) {
    return null;
  }
  if (Array.isArray(route)) {
    return route[0] ?? null;
  }
  return route;
}

function mapLiveShuttleRow(row: ShuttleWithLocationRow): LiveShuttleWithRoute | null {
  const location = normalizeLocation(row.shuttle_locations);
  if (location === null) {
    return null;
  }

  const route = normalizeRoute(row.routes);

  return {
    id: row.id,
    routeId: row.route_id,
    driverId: row.driver_id,
    plateNumber: row.plate_number,
    capacityStatus: row.capacity_status,
    isLive: row.is_live,
    tripStartedAt: row.trip_started_at,
    createdAt: row.created_at,
    location: {
      lat: location.lat,
      lng: location.lng,
      heading: location.heading,
      speedKmh: location.speed_kmh,
      updatedAt: location.updated_at,
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
}

const LIVE_SHUTTLE_SELECT = `
  *,
  shuttle_locations (
    shuttle_id,
    lat,
    lng,
    heading,
    speed_kmh,
    updated_at
  ),
  routes (
    id,
    name,
    code,
    color
  )
`;

export async function getLiveShuttlesWithRoutes(
  client: TypedSupabaseClient,
): Promise<LiveShuttleWithRoute[]> {
  const { data, error } = await client
    .from("shuttles")
    .select(LIVE_SHUTTLE_SELECT)
    .eq("is_live", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ShuttleWithLocationRow[])
    .map(mapLiveShuttleRow)
    .filter((shuttle): shuttle is LiveShuttleWithRoute => shuttle !== null);
}
