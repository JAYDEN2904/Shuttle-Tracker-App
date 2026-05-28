export const PROFILE_COLUMNS =
  "id, email, name, role, employee_id, avatar_url, expo_push_token, created_at, updated_at";

export const ROUTE_COLUMNS =
  "id, name, code, color, is_active, operating_start, operating_end, frequency_peak_mins, frequency_offpeak_mins, created_at";

export const STOP_COLUMNS =
  "id, route_id, name, lat, lng, sequence_order, created_at";

export const STOP_ALERT_COLUMNS =
  "id, student_id, stop_id, shuttle_id, notify_at, is_sent, created_at";
