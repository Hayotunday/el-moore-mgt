import { apiFetch } from "./client";
import type { DailyTaskReport } from "./types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function getMyReports(): Promise<DailyTaskReport[]> {
  return apiFetch<DailyTaskReport[]>("/daily-reports/mine");
}

export async function getTodayReportForStaff(): Promise<DailyTaskReport | null> {
  const mine = await getMyReports();
  return mine.find((r) => r.date === todayStr()) ?? null;
}

/** Submits or updates today's report for the authenticated staff member. */
export async function submitReport(content: string): Promise<DailyTaskReport> {
  return apiFetch<DailyTaskReport>("/daily-reports", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

/** OFFICE_ADMIN only — reports from all staff. */
export async function getAllReports(): Promise<DailyTaskReport[]> {
  return apiFetch<DailyTaskReport[]>("/daily-reports");
}

/** OFFICE_ADMIN only — reports submitted today. */
export async function getTodayReports(): Promise<DailyTaskReport[]> {
  return apiFetch<DailyTaskReport[]>("/daily-reports/today");
}
