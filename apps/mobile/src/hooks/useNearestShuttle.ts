import { useMemo } from "react";
import type { ShuttleWithDistance } from "@/types/app.types";
import {
  calculateETA,
  haversineDistance,
  sortShuttlesByDistance,
} from "@/utils/geo.utils";
import { useMapStore } from "@/store/map.store";
import { useShuttleLocations } from "@/hooks/useShuttleLocations";
import { NEARBY_SHUTTLE_RADIUS_METERS } from "@/utils/constants";

export function useNearestShuttle(): {
  nearestShuttle: ShuttleWithDistance | null;
  shuttlesWithDistance: ShuttleWithDistance[];
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  const { shuttles, isLoading, refetch } = useShuttleLocations();
  const studentLocation = useMapStore((state) => state.studentLocation);
  const activeRouteFilter = useMapStore((state) => state.activeRouteFilter);

  const shuttlesWithDistance = useMemo((): ShuttleWithDistance[] => {
    const filtered = activeRouteFilter
      ? shuttles.filter(
          (shuttle) => shuttle.route?.code === activeRouteFilter,
        )
      : shuttles;

    if (studentLocation === null) {
      return filtered.map((shuttle) => ({
        ...shuttle,
        distanceMeters: Infinity,
        etaMinutes: calculateETA(
          shuttle.location.lat,
          shuttle.location.lng,
          shuttle.location.lat,
          shuttle.location.lng,
        ),
      }));
    }

    return sortShuttlesByDistance(studentLocation, filtered)
      .map((shuttle) => {
        const distanceMeters = haversineDistance(
          studentLocation.lat,
          studentLocation.lng,
          shuttle.location.lat,
          shuttle.location.lng,
        );
        const etaMinutes = calculateETA(
          shuttle.location.lat,
          shuttle.location.lng,
          studentLocation.lat,
          studentLocation.lng,
        );

        return {
          ...shuttle,
          distanceMeters,
          etaMinutes,
        };
      })
      .filter(
        (shuttle) => shuttle.distanceMeters <= NEARBY_SHUTTLE_RADIUS_METERS,
      );
  }, [shuttles, studentLocation, activeRouteFilter]);

  const nearestShuttle = shuttlesWithDistance[0] ?? null;

  return { nearestShuttle, shuttlesWithDistance, isLoading, refetch };
}
