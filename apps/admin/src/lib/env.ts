function readEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name] ?? fallback;
  return value !== undefined && value.length > 0 ? value : undefined;
}

export function getSupabaseUrl(): string {
  const value = readEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  );
  if (value === undefined) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  return value;
}

export function getSupabaseAnonKey(): string {
  const value = readEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (value === undefined) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return value;
}

export function getSupabaseServiceRoleKey(): string {
  const value = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (value === undefined) {
    throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }
  return value;
}

export function getMapboxToken(): string {
  return (
    readEnv(
      "NEXT_PUBLIC_MAPBOX_TOKEN",
      process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN,
    ) ?? ""
  );
}

export function isMapboxConfigured(): boolean {
  return getMapboxToken().length > 0;
}
