import { useQuery } from "@tanstack/react-query";
import { getActiveRoutes, getStopsByRoute } from "@shuttle/database";
import type { Route } from "@shuttle/shared-types";
import { getTypedSupabase } from "@/lib/supabase";
import { ROUTES_STALE_TIME_MS } from "@/lib/query-client";
import { MOCK_SCHEDULE_ROUTES, MOCK_STOPS, USE_MOCK_DATA } from "@/lib/mock";

export interface DriverRouteOption extends Route {
  stopsCount: number;
  durationLabel: string;
}

function estimateDurationLabel(stopsCount: number): string {
  const minutes = Math.max(stopsCount * 4, 12);
  return `~${minutes} min`;
}

async function fetchDriverRoutes(): Promise<DriverRouteOption[]> {
  if (USE_MOCK_DATA) {
    return MOCK_SCHEDULE_ROUTES.map((route) => {
      const stopsCount = MOCK_STOPS.filter((stop) => stop.routeId === route.id)
        .length;
      return {
        ...route,
        stopsCount,
        durationLabel: estimateDurationLabel(stopsCount),
      };
    });
  }

  const client = getTypedSupabase();
  const routes = await getActiveRoutes(client);

  return Promise.all(
    routes.map(async (route) => {
      const stops = await getStopsByRoute(client, route.id);
      return {
        ...route,
        stopsCount: stops.length,
        durationLabel: estimateDurationLabel(stops.length),
      };
    }),
  );
}

export function useDriverRoutes() {
  return useQuery({
    queryKey: ["driver-routes"],
    queryFn: fetchDriverRoutes,
    staleTime: ROUTES_STALE_TIME_MS,
  });
}
