export type Role =
  | "MD_GM"
  | "OFFICE_ADMIN"
  | "SITE_COORDINATOR"
  | "TEAM_LEAD"
  | "ACCOUNTANT"
  | "CUSTOMER_CARE";

export interface ManagementUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamLeadId?: string | null;
  createdAt: string;
}

export type PropertyStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export interface Property {
  id: string;
  title: string;
  location: string;
  type: string;
  price: number;
  status: PropertyStatus;
  createdAt: string;
}

export type SaleType = "OUTRIGHT" | "INSTALLMENT";

export interface Sale {
  id: string;
  propertyId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  saleType: SaleType;
  totalAmount: number;
  soldById?: string | null;
  soldByName?: string | null;
  marketerId?: string | null;
  marketerName?: string | null;
  createdAt: string;
}

export interface InstallmentPlan {
  id: string;
  saleId: string;
  numberOfInstallments: number;
  startDate: string;
  overdue: boolean;
}

export interface InstallmentPayment {
  id: string;
  saleId: string;
  amountPaid: number;
  paidAt: string;
  note?: string;
}

export type ReferralStatus = "PENDING" | "PAID";

export interface Referral {
  id: string;
  marketerId: string;
  marketerName: string;
  saleId: string;
  commissionAmount: number;
  status: ReferralStatus;
  paidAt?: string | null;
  createdAt: string;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  saleId?: string | null;
  note?: string;
  recordedById: string;
  recordedByName: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut?: string | null;
}

export interface DailyTaskReport {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  authorId: string;
  authorName: string;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

export type SubscriberType = "CUSTOMER" | "MARKETER" | "SUBSCRIBER";

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  type: SubscriberType;
  subscribedAt: string;
  unsubscribed: boolean;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  body: string;
  audience: string;
  recipientCount: number;
  sentAt: string;
  createdById: string;
  createdByName: string;
}

export type NotificationChannel = "EMAIL" | "WHATSAPP";
export type NotificationTrigger =
  | "BIRTHDAY"
  | "PAYMENT_REMINDER"
  | "INSPECTION_FOLLOWUP"
  | "COMMISSION_PAID";

export interface NotificationLogEntry {
  id: string;
  channel: NotificationChannel;
  triggerType: NotificationTrigger;
  recipient: string;
  status: "SENT" | "FAILED";
  sentAt: string;
}

export interface AutomatedGreetingSettings {
  birthday: boolean;
  paymentReminder: boolean;
  inspectionFollowup: boolean;
}

export type InspectionStatus = "PENDING" | "DONE";

export interface InspectionRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preferredDate: string;
  note?: string;
  status: InspectionStatus;
  requestedAt: string;
  completedAt?: string | null;
  completedById?: string | null;
}

export interface Customer {
  key: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  saleCount: number;
  saleTypes: SaleType[];
  properties: string[];
  lastPurchaseDate: string;
}
