import { useMemo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { AppText, Button, Card } from "@/components/ui";
import { useShuttleLocations } from "@/hooks/useShuttleLocations";
import { useStopAlertActions } from "@/hooks/useStopAlertActions";
import { confirmCancelStopAlert } from "@/lib/alert-confirmation";
import { useStopAlerts } from "@/hooks/useStopAlerts";
import { useStopETA } from "@/hooks/useStopETA";
import { USE_MOCK_DATA, getMockStopName } from "@/lib/mock";
import { formatTime } from "@/utils/format.utils";
import { COLORS, RADIUS, SPACING } from "@/utils/constants";

function AlertRow({
  stopId,
  shuttleId,
  notifyAt,
  alertId,
}: {
  stopId: string;
  shuttleId: string;
  notifyAt: string;
  alertId: string;
}) {
  const { shuttles } = useShuttleLocations();
  const etaEntries = useStopETA(stopId, shuttles);
  const { cancelAlert, isCancelling } = useStopAlertActions();

  const shuttleEntry = etaEntries.find(
    (entry) => entry.shuttle.id === shuttleId,
  );
  const shuttleLabel = USE_MOCK_DATA
    ? `Shuttle ${shuttleId.replace("mock-shuttle-", "#")}`
    : `Shuttle ${shuttleId.slice(0, 8)}`;
  const routeName = shuttleEntry?.shuttle.route?.name ?? "Campus route";
  const etaLabel =
    shuttleEntry !== undefined
      ? `${Math.max(1, Math.round(shuttleEntry.etaMinutes))} min`
      : `Notify at ${formatTime(notifyAt)}`;
  const stopLabel = USE_MOCK_DATA
    ? getMockStopName(stopId)
    : `Stop ${stopId.slice(0, 8)}`;

  return (
    <Card style={styles.alertCard}>
      <View style={styles.alertContent}>
        <AppText variant="h3">{stopLabel}</AppText>
        <AppText variant="body" color="textSecondary">
          {routeName} · {shuttleLabel}
        </AppText>
        <AppText variant="bodyMed" color="primary">
          ETA {etaLabel}
        </AppText>
      </View>
      <Button
        label="Cancel"
        variant="ghost"
        size="sm"
        loading={isCancelling}
        accessibilityLabel={`Cancel alert for ${stopLabel}`}
        onPress={() => {
          confirmCancelStopAlert(() => {
            void cancelAlert(alertId);
          });
        }}
      />
    </Card>
  );
}

function AlertsEmptyState() {
  const router = useRouter();

  return (
    <Card style={styles.emptyCard}>
      <View style={styles.emptyIllustration} accessibilityRole="none">
        <AppText variant="display">🔔</AppText>
      </View>
      <AppText variant="h2" align="center">
        No alerts set
      </AppText>
      <AppText variant="caption" color="textSecondary" align="center">
        Tap on any stop on the map to set an arrival alert.
      </AppText>
      <Button
        label="Go to Map"
        fullWidth
        accessibilityLabel="Go to map"
        onPress={() => {
          router.push("/(student)");
        }}
        style={styles.emptyButton}
      />
    </Card>
  );
}

export default function AlertsScreen() {
  const { pendingAlerts, isLoading } = useStopAlerts();

  const sortedAlerts = useMemo(
    () =>
      [...pendingAlerts].sort(
        (left, right) =>
          new Date(left.notifyAt).getTime() - new Date(right.notifyAt).getTime(),
      ),
    [pendingAlerts],
  );

  return (
    <FlashList
      data={sortedAlerts}
      keyExtractor={(item) => item.id}
      estimatedItemSize={120}
      contentContainerStyle={styles.content}
      style={styles.container}
      ListHeaderComponent={
        <View style={styles.header}>
          <AppText variant="h1">Alerts</AppText>
          <AppText variant="caption" color="textSecondary" style={styles.subtitle}>
            Active stop arrival notifications
          </AppText>
          {isLoading && (
            <AppText variant="body" color="textSecondary">
              Loading alerts...
            </AppText>
          )}
        </View>
      }
      ListEmptyComponent={!isLoading ? <AlertsEmptyState /> : null}
      renderItem={({ item }) => (
        <AlertRow
          alertId={item.id}
          stopId={item.stopId}
          shuttleId={item.shuttleId}
          notifyAt={item.notifyAt}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  header: {
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    marginTop: -SPACING.sm,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  alertContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  emptyCard: {
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.xxxl,
  },
  emptyIllustration: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButton: {
    marginTop: SPACING.sm,
  },
});
