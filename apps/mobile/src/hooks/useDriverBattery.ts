import { useEffect } from "react";
import { useDriverStore } from "@/store/driver.store";

export function useDriverBattery(pollMs = 60_000): void {
  const setBatteryLevel = useDriverStore((state) => state.setBatteryLevel);

  useEffect(() => {
    let cancelled = false;

    async function poll(): Promise<void> {
      try {
        const Battery = await import("expo-battery");
        const level = await Battery.getBatteryLevelAsync();
        if (!cancelled) {
          setBatteryLevel(Math.round(level * 100));
        }
      } catch {
        if (!cancelled) {
          setBatteryLevel(null);
        }
      }
    }

    void poll();
    const interval = setInterval(() => {
      void poll();
    }, pollMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollMs, setBatteryLevel]);
}
