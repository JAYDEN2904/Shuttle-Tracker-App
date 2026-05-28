import {
  Easing,
  makeMutable,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const INTERPOLATION_MS = 500;

export interface ShuttlePositionValues {
  lat: SharedValue<number>;
  lng: SharedValue<number>;
}

const positionRegistry = new Map<string, ShuttlePositionValues>();

export function getShuttlePositionValues(
  shuttleId: string,
  initialLat = 0,
  initialLng = 0,
): ShuttlePositionValues {
  const existing = positionRegistry.get(shuttleId);
  if (existing !== undefined) {
    return existing;
  }

  const created: ShuttlePositionValues = {
    lat: makeMutable(initialLat),
    lng: makeMutable(initialLng),
  };
  positionRegistry.set(shuttleId, created);
  return created;
}

export function animateShuttleTo(
  shuttleId: string,
  lat: number,
  lng: number,
  immediate = false,
): ShuttlePositionValues {
  const values = getShuttlePositionValues(shuttleId, lat, lng);

  if (immediate) {
    values.lat.value = lat;
    values.lng.value = lng;
    return values;
  }

  values.lat.value = withTiming(lat, {
    duration: INTERPOLATION_MS,
    easing: Easing.out(Easing.quad),
  });
  values.lng.value = withTiming(lng, {
    duration: INTERPOLATION_MS,
    easing: Easing.out(Easing.quad),
  });

  return values;
}

export function removeShuttlePosition(shuttleId: string): void {
  positionRegistry.delete(shuttleId);
}

export function clearShuttlePositions(): void {
  positionRegistry.clear();
}
