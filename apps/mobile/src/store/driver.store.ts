import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LocationSubscription } from "expo-location";
import { create } from "zustand";
import { getActiveRoutes, updateShuttleLiveStatus, upsertShuttleLocation } from "@shuttle/database";
import type { CapacityStatus } from "@shuttle/shared-types";
import { getTypedSupabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/supabase-errors";
import { trackEvent } from "@/lib/analytics";
import {
  MOCK_DRIVER_SHUTTLE_ID,
  MOCK_SCHEDULE_ROUTES,
  USE_MOCK_DATA,
} from "@/lib/mock";
import { sendDriverEmergencyAlert } from "@/services/emergency.service";
import {
  getCurrentCoordinates,
  PermissionDeniedError,
  startBroadcast,
  stopBroadcast,
  watchPosition,
} from "@/services/location.service";
import { useAuthStore } from "@/store/auth.store";
import { UG_LEGON_CENTER } from "@/utils/constants";

interface DriverStoreState {
  isLive: boolean;
  currentShuttleId: string | null;
  currentRouteId: string | null;
  selectedRouteCode: string | null;
  capacityStatus: CapacityStatus;
  tripStartedAt: Date | null;
  locationSubscription: LocationSubscription | null;
  broadcastIntervalMs: number;
  batteryLevel: number | null;
  errorMessage: string | null;
  currentLat: number | null;
  currentLng: number | null;
  heading: number;
  speedKmh: number;
  lastEmergencySentAt: number | null;
  isGoLiveLoading: boolean;
}

interface DriverStoreActions {
  selectRoute: (routeCode: string) => void;
  setCapacity: (status: CapacityStatus) => Promise<void>;
  goLive: () => Promise<void>;
  endTrip: () => Promise<void>;
  updateLocation: (
    lat: number,
    lng: number,
    heading: number,
    speedMs: number,
  ) => void;
  sendEmergencyAlert: (options?: { confirmedDuplicate?: boolean }) => Promise<void>;
  setBatteryLevel: (level: number | null) => void;
  clearError: () => void;
  reset: () => void;
}

type DriverStore = DriverStoreState & DriverStoreActions;

const initialState: DriverStoreState = {
  isLive: false,
  currentShuttleId: null,
  currentRouteId: null,
  selectedRouteCode: null,
  capacityStatus: "available",
  tripStartedAt: null,
  locationSubscription: null,
  broadcastIntervalMs: 4000,
  batteryLevel: null,
  errorMessage: null,
  currentLat: null,
  currentLng: null,
  heading: 0,
  speedKmh: 0,
  lastEmergencySentAt: null,
  isGoLiveLoading: false,
};

async function resolveDriverShuttleId(driverId: string): Promise<string> {
  if (USE_MOCK_DATA) {
    return MOCK_DRIVER_SHUTTLE_ID;
  }

  try {
    const { data, error } = await getTypedSupabase()
      .from("shuttles")
      .select("id")
      .eq("driver_id", driverId)
      .maybeSingle();

    if (error !== null) {
      throw handleSupabaseError(error);
    }

    if (data === null) {
      throw new Error(
        "No shuttle is assigned to your account. Contact dispatch before going live.",
      );
    }

    return data.id;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

async function resolveRouteIdByCode(routeCode: string): Promise<string> {
  if (USE_MOCK_DATA) {
    const route = MOCK_SCHEDULE_ROUTES.find(
      (item) => item.code.toUpperCase() === routeCode.toUpperCase(),
    );
    if (route === undefined) {
      throw new Error("Selected route is no longer available.");
    }
    return route.id;
  }

  const routes = await getActiveRoutes(getTypedSupabase());
  const route = routes.find(
    (item) => item.code.toUpperCase() === routeCode.toUpperCase(),
  );
  if (route === undefined) {
    throw new Error("Selected route is no longer available.");
  }
  return route.id;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  ...initialState,

  selectRoute: (routeCode) => {
    set({ selectedRouteCode: routeCode, errorMessage: null });
  },

  setCapacity: async (status) => {
    set({ capacityStatus: status });
    const { currentShuttleId, isLive } = get();
    if (!isLive || currentShuttleId === null || USE_MOCK_DATA) {
      return;
    }

    await updateShuttleLiveStatus(getTypedSupabase(), currentShuttleId, {
      capacityStatus: status,
    });
  },

  goLive: async () => {
    const { selectedRouteCode, capacityStatus } = get();
    if (selectedRouteCode === null) {
      throw new Error("SELECT_ROUTE_REQUIRED");
    }

    const profile = useAuthStore.getState().profile;
    if (profile === null) {
      throw new Error("You must be signed in as a driver.");
    }

    set({ isGoLiveLoading: true, errorMessage: null });

    try {
      const routeId = await resolveRouteIdByCode(selectedRouteCode);
      const shuttleId = await resolveDriverShuttleId(profile.id);
      const tripStartedAt = new Date();

      if (!USE_MOCK_DATA) {
        try {
          const { error: updateError } = await getTypedSupabase()
            .from("shuttles")
            .update({
              route_id: routeId,
              capacity_status: capacityStatus,
              is_live: true,
              trip_started_at: tripStartedAt.toISOString(),
            })
            .eq("id", shuttleId);

          if (updateError !== null) {
            throw handleSupabaseError(updateError);
          }
        } catch (error) {
          throw handleSupabaseError(error);
        }
      }

      await startBroadcast(shuttleId);

      const subscription = await watchPosition((coords, heading, speedMs) => {
        get().updateLocation(
          coords.latitude,
          coords.longitude,
          heading,
          speedMs,
        );
      });

      const coords = USE_MOCK_DATA
        ? UG_LEGON_CENTER
        : await getCurrentCoordinates();

      set({
        isLive: true,
        currentShuttleId: shuttleId,
        currentRouteId: routeId,
        tripStartedAt,
        locationSubscription: subscription,
        currentLat: coords?.latitude ?? UG_LEGON_CENTER.latitude,
        currentLng: coords?.longitude ?? UG_LEGON_CENTER.longitude,
        heading: 0,
        speedKmh: 0,
        isGoLiveLoading: false,
      });

      if (!USE_MOCK_DATA && coords !== null) {
        try {
          await upsertShuttleLocation(getTypedSupabase(), {
            shuttleId,
            lat: coords.latitude,
            lng: coords.longitude,
            heading: 0,
            speedKmh: 0,
            updatedAt: tripStartedAt.toISOString(),
          });
        } catch (error) {
          throw handleSupabaseError(error);
        }
      }

      trackEvent({
        name: "driver_went_live",
        properties: { route_code: selectedRouteCode },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "SELECT_ROUTE_REQUIRED"
      ) {
        set({ isGoLiveLoading: false });
        throw error;
      }
      const message =
        error instanceof PermissionDeniedError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to start live broadcast.";
      set({ errorMessage: message, isGoLiveLoading: false });
      throw error;
    }
  },

  endTrip: async () => {
    const { currentShuttleId, locationSubscription, tripStartedAt } = get();

    locationSubscription?.remove();

    if (currentShuttleId !== null) {
      await stopBroadcast(currentShuttleId);

      if (!USE_MOCK_DATA) {
        try {
          const { error } = await getTypedSupabase()
            .from("shuttles")
            .update({
              is_live: false,
              trip_started_at: null,
            })
            .eq("id", currentShuttleId);

          if (error !== null) {
            throw handleSupabaseError(error);
          }
        } catch (error) {
          throw handleSupabaseError(error);
        }
      }
    }

    if (tripStartedAt !== null) {
      const durationMinutes = Math.max(
        1,
        Math.round((Date.now() - tripStartedAt.getTime()) / 60_000),
      );
      trackEvent({
        name: "driver_ended_trip",
        properties: { duration_minutes: durationMinutes },
      });
    }

    set({ ...initialState });
  },

  updateLocation: (lat, lng, heading, speedMs) => {
    const speedKmh = Math.max(0, speedMs * 3.6);
    set({ currentLat: lat, currentLng: lng, heading, speedKmh });

    const { isLive, currentShuttleId } = get();
    if (!isLive || currentShuttleId === null || USE_MOCK_DATA) {
      return;
    }

    void upsertShuttleLocation(getTypedSupabase(), {
      shuttleId: currentShuttleId,
      lat,
      lng,
      heading,
      speedKmh,
      updatedAt: new Date().toISOString(),
    });
  },

  sendEmergencyAlert: async (options) => {
    const state = get();
    const profile = useAuthStore.getState().profile;

    if (
      state.lastEmergencySentAt !== null &&
      Date.now() - state.lastEmergencySentAt < 5000 &&
      options?.confirmedDuplicate !== true
    ) {
      throw new Error("EMERGENCY_CONFIRM_REQUIRED");
    }

    if (
      state.currentShuttleId === null ||
      profile === null ||
      state.currentLat === null ||
      state.currentLng === null
    ) {
      throw new Error("Location unavailable for emergency alert.");
    }

    await sendDriverEmergencyAlert({
      shuttleId: state.currentShuttleId,
      driverId: profile.id,
      driverName: profile.name,
      routeCode: state.selectedRouteCode,
      lat: state.currentLat,
      lng: state.currentLng,
    });

    set({ lastEmergencySentAt: Date.now() });
  },

  setBatteryLevel: (level) => {
    set({ batteryLevel: level });
  },

  clearError: () => {
    set({ errorMessage: null });
  },

  reset: () => {
    get().locationSubscription?.remove();
    set({ ...initialState });
  },
}));

export async function hydrateDriverLiveSession(): Promise<void> {
  const shuttleId = await AsyncStorage.getItem("active_shuttle_id");
  if (shuttleId === null) {
    return;
  }

  const isRunning = USE_MOCK_DATA
    ? false
    : await import("expo-location").then((Location) =>
        Location.hasStartedLocationUpdatesAsync("SHUTTLE_LOCATION_BROADCAST"),
      );

  if (!isRunning) {
    await AsyncStorage.removeItem("active_shuttle_id");
    return;
  }

  useDriverStore.setState({
    isLive: true,
    currentShuttleId: shuttleId,
    tripStartedAt: new Date(),
  });
}
