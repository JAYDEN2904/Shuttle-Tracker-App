import { View, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { COLORS, RADIUS, SPACING } from "@/utils/constants";

type BadgeVariant =
  | "available"
  | "half_full"
  | "full"
  | "live"
  | "primary";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

interface VariantStyle {
  backgroundColor: string;
  textColor: keyof typeof COLORS;
  dotColor: string;
}

const VARIANT_STYLES: Record<BadgeVariant, VariantStyle> = {
  available: {
    backgroundColor: COLORS.successBg,
    textColor: "success",
    dotColor: COLORS.success,
  },
  half_full: {
    backgroundColor: COLORS.warningBg,
    textColor: "warning",
    dotColor: COLORS.warning,
  },
  full: {
    backgroundColor: COLORS.errorBg,
    textColor: "error",
    dotColor: COLORS.error,
  },
  live: {
    backgroundColor: COLORS.success,
    textColor: "white",
    dotColor: COLORS.white,
  },
  primary: {
    backgroundColor: COLORS.primaryLight,
    textColor: "primary",
    dotColor: COLORS.primary,
  },
};

const SIZE_STYLES: Record<
  BadgeSize,
  { paddingHorizontal: number; paddingVertical: number; textVariant: "caption" | "label" }
> = {
  sm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    textVariant: "label",
  },
  md: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    textVariant: "caption",
  },
};

export function Badge({
  label,
  variant = "primary",
  size = "md",
  dot = false,
}: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
      ]}
    >
      {dot && (
        <View
          style={[styles.dot, { backgroundColor: variantStyle.dotColor }]}
        />
      )}
      <AppText variant={sizeStyle.textVariant} color={variantStyle.textColor}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.full,
    alignSelf: "flex-start",
  },
  dot: {
    width: SPACING.sm,
    height: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
  },
});
