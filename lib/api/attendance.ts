import { apiFetch } from "./client";
import type { AttendanceRecord } from "./types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Clocks in the authenticated staff member — the backend identifies them from the JWT. */
export async function clockIn(): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>("/attendance/clock-in", { method: "POST" });
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
