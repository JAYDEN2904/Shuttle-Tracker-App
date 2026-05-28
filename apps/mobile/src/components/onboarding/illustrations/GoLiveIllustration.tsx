import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AppText } from "@/components/ui";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

const RING_CONFIG = [
  { size: 200, opacity: 0.06, delay: 0 },
  { size: 170, opacity: 0.1, delay: 150 },
  { size: 140, opacity: 0.16, delay: 300 },
  { size: 110, opacity: 0.22, delay: 450 },
] as const;

function PulseRing({
  size,
  opacity,
  delay,
}: {
  size: number;
  opacity: number;
  delay: number;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: `rgba(18, 185, 90, ${opacity})`,
        },
        animatedStyle,
      ]}
    />
  );
}

export function GoLiveIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.ringsContainer}>
        {RING_CONFIG.map((ring) => (
          <PulseRing
            key={ring.size}
            size={ring.size}
            opacity={ring.opacity}
            delay={ring.delay}
          />
        ))}

        <View style={styles.phoneFrame}>
          <View style={styles.centerCircle}>
            <AppText variant="overline" color="white" style={styles.goText}>
              GO
            </AppText>
            <AppText variant="h3" color="white" style={styles.liveText}>
              LIVE
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.floatingPill}>
        <Text style={styles.pillText}>📍 3 students found your shuttle</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ringsContainer: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
  phoneFrame: {
    width: 130,
    height: 130,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.driverBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  centerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.okGlow,
  },
  goText: {
    fontSize: 13,
    letterSpacing: 2,
  },
  liveText: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: "Inter_800ExtraBold",
  },
  floatingPill: {
    position: "absolute",
    bottom: "16%",
    backgroundColor: COLORS.driverSurface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.driverBorder,
    ...SHADOWS.md,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: COLORS.driverText,
  },
});
