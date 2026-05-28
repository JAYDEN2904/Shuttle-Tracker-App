import { useQuery } from "@tanstack/react-query";
import { getActiveRoutes, getStopsByRoute } from "@shuttle/database";
import type { Route, Stop } from "@shuttle/shared-types";
import { supabase } from "@/lib/supabase";
import { SCHEDULE_STALE_TIME_MS } from "@/lib/query-client";
import { USE_MOCK_DATA, getMockActiveRoutes, MOCK_STOPS } from "@/lib/mock";

export interface RouteWithStops {
  route: Route;
  stops: Stop[];
}

export function useScheduleData(): {
  routesWithStops: RouteWithStops[];
  allStops: Stop[];
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: ["schedule", USE_MOCK_DATA ? "mock" : "live"],
    queryFn: async (): Promise<RouteWithStops[]> => {
      if (USE_MOCK_DATA) {
        const routes = getMockActiveRoutes();
        return routes.map((route) => ({
          route,
          stops: MOCK_STOPS.filter((stop) => stop.routeId === route.id).sort(
            (left, right) => left.sequenceOrder - right.sequenceOrder,
          ),
        }));
      }

      const routes = await getActiveRoutes(supabase);
      return Promise.all(
        routes.map(async (route) => ({
          route,
          stops: await getStopsByRoute(supabase, route.id),
        })),
      );
    },
    staleTime: SCHEDULE_STALE_TIME_MS,
  });

  const routesWithStops = query.data ?? [];
  const allStops = routesWithStops.flatMap((entry) => entry.stops);

  return {
    routesWithStops,
    allStops,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
