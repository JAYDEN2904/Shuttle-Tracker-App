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
import { COLORS, RADIUS, SPACING } from "@/utils/constants";

function PulseDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pulseDot, animatedStyle]} />;
}

function MiniPhone({
  variant,
}: {
  variant: "driver" | "student";
}) {
  return (
    <View style={styles.miniPhone}>
      {variant === "driver" && (
        <View style={styles.liveBadge}>
          <AppText variant="overline" color="white" style={styles.liveBadgeText}>
            LIVE
          </AppText>
        </View>
      )}
      <View style={styles.miniMap}>
        <View style={styles.miniRoute} />
        <View style={styles.miniBus}>
          <Text style={styles.miniBusEmoji}>🚌</Text>
        </View>
      </View>
      {variant === "student" && (
        <View style={styles.toast}>
          <AppText variant="label" color="textPrimary" style={styles.toastText}>
            Shuttle nearby!
          </AppText>
        </View>
      )}
    </View>
  );
}

export function BroadcastingIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.phonesRow}>
        <MiniPhone variant="driver" />
        <View style={styles.centerDots}>
          {[0, 150, 300, 450].map((delay) => (
            <PulseDot key={delay} delay={delay} />
          ))}
        </View>
        <View style={styles.connectorLine} />
        <MiniPhone variant="student" />
      </View>

      <View style={styles.labelsRow}>
        <AppText variant="caption" color="driverDim" style={styles.label}>
          Driver
        </AppText>
        <AppText variant="caption" color="driverDim" style={styles.label}>
          Student
        </AppText>
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
    paddingHorizontal: SPACING.lg,
  },
  phonesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xl,
    position: "relative",
  },
  miniPhone: {
    width: 100,
    height: 160,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.driverBorder,
    backgroundColor: COLORS.driverMedium,
    overflow: "hidden",
    padding: SPACING.sm,
  },
  liveBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.sm,
  },
  liveBadgeText: {
    fontSize: 9,
  },
  miniMap: {
    flex: 1,
    backgroundColor: COLORS.driverBg,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
    position: "relative",
  },
  miniRoute: {
    position: "absolute",
    width: 60,
    height: 3,
    backgroundColor: COLORS.primary,
    top: "45%",
    left: 10,
    transform: [{ rotate: "-15deg" }],
  },
  miniBus: {
    position: "absolute",
    top: "40%",
    left: "35%",
    width: 24,
    height: 18,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  miniBusEmoji: {
    fontSize: 10,
  },
  toast: {
    position: "absolute",
    bottom: SPACING.md,
    left: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  toastText: {
    fontSize: 10,
    textAlign: "center",
  },
  centerDots: {
    position: "absolute",
    flexDirection: "row",
    gap: SPACING.sm,
    zIndex: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  connectorLine: {
    position: "absolute",
    width: 60,
    height: 2,
    backgroundColor: COLORS.driverBorder,
    top: "50%",
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 240,
    marginTop: SPACING.lg,
  },
  label: {
    width: 100,
    textAlign: "center",
  },
});
