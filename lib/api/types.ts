/**
 * Types mirroring the live el-moore-api backend (https://el-moore.onrender.com/docs).
 * Field names/shapes are taken directly from its OpenAPI spec. Amounts that the API
 * documents as decimal strings (price, totalAmount, amountPaid, amount, commissionAmount)
 * are kept as `string` here — convert with `Number()` at the point of use.
 */

// Full role enum as returned by the backend. Only the first 8 are "management" roles
// with access to /management/**; INTERNAL_MARKETER/AFFILIATE_MARKETER use /marketer,
// and "basic" is a plain public account. AFFILIATE_MARKETER was renamed from
// EXTERNAL_MARKETER (naming only); PROJECT_MANAGER is new, for the Projects module.
export type Role =
  | "MD"
  | "GM"
  | "OFFICE_ADMIN"
  | "SITE_COORDINATOR"
  | "TEAM_LEAD"
  | "ACCOUNTANT"
  | "CUSTOMER_CARE"
  | "PROJECT_MANAGER"
  | "INTERNAL_MARKETER"
  | "AFFILIATE_MARKETER"
  | "basic";

export type MarketerStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Names are split into parts across the backend now (was a single `name` field) —
 *  use `getFullName()` from lib/utils to render them as one string. */
export interface PersonName {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}

export interface ManagementUser extends PersonName {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  marketerStatus?: MarketerStatus | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export type PropertyStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  status: PropertyStatus;
  /** Links this property to a construction Project (see lib/api/projects.ts) — not
   *  every property belongs to one, e.g. standalone land/resale units. */
  projectId?: string | null;
  createdAt?: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  isPrimary: boolean;
}

export type SaleType = "OUTRIGHT" | "INSTALLMENT";
export type SaleStatus = "ACTIVE" | "VOIDED";

export interface Sale {
  id: string;
  propertyId: string;
  customerId?: string | null;
  /** Present when the sale was recorded before a Customer record existed for the
   *  buyer, or as a fallback display. Prefer looking up the linked Customer via
   *  `customerId` for the buyer's name — these are direct-entry fields on the sale
   *  itself and won't reflect later edits to the customer's own record. */
  buyerFirstName?: string | null;
  buyerMiddleName?: string | null;
  buyerLastName?: string | null;
  /** @deprecated superseded by buyerFirstName/buyerMiddleName/buyerLastName — the
   *  backend may still return this on older records. */
  buyerName?: string | null;
  buyerPhone: string;
  buyerEmail?: string | null;
  saleType: SaleType;
  totalAmount: string;
  /** Voiding a sale is now a soft flag (record + finance/referral history is kept)
   *  rather than a hard delete — a voided sale still appears in listSales(). */
  status?: SaleStatus;
  soldById?: string | null;
  marketerId?: string | null;
  createdAt: string;
}

export interface InstallmentPlan {
  id: string;
  saleId: string;
  numberOfInstallments: number;
  startDate: string;
  overdue?: boolean;
}

export interface InstallmentPayment {
  id: string;
  saleId: string;
  amountPaid: string;
  paidAt: string;
  note?: string;
}

export type SaleDocumentType = "CONTRACT" | "ID" | "OTHER";

export interface SaleDocument {
  id: string;
  saleId: string;
  documentType: SaleDocumentType;
  uploadedAt: string;
}

export type ReferralStatus = "PENDING" | "PAID";

export interface Referral {
  id: string;
  marketerId: string;
  saleId: string;
  commissionAmount: string;
  status: ReferralStatus;
  paidAt?: string | null;
  createdAt: string;
  /** Not documented in the OpenAPI spec, but `GET /referrals` says it returns rows
   * "with marketer and sale" — render defensively in case the backend embeds these. */
  sale?: {
    id: string;
    propertyId: string;
    totalAmount: string;
    property?: { title: string };
  };
  marketer?: PersonName & { id: string; email: string };
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: string;
  date: string;
  saleId?: string | null;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  clockIn: string;
  clockOut?: string | null;
}

export interface DailyTaskReport {
  id: string;
  staffId: string;
  staffName?: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  unsubscribed?: boolean;
  subscribedAt?: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  body: string;
  coverImageUrl?: string | null;
  sentAt?: string | null;
  createdAt?: string;
}

export interface NotificationLogEntry {
  id: string;
  channel: string;
  recipient: string;
  status: string;
  sentAt: string;
  triggerType?: string;
}

export type ChatSender = "CUSTOMER" | "BOT" | "STAFF";
export type ConversationStatus = "OPEN" | "HANDED_OFF" | "CLOSED";

export interface ChatConversation {
  id: string;
  customerIdentifier: string;
  status: ConversationStatus;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: ChatSender;
  sentAt?: string;
}

/** Prospect (info + interest captured) → Lead (site inspection completed) → Client
 *  (first purchase) → Customer (second+ purchase). Auto-upgraded on milestones;
 *  MD/GM/CUSTOMER_CARE can also manually override in either direction. */
export type CustomerStage = "PROSPECT" | "LEAD" | "CLIENT" | "CUSTOMER";

export interface Customer extends Omit<PersonName, "lastName"> {
  id: string;
  /** Null for companies. */
  lastName?: string | null;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  stage?: CustomerStage;
  interestedPropertyId?: string | null;
  createdAt?: string;
}

export type InspectionStatus = "SCHEDULED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";

export interface SiteInspection {
  id: string;
  customerId?: string | null;
  propertyId: string;
  scheduledAt: string;
  inspectorId?: string | null;
  status: InspectionStatus;
  notes?: string | null;
  followUpSent?: boolean;
}

export interface AutomatedGreetingSettings {
  birthday: boolean;
  paymentReminder: boolean;
  inspectionFollowup: boolean;
}

export type InviteStatus = "PENDING" | "CLAIMED" | "EXPIRED" | "REVOKED";

export interface Invite {
  id: string;
  email: string;
  name: string;
  role: Role;
  status?: InviteStatus;
  expiresAt?: string;
  createdAt?: string;
}

/* ---------- Projects (construction progress tracking) ---------- */

export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";

export interface Project {
  id: string;
  name: string;
  location: string;
  description?: string | null;
  status: ProjectStatus;
  overallProgressPercent: number;
  budgetAllocated?: string | null;
  startDate?: string | null;
  expectedCompletionDate?: string | null;
  createdAt?: string;
}

export interface ProjectBudgetSummary {
  budgetAllocated: string;
  spent: string;
  remaining: string;
}

export type WorkItemStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";

export interface WorkItem {
  id: string;
  projectId: string;
  name: string;
  progressPercent: number;
  status: WorkItemStatus;
  contractorId?: string | null;
  expectedCompletionDate?: string | null;
  latestUpdate?: string | null;
}

export interface ProjectIssue {
  id: string;
  projectId: string;
  workItemId?: string | null;
  description: string;
  resolvedAt?: string | null;
  createdAt?: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  workItemId?: string | null;
  note: string;
  visibleToCustomers: boolean;
  createdAt?: string;
}

export interface ProjectPhoto {
  id: string;
  projectId: string;
  photoUrl: string;
  visibleToCustomers: boolean;
  createdAt?: string;
}

export interface ProjectDetail extends Project {
  workItems: WorkItem[];
  issues: ProjectIssue[];
  updates: ProjectUpdate[];
  photos: ProjectPhoto[];
}

export interface Contractor {
  id: string;
  name: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  specialty?: string | null;
}
