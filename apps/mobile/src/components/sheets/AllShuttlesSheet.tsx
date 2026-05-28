import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { ShuttleCard } from "@/components/shuttle/ShuttleCard";
import { AppText } from "@/components/ui";
import { useNearestShuttle } from "@/hooks/useNearestShuttle";
import type { ShuttleWithDistance } from "@/types/app.types";
import { SPACING } from "@/utils/constants";

interface AllShuttlesSheetProps {
  onShuttlePress?: (shuttleId: string) => void;
}

export function AllShuttlesSheet({ onShuttlePress }: AllShuttlesSheetProps) {
  const snapPoints = useMemo(() => ["30%", "60%"], []);
  const { shuttlesWithDistance, isLoading } = useNearestShuttle();

  const renderItem = useCallback(
    ({ item }: { item: ShuttleWithDistance }) => (
      <ShuttleCard shuttle={item} onPress={onShuttlePress} />
    ),
    [onShuttlePress],
  );

  return (
    <BottomSheet index={0} snapPoints={snapPoints}>
      <View style={styles.header}>
        <AppText variant="h2">All Shuttles</AppText>
        <AppText variant="caption" color="textSecondary">
          {shuttlesWithDistance.length} shuttles on campus
        </AppText>
      </View>
      <View style={styles.listContainer}>
        <FlashList
          data={shuttlesWithDistance}
          keyExtractor={(item) => item.id}
          estimatedItemSize={88}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          ListEmptyComponent={
            <AppText variant="body" color="textSecondary" align="center" style={styles.empty}>
              {isLoading ? "Loading shuttles..." : "No active shuttles"}
            </AppText>
          }
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  listContainer: {
    flex: 1,
    minHeight: 180,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  empty: {
    paddingVertical: SPACING.xxl,
  },
});
