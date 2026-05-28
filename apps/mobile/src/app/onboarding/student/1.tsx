import { router } from "expo-router";
import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { LiveMapPortalIllustration } from "@/components/onboarding/illustrations/LiveMapPortalIllustration";
import { skipIntroOnboarding } from "@/components/onboarding/onboardingActions";
import { COLORS } from "@/utils/constants";

export default function StudentOnboardingStep1() {
  return (
    <OnboardingSlide
      illustrationBg={COLORS.primary}
      illustration={<LiveMapPortalIllustration />}
      totalSteps={3}
      currentStep={0}
      heading="Your Live Map Portal"
      body="See every active shuttle on campus in real time, with ETAs and stop locations at a glance."
      ctaLabel="Continue"
      onNext={() => {
        router.push("/onboarding/student/2");
      }}
      onSkip={() => {
        skipIntroOnboarding(1);
      }}
    />
  );
}
