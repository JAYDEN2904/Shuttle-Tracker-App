import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AppText } from "./AppText";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  type ShadowToken,
} from "@/utils/constants";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  dark?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: 40,
  md: 52,
  lg: 64,
};

const SIZE_RADIUS: Record<ButtonSize, number> = {
  sm: RADIUS.lg,
  md: RADIUS.xl,
  lg: RADIUS.xl,
};

const SIZE_PADDING: Record<ButtonSize, number> = {
  sm: SPACING.md,
  md: SPACING.lg,
  lg: SPACING.xl,
};

interface VariantConfig {
  container: ViewStyle;
  shadow?: ShadowToken;
  textColor: keyof typeof COLORS;
}

function getVariantConfig(
  variant: ButtonVariant,
  dark: boolean,
): VariantConfig {
  if (dark) {
    switch (variant) {
      case "primary":
        return {
          container: { backgroundColor: COLORS.primary },
          shadow: "glow",
          textColor: "white",
        };
      case "secondary":
        return {
          container: {
            backgroundColor: COLORS.driverMedium,
            borderWidth: 1,
            borderColor: COLORS.driverBorder,
          },
          textColor: "driverText",
        };
      case "ghost":
        return {
          container: { backgroundColor: "transparent" },
          textColor: "primary",
        };
      case "danger":
        return {
          container: {
            backgroundColor: COLORS.errorBg,
            borderWidth: 1,
            borderColor: COLORS.error,
          },
          textColor: "error",
        };
      case "success":
        return {
          container: { backgroundColor: COLORS.success },
          shadow: "okGlow",
          textColor: "white",
        };
    }
  }

  switch (variant) {
    case "primary":
      return {
        container: { backgroundColor: COLORS.primary },
        shadow: "glow",
        textColor: "white",
      };
    case "secondary":
      return {
        container: {
          backgroundColor: COLORS.surface2,
          borderWidth: 1,
          borderColor: COLORS.border,
        },
        textColor: "textPrimary",
      };
    case "ghost":
      return {
        container: { backgroundColor: "transparent" },
        textColor: "primary",
      };
    case "danger":
      return {
        container: {
          backgroundColor: COLORS.errorBg,
          borderWidth: 1,
          borderColor: COLORS.error,
        },
        textColor: "error",
      };
    case "success":
      return {
        container: { backgroundColor: COLORS.success },
        shadow: "okGlow",
        textColor: "white",
      };
  }
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  fullWidth = false,
  dark = false,
  leftIcon,
  rightIcon,
  style,
  accessibilityLabel,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const variantConfig = getVariantConfig(variant, dark);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled === true || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={(event) => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        onPressOut?.(event);
      }}
      style={[
        styles.base,
        {
          height: SIZE_HEIGHT[size],
          borderRadius: SIZE_RADIUS[size],
          paddingHorizontal: SIZE_PADDING[size],
        },
        variantConfig.container,
        variantConfig.shadow !== undefined && SHADOWS[variantConfig.shadow],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={COLORS[variantConfig.textColor]}
            size="small"
          />
        ) : (
          <>
            {leftIcon !== undefined && (
              <View style={styles.iconLeft}>{leftIcon}</View>
            )}
            <AppText
              variant="bodyMed"
              color={variantConfig.textColor}
              dark={dark && variantConfig.textColor === "driverText"}
            >
              {label}
            </AppText>
            {rightIcon !== undefined && (
              <View style={styles.iconRight}>{rightIcon}</View>
            )}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});
