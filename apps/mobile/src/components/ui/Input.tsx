import { useState, type ReactNode } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { AppText } from "./AppText";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/utils/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  dark?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  dark = false,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = error !== undefined && error.length > 0;

  const fieldStyle: ViewStyle = dark
    ? {
        backgroundColor: COLORS.driverSurface,
        borderColor: COLORS.driverBorder,
      }
    : {
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
      };

  const focusStyle: ViewStyle =
    isFocused && !hasError
      ? { borderColor: COLORS.primary, borderWidth: 2 }
      : { borderWidth: 1 };

  const errorStyle: ViewStyle = hasError
    ? { borderColor: COLORS.error, borderWidth: 1 }
    : {};

  return (
    <View style={styles.container}>
      {label !== undefined && (
        <AppText
          variant="label"
          color={dark ? "driverText" : "textPrimary"}
          dark={dark}
          style={styles.label}
        >
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.field,
          fieldStyle,
          focusStyle,
          errorStyle,
        ]}
      >
        {leftIcon !== undefined && (
          <View style={styles.iconLeft}>{leftIcon}</View>
        )}
        <TextInput
          placeholderTextColor={dark ? COLORS.driverDim : COLORS.textTertiary}
          style={[
            styles.input,
            dark ? styles.inputDark : styles.inputLight,
            style,
          ]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {rightIcon !== undefined && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>
      {hasError && (
        <AppText variant="caption" color="error" style={styles.message}>
          {error}
        </AppText>
      )}
      {!hasError && hint !== undefined && (
        <AppText
          variant="caption"
          color={dark ? "driverDim" : "textSecondary"}
          style={styles.message}
        >
          {hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.body.fontSize,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    fontFamily: TYPOGRAPHY.body.fontFamily,
    paddingVertical: 0,
  },
  inputLight: {
    color: COLORS.textPrimary,
  },
  inputDark: {
    color: COLORS.driverText,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  message: {
    marginTop: SPACING.xs,
  },
});
