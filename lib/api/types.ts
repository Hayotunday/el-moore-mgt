/**
 * Types mirroring the live el-moore-api backend (https://el-moore.onrender.com/docs).
 * Field names/shapes are taken directly from its OpenAPI spec. Amounts that the API
 * documents as decimal strings (price, totalAmount, amountPaid, amount, commissionAmount)
 * are kept as `string` here — convert with `Number()` at the point of use.
 */

// Full role enum as returned by the backend. Only the first 7 are "management" roles
// with access to /management/**; INTERNAL_MARKETER/EXTERNAL_MARKETER use /marketer,
// and "basic" is a plain public account.
export type Role =
  | "MD"
  | "GM"
  | "OFFICE_ADMIN"
  | "SITE_COORDINATOR"
  | "TEAM_LEAD"
  | "ACCOUNTANT"
  | "CUSTOMER_CARE"
  | "INTERNAL_MARKETER"
  | "EXTERNAL_MARKETER"
  | "basic";

export type MarketerStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ManagementUser {
  id: string;
  name: string;
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
  createdAt?: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  isPrimary: boolean;
}

export type SaleType = "OUTRIGHT" | "INSTALLMENT";

export interface Sale {
  id: string;
  propertyId: string;
  customerId?: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string | null;
  saleType: SaleType;
  totalAmount: string;
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
    buyerName: string;
    totalAmount: string;
    property?: { title: string };
  };
  marketer?: { id: string; name: string; email: string };
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

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string;
}

// ── Mock-only concepts ──────────────────────────────────────────────────
// The live backend has no endpoint for these yet — they stay backed entirely by
// lib/api/mock-store.ts regardless of NEXT_PUBLIC_API_BASE_URL. Shape follows the
// `site_inspections` table added to el-moore-technical-breakdown.md — not deployed
// yet, but matching it now keeps the eventual swap-over a drop-in.
export type InspectionStatus = "SCHEDULED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";

export interface InspectionRequest {
  id: string;
  customerId: string;
  propertyId: string;
  scheduledById: string;
  scheduledAt: string;
  status: InspectionStatus;
  followUpSent: boolean;
}

export interface AutomatedGreetingSettings {
  birthday: boolean;
  paymentReminder: boolean;
  inspectionFollowup: boolean;
}
