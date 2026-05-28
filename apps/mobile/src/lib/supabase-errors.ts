import type { PostgrestError } from "@supabase/supabase-js";

export class SupabaseServiceError extends Error {
  readonly code: string | undefined;
  readonly details: string | undefined;
  readonly hint: string | undefined;

  constructor(message: string, error?: PostgrestError | null) {
    super(message);
    this.name = "SupabaseServiceError";
    this.code = error?.code;
    this.details = error?.details ?? undefined;
    this.hint = error?.hint ?? undefined;
  }
}

const POSTGRES_MESSAGE_MAP: Record<string, string> = {
  "23505": "That record already exists.",
  "23503": "This action references data that no longer exists.",
  "23514": "The data provided is invalid.",
  "42501": "You do not have permission to perform this action.",
  "PGRST116": "The requested item could not be found.",
  "PGRST301": "Your session has expired. Please sign in again.",
  "28000": "Authentication failed. Please sign in again.",
  "28P01": "Authentication failed. Please sign in again.",
  "57014": "The request took too long. Please try again.",
  "22P02": "Invalid data format.",
  "23502": "Required information is missing.",
};

function mapPostgresCode(code: string | undefined): string | undefined {
  if (code === undefined) {
    return undefined;
  }
  return POSTGRES_MESSAGE_MAP[code];
}

export function handleSupabaseError(error: unknown): SupabaseServiceError {
  if (error instanceof SupabaseServiceError) {
    return error;
  }

  if (isPostgrestError(error)) {
    const friendly =
      mapPostgresCode(error.code) ??
      (error.message.length > 0
        ? error.message
        : "Something went wrong. Please try again.");
    return new SupabaseServiceError(friendly, error);
  }

  if (error instanceof Error) {
    return new SupabaseServiceError(error.message);
  }

  return new SupabaseServiceError("Something went wrong. Please try again.");
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as PostgrestError).message === "string"
  );
}

export async function withSupabase<T>(
  operation: () => Promise<{ data: T; error: PostgrestError | null }>,
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error !== null) {
      throw handleSupabaseError(error);
    }
    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
}
