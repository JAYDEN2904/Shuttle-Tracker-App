import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/utils/constants";

interface RouteFilterChipProps {
  routeFilterLabel: string;
  onRouteFilterPress?: () => void;
}

export function RouteFilterChip({
  routeFilterLabel,
  onRouteFilterPress,
}: RouteFilterChipProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { paddingTop: insets.top + SPACING.sm }]}
    >
      <Pressable
        style={styles.chip}
        onPress={onRouteFilterPress}
        accessibilityRole="button"
        accessibilityLabel={`Filter routes: ${routeFilterLabel}`}
      >
        <AppText variant="bodyMed" color="primary">
          {routeFilterLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  chip: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
});
