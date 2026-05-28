import type { Route, Stop } from "@shuttle/shared-types";
import type { TypedSupabaseClient } from "../client";
import type { TablesRow } from "../database.types";

type RouteRow = TablesRow<"routes">;
type StopRow = TablesRow<"stops">;

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

export interface AdminDriverRow {
  id: string;
  name: string | null;
  email: string;
  employeeId: string | null;
  shuttleId: string | null;
  currentRoute: { id: string; name: string; code: string } | null;
  isLive: boolean;
  tripsThisWeek: number;
}

export interface FleetShuttleRow {
  id: string;
  plateNumber: string | null;
  capacityStatus: TablesRow<"shuttles">["capacity_status"];
  isLive: boolean;
  driverName: string | null;
  driverId: string | null;
  route: { id: string; name: string; code: string; color: string } | null;
  location: {
    lat: number;
    lng: number;
    heading: number | null;
    speedKmh: number | null;
    updatedAt: string;
  } | null;
}

function startOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

export async function getAdminDrivers(
  client: TypedSupabaseClient,
): Promise<AdminDriverRow[]> {
  const weekStart = startOfWeekIso();

  const { data: drivers, error: driversError } = await client
    .from("profiles")
    .select("*")
    .eq("role", "driver")
    .order("name", { ascending: true });

  if (driversError) {
    throw new Error(driversError.message);
  }

  const { data: shuttles, error: shuttlesError } = await client
    .from("shuttles")
    .select("id, driver_id, route_id, is_live, routes(id, name, code)")
    .not("driver_id", "is", null);

  if (shuttlesError) {
    throw new Error(shuttlesError.message);
  }

  const { data: trips, error: tripsError } = await client
    .from("trips")
    .select("driver_id")
    .gte("started_at", weekStart);

  if (tripsError) {
    throw new Error(tripsError.message);
  }

  const shuttleByDriver = new Map<
    string,
    {
      shuttleId: string;
      isLive: boolean;
      route: { id: string; name: string; code: string } | null;
    }
  >();

  for (const shuttle of shuttles ?? []) {
    if (shuttle.driver_id === null) {
      continue;
    }

    const routeData = shuttle.routes;
    const route = Array.isArray(routeData) ? routeData[0] : routeData;

    shuttleByDriver.set(shuttle.driver_id, {
      shuttleId: shuttle.id,
      isLive: shuttle.is_live,
      route:
        route === null || route === undefined
          ? null
          : { id: route.id, name: route.name, code: route.code },
    });
  }

  const tripCounts = new Map<string, number>();
  for (const trip of trips ?? []) {
    if (trip.driver_id === null) {
      continue;
    }
    tripCounts.set(trip.driver_id, (tripCounts.get(trip.driver_id) ?? 0) + 1);
  }

  return (drivers ?? []).map((driver) => {
    const assignment = shuttleByDriver.get(driver.id);
    return {
      id: driver.id,
      name: driver.name,
      email: driver.email,
      employeeId: driver.employee_id,
      shuttleId: assignment?.shuttleId ?? null,
      currentRoute: assignment?.route ?? null,
      isLive: assignment?.isLive ?? false,
      tripsThisWeek: tripCounts.get(driver.id) ?? 0,
    };
  });
}

export async function getFleetOverview(
  client: TypedSupabaseClient,
): Promise<{
  liveShuttles: FleetShuttleRow[];
  activeCount: number;
  inactiveCount: number;
  allStops: Stop[];
}> {
  const { data, error } = await client
    .from("shuttles")
    .select(
      `
      id,
      plate_number,
      capacity_status,
      is_live,
      driver_id,
      profiles!driver_id ( name ),
      routes ( id, name, code, color ),
      shuttle_locations ( lat, lng, heading, speed_kmh, updated_at )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const liveShuttles: FleetShuttleRow[] = [];
  let activeCount = 0;
  let inactiveCount = 0;

  for (const row of data ?? []) {
    if (row.is_live) {
      activeCount += 1;
    } else {
      inactiveCount += 1;
    }

    if (!row.is_live) {
      continue;
    }

    const locationData = row.shuttle_locations;
    const location = Array.isArray(locationData)
      ? locationData[0]
      : locationData;
    const routeData = row.routes;
    const route = Array.isArray(routeData) ? routeData[0] : routeData;
    const profileData = row.profiles;
    const profile = Array.isArray(profileData) ? profileData[0] : profileData;

    liveShuttles.push({
      id: row.id,
      plateNumber: row.plate_number,
      capacityStatus: row.capacity_status,
      isLive: row.is_live,
      driverId: row.driver_id,
      driverName: profile?.name ?? null,
      route:
        route === null || route === undefined
          ? null
          : {
              id: route.id,
              name: route.name,
              code: route.code,
              color: route.color,
            },
      location:
        location === null || location === undefined
          ? null
          : {
              lat: location.lat,
              lng: location.lng,
              heading: location.heading,
              speedKmh: location.speed_kmh,
              updatedAt: location.updated_at,
            },
    });
  }

  const { data: stopRows, error: stopsError } = await client
    .from("stops")
    .select("*")
    .order("sequence_order", { ascending: true });

  if (stopsError) {
    throw new Error(stopsError.message);
  }

  return {
    liveShuttles,
    activeCount,
    inactiveCount,
    allStops: (stopRows ?? []).map(mapStopRow),
  };
}

export async function getAllRoutes(
  client: TypedSupabaseClient,
): Promise<Route[]> {
  const { data, error } = await client
    .from("routes")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRouteRow);
}

export async function getStopsForRouteAdmin(
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

  return (data ?? []).map(mapStopRow);
}
