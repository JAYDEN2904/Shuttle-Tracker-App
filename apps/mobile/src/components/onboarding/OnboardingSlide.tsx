import type { ReactNode } from "react";
import { useEffect } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, Button } from "@/components/ui";
import { ProgressDots } from "./ProgressDots";
import { COLORS, SPACING, TYPOGRAPHY } from "@/utils/constants";

interface OnboardingSlideProps {
  illustrationBg: string;
  illustration: ReactNode;
  totalSteps: number;
  currentStep: number;
  heading: string;
  body: string;
  ctaLabel: string;
  onNext: () => void;
  onSkip?: () => void;
  dark?: boolean;
}

export function OnboardingSlide({
  illustrationBg,
  illustration,
  totalSteps,
  currentStep,
  heading,
  body,
  ctaLabel,
  onNext,
  onSkip,
  dark = false,
}: OnboardingSlideProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(screenWidth);
  const illustrationHeight = screenHeight * 0.55;

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, [screenWidth, translateX]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  function handleNext() {
    translateX.value = withSpring(
      -screenWidth,
      { damping: 20, stiffness: 200 },
      (finished) => {
        if (finished) {
          runOnJS(onNext)();
        }
      },
    );
  }

  const cardBg = dark ? COLORS.driverSurface : COLORS.white;
  const skipColor = dark ? "driverDim" : "textSecondary";

  return (
    <Animated.View
      style={[
        styles.root,
        { backgroundColor: dark ? COLORS.driverBg : illustrationBg },
        containerStyle,
      ]}
    >
      {onSkip !== undefined && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={onSkip}
          style={[styles.skip, { top: insets.top + SPACING.sm }]}
          hitSlop={12}
        >
          <AppText variant="bodyMed" color={skipColor} dark={dark}>
            Skip
          </AppText>
        </Pressable>
      )}

      <View
        style={[
          styles.illustrationArea,
          {
            height: illustrationHeight,
            backgroundColor: illustrationBg,
          },
        ]}
      >
        {illustration}
      </View>

      <View
        style={[
          styles.contentCard,
          {
            backgroundColor: cardBg,
            paddingBottom: insets.bottom + SPACING.xxl,
          },
        ]}
      >
        <ProgressDots
          totalSteps={totalSteps}
          currentStep={currentStep}
          dark={dark}
        />

        <AppText
          variant="display"
          dark={dark}
          style={styles.heading}
        >
          {heading}
        </AppText>

        <AppText
          variant="body"
          color={dark ? "driverDim" : "textSecondary"}
          dark={dark}
          style={styles.body}
        >
          {body}
        </AppText>

        <Button
          label={ctaLabel}
          onPress={handleNext}
          fullWidth
          dark={dark}
          style={styles.cta}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  skip: {
    position: "absolute",
    right: SPACING.xxl,
    zIndex: 10,
  },
  illustrationArea: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  contentCard: {
    flex: 1,
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
    gap: SPACING.lg,
  },
  heading: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: TYPOGRAPHY.display.fontSize,
    lineHeight: TYPOGRAPHY.display.lineHeight,
  },
  body: {
    lineHeight: 24,
    flex: 1,
  },
  cta: {
    height: 56,
  },
});
