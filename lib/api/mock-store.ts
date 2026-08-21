import type {
  ManagementUser,
  Property,
  Sale,
  InstallmentPlan,
  InstallmentPayment,
  Referral,
  FinancialTransaction,
  AttendanceRecord,
  DailyTaskReport,
  BlogPost,
  NewsletterSubscriber,
  NewsletterCampaign,
  NotificationLogEntry,
  AutomatedGreetingSettings,
  InspectionRequest,
} from "./types";

/** Simulated network latency so the mock layer behaves like a real API. */
export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const DEMO_PASSWORD = "elmoore2024";

// ── Users ────────────────────────────────────────────────────────────────
export const managementUsers: ManagementUser[] = [
  { id: "u-md1", name: "Adaeze Balogun", email: "md@elmoore.com", role: "MD_GM", createdAt: "2023-01-10" },
  { id: "u-admin1", name: "Emeka Johnson", email: "admin@elmoore.com", role: "OFFICE_ADMIN", createdAt: "2023-02-14" },
  { id: "u-coord1", name: "Ifeoma Bassey", email: "coordinator@elmoore.com", role: "SITE_COORDINATOR", teamLeadId: "u-lead1", createdAt: "2023-03-20" },
  { id: "u-lead1", name: "Tunde Afolabi", email: "lead@elmoore.com", role: "TEAM_LEAD", createdAt: "2023-02-01" },
  { id: "u-acct1", name: "Grace Obi", email: "accounts@elmoore.com", role: "ACCOUNTANT", createdAt: "2023-04-05" },
  { id: "u-care1", name: "Blessing Eze", email: "care@elmoore.com", role: "CUSTOMER_CARE", createdAt: "2023-05-18" },
  { id: "u-coord2", name: "Segun Martins", email: "segun@elmoore.com", role: "SITE_COORDINATOR", teamLeadId: "u-lead1", createdAt: "2023-06-02" },
];

export const DEMO_ACCOUNTS = managementUsers.map((u) => ({ email: u.email, role: u.role, name: u.name }));

// ── Properties ───────────────────────────────────────────────────────────
export const properties: Property[] = [
  { id: "prop-001", title: "Luxury 5-Bed Detached Duplex, Maitama", location: "Abuja - Maitama", type: "Duplex", price: 1500000000, status: "SOLD", createdAt: "2023-08-01" },
  { id: "prop-002", title: "Prime 1200sqm Residential Land, Katampe", location: "Abuja - Katampe", type: "Land", price: 180000000, status: "SOLD", createdAt: "2023-08-10" },
  { id: "prop-003", title: "Modern 4-Bed Terrace Duplex, Gwarinpa", location: "Abuja - Gwarinpa", type: "Terrace", price: 220000000, status: "RESERVED", createdAt: "2023-09-02" },
  { id: "prop-004", title: "Executive Duplex, Lekki Phase 1", location: "Lagos - Lekki", type: "Duplex", price: 125000000, status: "SOLD", createdAt: "2023-09-15" },
  { id: "prop-005", title: "Commercial Space, Victoria Island", location: "Lagos - VI", type: "Commercial", price: 350000000, status: "AVAILABLE", createdAt: "2023-10-01" },
  { id: "prop-006", title: "Residential Plot, Asokoro", location: "Abuja - Asokoro", type: "Land", price: 225000000, status: "AVAILABLE", createdAt: "2023-10-20" },
  { id: "prop-007", title: "3-Bed Flat, Jabi", location: "Abuja - Jabi", type: "Flat", price: 85000000, status: "SOLD", createdAt: "2023-11-05" },
  { id: "prop-008", title: "Waterfront Land, Ikoyi", location: "Lagos - Ikoyi", type: "Land", price: 620000000, status: "AVAILABLE", createdAt: "2023-11-22" },
];

// ── Sales ────────────────────────────────────────────────────────────────
export const sales: Sale[] = [
  { id: "sale-001", propertyId: "prop-001", buyerName: "Chukwuemeka Obi", buyerPhone: "08012345678", buyerEmail: "chukwuemeka.obi@example.com", saleType: "OUTRIGHT", totalAmount: 1500000000, soldById: "u-coord1", soldByName: "Ifeoma Bassey", marketerId: "MKT-014", marketerName: "Amara Okonkwo", createdAt: "2024-01-10" },
  { id: "sale-002", propertyId: "prop-002", buyerName: "Fatima Yusuf", buyerPhone: "08167891234", buyerEmail: "fatima.yusuf@example.com", saleType: "INSTALLMENT", totalAmount: 180000000, soldById: "u-coord2", soldByName: "Segun Martins", marketerId: null, marketerName: null, createdAt: "2024-01-14" },
  { id: "sale-003", propertyId: "prop-004", buyerName: "David Adeyemi", buyerPhone: "08034567890", buyerEmail: "david.adeyemi@example.com", saleType: "OUTRIGHT", totalAmount: 125000000, soldById: "u-coord1", soldByName: "Ifeoma Bassey", marketerId: "MKT-021", marketerName: "Chidi Nwankwo", createdAt: "2024-01-18" },
  { id: "sale-004", propertyId: "prop-007", buyerName: "Ngozi Uche", buyerPhone: "08098765432", buyerEmail: "ngozi.uche@example.com", saleType: "INSTALLMENT", totalAmount: 85000000, soldById: "u-coord2", soldByName: "Segun Martins", marketerId: null, marketerName: null, createdAt: "2024-02-02" },
  { id: "sale-005", propertyId: "prop-003", buyerName: "Peter Danladi", buyerPhone: "08045671234", buyerEmail: "peter.danladi@example.com", saleType: "INSTALLMENT", totalAmount: 220000000, soldById: "u-coord1", soldByName: "Ifeoma Bassey", marketerId: "MKT-014", marketerName: "Amara Okonkwo", createdAt: "2024-02-20" },
  { id: "sale-006", propertyId: "prop-001", buyerName: "Chukwuemeka Obi", buyerPhone: "08012345678", buyerEmail: "chukwuemeka.obi@example.com", saleType: "OUTRIGHT", totalAmount: 45000000, soldById: "u-coord1", soldByName: "Ifeoma Bassey", marketerId: "MKT-014", marketerName: "Amara Okonkwo", createdAt: "2024-03-01" },
];

export const installmentPlans: InstallmentPlan[] = [
  { id: "plan-002", saleId: "sale-002", numberOfInstallments: 12, startDate: "2024-01-20", overdue: false },
  { id: "plan-004", saleId: "sale-004", numberOfInstallments: 6, startDate: "2024-02-05", overdue: true },
  { id: "plan-005", saleId: "sale-005", numberOfInstallments: 18, startDate: "2024-02-25", overdue: false },
];

export const installmentPayments: InstallmentPayment[] = [
  { id: uid("ip"), saleId: "sale-002", amountPaid: 30000000, paidAt: "2024-01-20", note: "First installment" },
  { id: uid("ip"), saleId: "sale-002", amountPaid: 15000000, paidAt: "2024-02-20" },
  { id: uid("ip"), saleId: "sale-004", amountPaid: 20000000, paidAt: "2024-02-05", note: "Down payment" },
  { id: uid("ip"), saleId: "sale-005", amountPaid: 25000000, paidAt: "2024-03-01" },
  { id: uid("ip"), saleId: "sale-005", amountPaid: 25000000, paidAt: "2024-04-01" },
];

// ── Referrals ────────────────────────────────────────────────────────────
export const referrals: Referral[] = [
  { id: "ref-001", marketerId: "MKT-014", marketerName: "Amara Okonkwo", saleId: "sale-001", commissionAmount: 45000000, status: "PAID", paidAt: "2024-01-20", createdAt: "2024-01-11" },
  { id: "ref-002", marketerId: "MKT-021", marketerName: "Chidi Nwankwo", saleId: "sale-003", commissionAmount: 5000000, status: "PENDING", paidAt: null, createdAt: "2024-01-19" },
  { id: "ref-003", marketerId: "MKT-014", marketerName: "Amara Okonkwo", saleId: "sale-005", commissionAmount: 8800000, status: "PENDING", paidAt: null, createdAt: "2024-02-21" },
];

// ── Finance ──────────────────────────────────────────────────────────────
export const financialTransactions: FinancialTransaction[] = [
  { id: "txn-001", type: "INCOME", category: "Property Sale", amount: 125000000, date: "2024-01-14", saleId: "sale-003", recordedById: "u-acct1", recordedByName: "Grace Obi" },
  { id: "txn-002", type: "EXPENSE", category: "Commission Payout", amount: 45000000, date: "2024-01-20", saleId: "sale-001", note: "Paid to Amara Okonkwo", recordedById: "u-acct1", recordedByName: "Grace Obi" },
  { id: "txn-003", type: "EXPENSE", category: "Office Utilities", amount: 850000, date: "2024-01-25", note: "Generator diesel + electricity", recordedById: "u-admin1", recordedByName: "Emeka Johnson" },
  { id: "txn-004", type: "INCOME", category: "Installment Payment", amount: 30000000, date: "2024-01-20", saleId: "sale-002", recordedById: "u-acct1", recordedByName: "Grace Obi" },
  { id: "txn-005", type: "EXPENSE", category: "Marketing", amount: 3200000, date: "2024-02-02", note: "Social media ad spend", recordedById: "u-admin1", recordedByName: "Emeka Johnson" },
  { id: "txn-006", type: "INCOME", category: "Installment Payment", amount: 20000000, date: "2024-02-05", saleId: "sale-004", recordedById: "u-acct1", recordedByName: "Grace Obi" },
  { id: "txn-007", type: "EXPENSE", category: "Staff Welfare", amount: 600000, date: "2024-02-14", recordedById: "u-admin1", recordedByName: "Emeka Johnson" },
];

// ── Attendance ───────────────────────────────────────────────────────────
export const attendanceRecords: AttendanceRecord[] = [
  { id: uid("att"), staffId: "u-coord1", staffName: "Ifeoma Bassey", date: "2024-08-18", clockIn: "08:30 AM", clockOut: "05:45 PM" },
  { id: uid("att"), staffId: "u-coord2", staffName: "Segun Martins", date: "2024-08-18", clockIn: "08:15 AM", clockOut: "05:30 PM" },
  { id: uid("att"), staffId: "u-care1", staffName: "Blessing Eze", date: "2024-08-18", clockIn: "09:05 AM", clockOut: "06:00 PM" },
  { id: uid("att"), staffId: "u-acct1", staffName: "Grace Obi", date: "2024-08-18", clockIn: "08:45 AM", clockOut: "05:15 PM" },
  { id: uid("att"), staffId: "u-lead1", staffName: "Tunde Afolabi", date: "2024-08-18", clockIn: "08:20 AM", clockOut: "05:50 PM" },
  { id: uid("att"), staffId: "u-coord1", staffName: "Ifeoma Bassey", date: "2024-08-17", clockIn: "08:40 AM", clockOut: "05:40 PM" },
  { id: uid("att"), staffId: "u-coord2", staffName: "Segun Martins", date: "2024-08-17", clockIn: "08:50 AM", clockOut: "05:20 PM" },
];

// ── Daily task reports ───────────────────────────────────────────────────
export const dailyTaskReports: DailyTaskReport[] = [
  { id: uid("dtr"), staffId: "u-coord1", staffName: "Ifeoma Bassey", date: "2024-08-18", content: "Showed the Gwarinpa terrace to two prospects, followed up with the Katampe installment buyer on next payment date.", createdAt: "2024-08-18T17:50:00" },
  { id: uid("dtr"), staffId: "u-coord2", staffName: "Segun Martins", date: "2024-08-18", content: "Site inspection at Jabi flat, coordinated survey plan pickup for the Lekki duplex file.", createdAt: "2024-08-18T17:35:00" },
  { id: uid("dtr"), staffId: "u-care1", staffName: "Blessing Eze", date: "2024-08-18", content: "Handled 6 inbound enquiries via WhatsApp, escalated one negotiation to the coordinator.", createdAt: "2024-08-18T18:05:00" },
  { id: uid("dtr"), staffId: "u-acct1", staffName: "Grace Obi", date: "2024-08-18", content: "Reconciled January installment payments, flagged the Jabi flat plan as overdue.", createdAt: "2024-08-18T17:20:00" },
  { id: uid("dtr"), staffId: "u-coord1", staffName: "Ifeoma Bassey", date: "2024-08-17", content: "Closed paperwork on the Maitama duplex sale, prepped contract for signing.", createdAt: "2024-08-17T17:45:00" },
];

// ── Blog ─────────────────────────────────────────────────────────────────
export const blogPosts: BlogPost[] = [
  {
    id: "post-001",
    title: "The Future of Residential Curated Spaces",
    slug: "future-of-residential-curated-spaces",
    excerpt: "An executive summary on how bespoke architectural integrity is driving unprecedented ROI in emerging suburban districts.",
    content: "An executive summary on how bespoke architectural integrity is driving unprecedented ROI in emerging suburban districts. As Abuja's periphery matures, curated developments are outperforming generic estates on both yield and resale velocity.",
    category: "Investment Mastery",
    image: "assets/property-1.jpg",
    authorId: "u-md1",
    authorName: "Adaeze Balogun",
    published: true,
    publishedAt: "2024-01-05",
    createdAt: "2024-01-02",
  },
  {
    id: "post-002",
    title: "Understanding Certificate of Occupancy",
    slug: "understanding-certificate-of-occupancy",
    excerpt: "The vital document every Nigerian land investor must master.",
    content: "The vital document every Nigerian land investor must master — what a C of O actually protects, how it differs from Governor's Consent, and the red flags to check before you commit.",
    category: "Legal Masterclass",
    image: "assets/property-2.jpg",
    authorId: "u-admin1",
    authorName: "Emeka Johnson",
    published: true,
    publishedAt: "2024-01-18",
    createdAt: "2024-01-15",
  },
  {
    id: "post-003",
    title: "Q1 Abuja Market Outlook",
    slug: "q1-abuja-market-outlook",
    excerpt: "A first-quarter read on pricing momentum across Maitama, Katampe and Gwarinpa.",
    content: "A first-quarter read on pricing momentum across Maitama, Katampe and Gwarinpa, with a look at infrastructure pivots likely to move valuations over the next 18 months.",
    category: "Market Insights",
    image: "assets/property-3.jpg",
    authorId: "u-md1",
    authorName: "Adaeze Balogun",
    published: false,
    publishedAt: null,
    createdAt: "2024-02-10",
  },
];

// ── Newsletter ───────────────────────────────────────────────────────────
export const newsletterSubscribers: NewsletterSubscriber[] = [
  { id: uid("sub"), name: "Chukwuemeka Obi", email: "chukwuemeka.obi@example.com", type: "CUSTOMER", subscribedAt: "2024-01-10", unsubscribed: false },
  { id: uid("sub"), name: "Fatima Yusuf", email: "fatima.yusuf@example.com", type: "CUSTOMER", subscribedAt: "2024-01-14", unsubscribed: false },
  { id: uid("sub"), name: "David Adeyemi", email: "david.adeyemi@example.com", type: "CUSTOMER", subscribedAt: "2024-01-18", unsubscribed: false },
  { id: uid("sub"), name: "Ngozi Uche", email: "ngozi.uche@example.com", type: "CUSTOMER", subscribedAt: "2024-02-02", unsubscribed: false },
  { id: uid("sub"), name: "Peter Danladi", email: "peter.danladi@example.com", type: "CUSTOMER", subscribedAt: "2024-02-20", unsubscribed: false },
  { id: uid("sub"), name: "Amara Okonkwo", email: "amara@elmoore.com", type: "MARKETER", subscribedAt: "2023-06-15", unsubscribed: false },
  { id: uid("sub"), name: "Chidi Nwankwo", email: "chidi@elmoore.com", type: "MARKETER", subscribedAt: "2023-03-22", unsubscribed: false },
  { id: uid("sub"), name: "Ahmed Hassan", email: "ahmed@example.com", type: "SUBSCRIBER", subscribedAt: "2024-02-28", unsubscribed: false },
];

export const newsletterCampaigns: NewsletterCampaign[] = [
  { id: uid("camp"), subject: "New Year, New Portfolio — January Listings", body: "Our latest premium investment opportunities across Abuja and Lagos.", audience: "All Subscribers", recipientCount: 8, sentAt: "2024-01-08", createdById: "u-admin1", createdByName: "Emeka Johnson" },
  { id: uid("camp"), subject: "Reminder: February Installment Due", body: "A friendly reminder that your next installment is due this week.", audience: "Custom — Installment Buyers", recipientCount: 2, sentAt: "2024-02-12", createdById: "u-acct1", createdByName: "Grace Obi" },
];

export const notificationLog: NotificationLogEntry[] = [
  { id: uid("nl"), channel: "EMAIL", triggerType: "BIRTHDAY", recipient: "chukwuemeka.obi@example.com", status: "SENT", sentAt: "2024-08-12" },
  { id: uid("nl"), channel: "EMAIL", triggerType: "PAYMENT_REMINDER", recipient: "fatima.yusuf@example.com", status: "SENT", sentAt: "2024-08-13" },
  { id: uid("nl"), channel: "WHATSAPP", triggerType: "INSPECTION_FOLLOWUP", recipient: "+2348045671234", status: "SENT", sentAt: "2024-08-15" },
  { id: uid("nl"), channel: "EMAIL", triggerType: "PAYMENT_REMINDER", recipient: "ngozi.uche@example.com", status: "FAILED", sentAt: "2024-08-16" },
];

export const automatedGreetingSettings: AutomatedGreetingSettings = {
  birthday: true,
  paymentReminder: true,
  inspectionFollowup: false,
};

// ── Site inspection requests ────────────────────────────────────────────
export const inspectionRequests: InspectionRequest[] = [
  {
    id: "insp-001",
    propertyId: "prop-005",
    propertyTitle: "Commercial Space, Victoria Island",
    customerName: "Tobiloba Akande",
    customerPhone: "08023456781",
    customerEmail: "tobiloba.akande@example.com",
    preferredDate: "2024-08-24",
    note: "Would like to see the space with a contractor to assess renovation scope.",
    status: "PENDING",
    requestedAt: "2024-08-19",
  },
  {
    id: "insp-002",
    propertyId: "prop-006",
    propertyTitle: "Residential Plot, Asokoro",
    customerName: "Chioma Nwosu",
    customerPhone: "08076543219",
    customerEmail: "chioma.nwosu@example.com",
    preferredDate: "2024-08-22",
    note: "Weekend visit preferred, bringing surveyor.",
    status: "PENDING",
    requestedAt: "2024-08-18",
  },
  {
    id: "insp-003",
    propertyId: "prop-008",
    propertyTitle: "Waterfront Land, Ikoyi",
    customerName: "Emeka Chukwu",
    customerPhone: "08011223344",
    customerEmail: "emeka.chukwu@example.com",
    preferredDate: "2024-08-15",
    status: "DONE",
    requestedAt: "2024-08-10",
    completedAt: "2024-08-15",
    completedById: "u-coord1",
  },
  {
    id: "insp-004",
    propertyId: "prop-003",
    propertyTitle: "Modern 4-Bed Terrace Duplex, Gwarinpa",
    customerName: "Halima Bello",
    customerPhone: "08099887766",
    customerEmail: "halima.bello@example.com",
    preferredDate: "2024-08-20",
    note: "Second visit before finalizing the installment plan.",
    status: "PENDING",
    requestedAt: "2024-08-17",
  },
];
