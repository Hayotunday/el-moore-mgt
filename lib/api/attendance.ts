import { apiFetch, IS_MOCK } from "./client";
import { delay, attendanceRecords, uid } from "./mock-store";
import type { AttendanceRecord } from "./types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeStr() {
  return new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export async function listAttendance(staffId?: string): Promise<AttendanceRecord[]> {
  if (IS_MOCK) {
    await delay();
    return attendanceRecords
      .filter((a) => !staffId || a.staffId === staffId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  return apiFetch<AttendanceRecord[]>(`/attendance${staffId ? `?staffId=${staffId}` : ""}`);
}

export async function getTodayRecord(staffId: string): Promise<AttendanceRecord | null> {
  if (IS_MOCK) {
    await delay(150);
    return attendanceRecords.find((a) => a.staffId === staffId && a.date === todayStr()) ?? null;
  }
  return apiFetch<AttendanceRecord | null>(`/attendance/today?staffId=${staffId}`);
}

export async function clockIn(staffId: string, staffName: string): Promise<AttendanceRecord> {
  if (IS_MOCK) {
    await delay(300);
    const existing = attendanceRecords.find(
      (a) => a.staffId === staffId && a.date === todayStr(),
    );
    if (existing) return { ...existing };
    const record: AttendanceRecord = {
      id: uid("att"),
      staffId,
      staffName,
      date: todayStr(),
      clockIn: nowTimeStr(),
      clockOut: null,
    };
    attendanceRecords.unshift(record);
    return { ...record };
  }
  return apiFetch<AttendanceRecord>("/attendance/clock-in", {
    method: "POST",
    body: JSON.stringify({ staffId }),
  });
}

export async function clockOut(staffId: string): Promise<AttendanceRecord> {
  if (IS_MOCK) {
    await delay(300);
    const record = attendanceRecords.find(
      (a) => a.staffId === staffId && a.date === todayStr(),
    );
    if (!record) throw new Error("Clock in before clocking out.");
    record.clockOut = nowTimeStr();
    return { ...record };
  }
  return apiFetch<AttendanceRecord>("/attendance/clock-out", {
    method: "POST",
    body: JSON.stringify({ staffId }),
  });
}
