import { ENV } from "@/lib/env";

/** Mock mode is on by default; set EXPO_PUBLIC_USE_MOCK_DATA=false for real Supabase. */
export const USE_MOCK_DATA = ENV.useMockData;
