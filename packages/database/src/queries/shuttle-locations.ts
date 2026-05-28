import type { CapacityStatus } from "@shuttle/shared-types";
import type { TypedSupabaseClient } from "../client";
import type { TablesInsert, TablesUpdate } from "../database.types";

export async function upsertShuttleLocation(
  client: TypedSupabaseClient,
  payload: {
    shuttleId: string;
    lat: number;
    lng: number;
    heading: number;
    speedKmh: number;
    updatedAt: string;
  },
): Promise<void> {
  const row: TablesInsert<"shuttle_locations"> = {
    shuttle_id: payload.shuttleId,
    lat: payload.lat,
    lng: payload.lng,
    heading: payload.heading,
    speed_kmh: payload.speedKmh,
    updated_at: payload.updatedAt,
  };

  const { error } = await client
    .from("shuttle_locations")
    .upsert(row, { onConflict: "shuttle_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateShuttleLiveStatus(
  client: TypedSupabaseClient,
  shuttleId: string,
  updates: {
    isLive?: boolean;
    capacityStatus?: CapacityStatus;
    tripStartedAt?: string | null;
  },
): Promise<void> {
  const payload: TablesUpdate<"shuttles"> = {};

  if (updates.isLive !== undefined) {
    payload.is_live = updates.isLive;
  }
  if (updates.capacityStatus !== undefined) {
    payload.capacity_status = updates.capacityStatus;
  }
  if (updates.tripStartedAt !== undefined) {
    payload.trip_started_at = updates.tripStartedAt;
  }

  const { error } = await client
    .from("shuttles")
    .update(payload)
    .eq("id", shuttleId);

  if (error) {
    throw new Error(error.message);
  }
}
