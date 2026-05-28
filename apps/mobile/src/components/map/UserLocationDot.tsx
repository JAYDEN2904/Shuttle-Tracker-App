import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { getMapboxModule } from "@/lib/mapbox";
import type { LatLng } from "@/types/app.types";
import { COLORS } from "@/utils/constants";

interface UserLocationDotProps {
  location: LatLng;
}

function UserLocationDotComponent({ location }: UserLocationDotProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.8, { duration: 1400, easing: Easing.out(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const Mapbox = getMapboxModule();
  if (Mapbox === null) {
    return null;
  }

  return (
    <Mapbox.PointAnnotation
      id="student-location"
      coordinate={[location.lng, location.lat]}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
        <View style={styles.dot} />
      </View>
    </Mapbox.PointAnnotation>
  );
}

export const UserLocationDot = memo(UserLocationDotComponent);

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryAlpha20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
