import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

interface CapacityCardProps {
  label: string;
  accent: string;
  rotation: string;
  offsetY: number;
  offsetX: number;
  zIndex: number;
  active?: boolean;
}

function CapacityCard({
  label,
  accent,
  rotation,
  offsetY,
  offsetX,
  zIndex,
  active = false,
}: CapacityCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          transform: [{ rotate: rotation }, { translateY: offsetY }, { translateX: offsetX }],
          zIndex,
          borderColor: active ? COLORS.success : COLORS.driverBorder,
        },
        active && styles.cardActive,
      ]}
    >
      {active && (
        <View style={styles.activePill}>
          <AppText variant="overline" color="white" style={styles.activePillText}>
            ACTIVE
          </AppText>
        </View>
      )}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <AppText variant="h3" dark color="driverText">
        {label}
      </AppText>
      <View style={styles.cardDots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.cardDot,
              { backgroundColor: i === 0 ? accent : COLORS.driverBorder },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function CapacityControlIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.cardsStack}>
        <CapacityCard
          label="Full"
          accent={COLORS.error}
          rotation="-8deg"
          offsetY={-20}
          offsetX={-30}
          zIndex={1}
        />
        <CapacityCard
          label="Half Full"
          accent={COLORS.warning}
          rotation="4deg"
          offsetY={-8}
          offsetX={10}
          zIndex={2}
        />
        <CapacityCard
          label="Available"
          accent={COLORS.success}
          rotation="-2deg"
          offsetY={8}
          offsetX={0}
          zIndex={3}
          active
        />
      </View>

      <AppText variant="caption" color="driverDim" style={styles.hint}>
        ← Tap to switch
      </AppText>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
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
  cardsStack: {
    width: 220,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: 160,
    backgroundColor: COLORS.driverSurface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  cardActive: {
    ...SHADOWS.okGlow,
  },
  activePill: {
    position: "absolute",
    top: -10,
    right: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  activePillText: {
    fontSize: 9,
  },
  accentBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  cardDots: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hint: {
    marginTop: SPACING.xxl,
  },
  progressTrack: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.driverBorder,
    borderRadius: 2,
    marginTop: SPACING.lg,
    overflow: "hidden",
  },
  progressFill: {
    width: "30%",
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
});
