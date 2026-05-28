import { Text, StyleSheet, type TextProps, type TextStyle } from "react-native";
import {
  COLORS,
  TYPOGRAPHY,
  type ColorToken,
  type TypographyVariant,
} from "@/utils/constants";

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: TextStyle["textAlign"];
  dark?: boolean;
}

function resolveColor(
  color: ColorToken | undefined,
  dark: boolean,
): string {
  if (color !== undefined) {
    return COLORS[color];
  }
  return dark ? COLORS.driverText : COLORS.textPrimary;
}

export function AppText({
  variant = "body",
  color,
  align,
  dark = false,
  style,
  ...props
}: AppTextProps) {
  const typography = TYPOGRAPHY[variant];

  return (
    <Text
      style={[
        styles.base,
        typography,
        { color: resolveColor(color, dark) },
        align !== undefined && { textAlign: align },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
