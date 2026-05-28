import { Alert } from "react-native";

export function confirmCancelStopAlert(onConfirm: () => void): void {
  Alert.alert(
    "Cancel alert?",
    "You won't be notified when this shuttle arrives.",
    [
      { text: "Keep Alert", style: "cancel" },
      { text: "Cancel Alert", style: "destructive", onPress: onConfirm },
    ],
  );
}
