import { router } from "expo-router";
import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { BroadcastingIllustration } from "@/components/onboarding/illustrations/BroadcastingIllustration";
import { skipOnboarding } from "@/components/onboarding/onboardingActions";
import { COLORS } from "@/utils/constants";

export default function DriverOnboardingStep2() {
  return (
    <OnboardingSlide
      illustrationBg={COLORS.driverBg}
      illustration={<BroadcastingIllustration />}
      totalSteps={3}
      currentStep={1}
      heading="Instant Broadcasting"
      body="Your position updates in real time on every student's map — no extra steps required."
      ctaLabel="Continue"
      onNext={() => {
        router.push("/onboarding/driver/3");
      }}
      onSkip={() => {
        skipOnboarding("driver", 2);
      }}
      dark
    />
  );
}
