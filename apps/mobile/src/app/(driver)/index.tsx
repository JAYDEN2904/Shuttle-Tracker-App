import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AppText, Skeleton } from "@/components/ui";
import { useDriverRoutes, type DriverRouteOption } from "@/hooks/useDriverRoutes";
import { useAuthStore } from "@/store/auth.store";
import { useDriverStore } from "@/store/driver.store";
import type { CapacityStatus } from "@shuttle/shared-types";
import {
  COLORS,
  DRIVER_MIN_LABEL_FONT_SIZE,
  DRIVER_MIN_TAP_HEIGHT,
  RADIUS,
  SHADOWS,
  SPACING,
} from "@/utils/constants";

const CARD_WIDTH = Math.min(342, Dimensions.get("window").width - 40);

const CAPACITY_OPTIONS: Array<{ key: CapacityStatus; label: string }> = [
  { key: "available", label: "Available" },
  { key: "half_full", label: "Half Full" },
  { key: "full", label: "Full" },
];

function routeAccentColor(route: DriverRouteOption): string {
  return route.color;
}

function greetingName(name: string | null | undefined): string {
  if (name === null || name === undefined || name.trim().length === 0) {
    return "Driver";
  }
  return name.split(" ")[0] ?? name;
}

function DriverOverline({ children }: { children: string }) {
  return (
    <AppText style={styles.overline} color="textSecondary">
      {children}
    </AppText>
  );
}

function RouteCard({
  route,
  selected,
  onPress,
}: {
  route: DriverRouteOption;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const accent = routeAccentColor(route);

  useEffect(() => {
    if (selected) {
      scale.value = withSequence(
        withSpring(1.02, { damping: 12, stiffness: 220 }),
        withSpring(1, { damping: 14, stiffness: 260 }),
      );
    }
  }, [selected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={[
          styles.routeCard,
          selected ? styles.routeCardSelected : styles.routeCardIdle,
          selected && { borderColor: accent },
        ]}
      >
        <View style={[styles.routeAccent, { backgroundColor: accent }]} />
        <View style={styles.routeCardBody}>
          <View style={[styles.routeBadge, { backgroundColor: accent }]}>
            <AppText style={styles.routeBadgeText}>{route.code}</AppText>
          </View>
          <View style={styles.routeTextBlock}>
            <AppText variant="h3" style={styles.routeName}>
              {route.name}
            </AppText>
            <AppText variant="caption" color="textSecondary" style={styles.routeMeta}>
              {route.stopsCount} stops · {route.durationLabel}
            </AppText>
          </View>
          <View
            style={[
              styles.selectionCircle,
              selected
                ? { backgroundColor: accent, borderColor: accent }
                : styles.selectionCircleIdle,
            ]}
          >
            {selected ? <AppText style={styles.checkMark}>✓</AppText> : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CapacitySegment({
  selected,
  status,
  onPress,
}: {
  selected: CapacityStatus;
  status: CapacityStatus;
  onPress: () => void;
}) {
  const isActive = selected === status;
  const activeColor =
    status === "available"
      ? COLORS.success
      : status === "half_full"
        ? COLORS.warning
        : COLORS.error;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={[styles.capacitySegment, isActive && { backgroundColor: `${activeColor}22` }]}
    >
      <AppText
        style={[
          styles.capacityLabel,
          isActive && { color: activeColor, fontFamily: "Inter_700Bold" },
        ]}
      >
        {CAPACITY_OPTIONS.find((item) => item.key === status)?.label}
      </AppText>
      {isActive ? (
        <View style={[styles.capacityIndicator, { backgroundColor: activeColor }]} />
      ) : null}
    </Pressable>
  );
}

export default function DriverPreTripScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((state) => state.profile);
  const selectedRouteCode = useDriverStore((state) => state.selectedRouteCode);
  const capacityStatus = useDriverStore((state) => state.capacityStatus);
  const isGoLiveLoading = useDriverStore((state) => state.isGoLiveLoading);
  const errorMessage = useDriverStore((state) => state.errorMessage);
  const selectRoute = useDriverStore((state) => state.selectRoute);
  const setCapacity = useDriverStore((state) => state.setCapacity);
  const goLive = useDriverStore((state) => state.goLive);
  const clearError = useDriverStore((state) => state.clearError);

  const { data: routes, isLoading } = useDriverRoutes();
  const [routeShake, setRouteShake] = useState(false);

  const glowOpacity = useSharedValue(0.4);
  const routeSectionX = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1400 }),
      -1,
      true,
    );
  }, [glowOpacity]);

  useEffect(() => {
    if (!routeShake) {
      return;
    }
    routeSectionX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    const timeout = setTimeout(() => {
      setRouteShake(false);
    }, 320);
    return () => {
      clearTimeout(timeout);
    };
  }, [routeShake, routeSectionX]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const routeSectionStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: routeSectionX.value }],
  }));

  const morningGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    }
    if (hour < 17) {
      return "Good afternoon";
    }
    return "Good evening";
  }, []);

  const handleGoLive = useCallback(async () => {
    clearError();
    if (selectedRouteCode === null) {
      setRouteShake(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await goLive();
      router.replace("/(driver)/live");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "SELECT_ROUTE_REQUIRED"
      ) {
        setRouteShake(true);
      }
    }
  }, [clearError, goLive, selectedRouteCode]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <AppText style={styles.greetingTitle}>
          {morningGreeting}, {greetingName(profile?.name)}! 👋
        </AppText>
        <AppText style={styles.greetingSubtitle}>
          Let&apos;s start your shift.
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + SPACING.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={routeSectionStyle}>
          <DriverOverline>SELECT ROUTE</DriverOverline>
          <View style={styles.routeList}>
            {isLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton
                    key={`route-skeleton-${index}`}
                    width={CARD_WIDTH}
                    height={88}
                    radius={RADIUS.xl}
                  />
                ))
              : routes?.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    selected={selectedRouteCode === route.code}
                    onPress={() => {
                      selectRoute(route.code);
                    }}
                  />
                ))}
          </View>
        </Animated.View>

        <DriverOverline>INITIAL CAPACITY</DriverOverline>
        <View style={styles.capacityCard}>
          {CAPACITY_OPTIONS.map((option) => (
            <CapacitySegment
              key={option.key}
              status={option.key}
              selected={capacityStatus}
              onPress={() => {
                void setCapacity(option.key);
              }}
            />
          ))}
        </View>

        <View style={styles.goLiveWrap}>
          <Animated.View style={[styles.goLiveGlow, glowStyle]} />
          <Pressable
            accessibilityRole="button"
            disabled={isGoLiveLoading}
            onPress={() => {
              void handleGoLive();
            }}
            style={({ pressed }) => [
              styles.goLiveButton,
              pressed && styles.goLivePressed,
              isGoLiveLoading && styles.goLiveLoading,
            ]}
          >
            {isGoLiveLoading ? (
              <ActivityIndicator color={COLORS.white} size="large" />
            ) : (
              <>
                <AppText style={styles.goLiveTitle}>▶  GO LIVE</AppText>
                <AppText style={styles.goLiveCaption}>
                  Starts broadcasting your location to students
                </AppText>
              </>
            )}
          </Pressable>
        </View>

        {errorMessage !== null ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{errorMessage}</AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void handleGoLive();
              }}
              style={styles.retryButton}
            >
              <AppText style={styles.retryText}>Tap to retry</AppText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.checklist}>
          {[
            "Phone charging or battery > 50%",
            "Route confirmed with dispatch",
            "Passenger count reset",
          ].map((item) => (
            <AppText key={item} style={styles.checklistItem}>
              ✓  {item}
            </AppText>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: 108,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    justifyContent: "center",
    gap: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greetingTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: "Inter_700Bold",
    color: COLORS.textPrimary,
  },
  greetingSubtitle: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    gap: SPACING.lg,
    alignItems: "center",
  },
  overline: {
    alignSelf: "flex-start",
    width: CARD_WIDTH,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: SPACING.sm,
  },
  routeList: {
    width: CARD_WIDTH,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  routeCard: {
    width: CARD_WIDTH,
    minHeight: 88,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    flexDirection: "row",
  },
  routeCardIdle: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routeCardSelected: {
    borderWidth: 2,
    ...SHADOWS.md,
  },
  routeAccent: {
    width: 4,
  },
  routeCardBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    minHeight: DRIVER_MIN_TAP_HEIGHT + 28,
  },
  routeBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  routeBadgeText: {
    color: COLORS.white,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_700Bold",
  },
  routeTextBlock: {
    flex: 1,
    gap: 2,
  },
  routeName: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE + 1,
  },
  routeMeta: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE - 1,
  },
  selectionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionCircleIdle: {
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  checkMark: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  capacityCard: {
    width: CARD_WIDTH,
    minHeight: DRIVER_MIN_TAP_HEIGHT,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  capacitySegment: {
    flex: 1,
    minHeight: DRIVER_MIN_TAP_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  capacityLabel: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_500Medium",
    color: COLORS.textSecondary,
  },
  capacityIndicator: {
    position: "absolute",
    bottom: 0,
    left: SPACING.md,
    right: SPACING.md,
    height: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  goLiveWrap: {
    width: CARD_WIDTH,
    marginTop: SPACING.sm,
    alignItems: "center",
  },
  goLiveGlow: {
    position: "absolute",
    width: CARD_WIDTH,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    ...SHADOWS.okGlow,
  },
  goLiveButton: {
    width: CARD_WIDTH,
    minHeight: 80,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    ...SHADOWS.okGlow,
  },
  goLivePressed: {
    opacity: 0.92,
  },
  goLiveLoading: {
    opacity: 0.85,
  },
  goLiveTitle: {
    color: COLORS.white,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: "Inter_800ExtraBold",
  },
  goLiveCaption: {
    marginTop: SPACING.xs,
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },
  errorBox: {
    width: CARD_WIDTH,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: SPACING.sm,
  },
  errorText: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    color: COLORS.error,
    fontFamily: "Inter_500Medium",
  },
  retryButton: {
    minHeight: DRIVER_MIN_TAP_HEIGHT,
    justifyContent: "center",
  },
  retryText: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    color: COLORS.error,
    fontFamily: "Inter_700Bold",
  },
  checklist: {
    width: CARD_WIDTH,
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  checklistItem: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    lineHeight: 22,
    color: COLORS.success,
    fontFamily: "Inter_500Medium",
  },
});
