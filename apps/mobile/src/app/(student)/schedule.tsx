import { useMemo, useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { AppText, Card, Skeleton } from "@/components/ui";
import { useScheduleData } from "@/hooks/useScheduleData";
import type { Route, Stop } from "@shuttle/shared-types";
import { haversineDistance } from "@/utils/geo.utils";
import { formatDistance } from "@/utils/format.utils";
import { trackEvent } from "@/lib/analytics";
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from "@/utils/constants";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

function formatOperatingTime(time: string): string {
  const parsed = dayjs(time, ["HH:mm:ss", "HH:mm"], true);
  return parsed.isValid() ? parsed.format("h:mm A") : time;
}

function getStopInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
}

function buildStopSequence(stops: Stop[]): string {
  if (stops.length === 0) {
    return "No stops";
  }

  const initials = stops.map((stop) => getStopInitial(stop.name));
  const loopBack = initials[0] ?? "?";
  return [...initials, loopBack].join(" → ");
}

function RouteScheduleCard({
  route,
  stops,
}: {
  route: Route;
  stops: Stop[];
}) {
  const [expanded, setExpanded] = useState(false);
  const operatingHours = `${formatOperatingTime(route.operatingStart)} – ${formatOperatingTime(route.operatingEnd)}`;
  const peakFrequency =
    route.frequencyPeakMins !== null
      ? `Every ${route.frequencyPeakMins} mins at peak`
      : "Peak frequency unavailable";

  return (
    <Pressable
      onPress={() => setExpanded((value) => !value)}
      accessibilityRole="button"
      accessibilityLabel={`${route.name} schedule, ${expanded ? "expanded" : "collapsed"}`}
    >
      <Card style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <View
            style={[styles.routeAccent, { backgroundColor: route.color }]}
          />
          <View style={styles.routeHeaderText}>
            <AppText variant="h2">{route.name}</AppText>
            <AppText variant="caption" color="textSecondary">
              Mon–Fri · {operatingHours}
            </AppText>
            <AppText variant="bodyMed" color="primary">
              {peakFrequency}
            </AppText>
          </View>
        </View>

        <AppText variant="body" color="textSecondary" style={styles.sequence}>
          {buildStopSequence(stops)}
        </AppText>

        {expanded && (
          <View style={styles.expandedStops}>
            {stops.map((stop, index) => {
              const previousStop = stops[index - 1];
              const distanceLabel =
                previousStop === undefined
                  ? "Start"
                  : formatDistance(
                      haversineDistance(
                        previousStop.coordinates.latitude,
                        previousStop.coordinates.longitude,
                        stop.coordinates.latitude,
                        stop.coordinates.longitude,
                      ),
                    );

              return (
                <View key={stop.id} style={styles.stopRow}>
                  <View style={styles.stopSequence}>
                    <AppText variant="label" color="textSecondary">
                      {index + 1}
                    </AppText>
                  </View>
                  <View style={styles.stopDetails}>
                    <AppText variant="bodyMed">{stop.name}</AppText>
                    <AppText variant="caption" color="textTertiary">
                      {distanceLabel}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <AppText variant="caption" color="textTertiary" style={styles.expandHint}>
          {expanded ? "Tap to collapse" : "Tap to view full stop list"}
        </AppText>
      </Card>
    </Pressable>
  );
}

function ScheduleSkeleton() {
  return (
    <View style={styles.skeletonGroup}>
      <Skeleton height={140} radius={RADIUS.xl} />
      <Skeleton height={140} radius={RADIUS.xl} />
    </View>
  );
}

export default function ScheduleScreen() {
  const { routesWithStops, isLoading } = useScheduleData();

  useEffect(() => {
    trackEvent({ name: "schedule_viewed" });
  }, []);

  const stopsByName = useMemo(() => {
    const grouped = new Map<
      string,
      Array<{ routeCode: string; routeColor: string }>
    >();

    for (const entry of routesWithStops) {
      for (const stop of entry.stops) {
        const existing = grouped.get(stop.name) ?? [];
        existing.push({
          routeCode: entry.route.code,
          routeColor: entry.route.color,
        });
        grouped.set(stop.name, existing);
      }
    }

    return [...grouped.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [routesWithStops]);

  const listHeader = (
    <View style={styles.header}>
      <AppText variant="h1">Schedule</AppText>
      <AppText variant="caption" color="textSecondary" style={styles.subtitle}>
        Operating hours & stop sequence
      </AppText>
      {isLoading ? <ScheduleSkeleton /> : null}
    </View>
  );

  const listFooter = (
    <View style={styles.footer}>
      <Card style={styles.peakCard} padding={SPACING.lg}>
        <AppText variant="bodyMed" color="primary">
          ⚡ Peak Hours Today: 7:00–9:00 AM and 4:00–6:30 PM
        </AppText>
      </Card>

      <Card style={styles.stopsTable}>
        <AppText variant="h3" style={styles.tableTitle}>
          Campus Stops
        </AppText>
        <FlashList
          data={stopsByName}
          scrollEnabled={false}
          estimatedItemSize={52}
          keyExtractor={([stopName]) => stopName}
          renderItem={({ item: [stopName, routes] }) => (
            <View style={styles.tableRow}>
              <AppText variant="body" style={styles.stopName}>
                {stopName}
              </AppText>
              <View style={styles.routeBadges}>
                {routes.map((route) => (
                  <View
                    key={`${stopName}-${route.routeCode}`}
                    style={[
                      styles.routeBadge,
                      { backgroundColor: `${route.routeColor}22` },
                    ]}
                  >
                    <AppText
                      variant="label"
                      style={{ color: route.routeColor }}
                    >
                      Route {route.routeCode}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <AppText variant="body" color="textSecondary">
                No stops available.
              </AppText>
            ) : null
          }
        />
      </Card>

      <AppText variant="caption" color="textSecondary" align="center">
        ℹ Schedules may vary on public holidays
      </AppText>
    </View>
  );

  return (
    <FlashList
      data={isLoading ? [] : routesWithStops}
      style={styles.container}
      contentContainerStyle={styles.content}
      estimatedItemSize={180}
      keyExtractor={(item) => item.route.id}
      ListHeaderComponent={listHeader}
      ListFooterComponent={listFooter}
      renderItem={({ item }) => (
        <RouteScheduleCard route={item.route} stops={item.stops} />
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
    gap: SPACING.lg,
  },
  header: {
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  footer: {
    gap: SPACING.lg,
    marginTop: SPACING.lg,
  },
  subtitle: {
    marginTop: -SPACING.sm,
  },
  routeCard: {
    gap: SPACING.md,
  },
  routeHeader: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  routeAccent: {
    width: 4,
    borderRadius: RADIUS.full,
    alignSelf: "stretch",
  },
  routeHeaderText: {
    flex: 1,
    gap: SPACING.xs,
  },
  sequence: {
    lineHeight: 22,
  },
  expandedStops: {
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  stopSequence: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  stopDetails: {
    flex: 1,
    gap: 2,
  },
  expandHint: {
    marginTop: SPACING.xs,
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: SPACING.md,
  },
  peakCard: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryAlpha20,
  },
  stopsTable: {
    gap: SPACING.md,
  },
  tableTitle: {
    marginBottom: SPACING.xs,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stopName: {
    flex: 1,
  },
  routeBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    justifyContent: "flex-end",
  },
  routeBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  skeletonGroup: {
    gap: SPACING.md,
  },
});
