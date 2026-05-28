import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { COLORS, SPACING } from "@/utils/constants";

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
  dark?: boolean;
}

function Dot({ active, dark }: { active: boolean; dark: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, { damping: 20, stiffness: 200 }),
    backgroundColor: active
      ? COLORS.primary
      : "transparent",
    borderColor: active
      ? COLORS.primary
      : dark
        ? COLORS.driverBorder
        : COLORS.border,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
        !active && styles.inactive,
      ]}
    />
  );
}

export function ProgressDots({
  totalSteps,
  currentStep,
  dark = false,
}: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <Dot key={index} active={index === currentStep} dark={dark} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  inactive: {
    borderWidth: 1.5,
  },
});
