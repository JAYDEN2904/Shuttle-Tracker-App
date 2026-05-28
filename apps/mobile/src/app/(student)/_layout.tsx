import { Tabs } from "expo-router";
import {
  StudentTabBar,
  type StudentTabBarProps,
} from "@/components/navigation/StudentTabBar";

export default function StudentLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <StudentTabBar
          state={props.state}
          navigation={
            props.navigation as unknown as StudentTabBarProps["navigation"]
          }
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Map" }} />
      <Tabs.Screen name="schedule" options={{ title: "Schedule" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
    </Tabs>
  );
}
