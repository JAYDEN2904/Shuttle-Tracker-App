import PostHog from "posthog-react-native";
import { ENV } from "@/lib/env";

export type AnalyticsEvent =
  | { name: "app_opened" }
  | { name: "map_viewed"; properties: { route_filter: string | null } }
  | { name: "stop_tapped"; properties: { stop_id: string } }
  | { name: "shuttle_tapped"; properties: { shuttle_id: string } }
  | { name: "alert_set"; properties: { stop_id: string } }
  | { name: "schedule_viewed" }
  | { name: "driver_went_live"; properties: { route_code: string } }
  | { name: "driver_ended_trip"; properties: { duration_minutes: number } }
  | { name: "onboarding_completed"; properties: { role: string } }
  | {
      name: "onboarding_skipped";
      properties: { role: string; step: number };
    };

let posthogClient: PostHog | null = null;

export function initAnalytics(): PostHog | null {
  if (ENV.posthogApiKey.length === 0) {
    return null;
  }

  if (posthogClient === null) {
    posthogClient = new PostHog(ENV.posthogApiKey, {
      host: ENV.posthogHost,
    });
  }

  return posthogClient;
}

export function getAnalyticsClient(): PostHog | null {
  return posthogClient;
}

export function trackEvent(event: AnalyticsEvent): void {
  const client = posthogClient ?? initAnalytics();
  if (client === null) {
    return;
  }

  if ("properties" in event) {
    client.capture(event.name, event.properties);
    return;
  }

  client.capture(event.name);
}

export async function shutdownAnalytics(): Promise<void> {
  if (posthogClient !== null) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
