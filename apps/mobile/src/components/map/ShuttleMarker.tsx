import { memo, useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BusIcon } from "@/components/ui/BusIcon";
import { getMapboxModule } from "@/lib/mapbox";
import { getShuttlePositionValues } from "@/lib/shuttle-position-registry";
import type { ShuttleWithLocation } from "@/types/app.types";
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SHADOWS } from "@/utils/constants";

const SELECTED_MARKER_SIZE = MIN_TOUCH_TARGET + 4;
const BUS_ICON_SIZE = 22;
const SELECTED_BUS_ICON_SIZE = 24;

interface ShuttleMarkerProps {
  shuttle: ShuttleWithLocation;
  isSelected?: boolean;
  onPress?: (shuttleId: string) => void;
}

function ShuttleMarkerComponent({
  shuttle,
  isSelected = false,
  onPress,
}: ShuttleMarkerProps) {
  const positions = getShuttlePositionValues(
    shuttle.id,
    shuttle.location.lat,
    shuttle.location.lng,
  );
  const [coordinate, setCoordinate] = useState<[number, number]>([
    shuttle.location.lng,
    shuttle.location.lat,
  ]);
  const scale = useSharedValue(1);
  const Mapbox = getMapboxModule();
  const routeColor = shuttle.route?.color ?? COLORS.primary;
  const markerSize = isSelected ? SELECTED_MARKER_SIZE : MIN_TOUCH_TARGET;
  const iconSize = isSelected ? SELECTED_BUS_ICON_SIZE : BUS_ICON_SIZE;

  useAnimatedReaction(
    () => ({
      lat: positions.lat.value,
      lng: positions.lng.value,
    }),
    (current, previous) => {
      if (
        previous !== null &&
        (current.lat !== previous.lat || current.lng !== previous.lng)
      ) {
        scale.value = withSequence(
          withTiming(1.15, { duration: 150, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
        );
      }
      runOnJS(setCoordinate)([current.lng, current.lat]);
    },
    [shuttle.id],
  );

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.08, { duration: 120 }),
        withTiming(1, { duration: 120 }),
      );
    }
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${shuttle.location.heading ?? 0}deg` },
      { scale: scale.value },
    ],
  }));

  if (Mapbox === null) {
    return null;
  }

  return (
    <Mapbox.PointAnnotation
      id={`shuttle-${shuttle.id}`}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      onSelected={() => {
        onPress?.(shuttle.id);
      }}
    >
      <Pressable
        onPress={() => {
          onPress?.(shuttle.id);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Shuttle on route ${shuttle.route?.name ?? "campus"}, ${shuttle.capacityStatus.replace("_", " ")}`}
      >
        <Animated.View
          style={[
            styles.container,
            {
              width: markerSize,
              height: markerSize,
              backgroundColor: routeColor,
            },
            isSelected ? SHADOWS.lg : SHADOWS.sm,
            animatedStyle,
          ]}
        >
          <BusIcon size={iconSize} color={COLORS.white} />
        </Animated.View>
      </Pressable>
    </Mapbox.PointAnnotation>
  );
}

export const ShuttleMarker = memo(
  ShuttleMarkerComponent,
  (previous, next) =>
    previous.shuttle.id === next.shuttle.id &&
    previous.isSelected === next.isSelected &&
    previous.shuttle.route?.color === next.shuttle.route?.color &&
    previous.shuttle.capacityStatus === next.shuttle.capacityStatus,
);

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
