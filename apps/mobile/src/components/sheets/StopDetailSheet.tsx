import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { AppText, Badge, Button } from "@/components/ui";
import { CapacityBadge } from "@/components/shuttle/CapacityBadge";
import { useShuttleLocations } from "@/hooks/useShuttleLocations";
import { useStopAlertActions } from "@/hooks/useStopAlertActions";
import { confirmCancelStopAlert } from "@/lib/alert-confirmation";
import { useStopAlerts } from "@/hooks/useStopAlerts";
import { useStopETA } from "@/hooks/useStopETA";
import type { StopETAEntry } from "@/types/app.types";
import { formatDistance } from "@/utils/format.utils";
import { COLORS, RADIUS, SPACING } from "@/utils/constants";

interface StopDetailSheetProps {
  stopId: string | null;
  stopName: string;
  onDismiss: () => void;
}

function StopShuttleRow({
  entry,
  hasAlert,
  onToggleAlert,
  isAlertLoading,
}: {
  entry: StopETAEntry;
  hasAlert: boolean;
  onToggleAlert: (entry: StopETAEntry) => void;
  isAlertLoading: boolean;
}) {
  const { shuttle, etaMinutes, distanceMetres } = entry;
  const routeColor = shuttle.route?.color ?? COLORS.primary;
  const routeName = shuttle.route?.name ?? "Campus Route";
  const etaLabel = `${Math.max(1, Math.round(etaMinutes))} min`;
  const etaVariant = etaMinutes < 3 ? "available" : "primary";

  return (
    <View style={styles.row}>
      <View style={[styles.routeBar, { backgroundColor: routeColor }]} />
      <View style={styles.rowContent}>
        <AppText variant="body">{routeName}</AppText>
        <AppText variant="caption" color="textSecondary">
          {formatDistance(distanceMetres)} away
        </AppText>
      </View>
      <View style={styles.rowMeta}>
        <Badge label={etaLabel} variant={etaVariant} size="md" />
        <CapacityBadge status={shuttle.capacityStatus} />
        <Button
          label={hasAlert ? "Alert set ✓" : "Notify me"}
          variant={hasAlert ? "success" : "secondary"}
          size="sm"
          loading={isAlertLoading}
          onPress={() => {
            onToggleAlert(entry);
          }}
          style={styles.notifyButton}
        />
      </View>
    </View>
  );
}

export function StopDetailSheet({
  stopId,
  stopName,
  onDismiss,
}: StopDetailSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["45%", "80%"], []);
  const { shuttles } = useShuttleLocations();
  const etaEntries = useStopETA(stopId, shuttles);
  const { pendingAlerts } = useStopAlerts(stopId ?? undefined);
  const { createAlert, cancelAlert, isCreating, isCancelling } =
    useStopAlertActions();

  useEffect(() => {
    if (stopId !== null) {
      sheetRef.current?.present();
      return;
    }
    sheetRef.current?.dismiss();
  }, [stopId]);

  const alertByShuttleId = useMemo(() => {
    const map = new Map<string, string>();
    for (const alert of pendingAlerts) {
      map.set(alert.shuttleId, alert.id);
    }
    return map;
  }, [pendingAlerts]);

  const handleToggleAlert = useCallback(
    async (entry: StopETAEntry) => {
      if (stopId === null) {
        return;
      }

      const existingAlertId = alertByShuttleId.get(entry.shuttle.id);
      if (existingAlertId !== undefined) {
        confirmCancelStopAlert(() => {
          void cancelAlert(existingAlertId);
        });
        return;
      }

      await createAlert({
        stopId,
        shuttleId: entry.shuttle.id,
        etaMinutes: entry.etaMinutes,
      });
    },
    [alertByShuttleId, cancelAlert, createAlert, stopId],
  );

  const renderItem = useCallback(
    ({ item }: { item: StopETAEntry }) => (
      <StopShuttleRow
        entry={item}
        hasAlert={alertByShuttleId.has(item.shuttle.id)}
        onToggleAlert={handleToggleAlert}
        isAlertLoading={isCreating || isCancelling}
      />
    ),
    [
      alertByShuttleId,
      handleToggleAlert,
      isCreating,
      isCancelling,
    ],
  );

  const shuttleCountLabel =
    etaEntries.length === 1
      ? "1 shuttle heading here"
      : `${etaEntries.length} shuttles heading here`;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onDismiss}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBackground}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <AppText variant="h1">{stopName}</AppText>
          <AppText variant="caption" color="textSecondary">
            {shuttleCountLabel}
          </AppText>
        </View>

        <View style={styles.listContainer}>
          <FlashList
            data={etaEntries}
            keyExtractor={(item) => item.shuttle.id}
            renderItem={renderItem}
            estimatedItemSize={112}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <AppText
                variant="body"
                color="textSecondary"
                align="center"
                style={styles.empty}
              >
                No shuttles heading to this stop
              </AppText>
            }
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
  },
  handle: {
    backgroundColor: COLORS.border,
    width: 40,
  },
  container: {
    flex: 1,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  listContainer: {
    flex: 1,
    minHeight: 200,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  routeBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: RADIUS.full,
  },
  rowContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  rowMeta: {
    alignItems: "flex-end",
    gap: SPACING.sm,
    maxWidth: 120,
  },
  notifyButton: {
    minWidth: 108,
  },
  empty: {
    paddingVertical: SPACING.xxl,
  },
});
