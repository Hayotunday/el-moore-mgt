import { apiFetch } from "./client";
import type { NotificationLogEntry } from "./types";

/** OFFICE_ADMIN or CUSTOMER_CARE — delivery log of all sent notifications. */
export async function getNotificationHistory(): Promise<NotificationLogEntry[]> {
  return apiFetch<NotificationLogEntry[]>("/notifications/history");
}
