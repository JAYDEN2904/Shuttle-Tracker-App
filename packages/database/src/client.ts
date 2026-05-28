import {
  createClient,
  type SupabaseClient,
  type SupportedStorage,
} from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

export interface SupabaseClientConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  storage?: SupportedStorage;
  persistSession?: boolean;
}

let supabaseInstance: TypedSupabaseClient | null = null;

export function createTypedSupabaseClient(
  config: SupabaseClientConfig,
): TypedSupabaseClient {
  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: config.storage,
      persistSession: config.persistSession ?? config.storage !== undefined,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

export function initializeSupabase(
  config: SupabaseClientConfig,
): TypedSupabaseClient {
  supabaseInstance = createTypedSupabaseClient(config);
  return supabaseInstance;
}

export function getTypedSupabase(): TypedSupabaseClient {
  if (supabaseInstance === null) {
    throw new Error(
      "Supabase client is not initialized. Call initializeSupabase() first.",
    );
  }
  return supabaseInstance;
}

export function createDatabaseClient(
  config: SupabaseClientConfig,
): TypedSupabaseClient {
  return createTypedSupabaseClient({
    ...config,
    persistSession: false,
  });
}

export type DatabaseClient = TypedSupabaseClient;
export type DatabaseClientOptions = SupabaseClientConfig;

export const supabase: TypedSupabaseClient = new Proxy(
  {} as TypedSupabaseClient,
  {
    get(_target, property, receiver) {
      return Reflect.get(getTypedSupabase(), property, receiver);
    },
  },
);
