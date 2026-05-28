import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { COLORS, RADIUS, SPACING } from "@/utils/constants";

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  dark?: boolean;
}

export function Toggle({
  value,
  onValueChange,
  label,
  dark = false,
}: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label ?? "Toggle"}
      onPress={() => {
        onValueChange(!value);
      }}
      style={styles.row}
    >
      {label !== undefined && (
        <AppText
          variant="bodyMed"
          color={dark ? "driverText" : "textPrimary"}
          dark={dark}
        >
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.track,
          value ? styles.trackOn : styles.trackOff,
          dark && styles.trackDark,
        ]}
      >
        <View
          style={[
            styles.thumb,
            value ? styles.thumbOn : styles.thumbOff,
          ]}
        />
      </View>
    </Pressable>
  );
}

const TRACK_WIDTH = 48;
const THUMB_SIZE = 22;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  track: {
    width: TRACK_WIDTH,
    height: 28,
    borderRadius: RADIUS.full,
    padding: 3,
    justifyContent: "center",
  },
  trackOn: {
    backgroundColor: COLORS.primary,
  },
  trackOff: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trackDark: {
    backgroundColor: COLORS.driverMedium,
    borderColor: COLORS.driverBorder,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
  },
  thumbOn: {
    alignSelf: "flex-end",
  },
  thumbOff: {
    alignSelf: "flex-start",
  },
});
