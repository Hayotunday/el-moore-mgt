import { apiFetch, IS_MOCK } from "./client";
import { delay, dailyTaskReports, uid } from "./mock-store";
import type { DailyTaskReport } from "./types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function listReports(staffId?: string): Promise<DailyTaskReport[]> {
  if (IS_MOCK) {
    await delay();
    return dailyTaskReports
      .filter((r) => !staffId || r.staffId === staffId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  return apiFetch<DailyTaskReport[]>(`/daily-reports${staffId ? `?staffId=${staffId}` : ""}`);
}

export async function listTodayReports(): Promise<DailyTaskReport[]> {
  const all = await listReports();
  return all.filter((r) => r.date === todayStr());
}

export async function getTodayReport(staffId: string): Promise<DailyTaskReport | null> {
  if (IS_MOCK) {
    await delay(150);
    return (
      dailyTaskReports.find((r) => r.staffId === staffId && r.date === todayStr()) ?? null
    );
  }
  return apiFetch<DailyTaskReport | null>(`/daily-reports/today?staffId=${staffId}`);
}

export async function submitReport(input: {
  staffId: string;
  staffName: string;
  content: string;
}): Promise<DailyTaskReport> {
  if (IS_MOCK) {
    await delay(400);
    const existing = dailyTaskReports.find(
      (r) => r.staffId === input.staffId && r.date === todayStr(),
    );
    if (existing) {
      existing.content = input.content;
      return { ...existing };
    }
    const report: DailyTaskReport = {
      id: uid("dtr"),
      date: todayStr(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    dailyTaskReports.unshift(report);
    return { ...report };
  }
  return apiFetch<DailyTaskReport>("/daily-reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
