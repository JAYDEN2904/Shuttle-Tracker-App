"use server";

import { revalidatePath } from "next/cache";
import {
  USE_MOCK_DATA,
  addMockDriver,
  deactivateMockDriver,
  updateMockDriver,
} from "@/lib/mock";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdminSession } from "@/lib/supabase/server";

function driverEmail(employeeId: string): string {
  return `driver.${employeeId.toLowerCase()}@shuttle.ug.edu.gh`;
}

export async function createDriverAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const employeeId = String(formData.get("employeeId") ?? "")
    .trim()
    .toUpperCase();
  const routeId = String(formData.get("routeId") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (name.length === 0 || employeeId.length === 0 || pin.length !== 4) {
    throw new Error("Name, employee ID, and 4-digit PIN are required.");
  }

  if (USE_MOCK_DATA) {
    await requireAdminSession();
    addMockDriver({ name, employeeId, routeId });
    revalidatePath("/drivers");
    return;
  }

  await requireAdminSession();

  const serviceClient = createServiceRoleClient();
  const email = driverEmail(employeeId);

  const { data: createdUser, error: createError } =
    await serviceClient.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true,
      user_metadata: { name },
    });

  if (createError !== null || createdUser.user === null) {
    throw new Error(createError?.message ?? "Unable to create driver account.");
  }

  const { error: profileError } = await serviceClient.from("profiles").upsert({
    id: createdUser.user.id,
    email,
    name,
    role: "driver",
    employee_id: employeeId,
  });

  if (profileError !== null) {
    throw new Error(profileError.message);
  }

  if (routeId.length > 0) {
    const { error: shuttleError } = await serviceClient.from("shuttles").insert({
      driver_id: createdUser.user.id,
      route_id: routeId,
      is_live: false,
    });

    if (shuttleError !== null) {
      throw new Error(shuttleError.message);
    }
  }

  revalidatePath("/drivers");
}

export async function updateDriverAction(formData: FormData): Promise<void> {
  const driverId = String(formData.get("driverId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const employeeId = String(formData.get("employeeId") ?? "")
    .trim()
    .toUpperCase();
  const routeId = String(formData.get("routeId") ?? "").trim();

  if (driverId.length === 0 || name.length === 0 || employeeId.length === 0) {
    throw new Error("Driver ID, name, and employee ID are required.");
  }

  if (USE_MOCK_DATA) {
    await requireAdminSession();
    updateMockDriver({ driverId, name, employeeId, routeId });
    revalidatePath("/drivers");
    return;
  }

  const { client } = await requireAdminSession();
  if (client === null) {
    throw new Error("Database client unavailable.");
  }

  const { error: profileError } = await client
    .from("profiles")
    .update({ name, employee_id: employeeId })
    .eq("id", driverId);

  if (profileError !== null) {
    throw new Error(profileError.message);
  }

  const { data: shuttle } = await client
    .from("shuttles")
    .select("id")
    .eq("driver_id", driverId)
    .maybeSingle();

  if (routeId.length === 0) {
    if (shuttle !== null) {
      await client.from("shuttles").delete().eq("id", shuttle.id);
    }
  } else if (shuttle === null) {
    await client.from("shuttles").insert({
      driver_id: driverId,
      route_id: routeId,
      is_live: false,
    });
  } else {
    await client
      .from("shuttles")
      .update({ route_id: routeId })
      .eq("id", shuttle.id);
  }

  revalidatePath("/drivers");
}

export async function deactivateDriverAction(driverId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await requireAdminSession();
    deactivateMockDriver(driverId);
    revalidatePath("/drivers");
    return;
  }

  await requireAdminSession();
  const serviceClient = createServiceRoleClient();

  await serviceClient
    .from("shuttles")
    .update({ is_live: false, driver_id: null })
    .eq("driver_id", driverId);

  const { error } = await serviceClient.auth.admin.updateUserById(driverId, {
    ban_duration: "876000h",
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  revalidatePath("/drivers");
}

export async function resetDriverPinAction(
  driverId: string,
  pin: string,
): Promise<void> {
  if (pin.length !== 4) {
    throw new Error("PIN must be 4 digits.");
  }

  if (USE_MOCK_DATA) {
    await requireAdminSession();
    return;
  }

  await requireAdminSession();
  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.auth.admin.updateUserById(driverId, {
    password: pin,
  });

  if (error !== null) {
    throw new Error(error.message);
  }
}
