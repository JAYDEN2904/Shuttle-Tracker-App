import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStopById } from "@shuttle/database";
import type { ShuttleWithLocation, StopETAEntry } from "@/types/app.types";
import { supabase } from "@/lib/supabase";
import { ROUTES_STALE_TIME_MS } from "@/lib/query-client";
import { handleSupabaseError } from "@/lib/supabase-errors";
import { USE_MOCK_DATA, getMockStopById } from "@/lib/mock";
import { calculateETA, haversineDistance } from "@/utils/geo.utils";

function shuttlePositionKey(shuttles: ShuttleWithLocation[]): string {
  return shuttles
    .map(
      (shuttle) =>
        `${shuttle.id}:${shuttle.location.lat.toFixed(5)},${shuttle.location.lng.toFixed(5)}`,
    )
    .join("|");
}

export function useStopETA(
  stopId: string | null,
  shuttles: ShuttleWithLocation[],
): StopETAEntry[] {
  const stopQuery = useQuery({
    queryKey: ["stop", stopId, USE_MOCK_DATA ? "mock" : "live"],
    queryFn: () =>
      stopId === null
        ? Promise.resolve(null)
        : USE_MOCK_DATA
          ? Promise.resolve(getMockStopById(stopId))
          : getStopById(supabase, stopId),
    enabled: stopId !== null,
    staleTime: ROUTES_STALE_TIME_MS,
  });

  const shuttlePositionsKey = shuttlePositionKey(shuttles);

  return useMemo((): StopETAEntry[] => {
    const stop = stopQuery.data;
    if (stop === null || stop === undefined || stopId === null) {
      return [];
    }

    const stopLat = stop.coordinates.latitude;
    const stopLng = stop.coordinates.longitude;

    return shuttles
      .map((shuttle) => {
        const distanceMetres = haversineDistance(
          shuttle.location.lat,
          shuttle.location.lng,
          stopLat,
          stopLng,
        );
        const etaMinutes = calculateETA(
          shuttle.location.lat,
          shuttle.location.lng,
          stopLat,
          stopLng,
        );

        return {
          shuttle,
          etaMinutes,
          distanceMetres,
        };
      })
      .sort((left, right) => left.etaMinutes - right.etaMinutes);
  }, [stopQuery.data, stopId, shuttlePositionsKey, shuttles]);
}
