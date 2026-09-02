import { apiFetch, toQueryString } from "./client";
import type { InspectionStatus, SiteInspection } from "./types";

export interface InspectionFilter {
  status?: InspectionStatus;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

/** OFFICE_ADMIN, SITE_COORDINATOR, TEAM_LEAD, or CUSTOMER_CARE. */
export async function listInspections(filter: InspectionFilter = {}): Promise<SiteInspection[]> {
  return apiFetch<SiteInspection[]>(
    `/site-inspections${toQueryString({
      status: filter.status,
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      limit: filter.limit ? String(filter.limit) : undefined,
    })}`,
  );
}

/** OFFICE_ADMIN, SITE_COORDINATOR, TEAM_LEAD, or CUSTOMER_CARE. */
export async function listPendingFollowUp(): Promise<SiteInspection[]> {
  return apiFetch<SiteInspection[]>("/site-inspections/pending-followup");
}

export async function getInspection(id: string): Promise<SiteInspection> {
  return apiFetch<SiteInspection>(`/site-inspections/${id}`);
}

/** OFFICE_ADMIN, SITE_COORDINATOR, TEAM_LEAD, or CUSTOMER_CARE. Optionally linked to a customer. */
export async function scheduleInspection(input: {
  customerId?: string;
  propertyId: string;
  scheduledAt: string;
  inspectorId?: string;
  notes?: string;
}): Promise<SiteInspection> {
  return apiFetch<SiteInspection>("/site-inspections", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** OFFICE_ADMIN, SITE_COORDINATOR, TEAM_LEAD, or CUSTOMER_CARE. Update status, reschedule, or reassign. */
export async function updateInspection(
  id: string,
  input: Partial<{
    scheduledAt: string;
    status: InspectionStatus;
    inspectorId: string;
    notes: string;
  }>,
): Promise<SiteInspection> {
  return apiFetch<SiteInspection>(`/site-inspections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
