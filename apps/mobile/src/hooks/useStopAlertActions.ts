import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelStopAlert, setStopAlert } from "@/services/alert.service";
import { trackEvent } from "@/lib/analytics";

export function useStopAlertActions() {
  const queryClient = useQueryClient();

  const invalidateAlerts = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["stop-alerts"] });
  };

  const createMutation = useMutation({
    mutationFn: (input: {
      stopId: string;
      shuttleId: string;
      etaMinutes: number;
    }) => setStopAlert(input.stopId, input.shuttleId, input.etaMinutes),
    onSuccess: (_data, variables) => {
      trackEvent({
        name: "alert_set",
        properties: { stop_id: variables.stopId },
      });
      void invalidateAlerts();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelStopAlert,
    onSuccess: () => {
      void invalidateAlerts();
    },
  });

  return {
    createAlert: createMutation.mutateAsync,
    cancelAlert: cancelMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
