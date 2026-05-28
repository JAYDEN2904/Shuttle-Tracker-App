import { createClient } from "@supabase/supabase-js";
import type { Database } from "@shuttle/database/database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

export function createServiceRoleClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
