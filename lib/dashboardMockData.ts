// Admin Dashboard Data
export const adminDashboardStats = {
  totalInventoryValue: 2450000000,
  activeMarketerCount: 48,
  totalProperties: 156,
  soldThisMonth: 23,
};

export const adminProperties = [
  {
    id: "prop-001",
    name: "Luxury Estate, Gwarinpa",
    location: "Abuja, FCT",
    price: 45000000,
    status: "Active",
    agent: "Amara Okonkwo",
    views: 2345,
    offers: 12,
  },
  {
    id: "prop-002",
    name: "Executive Duplex, Lekki",
    location: "Lagos",
    price: 125000000,
    status: "Sold",
    agent: "Chidi Nwankwo",
    views: 5678,
    offers: 28,
  },
  {
    id: "prop-003",
    name: "Commercial Space, V.I.",
    location: "Lagos",
    price: 350000000,
    status: "Active",
    agent: "Zainab Ibrahim",
    views: 3421,
    offers: 8,
  },
  {
    id: "prop-004",
    name: "Residential Plot, Asokoro",
    location: "Abuja, FCT",
    price: 22500000,
    status: "Active",
    agent: "Kunle Adesanya",
    views: 1203,
    offers: 5,
  },
];

export const adminUsers = [
  {
    id: "user-101",
    name: "Amara Okonkwo",
    email: "amara@elmoore.com",
    role: "Marketer",
    totalSales: 8,
    totalValue: 450000000,
    joinDate: "2023-06-15",
    status: "Active",
  },
  {
    id: "user-102",
    name: "Chidi Nwankwo",
    email: "chidi@elmoore.com",
    role: "Marketer",
    totalSales: 12,
    totalValue: 680000000,
    joinDate: "2023-03-22",
    status: "Active",
  },
  {
    id: "user-103",
    name: "Zainab Ibrahim",
    email: "zainab@elmoore.com",
    role: "Marketer",
    totalSales: 6,
    totalValue: 380000000,
    joinDate: "2023-09-10",
    status: "Active",
  },
  {
    id: "user-104",
    name: "Kunle Adesanya",
    email: "kunle@elmoore.com",
    role: "Marketer",
    totalSales: 15,
    totalValue: 920000000,
    joinDate: "2023-01-05",
    status: "Active",
  },
];

export const promotionTemplate = `
Dear Valued Investor,

We are excited to present you with our latest premium investment opportunities in Abuja and Lagos.

Discover properties with exceptional ROI potential and secure your wealth today.

Visit El-Moore Real Estate to explore more.

Best regards,
El-Moore Team
`;

// HR Dashboard Data
export const hrStaffList = [
  {
    id: "staff-001",
    name: "Amara Okonkwo",
    position: "Senior Marketer",
    department: "Sales",
    email: "amara@elmoore.com",
    phone: "08012345678",
    joinDate: "2023-06-15",
    status: "Active",
  },
  {
    id: "staff-002",
    name: "Chidi Nwankwo",
    position: "Marketer",
    department: "Sales",
    email: "chidi@elmoore.com",
    phone: "08087654321",
    joinDate: "2023-03-22",
    status: "Active",
  },
  {
    id: "staff-003",
    name: "Sarah Johnson",
    position: "HR Manager",
    department: "Human Resources",
    email: "sarah@elmoore.com",
    phone: "08045671234",
    joinDate: "2023-02-01",
    status: "Active",
  },
];

export const attendanceLog = [
  {
    id: "att-001",
    name: "Amara Okonkwo",
    date: "2024-01-15",
    clockIn: "08:30 AM",
    clockOut: "05:45 PM",
    status: "On Time",
  },
  {
    id: "att-002",
    name: "Chidi Nwankwo",
    date: "2024-01-15",
    clockIn: "08:15 AM",
    clockOut: "05:30 PM",
    status: "On Time",
  },
  {
    id: "att-003",
    name: "Sarah Johnson",
    date: "2024-01-15",
    clockIn: "09:00 AM",
    clockOut: "06:00 PM",
    status: "Late",
  },
  {
    id: "att-004",
    name: "Kunle Adesanya",
    date: "2024-01-15",
    clockIn: "08:45 AM",
    clockOut: "05:15 PM",
    status: "On Time",
  },
];

export const disciplinaryLog = [
  {
    id: "disc-001",
    staffName: "David Chen",
    date: "2024-01-10",
    issue: "Missed target deadline",
    severity: "Medium",
    status: "Resolved",
    notes: "Discussed performance improvement plan",
  },
  {
    id: "disc-002",
    staffName: "Maria Santos",
    date: "2024-01-08",
    issue: "Unauthorized absence",
    severity: "High",
    status: "Pending",
    notes: "Awaiting staff response",
  },
  {
    id: "disc-003",
    staffName: "John Smith",
    date: "2024-01-05",
    issue: "Minor conduct issue",
    severity: "Low",
    status: "Closed",
    notes: "Verbal warning issued",
  },
];

export const taskRoster = [
  {
    id: "task-001",
    title: "Q1 Property Valuation Review",
    assignee: "Amara Okonkwo",
    dueDate: "2024-02-15",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "task-002",
    title: "Client Follow-up Campaign",
    assignee: "Chidi Nwankwo",
    dueDate: "2024-02-10",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "task-003",
    title: "Marketing Material Update",
    assignee: "Sarah Johnson",
    dueDate: "2024-02-20",
    priority: "Low",
    status: "Not Started",
  },
];

// Finance Dashboard Data
export const recentTransactions = [
  {
    id: "txn-001",
    date: "2024-01-15",
    type: "Commission Payout",
    agent: "Amara Okonkwo",
    amount: 1800000,
    status: "Paid",
    reference: "COMM-2024-001",
  },
  {
    id: "txn-002",
    date: "2024-01-14",
    type: "Property Sale",
    agent: "Chidi Nwankwo",
    amount: 125000000,
    status: "Completed",
    reference: "SALE-2024-045",
  },
  {
    id: "txn-003",
    date: "2024-01-13",
    type: "Commission Payout",
    agent: "Kunle Adesanya",
    amount: 2750000,
    status: "Pending",
    reference: "COMM-2024-002",
  },
  {
    id: "txn-004",
    date: "2024-01-12",
    type: "Property Sale",
    agent: "Zainab Ibrahim",
    amount: 45000000,
    status: "Completed",
    reference: "SALE-2024-044",
  },
  {
    id: "txn-005",
    date: "2024-01-11",
    type: "Refund",
    agent: "System",
    amount: -500000,
    status: "Completed",
    reference: "REF-2024-003",
  },
];

export const commissionDisbursements = [
  {
    id: "disb-001",
    agent: "Amara Okonkwo",
    period: "January 2024",
    totalEarned: 4500000,
    disbursed: 4500000,
    status: "Paid",
    paymentDate: "2024-01-15",
  },
  {
    id: "disb-002",
    agent: "Chidi Nwankwo",
    period: "January 2024",
    totalEarned: 6200000,
    disbursed: 0,
    status: "Pending",
    paymentDate: "2024-01-20",
  },
  {
    id: "disb-003",
    agent: "Kunle Adesanya",
    period: "January 2024",
    totalEarned: 7100000,
    disbursed: 7100000,
    status: "Paid",
    paymentDate: "2024-01-15",
  },
  {
    id: "disb-004",
    agent: "Zainab Ibrahim",
    period: "January 2024",
    totalEarned: 3200000,
    disbursed: 0,
    status: "Processing",
    paymentDate: "2024-01-18",
  },
];

// Marketer Portal Data
export const marketerProfile = {
  name: "Amara Okonkwo",
  email: "amara@elmoore.com",
  phone: "08012345678",
  joinDate: "2023-06-15",
  totalListings: 24,
  activeSales: 8,
  completedSales: 45,
};

export const marketerSalesReport = [
  {
    id: "sale-001",
    propertyName: "Luxury Estate, Gwarinpa",
    saleDate: "2024-01-10",
    salePrice: 45000000,
    commission: 1800000,
    status: "Completed",
  },
  {
    id: "sale-002",
    propertyName: "Executive Duplex, Lekki",
    saleDate: "2023-12-28",
    salePrice: 125000000,
    commission: 5000000,
    status: "Completed",
  },
  {
    id: "sale-003",
    propertyName: "Commercial Space, V.I.",
    saleDate: "2023-12-15",
    salePrice: 350000000,
    commission: 14000000,
    status: "Completed",
  },
];

export const commissionHistory = [
  {
    period: "January 2024",
    earned: 4500000,
    status: "Paid",
    date: "2024-01-15",
  },
  {
    period: "December 2023",
    earned: 9800000,
    status: "Paid",
    date: "2023-12-31",
  },
  {
    period: "November 2023",
    earned: 6700000,
    status: "Paid",
    date: "2023-11-30",
  },
  {
    period: "October 2023",
    earned: 5200000,
    status: "Paid",
    date: "2023-10-31",
  },
];

export const leads = [
  {
    id: "lead-001",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    phone: "08098765432",
    interestedProperty: "Abuja Properties",
    budget: 50000000,
    source: "Website",
    status: "New",
  },
  {
    id: "lead-002",
    name: "Fatima Yusuf",
    email: "fatima@example.com",
    phone: "08167891234",
    interestedProperty: "Lagos Commercial",
    budget: 200000000,
    source: "Referral",
    status: "Qualified",
  },
  {
    id: "lead-003",
    name: "Peter Adeyemi",
    email: "peter@example.com",
    phone: "08034567890",
    interestedProperty: "Luxury Residential",
    budget: 150000000,
    source: "Website",
    status: "Contacted",
  },
];
