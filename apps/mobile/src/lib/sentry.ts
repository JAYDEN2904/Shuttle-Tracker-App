import * as Sentry from "@sentry/react-native";
import { ENV } from "@/lib/env";

let initialized = false;

export function initSentry(): void {
  if (initialized || ENV.sentryDsn.length === 0) {
    return;
  }

  Sentry.init({
    dsn: ENV.sentryDsn,
    enableAutoSessionTracking: true,
    enableNative: true,
    enableNativeCrashHandling: true,
    attachStacktrace: true,
    tracesSampleRate: 0.2,
  });

  initialized = true;
}

export function setSentryUser(userId: string | null): void {
  if (!initialized) {
    return;
  }

  if (userId === null) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({ id: userId });
}

export { Sentry };
