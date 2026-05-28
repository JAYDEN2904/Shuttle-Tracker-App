import { QueryClient } from "@tanstack/react-query";

/** Routes and stops — 10 minutes */
export const ROUTES_STALE_TIME_MS = 10 * 60 * 1000;

/** Schedule — 1 hour */
export const SCHEDULE_STALE_TIME_MS = 60 * 60 * 1000;

/** Shuttle locations use realtime subscriptions — no polling stale time needed */
export const SHUTTLE_LOCATIONS_STALE_TIME_MS = 0;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}
