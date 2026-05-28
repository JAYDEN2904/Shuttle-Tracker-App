import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/components/ui/AppText";
import { COLORS, SPACING } from "@/utils/constants";

const TAB_BAR_HEIGHT = 64;

type TabIconName = "map" | "schedule" | "alerts";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: TabIconName }
> = {
  index: { label: "Map", icon: "map" },
  schedule: { label: "Schedule", icon: "schedule" },
  alerts: { label: "Alerts", icon: "alerts" },
};

interface TabRoute {
  key: string;
  name: string;
}

export interface StudentTabBarProps {
  state: {
    index: number;
    routes: TabRoute[];
  };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
  };
}

function TabIcon({
  name,
  color,
}: {
  name: TabIconName;
  color: string;
}) {
  if (name === "map") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path d="M9 3v16M15 5v16" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }

  if (name === "schedule") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 3v3M17 3v3M4 8h16M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V8a4 4 0 0 1 4-4Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function StudentTabBar({ state, navigation }: StudentTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, SPACING.sm) },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name];

        if (config === undefined) {
          return null;
        }

        const color = isFocused ? COLORS.primary : COLORS.textTertiary;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={`${config.label} tab`}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tab}
          >
            <TabIcon name={config.icon} color={color} />
            <AppText
              variant="label"
              color={isFocused ? "primary" : "textTertiary"}
            >
              {config.label}
            </AppText>
            {isFocused && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    minHeight: TAB_BAR_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  activeDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
});
