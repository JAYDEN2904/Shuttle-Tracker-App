import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database.types";

export function createMockSession(profile: Profile): Session {
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: "bearer",
    user: {
      id: profile.id,
      email: profile.email,
      app_metadata: {},
      user_metadata: { name: profile.name },
      aud: "authenticated",
      created_at: profile.created_at,
    },
  } as Session;
}
