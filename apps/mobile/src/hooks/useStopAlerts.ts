import { useQuery } from "@tanstack/react-query";
import type { StopAlert } from "@shuttle/shared-types";
import {
  fetchAlertsForStop,
  fetchStudentAlerts,
  filterPendingAlerts,
} from "@/services/alert.service";

export function useStopAlerts(stopId?: string): {
  alerts: StopAlert[];
  pendingAlerts: StopAlert[];
  isLoading: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: stopId ? ["stop-alerts", stopId] : ["stop-alerts"],
    queryFn: () =>
      stopId ? fetchAlertsForStop(stopId) : fetchStudentAlerts(),
    refetchInterval: 60000,
  });

  const alerts = query.data ?? [];

  return {
    alerts,
    pendingAlerts: filterPendingAlerts(alerts),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
