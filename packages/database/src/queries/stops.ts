import type { Stop } from "@shuttle/shared-types";
import type { TypedSupabaseClient } from "../client";
import type { TablesRow } from "../database.types";
import { STOP_COLUMNS } from "../select-columns";

type StopRow = TablesRow<"stops">;

function mapStopRow(row: StopRow): Stop {
  return {
    id: row.id,
    routeId: row.route_id,
    name: row.name,
    coordinates: { latitude: row.lat, longitude: row.lng },
    sequenceOrder: row.sequence_order,
    createdAt: row.created_at,
  };
}

export async function getStopsByRoute(
  client: TypedSupabaseClient,
  routeId: string,
): Promise<Stop[]> {
  const { data, error } = await client
    .from("stops")
    .select("*")
    .eq("route_id", routeId)
    .order("sequence_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapStopRow);
}

export async function getStopById(
  client: TypedSupabaseClient,
  stopId: string,
): Promise<Stop | null> {
  const { data, error } = await client
    .from("stops")
    .select(STOP_COLUMNS)
    .eq("id", stopId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    return null;
  }

  return mapStopRow(data);
}
