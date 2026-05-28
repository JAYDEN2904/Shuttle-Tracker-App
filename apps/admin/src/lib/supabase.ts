import { createDatabaseClient } from "@shuttle/database";
import { getLiveShuttles } from "@shuttle/database";

export function getAdminDatabaseClient() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl === undefined || serviceRoleKey === undefined) {
    throw new Error("Missing Supabase environment variables");
  }

  return createDatabaseClient({
    supabaseUrl,
    supabaseAnonKey: serviceRoleKey,
  });
}
