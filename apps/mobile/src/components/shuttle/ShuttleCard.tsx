import { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { ShuttleWithDistance } from "@/types/app.types";
import { AppText, Badge } from "@/components/ui";
import { CapacityBadge } from "@/components/shuttle/CapacityBadge";
import { formatDistance } from "@/utils/format.utils";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

interface ShuttleCardProps {
  shuttle: ShuttleWithDistance;
  onPress?: (shuttleId: string) => void;
}

function ShuttleCardComponent({ shuttle, onPress }: ShuttleCardProps) {
  const scale = useSharedValue(1);
  const routeColor = shuttle.route?.color ?? COLORS.primary;
  const routeCode = shuttle.route?.code ?? "?";
  const routeName = shuttle.route?.name ?? "Campus Route";
  const etaMinutes = Math.max(1, Math.round(shuttle.etaMinutes));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  }, [scale]);

  return (
    <Pressable
      onPress={() => {
        onPress?.(shuttle.id);
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${routeName}, ${etaMinutes} minutes away, ${shuttle.capacityStatus.replace("_", " ")}`}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.accent, { backgroundColor: routeColor }]} />
        <View style={[styles.routeIcon, { backgroundColor: COLORS.primaryLight }]}>
          <AppText variant="bodyMed" style={{ color: routeColor }}>
            {routeCode}
          </AppText>
        </View>
        <View style={styles.content}>
          <AppText variant="bodyMed">{routeName}</AppText>
          <AppText variant="caption" color="textSecondary">
            {formatDistance(shuttle.distanceMeters)} away
          </AppText>
        </View>
        <View style={styles.meta}>
          <Badge label={`${etaMinutes} min`} variant="primary" />
          <CapacityBadge status={shuttle.capacityStatus} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export const ShuttleCard = memo(ShuttleCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  accent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: RADIUS.full,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: SPACING.xs,
  },
  meta: {
    alignItems: "flex-end",
    gap: SPACING.sm,
  },
});
