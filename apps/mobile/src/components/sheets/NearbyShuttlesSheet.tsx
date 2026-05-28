import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { ShuttleCard } from "@/components/shuttle/ShuttleCard";
import { AppText, Badge } from "@/components/ui";
import { useNearestShuttle } from "@/hooks/useNearestShuttle";
import type { ShuttleWithDistance } from "@/types/app.types";
import { SPACING, COLORS } from "@/utils/constants";

interface NearbyShuttlesSheetProps {
  onShuttlePress?: (shuttleId: string) => void;
}

export function NearbyShuttlesSheet({
  onShuttlePress,
}: NearbyShuttlesSheetProps) {
  const snapPoints = useMemo(() => ["25%", "55%", "92%"], []);
  const { shuttlesWithDistance, isLoading, refetch } = useNearestShuttle();

  const renderItem = useCallback(
    ({ item }: { item: ShuttleWithDistance }) => (
      <ShuttleCard shuttle={item} onPress={onShuttlePress} />
    ),
    [onShuttlePress],
  );

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleIndicatorStyle={{ backgroundColor: COLORS.border, width: 40 }}
    >
      <View style={styles.header}>
        <AppText variant="h2">Nearby Shuttles</AppText>
        <Badge
          label={`${shuttlesWithDistance.length} active`}
          variant="available"
          dot
        />
      </View>
      <View style={styles.listContainer}>
        <FlashList
          data={shuttlesWithDistance}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          estimatedItemSize={88}
          contentContainerStyle={styles.list}
          onRefresh={() => {
            void refetch();
          }}
          refreshing={isLoading}
          ListEmptyComponent={
            <AppText
              variant="body"
              color="textSecondary"
              align="center"
              style={styles.empty}
            >
              {isLoading ? "Loading shuttles..." : "No shuttles nearby"}
            </AppText>
          }
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  listContainer: {
    flex: 1,
    minHeight: 180,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.huge,
  },
  empty: {
    paddingVertical: SPACING.xxl,
  },
});
