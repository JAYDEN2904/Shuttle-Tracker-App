import { getTypedSupabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/supabase-errors";
import { USE_MOCK_DATA } from "@/lib/mock";
import { sendLocalNotification } from "@/lib/notifications";

export interface EmergencyAlertPayload {
  shuttleId: string;
  driverId: string;
  driverName: string | null;
  routeCode: string | null;
  lat: number;
  lng: number;
}

export async function sendDriverEmergencyAlert(
  payload: EmergencyAlertPayload,
): Promise<void> {
  if (USE_MOCK_DATA) {
    await sendLocalNotification(
      "Emergency alert sent",
      "Campus dispatch has been notified of your location.",
      { type: "emergency_alert", shuttleId: payload.shuttleId },
    );
    return;
  }

  try {
    const client = getTypedSupabase();
    const channel = client.channel("fleet-emergencies");
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "emergency_alert",
      payload: {
        ...payload,
        createdAt: new Date().toISOString(),
      },
    });
    await client.removeChannel(channel);
  } catch (error) {
    throw handleSupabaseError(error);
  }

  await sendLocalNotification(
    "Emergency alert sent",
    "Dispatch has been notified. Help is on the way.",
    { type: "emergency_alert", shuttleId: payload.shuttleId },
  );
}
