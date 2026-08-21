import { apiFetch, IS_MOCK } from "./client";
import { delay, inspectionRequests } from "./mock-store";
import type { InspectionRequest, InspectionStatus } from "./types";

export interface InspectionFilter {
  status?: InspectionStatus;
  search?: string;
}

export async function listInspectionRequests(
  filter: InspectionFilter = {},
): Promise<InspectionRequest[]> {
  if (IS_MOCK) {
    await delay();
    const search = filter.search?.trim().toLowerCase();
    return inspectionRequests
      .filter((r) => !filter.status || r.status === filter.status)
      .filter(
        (r) =>
          !search ||
          r.customerName.toLowerCase().includes(search) ||
          r.propertyTitle.toLowerCase().includes(search),
      )
      .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
  }
  return apiFetch<InspectionRequest[]>("/inspections");
}

export async function markInspectionDone(
  id: string,
  completedById: string,
): Promise<InspectionRequest> {
  if (IS_MOCK) {
    await delay(300);
    const request = inspectionRequests.find((r) => r.id === id);
    if (!request) throw new Error("Inspection request not found");
    request.status = "DONE";
    request.completedAt = new Date().toISOString().slice(0, 10);
    request.completedById = completedById;
    return { ...request };
  }
  return apiFetch<InspectionRequest>(`/inspections/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "DONE" }),
  });
}
