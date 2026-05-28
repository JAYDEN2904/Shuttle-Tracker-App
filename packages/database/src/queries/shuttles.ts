import type { Shuttle } from "@shuttle/shared-types";
import type { TypedSupabaseClient } from "../client";
import type { TablesRow } from "../database.types";

type ShuttleRow = TablesRow<"shuttles">;
type ShuttleLocationRow = TablesRow<"shuttle_locations">;

interface ShuttleWithLocationRow extends ShuttleRow {
  shuttle_locations: ShuttleLocationRow | ShuttleLocationRow[] | null;
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

function mapShuttleRow(
  row: ShuttleRow,
  location: ShuttleLocationRow | null,
): Shuttle {
  return {
    id: row.id,
    routeId: row.route_id,
    driverId: row.driver_id,
    plateNumber: row.plate_number,
    capacityStatus: row.capacity_status,
    isLive: row.is_live,
    tripStartedAt: row.trip_started_at,
    createdAt: row.created_at,
    lastLocation:
      location !== null
        ? { latitude: location.lat, longitude: location.lng }
        : null,
    lastLocationAt: location?.updated_at ?? null,
    heading: location?.heading ?? null,
    speedKmh: location?.speed_kmh ?? null,
  };
}

const SHUTTLE_SELECT = `
  *,
  shuttle_locations (
    shuttle_id,
    lat,
    lng,
    heading,
    speed_kmh,
    updated_at
  )
`;

export async function getLiveShuttles(
  client: TypedSupabaseClient,
): Promise<Shuttle[]> {
  const { data, error } = await client
    .from("shuttles")
    .select(SHUTTLE_SELECT)
    .eq("is_live", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ShuttleWithLocationRow[]).map((row) =>
    mapShuttleRow(row, normalizeLocation(row.shuttle_locations)),
  );
}

export async function getShuttleById(
  client: TypedSupabaseClient,
  shuttleId: string,
): Promise<Shuttle | null> {
  const { data, error } = await client
    .from("shuttles")
    .select(SHUTTLE_SELECT)
    .eq("id", shuttleId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    return null;
  }

  const row = data as ShuttleWithLocationRow;
  return mapShuttleRow(row, normalizeLocation(row.shuttle_locations));
}

export const getActiveShuttles = getLiveShuttles;
