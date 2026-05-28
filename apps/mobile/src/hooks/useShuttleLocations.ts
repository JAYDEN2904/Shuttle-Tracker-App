import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { getLiveShuttlesWithRoutes } from "@shuttle/database";
import type { ShuttleWithLocation } from "@/types/app.types";
import { supabase } from "@/lib/supabase";
import { SHUTTLE_LOCATION_CHANNEL } from "@/utils/constants";
import { handleSupabaseError } from "@/lib/supabase-errors";
import { USE_MOCK_DATA, getMockLiveShuttles } from "@/lib/mock";
import {
  animateShuttleTo,
  clearShuttlePositions,
  removeShuttlePosition,
} from "@/lib/shuttle-position-registry";

function applyAnimatedPositions(
  shuttles: ShuttleWithLocation[],
  immediate = false,
): void {
  for (const shuttle of shuttles) {
    animateShuttleTo(
      shuttle.id,
      shuttle.location.lat,
      shuttle.location.lng,
      immediate,
    );
  }
}

export function useShuttleLocations(): {
  shuttles: ShuttleWithLocation[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
} {
  const shuttlesRef = useRef<ShuttleWithLocation[]>([]);
  const [shuttles, setShuttles] = useState<ShuttleWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const commitShuttles = useCallback(
    (nextShuttles: ShuttleWithLocation[], immediateAnimation = false) => {
      shuttlesRef.current = nextShuttles;
      applyAnimatedPositions(nextShuttles, immediateAnimation);
      startTransition(() => {
        setShuttles(nextShuttles);
        setLastUpdated(new Date());
      });
    },
    [],
  );

  const fetchShuttles = useCallback(async () => {
    try {
      setError(null);
      const nextShuttles = USE_MOCK_DATA
        ? getMockLiveShuttles()
        : await getLiveShuttlesWithRoutes(supabase);

      const previousIds = new Set(
        shuttlesRef.current.map((shuttle) => shuttle.id),
      );
      const nextIds = new Set(nextShuttles.map((shuttle) => shuttle.id));

      for (const shuttleId of previousIds) {
        if (!nextIds.has(shuttleId)) {
          removeShuttlePosition(shuttleId);
        }
      }

      commitShuttles(nextShuttles, shuttlesRef.current.length === 0);
    } catch (fetchError) {
      setError(handleSupabaseError(fetchError));
    } finally {
      setIsLoading(false);
    }
  }, [commitShuttles]);

  useEffect(() => {
    void fetchShuttles();

    if (USE_MOCK_DATA) {
      const interval = setInterval(() => {
        void fetchShuttles();
      }, 3000);

      return () => {
        clearInterval(interval);
        clearShuttlePositions();
      };
    }

    const channel = supabase
      .channel(SHUTTLE_LOCATION_CHANNEL)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shuttle_locations" },
        () => {
          startTransition(() => {
            void fetchShuttles();
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shuttles" },
        () => {
          startTransition(() => {
            void fetchShuttles();
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
      clearShuttlePositions();
    };
  }, [fetchShuttles]);

  return {
    shuttles,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchShuttles,
  };
}
