import { StyleSheet, Text, View } from "react-native";
import { AppText } from "@/components/ui";
import { COLORS, SPACING } from "@/utils/constants";

const STOPS = ["Main Gate", "Balme", "Commonwealth", "Legon Hall", "DTF"];

export function RouteCoverageIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.routeRow}>
        {STOPS.map((name, index) => (
          <View key={name} style={styles.stopGroup}>
            {index > 0 && <View style={styles.segment} />}
            <View style={styles.stopCircle} />
            {index === 2 && (
              <View style={styles.busMarker}>
                <Text style={styles.busEmoji}>🚌</Text>
              </View>
            )}
            <AppText variant="overline" color="textSecondary" style={styles.stopLabel}>
              {name}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.routeA }]} />
          <AppText variant="caption" color="textSecondary">
            Route A
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.routeB }]} />
          <AppText variant="caption" color="textSecondary">
            Route B
          </AppText>
        </View>
      </View>

      <View style={styles.locationDot}>
        <View style={styles.locationPulse} />
        <View style={styles.locationCore} />
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
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: 340,
  },
  stopGroup: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  segment: {
    position: "absolute",
    top: 11,
    right: "50%",
    width: "100%",
    height: 4,
    backgroundColor: COLORS.primary,
    zIndex: 0,
  },
  stopCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    zIndex: 1,
  },
  stopLabel: {
    marginTop: SPACING.sm,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 12,
  },
  busMarker: {
    position: "absolute",
    top: -8,
    zIndex: 2,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  busEmoji: {
    fontSize: 12,
  },
  legend: {
    flexDirection: "row",
    gap: SPACING.xxl,
    marginTop: SPACING.huge,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationDot: {
    position: "absolute",
    bottom: "20%",
    right: "18%",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
  },
  locationPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryAlpha20,
  },
  locationCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
