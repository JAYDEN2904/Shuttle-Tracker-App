import { StyleSheet, Text, View } from "react-native";
import { AppText } from "@/components/ui";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

export function SmartAlertsIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.notificationCard}>
        <View style={styles.accentBar} />
        <View style={styles.cardContent}>
          <View style={styles.busIconSquare}>
            <Text style={styles.busEmoji}>🚌</Text>
          </View>
          <View style={styles.cardText}>
            <AppText variant="caption" color="textSecondary">
              Shuttle arriving at Main Gate
            </AppText>
            <AppText variant="h1" color="primary" style={styles.eta}>
              2 min
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.bellArea}>
        <View style={[styles.pulseRing, styles.pulseRingOuter]} />
        <View style={[styles.pulseRing, styles.pulseRingInner]} />
        <View style={styles.bellCircle}>
          <Text style={styles.bellEmoji}>🔔</Text>
        </View>
      </View>

      <View style={styles.stepsRow}>
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <AppText variant="label" color="primary">
            At stop
          </AppText>
        </View>
        <View style={[styles.stepLine, styles.stepLineActive]} />
        <View style={styles.stepItem}>
          <View style={styles.stepDot} />
          <AppText variant="label" color="textSecondary">
            Walking
          </AppText>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={styles.stepDot} />
          <AppText variant="label" color="textSecondary">
            Alert set
          </AppText>
        </View>
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
    paddingHorizontal: SPACING.xxl,
  },
  notificationCard: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  accentBar: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  busIconSquare: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  busEmoji: {
    fontSize: 22,
  },
  cardText: {
    flex: 1,
    gap: SPACING.xs,
  },
  eta: {
    fontSize: 28,
    lineHeight: 32,
  },
  bellArea: {
    marginTop: SPACING.xxxl,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
  },
  pulseRing: {
    position: "absolute",
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pulseRingOuter: {
    width: 100,
    height: 100,
    opacity: 0.12,
  },
  pulseRingInner: {
    width: 80,
    height: 80,
    opacity: 0.2,
  },
  bellCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.glow,
  },
  bellEmoji: {
    fontSize: 28,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: SPACING.xxxl,
    width: "100%",
    maxWidth: 320,
    justifyContent: "center",
  },
  stepItem: {
    alignItems: "center",
    gap: SPACING.sm,
    width: 72,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginTop: 4,
    maxWidth: 40,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
});
