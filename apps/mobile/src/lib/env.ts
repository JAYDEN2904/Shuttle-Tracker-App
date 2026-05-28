/** Centralized Expo public environment variables. Never hardcode secrets here. */
export const ENV = {
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA !== "false",
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  mapboxPublicToken: process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ?? "",
  posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "",
  posthogHost:
    process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
} as const;

export function assertRequiredEnv(): void {
  if (ENV.useMockData) {
    return;
  }

  if (ENV.supabaseUrl.length === 0 || ENV.supabaseAnonKey.length === 0) {
    console.warn(
      "[env] EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are required when mock mode is off.",
    );
  }
}
