import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStopsByRoute } from "@shuttle/database";
import type { Stop } from "@shuttle/shared-types";
import { getTypedSupabase } from "@/lib/supabase";
import { MOCK_STOPS, USE_MOCK_DATA } from "@/lib/mock";
import { useDriverStore } from "@/store/driver.store";
import { haversineDistance } from "@/utils/geo.utils";
import { formatDistance } from "@/utils/format.utils";

export interface DriverNextStopInfo {
  stop: Stop;
  distanceMeters: number;
  distanceLabel: string;
}

function findNextStop(
  stops: Stop[],
  lat: number | null,
  lng: number | null,
): DriverNextStopInfo | null {
  if (stops.length === 0) {
    return null;
  }

  const sorted = [...stops].sort(
    (left, right) => left.sequenceOrder - right.sequenceOrder,
  );

  if (lat === null || lng === null) {
    const first = sorted[0];
    return first === undefined
      ? null
      : {
          stop: first,
          distanceMeters: 0,
          distanceLabel: "—",
        };
  }

  let nearestAhead: Stop | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const stop of sorted) {
    const distance = haversineDistance(
      lat,
      lng,
      stop.coordinates.latitude,
      stop.coordinates.longitude,
    );
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestAhead = stop;
    }
  }

  if (nearestAhead === null) {
    return null;
  }

  return {
    stop: nearestAhead,
    distanceMeters: nearestDistance,
    distanceLabel: formatDistance(nearestDistance),
  };
}

export function useDriverNextStop() {
  const routeId = useDriverStore((state) => state.currentRouteId);
  const lat = useDriverStore((state) => state.currentLat);
  const lng = useDriverStore((state) => state.currentLng);

  const stopsQuery = useQuery({
    queryKey: ["driver-route-stops", routeId],
    enabled: routeId !== null,
    queryFn: async () => {
      if (routeId === null) {
        return [];
      }
      if (USE_MOCK_DATA) {
        return MOCK_STOPS.filter((stop) => stop.routeId === routeId);
      }
      return getStopsByRoute(getTypedSupabase(), routeId);
    },
  });

  return useMemo(
    () => findNextStop(stopsQuery.data ?? [], lat, lng),
    [stopsQuery.data, lat, lng],
  );
}
