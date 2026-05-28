"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { TypedSupabaseClient } from "@shuttle/database";

let browserClient: TypedSupabaseClient | null = null;

export function createSupabaseBrowserClient(): TypedSupabaseClient {
  if (browserClient !== null) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      "",
  ) as TypedSupabaseClient;

  return browserClient;
}
