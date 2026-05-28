import { StyleSheet } from "react-native";
import { configureMapbox, getMapboxModule } from "@/lib/mapbox";
import { RoutePolyline } from "@/components/map/RoutePolyline";
import { ShuttleMarker } from "@/components/map/ShuttleMarker";
import { StopMarker } from "@/components/map/StopMarker";
import { UserLocationDot } from "@/components/map/UserLocationDot";
import type { Stop } from "@shuttle/shared-types";
import type { LatLng, ShuttleWithLocation } from "@/types/app.types";
import { UG_LEGON_CENTER } from "@/utils/constants";
import { useEffect } from "react";

interface MapboxCampusMapProps {
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

export function MapboxCampusMap({
  routePolylines,
  visibleStops,
  visibleShuttles,
  studentLocation,
  selectedStopId,
  selectedShuttleId,
  onSelectStop,
  onSelectShuttle,
  onMapReady,
}: MapboxCampusMapProps) {
  const Mapbox = getMapboxModule();

  useEffect(() => {
    configureMapbox();
  }, []);

  if (Mapbox === null) {
    return null;
  }

  return (
    <Mapbox.MapView
      style={StyleSheet.absoluteFill}
      styleURL="mapbox://styles/mapbox/light-v11"
      compassEnabled={false}
      scaleBarEnabled={false}
      logoEnabled={false}
      attributionEnabled={false}
      onDidFinishLoadingMap={onMapReady}
    >
      <Mapbox.Camera
        defaultSettings={{
          centerCoordinate: [UG_LEGON_CENTER.longitude, UG_LEGON_CENTER.latitude],
          zoomLevel: 15,
        }}
      />

      {routePolylines.map((route) => (
        <RoutePolyline
          key={route.routeId}
          routeId={route.routeId}
          coordinates={route.coordinates}
          color={route.color}
        />
      ))}

      {visibleStops.map((stop) => (
        <StopMarker
          key={stop.id}
          stop={stop}
          isSelected={selectedStopId === stop.id}
          onPress={onSelectStop}
        />
      ))}

      {visibleShuttles.map((shuttle) => (
        <ShuttleMarker
          key={shuttle.id}
          shuttle={shuttle}
          isSelected={selectedShuttleId === shuttle.id}
          onPress={onSelectShuttle}
        />
      ))}

      {studentLocation !== null && <UserLocationDot location={studentLocation} />}
    </Mapbox.MapView>
  );
}
