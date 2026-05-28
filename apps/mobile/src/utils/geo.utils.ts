import type { LatLng, ShuttleWithLocation } from "@/types/app.types";

const EARTH_RADIUS_METERS = 6371000;
const DEFAULT_CAMPUS_SPEED_KMH = 25;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function normalizeLongitudeDelta(lng1: number, lng2: number): number {
  let delta = lng2 - lng1;
  if (delta > 180) {
    delta -= 360;
  }
  if (delta < -180) {
    delta += 360;
  }
  return delta;
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(normalizeLongitudeDelta(lng1, lng2));
  const originLat = toRadians(lat1);
  const targetLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLat) *
      Math.cos(targetLat) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const clamped = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));
  return EARTH_RADIUS_METERS * c;
}

/** @deprecated Use haversineDistance — kept for existing call sites. */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return haversineDistance(lat1, lon1, lat2, lon2);
}

export function calculateETA(
  shuttleLat: number,
  shuttleLng: number,
  stopLat: number,
  stopLng: number,
  avgSpeedKmh: number = DEFAULT_CAMPUS_SPEED_KMH,
): number {
  const distanceMeters = haversineDistance(
    shuttleLat,
    shuttleLng,
    stopLat,
    stopLng,
  );

  if (distanceMeters === 0) {
    return 0;
  }

  const speedMetersPerMinute = Math.max(avgSpeedKmh * 1000, 1) / 60;
  return distanceMeters / speedMetersPerMinute;
}

export function interpolatePosition(
  from: LatLng,
  to: LatLng,
  progress: number,
): LatLng {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  if (clampedProgress === 0) {
    return { lat: from.lat, lng: from.lng };
  }

  if (clampedProgress === 1) {
    return { lat: to.lat, lng: to.lng };
  }

  return {
    lat: from.lat + (to.lat - from.lat) * clampedProgress,
    lng: from.lng + (to.lng - from.lng) * clampedProgress,
  };
}

export function getBearing(from: LatLng, to: LatLng): number {
  if (from.lat === to.lat && from.lng === to.lng) {
    return 0;
  }

  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLng = toRadians(normalizeLongitudeDelta(from.lng, to.lng));

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

/** @deprecated Use getBearing with LatLng objects. */
export function bearingDegrees(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return getBearing({ lat: lat1, lng: lon1 }, { lat: lat2, lng: lon2 });
}

export function sortShuttlesByDistance(
  studentLoc: LatLng,
  shuttles: ShuttleWithLocation[],
): ShuttleWithLocation[] {
  return [...shuttles].sort((left, right) => {
    const leftDistance = haversineDistance(
      studentLoc.lat,
      studentLoc.lng,
      left.location.lat,
      left.location.lng,
    );
    const rightDistance = haversineDistance(
      studentLoc.lat,
      studentLoc.lng,
      right.location.lat,
      right.location.lng,
    );
    return leftDistance - rightDistance;
  });
}

export function isWithinRadius(
  originLat: number,
  originLon: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number,
): boolean {
  return (
    haversineDistance(originLat, originLon, targetLat, targetLon) <=
    radiusMeters
  );
}
