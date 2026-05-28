import type { Coordinates, ETAEstimate } from "@shuttle/shared-types";
import { haversineDistanceMeters } from "@/utils/geo.utils";

const AVERAGE_SHUTTLE_SPEED_MPS = 8.33;

export function calculateETA(
  shuttleId: string,
  stopId: string,
  shuttleLocation: Coordinates,
  stopLocation: Coordinates,
): ETAEstimate {
  const distanceMeters = haversineDistanceMeters(
    shuttleLocation.latitude,
    shuttleLocation.longitude,
    stopLocation.latitude,
    stopLocation.longitude,
  );
  const durationSeconds = Math.max(
    60,
    Math.round(distanceMeters / AVERAGE_SHUTTLE_SPEED_MPS),
  );
  const estimatedArrivalAt = new Date(
    Date.now() + durationSeconds * 1000,
  ).toISOString();

  return {
    stopId,
    shuttleId,
    estimatedArrivalAt,
    distanceMeters,
    durationSeconds,
  };
}

export function rankETAs(estimates: ETAEstimate[]): ETAEstimate[] {
  return [...estimates].sort(
    (a, b) => a.durationSeconds - b.durationSeconds,
  );
}

export function getNearestETA(
  estimates: ETAEstimate[],
): ETAEstimate | null {
  if (estimates.length === 0) {
    return null;
  }
  return rankETAs(estimates)[0] ?? null;
}
