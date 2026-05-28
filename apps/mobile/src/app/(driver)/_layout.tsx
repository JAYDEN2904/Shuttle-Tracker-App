import { Stack } from "expo-router";
import { COLORS } from "@/utils/constants";

export default function DriverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.driverBg },
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ contentStyle: { backgroundColor: COLORS.background } }}
      />
      <Stack.Screen name="live" />
    </Stack>
  );
}
