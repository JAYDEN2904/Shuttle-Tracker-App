import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { TypedSupabaseClient } from "@shuttle/database";
import { MOCK_ADMIN_PROFILE, MOCK_SESSION_COOKIE, USE_MOCK_DATA } from "@/lib/mock";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

export async function createSupabaseServerClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware handles refresh.
        }
      },
    },
  }) as TypedSupabaseClient;
}

export async function requireAdminSession(): Promise<{
  client: TypedSupabaseClient | null;
  userId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}> {
  if (USE_MOCK_DATA) {
    const cookieStore = await cookies();
    if (cookieStore.get(MOCK_SESSION_COOKIE)?.value !== "1") {
      throw new Error("Unauthorized");
    }

    return {
      client: null,
      userId: MOCK_ADMIN_PROFILE.userId,
      email: MOCK_ADMIN_PROFILE.email,
      name: MOCK_ADMIN_PROFILE.name,
      avatarUrl: MOCK_ADMIN_PROFILE.avatarUrl,
    };
  }

  const client = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError !== null || user === null) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role, name, avatar_url, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError !== null || profile === null || profile.role !== "admin") {
    throw new Error("Forbidden");
  }

  return {
    client,
    userId: user.id,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatar_url,
  };
}
