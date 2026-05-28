import { ActivityIndicator, StyleSheet, View } from "react-native";
import { COLORS } from "@/utils/constants";

export function MapLoadingOverlay() {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
