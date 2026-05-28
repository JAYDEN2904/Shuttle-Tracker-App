import type { Profile, UserRole } from "@shuttle/shared-types";
import type { TypedSupabaseClient } from "../client";
import type { TablesRow } from "../database.types";
import { PROFILE_COLUMNS } from "../select-columns";

type ProfileRow = TablesRow<"profiles">;

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    employeeId: row.employee_id,
    avatarUrl: row.avatar_url,
    expoPushToken: row.expo_push_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfileById(
  client: TypedSupabaseClient,
  profileId: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    return null;
  }

  return mapProfileRow(data);
}

export async function getProfilesByRole(
  client: TypedSupabaseClient,
  role: UserRole,
): Promise<Profile[]> {
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("role", role)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProfileRow);
}
