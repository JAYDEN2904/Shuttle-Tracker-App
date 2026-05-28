import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { getMapboxModule } from "@/lib/mapbox";
import { AppText } from "@/components/ui/AppText";
import type { Stop } from "@shuttle/shared-types";
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

interface StopMarkerProps {
  stop: Stop;
  isSelected?: boolean;
  onPress?: (stopId: string) => void;
}

function StopMarkerComponent({
  stop,
  isSelected = false,
  onPress,
}: StopMarkerProps) {
  const outerSize = isSelected ? 36 : 32;
  const borderWidth = isSelected ? 3 : 2.5;
  const Mapbox = getMapboxModule();

  if (Mapbox === null) {
    return null;
  }

  return (
    <Mapbox.PointAnnotation
      id={`stop-${stop.id}`}
      coordinate={[stop.coordinates.longitude, stop.coordinates.latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
      onSelected={() => {
        onPress?.(stop.id);
      }}
    >
      <Pressable
        onPress={() => {
          onPress?.(stop.id);
        }}
        hitSlop={12}
        style={styles.wrapper}
        accessibilityRole="button"
        accessibilityLabel={`Stop ${stop.name}`}
      >
        {isSelected && (
          <View style={styles.labelPill}>
            <AppText variant="label" color="textPrimary">
              {stop.name}
            </AppText>
          </View>
        )}
        <View
          style={[
            styles.outer,
            {
              width: outerSize,
              height: outerSize,
              borderWidth,
            },
            isSelected ? SHADOWS.md : SHADOWS.sm,
          ]}
        >
          <View style={styles.inner} />
        </View>
      </Pressable>
    </Mapbox.PointAnnotation>
  );
}

export const StopMarker = memo(
  StopMarkerComponent,
  (previous, next) =>
    previous.stop.id === next.stop.id &&
    previous.isSelected === next.isSelected,
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    gap: SPACING.xs,
  },
  labelPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  outer: {
    borderRadius: RADIUS.full,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
});
