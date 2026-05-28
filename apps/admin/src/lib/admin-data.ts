import {
  getAdminDrivers,
  getAllRoutes,
  getFleetOverview,
  getStopsForRouteAdmin,
} from "@shuttle/database";
import {
  USE_MOCK_DATA,
  getMockAdminDrivers,
  getMockFleetOverview,
  getMockRoutes,
  getMockStops,
} from "@/lib/mock";
import { requireAdminSession } from "@/lib/supabase/server";

export async function loadFleetOverview() {
  if (USE_MOCK_DATA) {
    return getMockFleetOverview();
  }

  const { client } = await requireAdminSession();
  if (client === null) {
    throw new Error("Database client unavailable.");
  }
  return getFleetOverview(client);
}

export async function loadAdminDrivers() {
  if (USE_MOCK_DATA) {
    return getMockAdminDrivers();
  }

  const { client } = await requireAdminSession();
  if (client === null) {
    throw new Error("Database client unavailable.");
  }
  return getAdminDrivers(client);
}

export async function loadRoutesAndStops() {
  if (USE_MOCK_DATA) {
    return {
      routes: getMockRoutes(),
      stops: getMockStops(),
    };
  }

  const { client } = await requireAdminSession();
  if (client === null) {
    throw new Error("Database client unavailable.");
  }
  const routes = await getAllRoutes(client);
  const stopsByRoute = await Promise.all(
    routes.map(async (route) => getStopsForRouteAdmin(client, route.id)),
  );

  return {
    routes,
    stops: stopsByRoute.flat(),
  };
}

export async function loadAdminSession() {
  if (USE_MOCK_DATA) {
    const { MOCK_ADMIN_PROFILE } = await import("@/lib/mock/data");
    return MOCK_ADMIN_PROFILE;
  }

  const session = await requireAdminSession();
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    avatarUrl: session.avatarUrl,
  };
}
