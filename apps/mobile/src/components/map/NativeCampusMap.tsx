import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import type { Stop } from "@shuttle/shared-types";
import type { LatLng, ShuttleWithLocation } from "@/types/app.types";
import { AppText } from "@/components/ui/AppText";
import { COLORS, DEFAULT_MAP_DELTA, UG_LEGON_CENTER } from "@/utils/constants";

interface NativeCampusMapProps {
  routePolylines: Array<{
    routeId: string;
    color: string;
    coordinates: LatLng[];
  }>;
  visibleStops: Stop[];
  visibleShuttles: ShuttleWithLocation[];
  studentLocation: LatLng | null;
  selectedStopId: string | null;
  selectedShuttleId: string | null;
  onSelectStop: (stopId: string) => void;
  onSelectShuttle: (shuttleId: string) => void;
  onMapReady: () => void;
}

export function NativeCampusMap({
  routePolylines,
  visibleStops,
  visibleShuttles,
  studentLocation,
  selectedStopId,
  selectedShuttleId,
  onSelectStop,
  onSelectShuttle,
  onMapReady,
}: NativeCampusMapProps) {
  const initialRegion = useMemo(
    () => ({
      ...UG_LEGON_CENTER,
      ...DEFAULT_MAP_DELTA,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={onMapReady}
      >
        {routePolylines.map((route) => (
          <Polyline
            key={route.routeId}
            coordinates={route.coordinates.map((point) => ({
              latitude: point.lat,
              longitude: point.lng,
            }))}
            strokeColor={route.color}
            strokeWidth={4}
          />
        ))}

        {visibleStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.coordinates.latitude,
              longitude: stop.coordinates.longitude,
            }}
            pinColor={selectedStopId === stop.id ? COLORS.primary : COLORS.routeB}
            title={stop.name}
            onPress={() => {
              onSelectStop(stop.id);
            }}
          />
        ))}

        {visibleShuttles.map((shuttle) => (
          <Marker
            key={shuttle.id}
            coordinate={{
              latitude: shuttle.location.lat,
              longitude: shuttle.location.lng,
            }}
            pinColor={
              selectedShuttleId === shuttle.id ? COLORS.primaryDark : COLORS.primary
            }
            title={shuttle.route?.name ?? "Shuttle"}
            onPress={() => {
              onSelectShuttle(shuttle.id);
            }}
          />
        ))}

        {studentLocation !== null && (
          <Marker
            coordinate={{
              latitude: studentLocation.lat,
              longitude: studentLocation.lng,
            }}
            pinColor={COLORS.primary}
          />
        )}
      </MapView>

      <View style={styles.banner} pointerEvents="none">
        <AppText variant="caption" color="textSecondary" align="center">
          Development map (Expo Go). Build with `npx expo run:ios` for Mapbox.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    flex: 1,
  },
  banner: {
    position: "absolute",
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    opacity: 0.92,
  },
});
