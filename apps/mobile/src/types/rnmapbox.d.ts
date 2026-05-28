declare module "@rnmapbox/maps" {
  import type { ComponentType, ReactNode } from "react";
  import type { StyleProp, ViewStyle } from "react-native";

  export interface Coordinate {
    latitude: number;
    longitude: number;
  }

  export interface MapViewProps {
    style?: StyleProp<ViewStyle>;
    styleURL?: string;
    compassEnabled?: boolean;
    scaleBarEnabled?: boolean;
    logoEnabled?: boolean;
    attributionEnabled?: boolean;
    onDidFinishLoadingMap?: () => void;
    children?: ReactNode;
  }

  export interface CameraProps {
    defaultSettings?: {
      centerCoordinate?: [number, number];
      zoomLevel?: number;
    };
  }

  export interface PointAnnotationProps {
    id: string;
    coordinate: [number, number];
    anchor?: { x: number; y: number };
    onSelected?: () => void;
    children?: ReactNode;
  }

  export interface ShapeSourceProps {
    id: string;
    shape: GeoJSON.Feature;
    children?: ReactNode;
  }

  export interface LineLayerProps {
    id: string;
    style?: Record<string, unknown>;
  }

  export interface MapboxModule {
    setAccessToken: (token: string) => void;
    MapView: ComponentType<MapViewProps>;
    Camera: ComponentType<CameraProps>;
    PointAnnotation: ComponentType<PointAnnotationProps>;
    ShapeSource: ComponentType<ShapeSourceProps>;
    LineLayer: ComponentType<LineLayerProps>;
  }

  const Mapbox: MapboxModule;
  export default Mapbox;
}

declare namespace GeoJSON {
  interface Feature {
    type: "Feature";
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
    properties: Record<string, unknown>;
  }
}
