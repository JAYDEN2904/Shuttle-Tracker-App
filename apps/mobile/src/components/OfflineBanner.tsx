import { useEffect, useState } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AppText } from "@/components/ui/AppText";
import {
  COLORS,
  SPACING,
  STALE_POSITION_THRESHOLD_MINUTES,
} from "@/utils/constants";

dayjs.extend(relativeTime);

function isOffline(state: NetInfoState): boolean {
  return state.isConnected === false || state.isInternetReachable === false;
}

export function useNetworkStatus(): { isOffline: boolean } {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(isOffline(state));
    });

    void NetInfo.fetch().then((state) => {
      setOffline(isOffline(state));
    });

    return unsubscribe;
  }, []);

  return { isOffline: offline };
}

function formatLastUpdated(lastUpdated: Date | null): string {
  if (lastUpdated === null) {
    return "unknown";
  }
  return dayjs(lastUpdated).fromNow();
}

function isStaleData(lastUpdated: Date | null): boolean {
  if (lastUpdated === null) {
    return true;
  }
  return dayjs().diff(dayjs(lastUpdated), "minute") >= STALE_POSITION_THRESHOLD_MINUTES;
}

interface OfflineBannerProps {
  lastUpdated: Date | null;
}

export function OfflineBanner({ lastUpdated }: OfflineBannerProps) {
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  const stale = isStaleData(lastUpdated);
  const updatedLabel = formatLastUpdated(lastUpdated);
  const message = stale
    ? `Offline · Positions may be inaccurate (last updated ${updatedLabel})`
    : `Offline · Last updated ${updatedLabel}`;

  return (
    <View
      style={[
        styles.banner,
        { top: insets.top },
        stale ? styles.bannerStale : styles.bannerFresh,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <AppText variant="label" color="white" align="center">
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  bannerFresh: {
    backgroundColor: COLORS.warning,
  },
  bannerStale: {
    backgroundColor: COLORS.error,
  },
});
