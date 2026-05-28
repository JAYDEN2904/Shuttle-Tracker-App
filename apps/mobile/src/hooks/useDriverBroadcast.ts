import { useDriverStore } from "@/store/driver.store";

/** @deprecated Prefer useDriverStore actions (goLive / endTrip). */
export function useDriverBroadcast(): {
  isBroadcasting: boolean;
  startBroadcast: (shuttleId: string) => Promise<void>;
  stopBroadcast: () => Promise<void>;
  updateOccupancy: (occupancy: number) => void;
} {
  const isLive = useDriverStore((state) => state.isLive);
  const goLive = useDriverStore((state) => state.goLive);
  const endTrip = useDriverStore((state) => state.endTrip);
  const setCapacity = useDriverStore((state) => state.setCapacity);

  return {
    isBroadcasting: isLive,
    startBroadcast: async () => {
      await goLive();
    },
    stopBroadcast: async () => {
      await endTrip();
    },
    updateOccupancy: () => {
      void setCapacity("available");
    },
  };
}
