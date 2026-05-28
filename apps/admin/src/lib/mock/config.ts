/** Mock mode is on by default; set NEXT_PUBLIC_USE_MOCK_DATA=false for real Supabase. */
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" &&
  process.env.EXPO_PUBLIC_USE_MOCK_DATA !== "false";

export const MOCK_SESSION_COOKIE = "mock-admin-session";
