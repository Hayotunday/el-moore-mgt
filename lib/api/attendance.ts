import { apiFetch, toQueryString } from "./client";
import type { AttendanceRecord } from "./types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Clocks in the authenticated staff member — the backend identifies them from the JWT.
 *  `location` is optional (ClockInBodyDto.location), used for on-site verification. */
export async function clockIn(location?: {
  lat: number;
  lng: number;
  accuracy?: number;
}): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>("/attendance/clock-in", {
    method: "POST",
    body: JSON.stringify(location ? { location } : {}),
  });
}

export async function clockOut(): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>("/attendance/clock-out", { method: "POST" });
}

export async function getMyAttendance(): Promise<AttendanceRecord[]> {
  return apiFetch<AttendanceRecord[]>("/attendance/mine");
}

export async function getTodayRecord(): Promise<AttendanceRecord | null> {
  const mine = await getMyAttendance();
  return mine.find((a) => a.date === todayStr()) ?? null;
}

/** OFFICE_ADMIN only — attendance for all staff. */
export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  return apiFetch<AttendanceRecord[]>("/attendance");
}

/** OFFICE_ADMIN only. Attendance percentage per staff member over a date range
 *  (business days, Mon-Fri) — defaults to the current month. Response shape
 *  isn't documented — passed through as-is. */
export async function getAttendanceSummary(params: {
  startDate?: string;
  endDate?: string;
  staffId?: string;
} = {}): Promise<unknown> {
  return apiFetch(
    `/attendance/summary${toQueryString({
      startDate: params.startDate,
      endDate: params.endDate,
      staffId: params.staffId,
    })}`,
  );
}
