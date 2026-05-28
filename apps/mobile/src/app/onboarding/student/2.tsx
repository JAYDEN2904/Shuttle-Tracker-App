import { router } from "expo-router";
import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { SmartAlertsIllustration } from "@/components/onboarding/illustrations/SmartAlertsIllustration";
import { skipIntroOnboarding } from "@/components/onboarding/onboardingActions";

const ILLUSTRATION_BG = "#EEF4FF";

export default function StudentOnboardingStep2() {
  return (
    <OnboardingSlide
      illustrationBg={ILLUSTRATION_BG}
      illustration={<SmartAlertsIllustration />}
      totalSteps={3}
      currentStep={1}
      heading="Smart Alerts"
      body="Set alerts for your stop and get notified when your shuttle is minutes away — so you never miss a ride."
      ctaLabel="Continue"
      onNext={() => {
        router.push("/onboarding/student/3");
      }}
      onSkip={() => {
        skipIntroOnboarding(2);
      }}
    />
  );
}
