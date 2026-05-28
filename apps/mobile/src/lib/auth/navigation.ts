import { router } from "expo-router";
import type { Profile } from "@/types/database.types";

export async function resolvePostAuthRoute(
  profile: Profile,
): Promise<string> {
  if (profile.role === "student") {
    return "/(student)";
  }

  if (profile.role === "driver") {
    return "/(driver)";
  }

  return "/(auth)/sign-in";
}

export async function navigateAfterAuth(profile: Profile): Promise<void> {
  const route = await resolvePostAuthRoute(profile);
  router.replace(route as Parameters<typeof router.replace>[0]);
}
