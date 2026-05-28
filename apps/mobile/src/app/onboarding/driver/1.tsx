import { router } from "expo-router";
import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { GoLiveIllustration } from "@/components/onboarding/illustrations/GoLiveIllustration";
import { skipOnboarding } from "@/components/onboarding/onboardingActions";
import { COLORS } from "@/utils/constants";

export default function DriverOnboardingStep1() {
  return (
    <OnboardingSlide
      illustrationBg={COLORS.driverBg}
      illustration={<GoLiveIllustration />}
      totalSteps={3}
      currentStep={0}
      heading="Go Live"
      body="Tap once to start broadcasting your location so students across campus can find your shuttle."
      ctaLabel="Continue"
      onNext={() => {
        router.push("/onboarding/driver/2");
      }}
      onSkip={() => {
        skipOnboarding("driver", 1);
      }}
      dark
    />
  );
}
