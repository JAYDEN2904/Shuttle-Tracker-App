import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { canUseMapboxMap } from "@/lib/mapbox";
import { MapLoadingOverlay } from "@/components/map/MapLoadingOverlay";
import { RouteFilterChip } from "@/components/map/RouteFilterChip";
import { MapboxCampusMap } from "@/components/map/MapboxCampusMap";
import { NativeCampusMap } from "@/components/map/NativeCampusMap";
import { OfflineBanner } from "@/components/OfflineBanner";
import { NearbyShuttlesSheet } from "@/components/sheets/NearbyShuttlesSheet";
import { StopDetailSheet } from "@/components/sheets/StopDetailSheet";
import { useShuttleLocations } from "@/hooks/useShuttleLocations";
import { useMapStore } from "@/store/map.store";
import { getCurrentCoordinates } from "@/services/location.service";
import { trackEvent } from "@/lib/analytics";
import { showRouteFilterPicker } from "@/lib/route-filter-picker";
import { MOCK_ROUTES, MOCK_STOPS } from "@/lib/mock";
import type { LatLng } from "@/types/app.types";

function groupStopsByRoute(): Array<{
  routeId: string;
  color: string;
  coordinates: LatLng[];
}> {
  const grouped = new Map<
    string,
    Array<{ lat: number; lng: number; sequenceOrder: number }>
  >();

  for (const stop of MOCK_STOPS) {
    const existing = grouped.get(stop.routeId) ?? [];
    existing.push({
      lat: stop.coordinates.latitude,
      lng: stop.coordinates.longitude,
      sequenceOrder: stop.sequenceOrder,
    });
    grouped.set(stop.routeId, existing);
  }

  return MOCK_ROUTES.map((route) => ({
    routeId: route.id,
    color: route.color,
    coordinates: (grouped.get(route.id) ?? [])
      .sort((left, right) => left.sequenceOrder - right.sequenceOrder)
      .map(({ lat, lng }) => ({ lat, lng })),
  }));
}

export default function StudentMapScreen() {
  const useMapbox = canUseMapboxMap();
  const { shuttles, isLoading, lastUpdated } = useShuttleLocations();
  const studentLocation = useMapStore((state) => state.studentLocation);
  const activeRouteFilter = useMapStore((state) => state.activeRouteFilter);
  const selectedStopId = useMapStore((state) => state.selectedStopId);
  const selectedShuttleId = useMapStore((state) => state.selectedShuttleId);
  const mapReady = useMapStore((state) => state.mapReady);
  const setStudentLocation = useMapStore((state) => state.setStudentLocation);
  const setRouteFilter = useMapStore((state) => state.setRouteFilter);
  const selectStop = useMapStore((state) => state.selectStop);
  const selectShuttle = useMapStore((state) => state.selectShuttle);
  const setMapReady = useMapStore((state) => state.setMapReady);

  useEffect(() => {
    trackEvent({
      name: "map_viewed",
      properties: { route_filter: activeRouteFilter },
    });
  }, [activeRouteFilter]);

  useEffect(() => {
    void getCurrentCoordinates().then((coordinates) => {
      if (coordinates === null) {
        return;
      }
      setStudentLocation({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
    });
  }, [setStudentLocation]);

  const routePolylines = useMemo(() => groupStopsByRoute(), []);

  const visibleStops = useMemo(
    () =>
      activeRouteFilter
        ? MOCK_STOPS.filter((stop) =>
            MOCK_ROUTES.some(
              (route) =>
                route.code === activeRouteFilter && route.id === stop.routeId,
            ),
          )
        : MOCK_STOPS,
    [activeRouteFilter],
  );

  const visibleShuttles = useMemo(
    () =>
      activeRouteFilter
        ? shuttles.filter(
            (shuttle) => shuttle.route?.code === activeRouteFilter,
          )
        : shuttles,
    [shuttles, activeRouteFilter],
  );

  const routeFilterLabel =
    activeRouteFilter === null ? "All ▾" : `Route ${activeRouteFilter} ▾`;

  const handleRouteFilterPress = useCallback(() => {
    showRouteFilterPicker(activeRouteFilter, setRouteFilter);
  }, [activeRouteFilter, setRouteFilter]);

  const isMapLoading = !mapReady || (isLoading && shuttles.length === 0);

  const selectedStop = useMemo(
    () => MOCK_STOPS.find((stop) => stop.id === selectedStopId) ?? null,
    [selectedStopId],
  );

  const handleStopSelect = useCallback(
    (stopId: string) => {
      trackEvent({ name: "stop_tapped", properties: { stop_id: stopId } });
      selectStop(stopId);
    },
    [selectStop],
  );

  const handleShuttleSelect = useCallback(
    (shuttleId: string) => {
      trackEvent({
        name: "shuttle_tapped",
        properties: { shuttle_id: shuttleId },
      });
      selectShuttle(shuttleId);
    },
    [selectShuttle],
  );

  const handleStopDismiss = useCallback(() => {
    selectStop(null);
  }, [selectStop]);

  const mapProps = {
    routePolylines,
    visibleStops,
    visibleShuttles,
    studentLocation,
    selectedStopId,
    selectedShuttleId,
    onSelectStop: handleStopSelect,
    onSelectShuttle: handleShuttleSelect,
  };

  return (
    <View style={styles.container}>
      {useMapbox ? (
        <MapboxCampusMap {...mapProps} onMapReady={() => setMapReady(true)} />
      ) : (
        <NativeCampusMap
          {...mapProps}
          onMapReady={() => setMapReady(true)}
        />
      )}

      {isMapLoading ? <MapLoadingOverlay /> : null}

      <OfflineBanner lastUpdated={lastUpdated} />

      <RouteFilterChip
        routeFilterLabel={routeFilterLabel}
        onRouteFilterPress={handleRouteFilterPress}
      />

      <NearbyShuttlesSheet onShuttlePress={handleShuttleSelect} />

      <StopDetailSheet
        stopId={selectedStopId}
        stopName={selectedStop?.name ?? "Campus Stop"}
        onDismiss={handleStopDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
