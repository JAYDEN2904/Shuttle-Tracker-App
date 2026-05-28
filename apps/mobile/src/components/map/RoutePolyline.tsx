import { memo, useMemo } from "react";
import { getMapboxModule } from "@/lib/mapbox";
import type { LatLng } from "@/types/app.types";

interface RoutePolylineProps {
  routeId: string;
  coordinates: LatLng[];
  color?: string;
  strokeWidth?: number;
}

function RoutePolylineComponent({
  routeId,
  coordinates,
  color = "#2563EB",
  strokeWidth = 4,
}: RoutePolylineProps) {
  const shape = useMemo(
    () => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: coordinates.map((point) => [point.lng, point.lat]),
      },
      properties: {},
    }),
    [coordinates],
  );

  if (coordinates.length < 2) {
    return null;
  }

  const Mapbox = getMapboxModule();
  if (Mapbox === null) {
    return null;
  }

  return (
    <Mapbox.ShapeSource id={`route-${routeId}`} shape={shape}>
      <Mapbox.LineLayer
        id={`route-line-${routeId}`}
        style={{
          lineColor: color,
          lineWidth: strokeWidth,
          lineCap: "round",
          lineJoin: "round",
          lineOpacity: 0.85,
        }}
      />
    </Mapbox.ShapeSource>
  );
}

export const RoutePolyline = memo(RoutePolylineComponent);
