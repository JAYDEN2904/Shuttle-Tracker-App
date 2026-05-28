import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

export function LiveMapPortalIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.mapCircle}>
        <View style={[styles.parkPatch, styles.park1]} />
        <View style={[styles.parkPatch, styles.park2]} />
        <View style={styles.routeLine} />
        <View style={[styles.stop, styles.stop1]} />
        <View style={[styles.stop, styles.stop2]} />
        <View style={[styles.stop, styles.stop3]} />

        <View style={styles.rings}>
          <View style={[styles.ring, styles.ring3]} />
          <View style={[styles.ring, styles.ring2]} />
          <View style={[styles.ring, styles.ring1]} />
        </View>

        <View style={styles.busMarker}>
          <Text style={styles.busEmoji}>🚌</Text>
        </View>
      </View>

      <View style={[styles.badge, styles.badgeEta]}>
        <Text style={styles.badgeText}>2 min away</Text>
      </View>
      <View style={[styles.badge, styles.badgeActive]}>
        <Text style={styles.badgeText}>3 active</Text>
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
  mapCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#E8EAED",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  parkPatch: {
    position: "absolute",
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.sm,
  },
  park1: {
    width: 48,
    height: 32,
    top: 36,
    left: 28,
    transform: [{ rotate: "-12deg" }],
  },
  park2: {
    width: 56,
    height: 28,
    bottom: 52,
    right: 24,
    transform: [{ rotate: "8deg" }],
  },
  routeLine: {
    position: "absolute",
    width: 140,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    transform: [{ rotate: "-28deg" }],
    top: 110,
    left: 50,
  },
  stop: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stop1: { top: 58, left: 72 },
  stop2: { top: 98, left: 118 },
  stop3: { top: 138, left: 88 },
  rings: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  ring1: {
    width: 72,
    height: 72,
    opacity: 0.25,
  },
  ring2: {
    width: 96,
    height: 96,
    opacity: 0.15,
  },
  ring3: {
    width: 120,
    height: 120,
    opacity: 0.08,
  },
  busMarker: {
    width: 36,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  busEmoji: {
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  badgeEta: {
    top: "18%",
    right: "8%",
  },
  badgeActive: {
    bottom: "22%",
    left: "6%",
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: COLORS.textPrimary,
  },
});
