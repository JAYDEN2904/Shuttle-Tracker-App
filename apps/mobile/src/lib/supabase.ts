import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeSupabase, getTypedSupabase, supabase } from "@shuttle/database";
import { ENV } from "@/lib/env";

if (!ENV.useMockData) {
  initializeSupabase({
    supabaseUrl: ENV.supabaseUrl,
    supabaseAnonKey: ENV.supabaseAnonKey,
    storage: AsyncStorage,
    persistSession: true,
  });
}

export { supabase, getTypedSupabase };
