import { STOP_ALERT_COLUMNS, getStopById } from "@shuttle/database";
import type { StopAlert } from "@shuttle/shared-types";
import {
  USE_MOCK_DATA,
  addMockStopAlert,
  getMockAlerts,
  getMockStopName,
  removeMockStopAlert,
} from "@/lib/mock";
import {
  cancelScheduledNotificationForAlert,
  scheduleShuttleArrivalNotification,
} from "@/lib/notifications";
import { getTypedSupabase } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/supabase-errors";

function mapStopAlertRow(row: {
  id: string;
  student_id: string;
  stop_id: string;
  shuttle_id: string;
  notify_at: string;
  is_sent: boolean;
  created_at: string;
}): StopAlert {
  return {
    id: row.id,
    studentId: row.student_id,
    stopId: row.stop_id,
    shuttleId: row.shuttle_id,
    notifyAt: row.notify_at,
    isSent: row.is_sent,
    createdAt: row.created_at,
  };
}

async function resolveStopName(stopId: string): Promise<string> {
  if (USE_MOCK_DATA) {
    return getMockStopName(stopId);
  }

  try {
    const stop = await getStopById(getTypedSupabase(), stopId);
    return stop?.name ?? "your stop";
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

async function scheduleAlertNotification(
  alert: StopAlert,
  stopName: string,
): Promise<void> {
  await scheduleShuttleArrivalNotification({
    alertId: alert.id,
    stopName,
    stopId: alert.stopId,
    shuttleId: alert.shuttleId,
    notifyAt: new Date(alert.notifyAt),
  });
}

export async function getActiveAlerts(studentId: string): Promise<StopAlert[]> {
  if (USE_MOCK_DATA) {
    return getMockAlerts().filter(
      (alert) => alert.studentId === studentId && !alert.isSent,
    );
  }

  try {
    const { data, error } = await getTypedSupabase()
      .from("stop_alerts")
      .select(STOP_ALERT_COLUMNS)
      .eq("student_id", studentId)
      .eq("is_sent", false)
      .gte("notify_at", new Date().toISOString())
      .order("notify_at", { ascending: true });

    if (error) {
      throw handleSupabaseError(error);
    }

    return data.map(mapStopAlertRow);
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

export async function fetchStudentAlerts(): Promise<StopAlert[]> {
  if (USE_MOCK_DATA) {
    return getMockAlerts();
  }

  try {
    const {
      data: { user },
    } = await getTypedSupabase().auth.getUser();

    if (user === null) {
      return [];
    }

    return getActiveAlerts(user.id);
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

export async function fetchAlertsForStop(stopId: string): Promise<StopAlert[]> {
  const alerts = await fetchStudentAlerts();
  return alerts.filter((alert) => alert.stopId === stopId);
}

export function filterPendingAlerts(alerts: StopAlert[]): StopAlert[] {
  const now = Date.now();
  return alerts.filter(
    (alert) => !alert.isSent && new Date(alert.notifyAt).getTime() >= now,
  );
}

export async function setStopAlert(
  stopId: string,
  shuttleId: string,
  etaMinutes: number,
): Promise<void> {
  const notifyAt = new Date(
    Date.now() + Math.max(1, etaMinutes - 2) * 60 * 1000,
  ).toISOString();
  const stopName = await resolveStopName(stopId);

  if (USE_MOCK_DATA) {
    const alert = addMockStopAlert({ stopId, shuttleId, notifyAt });
    await scheduleAlertNotification(alert, stopName);
    return;
  }

  try {
    const {
      data: { user },
    } = await getTypedSupabase().auth.getUser();

    if (user === null) {
      throw new Error("You must be signed in to set alerts.");
    }

    const { data: existing, error: lookupError } = await getTypedSupabase()
      .from("stop_alerts")
      .select(STOP_ALERT_COLUMNS)
      .eq("student_id", user.id)
      .eq("stop_id", stopId)
      .eq("shuttle_id", shuttleId)
      .eq("is_sent", false)
      .maybeSingle();

    if (lookupError) {
      throw handleSupabaseError(lookupError);
    }

    let alert: StopAlert;

    if (existing !== null) {
      await cancelScheduledNotificationForAlert(existing.id);

      const { data, error } = await getTypedSupabase()
        .from("stop_alerts")
        .update({ notify_at: notifyAt })
        .eq("id", existing.id)
        .select(STOP_ALERT_COLUMNS)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      alert = mapStopAlertRow(data);
    } else {
      const { data, error } = await getTypedSupabase()
        .from("stop_alerts")
        .insert({
          student_id: user.id,
          stop_id: stopId,
          shuttle_id: shuttleId,
          notify_at: notifyAt,
        })
        .select(STOP_ALERT_COLUMNS)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      alert = mapStopAlertRow(data);
    }

    await scheduleAlertNotification(alert, stopName);
  } catch (error) {
    throw handleSupabaseError(error);
  }
}

/** @deprecated Use setStopAlert instead */
export async function createStopAlert(input: {
  stopId: string;
  shuttleId: string;
  etaMinutes: number;
}): Promise<void> {
  await setStopAlert(input.stopId, input.shuttleId, input.etaMinutes);
}

export async function cancelStopAlert(alertId: string): Promise<void> {
  await cancelScheduledNotificationForAlert(alertId);

  if (USE_MOCK_DATA) {
    removeMockStopAlert(alertId);
    return;
  }

  try {
    const { error } = await getTypedSupabase()
      .from("stop_alerts")
      .delete()
      .eq("id", alertId);

    if (error) {
      throw handleSupabaseError(error);
    }
  } catch (error) {
    throw handleSupabaseError(error);
  }
}
