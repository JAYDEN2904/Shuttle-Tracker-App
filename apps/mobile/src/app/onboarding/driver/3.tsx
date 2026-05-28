import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { CapacityControlIllustration } from "@/components/onboarding/illustrations/CapacityControlIllustration";
import {
  completeOnboarding,
  skipOnboarding,
} from "@/components/onboarding/onboardingActions";
import { COLORS } from "@/utils/constants";

export default function DriverOnboardingStep3() {
  return (
    <OnboardingSlide
      illustrationBg={COLORS.driverBg}
      illustration={<CapacityControlIllustration />}
      totalSteps={3}
      currentStep={2}
      heading="Capacity Control"
      body="Keep your passenger count updated so students know if seats are available before they walk to the stop."
      ctaLabel="Start Driving →"
      onNext={() => {
        void completeOnboarding("driver");
      }}
      onSkip={() => {
        skipOnboarding("driver", 3);
      }}
      dark
    />
  );
}
