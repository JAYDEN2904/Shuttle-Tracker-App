import { useEffect } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { COLORS, RADIUS } from "@/utils/constants";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

const SHIMMER_WIDTH = 200;

export function Skeleton({
  width = "100%",
  height = 16,
  radius = RADIUS.sm,
  style,
}: SkeletonProps) {
  const translateX = useSharedValue(-SHIMMER_WIDTH);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(SHIMMER_WIDTH * 3, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { width, height, borderRadius: radius },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerTrack, shimmerStyle]}>
        <LinearGradient
          colors={[COLORS.surface2, COLORS.surface, COLORS.surface2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: COLORS.surface2,
  },
  shimmerTrack: {
    ...StyleSheet.absoluteFillObject,
    width: SHIMMER_WIDTH,
  },
  gradient: {
    flex: 1,
  },
});
