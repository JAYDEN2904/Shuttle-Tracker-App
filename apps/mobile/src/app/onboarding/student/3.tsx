import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { RouteCoverageIllustration } from "@/components/onboarding/illustrations/RouteCoverageIllustration";
import {
  completeIntroOnboarding,
  skipIntroOnboarding,
} from "@/components/onboarding/onboardingActions";
import { COLORS } from "@/utils/constants";

export default function StudentOnboardingStep3() {
  return (
    <OnboardingSlide
      illustrationBg={COLORS.white}
      illustration={<RouteCoverageIllustration />}
      totalSteps={3}
      currentStep={2}
      heading="Full Route Coverage"
      body="Browse all campus routes, compare options, and find the best shuttle for your destination."
      ctaLabel="Get Started →"
      onNext={() => {
        void completeIntroOnboarding();
      }}
      onSkip={() => {
        skipIntroOnboarding(3);
      }}
    />
  );
}
