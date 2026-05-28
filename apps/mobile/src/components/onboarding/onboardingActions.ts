import { router } from "expo-router";
import {
  markAppIntroComplete,
  markOnboardingComplete,
} from "@/lib/auth/onboarding";
import { trackEvent } from "@/lib/analytics";
import type { UserRole } from "@/types/database.types";

/** Pre-auth intro (student slides) → sign-in. */
export async function completeIntroOnboarding(
  trackCompletion = true,
): Promise<void> {
  await markAppIntroComplete();
  if (trackCompletion) {
    trackEvent({
      name: "onboarding_completed",
      properties: { role: "student" },
    });
  }
  router.replace("/(auth)/sign-in");
}

export function skipIntroOnboarding(step: number): void {
  trackEvent({
    name: "onboarding_skipped",
    properties: { role: "student", step },
  });
  void completeIntroOnboarding(false);
}

/** Role-specific onboarding after choosing a login path. */
export async function completeOnboarding(
  role: UserRole,
  trackCompletion = true,
): Promise<void> {
  await markOnboardingComplete(role);
  if (trackCompletion) {
    trackEvent({
      name: "onboarding_completed",
      properties: { role },
    });
  }
  if (role === "student") {
    router.replace("/(student)");
    return;
  }
  router.replace("/(driver)");
}

export function skipOnboarding(role: UserRole, step: number): void {
  trackEvent({
    name: "onboarding_skipped",
    properties: { role, step },
  });
  void completeOnboarding(role, false);
}
