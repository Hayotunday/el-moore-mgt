import type { AutomatedGreetingSettings, InspectionRequest } from "./types";

/**
 * The rest of the app talks to the live el-moore-api backend directly — this file only
 * backs the two features with no corresponding endpoint yet: Site Inspections, and the
 * automated-greeting toggle previews on the Newsletter page.
 */
export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const automatedGreetingSettings: AutomatedGreetingSettings = {
  birthday: true,
  paymentReminder: true,
  inspectionFollowup: false,
};

// ── Site inspection requests ─────────────────────────────────────────────
// No endpoint for this exists on the live backend yet.
// Shape mirrors the `site_inspections` table from el-moore-technical-breakdown.md.
export const inspectionRequests: InspectionRequest[] = [
  {
    id: "insp-001",
    customerId: "cus-006",
    propertyId: "prop-005",
    scheduledById: "u-coord1",
    scheduledAt: "2024-08-24T11:00:00",
    status: "SCHEDULED",
    followUpSent: false,
  },
  {
    id: "insp-002",
    customerId: "cus-007",
    propertyId: "prop-006",
    scheduledById: "u-coord2",
    scheduledAt: "2024-08-22T09:30:00",
    status: "SCHEDULED",
    followUpSent: false,
  },
  {
    id: "insp-003",
    customerId: "cus-008",
    propertyId: "prop-008",
    scheduledById: "u-coord1",
    scheduledAt: "2024-08-15T14:00:00",
    status: "COMPLETED",
    followUpSent: true,
  },
  {
    id: "insp-004",
    customerId: "cus-009",
    propertyId: "prop-003",
    scheduledById: "u-coord1",
    scheduledAt: "2024-08-20T10:00:00",
    status: "SCHEDULED",
    followUpSent: false,
  },
];
