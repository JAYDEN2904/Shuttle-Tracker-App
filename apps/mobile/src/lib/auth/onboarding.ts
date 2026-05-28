import * as SecureStore from "expo-secure-store";
import type { UserRole } from "@/types/database.types";

const APP_INTRO_KEY = "app_intro_complete";

function onboardingKey(role: UserRole): string {
  return `onboarding_complete_${role}`;
}

export async function isAppIntroComplete(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(APP_INTRO_KEY);
  return value === "true";
}

export async function markAppIntroComplete(): Promise<void> {
  await SecureStore.setItemAsync(APP_INTRO_KEY, "true");
}

export async function clearAppIntroComplete(): Promise<void> {
  await SecureStore.deleteItemAsync(APP_INTRO_KEY);
}

export async function isOnboardingComplete(role: UserRole): Promise<boolean> {
  const value = await SecureStore.getItemAsync(onboardingKey(role));
  return value === "true";
}

export async function markOnboardingComplete(role: UserRole): Promise<void> {
  await SecureStore.setItemAsync(onboardingKey(role), "true");
}

export async function clearOnboardingComplete(role: UserRole): Promise<void> {
  await SecureStore.deleteItemAsync(onboardingKey(role));
}

const REMEMBER_EMPLOYEE_KEY = "driver_remember_employee_id";

export async function getRememberedEmployeeId(): Promise<string | null> {
  return SecureStore.getItemAsync(REMEMBER_EMPLOYEE_KEY);
}

export async function setRememberedEmployeeId(
  employeeId: string | null,
): Promise<void> {
  if (employeeId === null || employeeId.length === 0) {
    await SecureStore.deleteItemAsync(REMEMBER_EMPLOYEE_KEY);
    return;
  }
  await SecureStore.setItemAsync(REMEMBER_EMPLOYEE_KEY, employeeId);
}
