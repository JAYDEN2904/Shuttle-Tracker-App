import { NativeModules } from "react-native";
import { ENV } from "@/lib/env";

let configured = false;

export function isMapboxNativeAvailable(): boolean {
  return (
    NativeModules.RNMBXModule !== undefined ||
    NativeModules.RNMapboxMapsImpl !== undefined
  );
}

export function isMapboxConfigured(): boolean {
  return ENV.mapboxPublicToken.length > 0;
}

export function canUseMapboxMap(): boolean {
  return isMapboxConfigured() && isMapboxNativeAvailable();
}

export function configureMapbox(): void {
  if (configured || !canUseMapboxMap()) {
    return;
  }

  // Lazy require avoids crashing Expo Go at import time.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Mapbox = require("@rnmapbox/maps").default as {
    setAccessToken: (token: string) => void;
  };
  Mapbox.setAccessToken(ENV.mapboxPublicToken);
  configured = true;
}

export function getMapboxModule(): typeof import("@rnmapbox/maps").default | null {
  if (!canUseMapboxMap()) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@rnmapbox/maps").default;
}
