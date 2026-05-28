import { create } from "zustand";
import type { LatLng } from "@/types/app.types";

interface MapStore {
  studentLocation: LatLng | null;
  activeRouteFilter: string | null;
  selectedStopId: string | null;
  selectedShuttleId: string | null;
  mapReady: boolean;
  setStudentLocation: (location: LatLng | null) => void;
  setRouteFilter: (routeCode: string | null) => void;
  selectStop: (stopId: string | null) => void;
  selectShuttle: (shuttleId: string | null) => void;
  setMapReady: (ready: boolean) => void;
  resetSelection: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  studentLocation: null,
  activeRouteFilter: null,
  selectedStopId: null,
  selectedShuttleId: null,
  mapReady: false,
  setStudentLocation: (studentLocation) => set({ studentLocation }),
  setRouteFilter: (activeRouteFilter) => set({ activeRouteFilter }),
  selectStop: (selectedStopId) => set({ selectedStopId }),
  selectShuttle: (selectedShuttleId) => set({ selectedShuttleId }),
  setMapReady: (mapReady) => set({ mapReady }),
  resetSelection: () =>
    set({ selectedStopId: null, selectedShuttleId: null }),
}));
