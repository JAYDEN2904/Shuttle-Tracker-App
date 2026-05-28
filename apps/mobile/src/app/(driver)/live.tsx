import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components/ui";
import { EndTripSheet } from "@/components/driver/EndTripSheet";
import { useDriverBattery } from "@/hooks/useDriverBattery";
import { useDriverNextStop } from "@/hooks/useDriverNextStop";
import { useDriverRoutes } from "@/hooks/useDriverRoutes";
import { useDriverStore } from "@/store/driver.store";
import type { CapacityStatus } from "@shuttle/shared-types";
import {
  COLORS,
  DRIVER_MIN_LABEL_FONT_SIZE,
  DRIVER_MIN_TAP_HEIGHT,
  RADIUS,
  SPACING,
} from "@/utils/constants";

const ROW_WIDTH = Math.min(350, Dimensions.get("window").width - 40);
const EMERGENCY_HOLD_MS = 3000;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CAPACITY_ROWS: Array<{
  key: CapacityStatus;
  label: string;
  activeBg: string;
  activeBorder: string;
  stripe: string;
}> = [
  {
    key: "available",
    label: "Available",
    activeBg: "#0F2A1A",
    activeBorder: COLORS.success,
    stripe: COLORS.success,
  },
  {
    key: "half_full",
    label: "Half Full",
    activeBg: "#2A220F",
    activeBorder: COLORS.warning,
    stripe: COLORS.warning,
  },
  {
    key: "full",
    label: "Full",
    activeBg: "#2A1010",
    activeBorder: COLORS.error,
    stripe: COLORS.error,
  },
];

function DriverOverline({
  children,
  centered,
}: {
  children: string;
  centered?: boolean;
}) {
  return (
    <AppText
      dark
      color="driverDim"
      style={[styles.overline, centered && styles.overlineCenter]}
    >
      {children}
    </AppText>
  );
}

function LiveBadge() {
  const glow = useSharedValue(0.2);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={styles.liveBadgeWrap}>
      <Animated.View style={[styles.liveBadgeGlow, glowStyle]} />
      <View style={styles.liveBadge}>
        <AppText style={styles.liveBadgeText}>● LIVE</AppText>
      </View>
    </View>
  );
}

function PulsingDots() {
  return (
    <View style={styles.dotsRow}>
      {[0, 300, 600, 900].map((delay) => (
        <PulsingDot key={delay} delayMs={delay} />
      ))}
    </View>
  );
}

function PulsingDot({ delayMs }: { delayMs: number }) {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: 700 }),
        -1,
        true,
      );
    }, delayMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [delayMs, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.statusDot, style]} />;
}

function TripTimer({ startedAt }: { startedAt: Date | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null) {
      return;
    }
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <View style={styles.timerBlock}>
      <DriverOverline centered>TRIP DURATION</DriverOverline>
      <AppText style={styles.timerValue}>
        {pad(hours)} : {pad(minutes)} : {pad(seconds)}
      </AppText>
      <View style={styles.timerLabels}>
        <AppText style={styles.timerUnit}>HH</AppText>
        <AppText style={styles.timerUnit}>MM</AppText>
        <AppText style={styles.timerUnit}>SS</AppText>
      </View>
    </View>
  );
}

function CapacityRow({
  label,
  active,
  activeBg,
  activeBorder,
  stripe,
  onPress,
}: {
  label: string;
  active: boolean;
  activeBg: string;
  activeBorder: string;
  stripe: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => {
          if (active) {
            return;
          }
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          scale.value = withSequence(
            withSpring(0.98, { damping: 14 }),
            withSpring(1, { damping: 12 }),
          );
          onPress();
        }}
        style={[
          styles.capacityRow,
          active
            ? {
                backgroundColor: activeBg,
                borderColor: activeBorder,
              }
            : styles.capacityRowIdle,
        ]}
      >
        {active ? (
          <View style={[styles.capacityStripe, { backgroundColor: stripe }]} />
        ) : null}
        <AppText
          style={[
            styles.capacityRowLabel,
            active && { color: COLORS.driverText },
          ]}
        >
          {label}
        </AppText>
        {active ? (
          <View style={[styles.activePill, { borderColor: stripe }]}>
            <AppText style={[styles.activePillText, { color: stripe }]}>
              ACTIVE
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function EmergencyButton({
  onTriggered,
}: {
  onTriggered: () => Promise<void>;
}) {
  const progress = useSharedValue(0);
  const [holding, setHolding] = useState(false);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const longPress = Gesture.LongPress()
    .minDuration(EMERGENCY_HOLD_MS)
    .onBegin(() => {
      setHolding(true);
      progress.value = withTiming(1, { duration: EMERGENCY_HOLD_MS });
    })
    .onFinalize(() => {
      setHolding(false);
      progress.value = withTiming(0, { duration: 200 });
    })
    .onEnd(() => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      void onTriggered();
    });

  return (
    <GestureDetector gesture={longPress}>
      <View style={styles.emergencyOuter}>
        {holding ? (
          <Svg width={ROW_WIDTH + 8} height={72} style={styles.emergencyRing}>
            <AnimatedCircle
              cx={(ROW_WIDTH + 8) / 2}
              cy={36}
              r={radius}
              stroke={COLORS.error}
              strokeWidth={3}
              fill="none"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation={-90}
              origin={`${(ROW_WIDTH + 8) / 2}, 36`}
            />
          </Svg>
        ) : null}
        <View style={styles.emergencyButton}>
          <AppText style={styles.emergencyTitle}>⚠  Emergency Alert</AppText>
          <AppText style={styles.emergencyHint}>Hold 3 seconds →</AppText>
        </View>
      </View>
    </GestureDetector>
  );
}

export default function DriverLiveScreen() {
  const insets = useSafeAreaInsets();
  const endTripSheetRef = useRef<BottomSheetModal>(null);
  const [emergencyConfirmVisible, setEmergencyConfirmVisible] = useState(false);

  const isLive = useDriverStore((state) => state.isLive);
  const tripStartedAt = useDriverStore((state) => state.tripStartedAt);
  const capacityStatus = useDriverStore((state) => state.capacityStatus);
  const selectedRouteCode = useDriverStore((state) => state.selectedRouteCode);
  const setCapacity = useDriverStore((state) => state.setCapacity);
  const endTrip = useDriverStore((state) => state.endTrip);
  const sendEmergencyAlert = useDriverStore((state) => state.sendEmergencyAlert);

  const { data: routes } = useDriverRoutes();
  const nextStop = useDriverNextStop();
  useDriverBattery();

  const routeName = useMemo(() => {
    const route = routes?.find((item) => item.code === selectedRouteCode);
    return route?.name ?? selectedRouteCode ?? "Campus route";
  }, [routes, selectedRouteCode]);

  const routeColor = useMemo(() => {
    const route = routes?.find((item) => item.code === selectedRouteCode);
    return route?.color ?? COLORS.primary;
  }, [routes, selectedRouteCode]);

  useEffect(() => {
    if (!isLive) {
      router.replace("/(driver)");
    }
  }, [isLive]);

  const confirmEndTrip = useCallback(() => {
    endTripSheetRef.current?.present();
  }, []);

  const handleEndTrip = useCallback(async () => {
    endTripSheetRef.current?.dismiss();
    await endTrip();
    router.replace("/(driver)");
  }, [endTrip]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          Alert.alert(
            "Are you sure?",
            "Your trip will be ended.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "End trip",
                style: "destructive",
                onPress: () => {
                  void handleEndTrip();
                },
              },
            ],
          );
          return true;
        },
      );
      return () => {
        subscription.remove();
      };
    }, [handleEndTrip]),
  );

  const handleEmergency = useCallback(async () => {
    try {
      await sendEmergencyAlert();
      setEmergencyConfirmVisible(false);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "EMERGENCY_CONFIRM_REQUIRED"
      ) {
        setEmergencyConfirmVisible(true);
        return;
      }
      Alert.alert(
        "Emergency alert failed",
        error instanceof Error ? error.message : "Try again.",
      );
    }
  }, [sendEmergencyAlert]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 50,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LiveBadge />

        <AppText style={styles.routeCaption}>{routeName}</AppText>

        <View style={styles.nextStopCard}>
          <View style={styles.nextStopRouteLine}>
            <View style={[styles.routeLine, { backgroundColor: routeColor }]} />
            <View style={[styles.stopDot, { borderColor: routeColor }]} />
          </View>
          <View style={styles.nextStopContent}>
            <DriverOverline>NEXT STOP</DriverOverline>
            <AppText style={styles.nextStopName}>
              {nextStop?.stop.name ?? "Calculating…"}
            </AppText>
          </View>
          <View style={styles.distanceBadge}>
            <AppText style={styles.distanceText}>
              {nextStop?.distanceLabel ?? "—"}
            </AppText>
          </View>
        </View>

        <TripTimer startedAt={tripStartedAt} />

        <View style={styles.capacitySection}>
          <DriverOverline>UPDATE CAPACITY</DriverOverline>
          <AppText style={styles.capacityHint}>Tap to update</AppText>
          {CAPACITY_ROWS.map((row) => (
            <CapacityRow
              key={row.key}
              label={row.label}
              active={capacityStatus === row.key}
              activeBg={row.activeBg}
              activeBorder={row.activeBorder}
              stripe={row.stripe}
              onPress={() => {
                void setCapacity(row.key);
              }}
            />
          ))}
        </View>

        <EmergencyButton onTriggered={handleEmergency} />

        <Pressable
          accessibilityRole="button"
          onPress={confirmEndTrip}
          style={styles.endTripButton}
        >
          <AppText style={styles.endTripLabel}>⏹  END TRIP</AppText>
        </Pressable>

        <View style={styles.footer}>
          <AppText style={styles.footerText}>
            Broadcasting every 4s · Students can see you live
          </AppText>
          <PulsingDots />
        </View>
      </ScrollView>

      <EndTripSheet
        ref={endTripSheetRef}
        onConfirm={() => {
          void handleEndTrip();
        }}
        onCancel={() => {
          endTripSheetRef.current?.dismiss();
        }}
      />

      {emergencyConfirmVisible ? (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <AppText style={styles.confirmTitle}>Send another alert?</AppText>
            <AppText style={styles.confirmBody}>
              You sent an emergency alert moments ago. Confirm to notify dispatch
              again.
            </AppText>
            <Pressable
              accessibilityRole="button"
              style={styles.confirmPrimary}
              onPress={() => {
                void sendEmergencyAlert({ confirmedDuplicate: true }).then(
                  () => {
                    setEmergencyConfirmVisible(false);
                  },
                );
              }}
            >
              <AppText style={styles.confirmPrimaryText}>Yes, send again</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.confirmSecondary}
              onPress={() => {
                setEmergencyConfirmVisible(false);
              }}
            >
              <AppText style={styles.confirmSecondaryText}>Cancel</AppText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.driverBg,
  },
  scroll: {
    alignItems: "center",
    gap: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  liveBadgeWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadgeGlow: {
    position: "absolute",
    width: 120,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
  },
  liveBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    minHeight: 36,
    justifyContent: "center",
  },
  liveBadgeText: {
    color: COLORS.white,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: 1.2,
  },
  routeCaption: {
    color: COLORS.driverDim,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  nextStopCard: {
    width: ROW_WIDTH,
    backgroundColor: COLORS.driverSurface,
    borderRadius: 14,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    minHeight: DRIVER_MIN_TAP_HEIGHT + 16,
  },
  nextStopRouteLine: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  routeLine: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    backgroundColor: COLORS.driverSurface,
  },
  nextStopContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  nextStopName: {
    color: COLORS.driverText,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  distanceBadge: {
    backgroundColor: COLORS.driverMedium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 36,
    justifyContent: "center",
  },
  distanceText: {
    color: COLORS.success,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_700Bold",
  },
  overline: {
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  overlineCenter: {
    textAlign: "center",
  },
  timerBlock: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  timerValue: {
    color: COLORS.driverText,
    fontSize: 36,
    lineHeight: 44,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: 2,
  },
  timerLabels: {
    flexDirection: "row",
    gap: SPACING.xxxl,
  },
  timerUnit: {
    color: COLORS.driverDim,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    width: 48,
    textAlign: "center",
  },
  capacitySection: {
    width: ROW_WIDTH,
    gap: SPACING.sm,
  },
  capacityHint: {
    color: COLORS.driverDim,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_400Regular",
    marginBottom: SPACING.xs,
  },
  capacityRow: {
    width: ROW_WIDTH,
    minHeight: 80,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  capacityRowIdle: {
    backgroundColor: COLORS.driverSurface,
    borderColor: COLORS.driverBorder,
  },
  capacityStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  capacityRowLabel: {
    flex: 1,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE + 1,
    fontFamily: "Inter_600SemiBold",
    color: COLORS.driverDim,
  },
  activePill: {
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: 32,
    justifyContent: "center",
  },
  activePillText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
  },
  emergencyOuter: {
    width: ROW_WIDTH,
    minHeight: DRIVER_MIN_TAP_HEIGHT,
    justifyContent: "center",
  },
  emergencyRing: {
    position: "absolute",
    top: -4,
    left: -4,
  },
  emergencyButton: {
    width: ROW_WIDTH,
    minHeight: DRIVER_MIN_TAP_HEIGHT,
    borderRadius: RADIUS.lg,
    backgroundColor: "#2A1010",
    borderWidth: 2,
    borderColor: COLORS.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
  },
  emergencyTitle: {
    color: COLORS.error,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE + 1,
    fontFamily: "Inter_700Bold",
  },
  emergencyHint: {
    color: COLORS.driverDim,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_500Medium",
  },
  endTripButton: {
    width: ROW_WIDTH,
    minHeight: 84,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.driverSurface,
    borderWidth: 2,
    borderColor: COLORS.driverText,
    alignItems: "center",
    justifyContent: "center",
  },
  endTripLabel: {
    color: COLORS.driverText,
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    alignItems: "center",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  footerText: {
    color: COLORS.driverDim,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  confirmCard: {
    width: ROW_WIDTH,
    backgroundColor: COLORS.driverSurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  confirmTitle: {
    color: COLORS.driverText,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE + 2,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  confirmBody: {
    color: COLORS.driverDim,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    textAlign: "center",
    lineHeight: 22,
  },
  confirmPrimary: {
    minHeight: DRIVER_MIN_TAP_HEIGHT,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmPrimaryText: {
    color: COLORS.white,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_700Bold",
  },
  confirmSecondary: {
    minHeight: DRIVER_MIN_TAP_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmSecondaryText: {
    color: COLORS.driverDim,
    fontSize: DRIVER_MIN_LABEL_FONT_SIZE,
    fontFamily: "Inter_600SemiBold",
  },
});
