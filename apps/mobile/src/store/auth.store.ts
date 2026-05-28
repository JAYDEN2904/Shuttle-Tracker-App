import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { PROFILE_COLUMNS } from "@shuttle/database";
import type { Profile, TablesUpdate } from "@/types/database.types";
import { getTypedSupabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/supabase-errors";
import {
  getRememberedEmployeeId,
  setRememberedEmployeeId,
} from "@/lib/auth/onboarding";
import {
  USE_MOCK_DATA,
  createMockSession,
  MOCK_DRIVER_PROFILE,
  MOCK_STUDENT_PROFILE,
} from "@/lib/mock";

WebBrowser.maybeCompleteAuthSession();

const UG_EMAIL_SUFFIXES = ["@ug.edu.gh", "@st.ug.edu.gh"] as const;

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  syncSession: (session: Session | null) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDriver: (
    employeeId: string,
    pin: string,
    rememberDevice?: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: TablesUpdate<"profiles">) => Promise<void>;
  setExpoPushToken: (token: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

function isUgStudentEmail(email: string | undefined): boolean {
  if (email === undefined) {
    return false;
  }
  const normalized = email.toLowerCase();
  return UG_EMAIL_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

async function loadProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await getTypedSupabase()
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

    if (error !== null) {
      throw handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

async function applyMockAuth(
  profile: Profile,
  set: (fn: (state: AuthStore) => void) => void,
): Promise<void> {
  set((state) => {
    state.session = createMockSession(profile);
    state.profile = profile;
  });
}

async function applySession(
  session: Session | null,
  set: (fn: (state: AuthStore) => void) => void,
): Promise<void> {
  set((state) => {
    state.session = session;
    state.profile = null;
  });

  if (session === null) {
    return;
  }

  const profile = await loadProfile(session.user.id);

  if (profile === null) {
    try {
      await getTypedSupabase().auth.signOut();
    } catch (error) {
      throw handleSupabaseError(error);
    }
    set((state) => {
      state.session = null;
      state.profile = null;
    });
    throw new Error("Profile not found. Contact support.");
  }

  set((state) => {
    state.profile = profile;
  });
}

export const useAuthStore = create<AuthStore>()(
  immer((set, get) => ({
    session: null,
    profile: null,
    isLoading: false,
    isInitialized: false,

    initialize: async () => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        if (USE_MOCK_DATA) {
          return;
        }

        const {
          data: { session },
        } = await getTypedSupabase().auth.getSession();
        await applySession(session, set);
      } catch (error) {
        throw handleSupabaseError(error);
      } finally {
        set((state) => {
          state.isLoading = false;
          state.isInitialized = true;
        });
      }
    },

    syncSession: async (session) => {
      if (USE_MOCK_DATA || get().isLoading) {
        return;
      }

      try {
        await applySession(session, set);
      } catch (error) {
        throw handleSupabaseError(error);
      }
    },

    signInWithGoogle: async () => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => {
            setTimeout(resolve, 400);
          });
          await applyMockAuth(MOCK_STUDENT_PROFILE, set);
          return;
        }

        const redirectTo = makeRedirectUri({ scheme: "shuttle" });
        const { data, error } = await getTypedSupabase().auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: { hd: "ug.edu.gh" },
          },
        });

        if (error !== null) {
          throw handleSupabaseError(error);
        }

        if (data.url === null) {
          throw new Error("Unable to start Google sign-in.");
        }

        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo,
        );

        if (result.type !== "success") {
          throw new Error("Google sign-in was cancelled.");
        }

        const { params, errorCode } = QueryParams.getQueryParams(result.url);

        if (errorCode !== null) {
          throw new Error(errorCode);
        }

        if (params.code === undefined) {
          throw new Error("Missing authorization code.");
        }

        const { data: sessionData, error: exchangeError } =
          await getTypedSupabase().auth.exchangeCodeForSession(params.code);

        if (exchangeError !== null) {
          throw handleSupabaseError(exchangeError);
        }

        if (!isUgStudentEmail(sessionData.user.email ?? undefined)) {
          await getTypedSupabase().auth.signOut();
          throw new Error("Please sign in with your University of Ghana email.");
        }

        await applySession(sessionData.session, set);
      } catch (error) {
        throw handleSupabaseError(error);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    signInDriver: async (employeeId, pin, rememberDevice = false) => {
      const trimmedId = employeeId.trim().toUpperCase();

      if (trimmedId.length === 0 || pin.length !== 4) {
        throw new Error("Enter a valid employee ID and 4-digit PIN.");
      }

      set((state) => {
        state.isLoading = true;
      });

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => {
            setTimeout(resolve, 400);
          });

          if (rememberDevice) {
            await setRememberedEmployeeId(trimmedId);
          } else {
            await setRememberedEmployeeId(null);
          }

          const profile: Profile = {
            ...MOCK_DRIVER_PROFILE,
            employee_id: trimmedId,
          };
          await applyMockAuth(profile, set);
          return;
        }

        const { data: email, error: lookupError } = await getTypedSupabase().rpc(
          "get_driver_email",
          { p_employee_id: trimmedId },
        );

        if (lookupError !== null || email === null) {
          throw handleSupabaseError(
            lookupError ?? new Error("Invalid employee ID or PIN."),
          );
        }

        const { data, error: signInError } =
          await getTypedSupabase().auth.signInWithPassword({
            email,
            password: pin,
          });

        if (signInError !== null) {
          throw handleSupabaseError(signInError);
        }

        if (data.session === null) {
          throw new Error("Invalid employee ID or PIN.");
        }

        const profile = await loadProfile(data.session.user.id);

        if (profile === null || profile.role !== "driver") {
          await getTypedSupabase().auth.signOut();
          throw new Error("This account is not authorized as a driver.");
        }

        if (rememberDevice) {
          await setRememberedEmployeeId(trimmedId);
        } else {
          await setRememberedEmployeeId(null);
        }

        set((state) => {
          state.session = data.session;
          state.profile = profile;
        });
      } catch (error) {
        throw handleSupabaseError(error);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    signOut: async () => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        if (USE_MOCK_DATA) {
          set((state) => {
            state.session = null;
            state.profile = null;
          });
          return;
        }

        await getTypedSupabase().auth.signOut();
        set((state) => {
          state.session = null;
          state.profile = null;
        });
      } catch (error) {
        throw handleSupabaseError(error);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    updateProfile: async (updates) => {
      const userId = get().session?.user.id;

      if (userId === undefined) {
        throw new Error("Not authenticated.");
      }

      if (USE_MOCK_DATA) {
        set((state) => {
          if (state.profile === null) {
            return;
          }
          state.profile = {
            ...state.profile,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        });
        return;
      }

      try {
        const { data, error } = await getTypedSupabase()
          .from("profiles")
          .update(updates)
          .eq("id", userId)
          .select(PROFILE_COLUMNS)
          .single();

        if (error !== null) {
          throw handleSupabaseError(error);
        }

        set((state) => {
          state.profile = data;
        });
      } catch (error) {
        throw handleSupabaseError(error);
      }
    },

    setExpoPushToken: async (token) => {
      await get().updateProfile({ expo_push_token: token });
    },
  })),
);

export async function hydrateRememberedEmployeeId(): Promise<string | null> {
  return getRememberedEmployeeId();
}
