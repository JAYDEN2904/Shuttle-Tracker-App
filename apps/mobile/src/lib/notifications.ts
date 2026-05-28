import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/auth.store";

const ALERT_NOTIFICATION_IDS_KEY = "stop-alert-notification-ids";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function readNotificationIdMap(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(ALERT_NOTIFICATION_IDS_KEY);
  if (raw === null) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function writeNotificationIdMap(
  map: Record<string, string>,
): Promise<void> {
  await AsyncStorage.setItem(ALERT_NOTIFICATION_IDS_KEY, JSON.stringify(map));
}

export async function storeAlertNotificationId(
  alertId: string,
  notificationId: string,
): Promise<void> {
  const map = await readNotificationIdMap();
  map[alertId] = notificationId;
  await writeNotificationIdMap(map);
}

export async function cancelScheduledNotificationForAlert(
  alertId: string,
): Promise<void> {
  const map = await readNotificationIdMap();
  const notificationId = map[alertId];

  if (notificationId === undefined) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
  delete map[alertId];
  await writeNotificationIdMap(map);
}

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Shuttle Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await useAuthStore.getState().setExpoPushToken(token);
  return token;
}

export function setupNotificationHandlers(): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    async () => {
      const count = await Notifications.getBadgeCountAsync();
      await Notifications.setBadgeCountAsync(count + 1);
    },
  );

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const type = typeof data.type === "string" ? data.type : undefined;

      if (type === "shuttle_arriving") {
        router.push("/(student)/");
        return;
      }

      if (type === "emergency_alert") {
        const profile = useAuthStore.getState().profile;
        if (profile?.role === "admin") {
          router.push("/(admin)/alerts" as Parameters<typeof router.push>[0]);
        }
      }
    });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
}

export async function scheduleShuttleArrivalNotification(input: {
  alertId: string;
  stopName: string;
  stopId: string;
  shuttleId: string;
  notifyAt: Date;
}): Promise<string> {
  await cancelScheduledNotificationForAlert(input.alertId);

  const trigger =
    input.notifyAt.getTime() > Date.now() ? { date: input.notifyAt } : null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Shuttle arriving soon",
      body: `Your shuttle reaches ${input.stopName} in about 2 minutes`,
      data: {
        type: "shuttle_arriving",
        stopId: input.stopId,
        shuttleId: input.shuttleId,
      },
    },
    trigger,
  });

  await storeAlertNotificationId(input.alertId, notificationId);
  return notificationId;
}
