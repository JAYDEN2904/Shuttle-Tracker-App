import { NextResponse } from "next/server";
import { createDatabaseClient, getLiveShuttles } from "@shuttle/database";

export async function GET(): Promise<NextResponse> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl === undefined || serviceRoleKey === undefined) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 },
    );
  }

  const client = createDatabaseClient({
    supabaseUrl,
    supabaseAnonKey: serviceRoleKey,
  });

  const shuttles = await getLiveShuttles(client);

  return NextResponse.json({ shuttles });
}
