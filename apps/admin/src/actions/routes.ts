"use server";

import { revalidatePath } from "next/cache";
import {
  USE_MOCK_DATA,
  addMockStop,
  removeMockStop,
  updateMockStopPosition,
} from "@/lib/mock";
import { requireAdminSession } from "@/lib/supabase/server";

export async function updateStopPositionAction(input: {
  stopId: string;
  lat: number;
  lng: number;
}): Promise<void> {
  if (USE_MOCK_DATA) {
    await requireAdminSession();
    updateMockStopPosition(input);
    revalidatePath("/routes");
    return;
  }

  const { client } = await requireAdminSession();
  if (client === null) {
    throw new Error("Database client unavailable.");
  }

  const { error } = await client
    .from("stops")
    .update({ lat: input.lat, lng: input.lng })
    .eq("id", input.stopId);

  if (error !== null) {
    throw new Error(error.message);
  }

  revalidatePath("/routes");
}

export async function createStopAction(input: {
  routeId: string;
  name: string;
  lat: number;
  lng: number;
}): Promise<void> {
  if (USE_MOCK_DATA) {
    await requireAdminSession();
    addMockStop(input);
    revalidatePath("/routes");
    return;
  }

  const { client } = await requireAdminSession();
  if (client === null) {
    throw new Error("Database client unavailable.");
  }

  const { data: existingStops, error: countError } = await client
    .from("stops")
    .select("sequence_order")
    .eq("route_id", input.routeId)
    .order("sequence_order", { ascending: false })
    .limit(1);

  if (countError !== null) {
    throw new Error(countError.message);
  }

  const nextSequence = (existingStops?.[0]?.sequence_order ?? 0) + 1;

  const { error } = await client.from("stops").insert({
    route_id: input.routeId,
    name: input.name,
    lat: input.lat,
    lng: input.lng,
    sequence_order: nextSequence,
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  revalidatePath("/routes");
}

export async function deleteStopAction(stopId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await requireAdminSession();
    removeMockStop(stopId);
    revalidatePath("/routes");
    return;
  }

  const { client } = await requireAdminSession();
  if (client === null) {
    throw new Error("Database client unavailable.");
  }

  const { error } = await client.from("stops").delete().eq("id", stopId);

  if (error !== null) {
    throw new Error(error.message);
  }

  revalidatePath("/routes");
}
