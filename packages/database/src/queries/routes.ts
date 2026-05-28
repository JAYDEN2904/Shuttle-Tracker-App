import type { Route } from "@shuttle/shared-types";
import type { TypedSupabaseClient } from "../client";
import type { TablesRow } from "../database.types";
import { ROUTE_COLUMNS } from "../select-columns";

type RouteRow = TablesRow<"routes">;

function mapRouteRow(row: RouteRow): Route {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    color: row.color,
    isActive: row.is_active,
    operatingStart: row.operating_start,
    operatingEnd: row.operating_end,
    frequencyPeakMins: row.frequency_peak_mins,
    frequencyOffpeakMins: row.frequency_offpeak_mins,
    createdAt: row.created_at,
  };
}

export async function getActiveRoutes(
  client: TypedSupabaseClient,
): Promise<Route[]> {
  const { data, error } = await client
    .from("routes")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapRouteRow);
}

export async function getRouteById(
  client: TypedSupabaseClient,
  routeId: string,
): Promise<Route | null> {
  const { data, error } = await client
    .from("routes")
    .select(ROUTE_COLUMNS)
    .eq("id", routeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    return null;
  }

  return mapRouteRow(data);
}
