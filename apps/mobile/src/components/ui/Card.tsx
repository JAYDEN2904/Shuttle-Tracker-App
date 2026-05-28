import { View, StyleSheet, type ViewProps, type ViewStyle } from "react-native";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  type ShadowToken,
} from "@/utils/constants";

interface CardProps extends ViewProps {
  padding?: number;
  shadow?: ShadowToken;
  radius?: number;
  dark?: boolean;
}

export function Card({
  padding = SPACING.lg,
  shadow = "sm",
  radius = RADIUS.xl,
  dark = false,
  style,
  children,
  ...props
}: CardProps) {
  const cardStyle: ViewStyle = dark
    ? {
        backgroundColor: COLORS.driverSurface,
        borderColor: COLORS.driverBorder,
      }
    : {
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
      };

  return (
    <View
      style={[
        styles.card,
        cardStyle,
        SHADOWS[shadow],
        { padding, borderRadius: radius },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
