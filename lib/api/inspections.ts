import { delay, inspectionRequests } from "./mock-store";
import type { InspectionRequest, InspectionStatus } from "./types";

/**
 * Site Inspections has no corresponding endpoint on the live el-moore-api backend yet —
 * this module always reads/writes the local mock store, regardless of NEXT_PUBLIC_API_BASE_URL.
 * The shape matches the `site_inspections` table added to el-moore-technical-breakdown.md
 * so wiring this up to a real endpoint later is a drop-in swap.
 */

export interface InspectionFilter {
  status?: InspectionStatus;
}

export async function listInspectionRequests(
  filter: InspectionFilter = {},
): Promise<InspectionRequest[]> {
  await delay();
  return inspectionRequests
    .filter((r) => !filter.status || r.status === filter.status)
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
}

export async function updateInspectionStatus(
  id: string,
  status: InspectionStatus,
): Promise<InspectionRequest> {
  await delay(300);
  const request = inspectionRequests.find((r) => r.id === id);
  if (!request) throw new Error("Inspection request not found");
  request.status = status;
  return { ...request };
}
