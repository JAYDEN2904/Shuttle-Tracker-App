import { View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "@/utils/constants";

interface DividerProps {
  spacing?: number;
}

export function Divider({ spacing = SPACING.lg }: DividerProps) {
  return <View style={[styles.divider, { marginVertical: spacing }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: "100%",
  },
});
