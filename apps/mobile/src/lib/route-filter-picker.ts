import { ActionSheetIOS, Alert, Platform } from "react-native";
import { MOCK_ROUTES } from "@/lib/mock";

export interface RouteFilterOption {
  label: string;
  value: string | null;
}

function buildRouteFilterOptions(): RouteFilterOption[] {
  return [
    { label: "All routes", value: null },
    ...MOCK_ROUTES.map((route) => ({
      label: route.name,
      value: route.code,
    })),
  ];
}

export function showRouteFilterPicker(
  activeRouteFilter: string | null,
  onSelect: (routeCode: string | null) => void,
): void {
  const options = buildRouteFilterOptions();
  const labels = options.map((option) => option.label);
  const cancelButtonIndex = labels.length;

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...labels, "Cancel"],
        cancelButtonIndex,
        title: "Filter by route",
      },
      (buttonIndex) => {
        if (buttonIndex === cancelButtonIndex || buttonIndex === undefined) {
          return;
        }
        onSelect(options[buttonIndex]?.value ?? null);
      },
    );
    return;
  }

  Alert.alert(
    "Filter by route",
    undefined,
    [
      ...options.map((option) => ({
        text:
          option.value === activeRouteFilter ||
          (option.value === null && activeRouteFilter === null)
            ? `✓ ${option.label}`
            : option.label,
        onPress: () => {
          onSelect(option.value);
        },
      })),
      { text: "Cancel", style: "cancel" },
    ],
  );
}
