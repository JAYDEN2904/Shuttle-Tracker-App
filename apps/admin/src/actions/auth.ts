"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MOCK_SESSION_COOKIE, USE_MOCK_DATA } from "@/lib/mock";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAdmin(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (email.length === 0 || password.length === 0) {
    redirect("/login?error=missing");
  }

  if (USE_MOCK_DATA) {
    const cookieStore = await cookies();
    cookieStore.set(MOCK_SESSION_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    redirect("/");
  }

  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error !== null || data.user === null) {
    redirect("/login?error=invalid");
  }

  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await client.auth.signOut();
    redirect("/login?error=forbidden");
  }

  redirect("/");
}

export async function signOutAdmin(): Promise<void> {
  if (USE_MOCK_DATA) {
    const cookieStore = await cookies();
    cookieStore.delete(MOCK_SESSION_COOKIE);
    redirect("/login");
  }

  const client = await createSupabaseServerClient();
  await client.auth.signOut();
  redirect("/login");
}
