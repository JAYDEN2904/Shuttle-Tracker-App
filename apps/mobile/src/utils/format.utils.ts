import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) {
    return "Unknown";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatETA(isoTimestamp: string): string {
  return dayjs(isoTimestamp).fromNow();
}

export function formatTime(isoTimestamp: string): string {
  return dayjs(isoTimestamp).format("h:mm A");
}

export function formatDate(isoTimestamp: string): string {
  return dayjs(isoTimestamp).format("MMM D, YYYY");
}

export function formatOccupancy(current: number, capacity: number): string {
  const percentage = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  return `${current}/${capacity} (${percentage}%)`;
}

export function capitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}
