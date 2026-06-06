// Mock data for the VendorBridge AI frontend demo.

export type Vendor = {
  id: string;
  name: string;
  email: string;
  contact: string;
  country: string;
  category: string[];
  trust_score: number;
  total_orders: number;
  on_time: number;
  avg_response_days: number;
  win_rate: number;
  dispute_free: number;
  last_order: string;
  is_approved: boolean;
};

export type RFQ = {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  budget: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "draft" | "active" | "under_review" | "awarded" | "closed";
  submission_deadline: string;
  delivery_date: string;
  quotes_received: number;
  vendors_invited: number;
  created_at: string;
  owner: string;
  items: { name: string; qty: number; unit: string; specs: string }[];
};

export type Quotation = {
  id: string;
  quote_number: string;
  rfq_id: string;
  vendor_id: string;
  vendor_name: string;
  total: number;
  unit_price: number;
  delivery_days: number;
  payment_terms: string;
  trust_score: number;
  ai_score: number;
  status: "submitted" | "shortlisted" | "awarded" | "rejected";
  submitted_at: string;
};

export type Approval = {
  id: string;
  entity_type: "rfq" | "quotation" | "purchase_order";
  entity_ref: string;
  title: string;
  amount: number;
  requested_by: string;
  submitted_at: string;
  due_by: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  ai_recommendation: string;
};

export type PurchaseOrder = {
  id: string;
  po_number: string;
  rfq_number: string;
  vendor_name: string;
  total: number;
  status: "issued" | "acknowledged" | "in_progress" | "delivered" | "invoiced" | "completed";
  issued_at: string;
  delivery_date: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  po_number: string;
  vendor_name: string;
  total: number;
  issue_date: string;
  due_date: string;
  payment_status: "unpaid" | "partial" | "paid" | "overdue" | "disputed";
  match_status: "pending" | "matched" | "discrepancy" | "approved";
};

export const VENDORS: Vendor[] = [
  { id: "v1", name: "TechPro Supplies", email: "sales@techpro.com", contact: "John Smith", country: "USA", category: ["IT", "Electronics"], trust_score: 87, total_orders: 142, on_time: 91, avg_response_days: 1.2, win_rate: 38, dispute_free: 96, last_order: "2026-05-22", is_approved: true },
  { id: "v2", name: "FastTech Corp", email: "rfq@fasttech.io", contact: "Maria Lopez", country: "Mexico", category: ["IT", "Logistics"], trust_score: 74, total_orders: 88, on_time: 84, avg_response_days: 1.6, win_rate: 27, dispute_free: 92, last_order: "2026-05-30", is_approved: true },
  { id: "v3", name: "GlobalSup Industries", email: "bids@globalsup.com", contact: "Rakesh Iyer", country: "India", category: ["Office", "Furniture"], trust_score: 58, total_orders: 41, on_time: 71, avg_response_days: 3.1, win_rate: 19, dispute_free: 78, last_order: "2026-04-12", is_approved: true },
  { id: "v4", name: "NorthStar Office", email: "hello@northstar.co", contact: "Anna Berg", country: "Sweden", category: ["Office", "Furniture"], trust_score: 81, total_orders: 67, on_time: 88, avg_response_days: 1.9, win_rate: 32, dispute_free: 95, last_order: "2026-05-18", is_approved: true },
  { id: "v5", name: "RackForge Systems", email: "team@rackforge.com", contact: "Daniel Kim", country: "South Korea", category: ["Datacenter", "Hardware"], trust_score: 79, total_orders: 54, on_time: 86, avg_response_days: 2.2, win_rate: 31, dispute_free: 90, last_order: "2026-05-09", is_approved: true },
  { id: "v6", name: "PaperWorks Co", email: "orders@paperworks.com", contact: "Lina Park", country: "Canada", category: ["Office", "Supplies"], trust_score: 69, total_orders: 213, on_time: 82, avg_response_days: 2.0, win_rate: 45, dispute_free: 88, last_order: "2026-06-01", is_approved: true },
  { id: "v7", name: "NewVendor Inc", email: "sales@newvendor.io", contact: "Omar Hassan", country: "UAE", category: ["IT"], trust_score: 42, total_orders: 3, on_time: 67, avg_response_days: 4.0, win_rate: 33, dispute_free: 100, last_order: "2026-05-28", is_approved: true },
  { id: "v8", name: "Cloud9 Networks", email: "biz@cloud9.net", contact: "Sophie Chen", country: "Singapore", category: ["IT", "Networking"], trust_score: 90, total_orders: 96, on_time: 95, avg_response_days: 0.9, win_rate: 41, dispute_free: 98, last_order: "2026-06-03", is_approved: true },
];

export const RFQS: RFQ[] = [
  { id: "r1", rfq_number: "RFQ-2026-0042", title: "100 Dell Laptops — Core i7", category: "IT Equipment", budget: 80000, priority: "high", status: "under_review", submission_deadline: "2026-06-12T23:59:00Z", delivery_date: "2026-07-01", quotes_received: 4, vendors_invited: 6, created_at: "2026-06-02T09:00:00Z", owner: "Sarah Chen", items: [{ name: "Dell Latitude 7430", qty: 100, unit: "units", specs: "Core i7, 16GB RAM, 512GB SSD" }] },
  { id: "r2", rfq_number: "RFQ-2026-0041", title: "200 Ergonomic Office Chairs", category: "Office Furniture", budget: 40000, priority: "medium", status: "active", submission_deadline: "2026-06-15T23:59:00Z", delivery_date: "2026-07-10", quotes_received: 6, vendors_invited: 8, created_at: "2026-06-01T11:00:00Z", owner: "Sarah Chen", items: [{ name: "Ergonomic Chair", qty: 200, unit: "units", specs: "Adjustable lumbar, mesh back" }] },
  { id: "r3", rfq_number: "RFQ-2026-0040", title: "12 Server Racks — 42U", category: "Datacenter", budget: 38000, priority: "high", status: "active", submission_deadline: "2026-06-14T23:59:00Z", delivery_date: "2026-07-05", quotes_received: 2, vendors_invited: 5, created_at: "2026-05-30T14:20:00Z", owner: "Daniel Park", items: [{ name: "Server Rack 42U", qty: 12, unit: "units", specs: "Black, lockable, cable management" }] },
  { id: "r4", rfq_number: "RFQ-2026-0039", title: "Printer Paper — Annual Contract", category: "Office Supplies", budget: 18000, priority: "low", status: "awarded", submission_deadline: "2026-05-25T23:59:00Z", delivery_date: "2026-06-20", quotes_received: 7, vendors_invited: 7, created_at: "2026-05-15T10:00:00Z", owner: "Lisa Wong", items: [{ name: "A4 80gsm paper", qty: 5000, unit: "reams", specs: "FSC certified" }] },
  { id: "r5", rfq_number: "RFQ-2026-0038", title: "Network Switches — 24-port", category: "Networking", budget: 22000, priority: "urgent", status: "under_review", submission_deadline: "2026-06-10T23:59:00Z", delivery_date: "2026-06-25", quotes_received: 5, vendors_invited: 6, created_at: "2026-05-28T08:30:00Z", owner: "Daniel Park", items: [{ name: "Managed Switch 24-port", qty: 30, unit: "units", specs: "PoE+, Layer 2/3" }] },
  { id: "r6", rfq_number: "RFQ-2026-0037", title: "Conference Room AV Equipment", category: "IT Equipment", budget: 65000, priority: "medium", status: "draft", submission_deadline: "2026-06-20T23:59:00Z", delivery_date: "2026-07-15", quotes_received: 0, vendors_invited: 0, created_at: "2026-06-05T15:00:00Z", owner: "Sarah Chen", items: [{ name: "4K Display 75\"", qty: 8, unit: "units", specs: "Touch, with PTZ camera" }] },
];

export const QUOTATIONS: Quotation[] = [
  { id: "q1", quote_number: "QT-2026-0142", rfq_id: "r1", vendor_id: "v1", vendor_name: "TechPro Supplies", total: 76500, unit_price: 765, delivery_days: 14, payment_terms: "Net 30", trust_score: 87, ai_score: 87.4, status: "shortlisted", submitted_at: "2026-06-04T12:00:00Z" },
  { id: "q2", quote_number: "QT-2026-0143", rfq_id: "r1", vendor_id: "v2", vendor_name: "FastTech Corp", total: 79200, unit_price: 792, delivery_days: 10, payment_terms: "Net 30", trust_score: 74, ai_score: 79.1, status: "shortlisted", submitted_at: "2026-06-04T15:30:00Z" },
  { id: "q3", quote_number: "QT-2026-0144", rfq_id: "r1", vendor_id: "v3", vendor_name: "GlobalSup Industries", total: 82000, unit_price: 820, delivery_days: 21, payment_terms: "Net 45", trust_score: 58, ai_score: 58.3, status: "submitted", submitted_at: "2026-06-05T09:10:00Z" },
  { id: "q4", quote_number: "QT-2026-0145", rfq_id: "r1", vendor_id: "v7", vendor_name: "NewVendor Inc", total: 73900, unit_price: 739, delivery_days: 18, payment_terms: "Net 60", trust_score: 42, ai_score: 52.1, status: "submitted", submitted_at: "2026-06-05T16:00:00Z" },
];

export const APPROVALS: Approval[] = [
  { id: "a1", entity_type: "purchase_order", entity_ref: "PO-2026-0021", title: "100 Dell Laptops — TechPro Supplies", amount: 76500, requested_by: "Sarah Chen", submitted_at: "2026-06-04T13:00:00Z", due_by: "2026-06-07T13:00:00Z", status: "pending", priority: "high", ai_recommendation: "Approve. Best overall value (AI score 87.4) with 91% on-time delivery history." },
  { id: "a2", entity_type: "rfq", entity_ref: "RFQ-2026-0039", title: "Conference Room AV Equipment", amount: 65000, requested_by: "Sarah Chen", submitted_at: "2026-06-05T20:00:00Z", due_by: "2026-06-08T20:00:00Z", status: "pending", priority: "medium", ai_recommendation: "Approve with note: budget is 8% above category average — consider 2-vendor split." },
  { id: "a3", entity_type: "purchase_order", entity_ref: "PO-2026-0019", title: "Server Racks — RackForge Systems", amount: 4200, requested_by: "Daniel Park", submitted_at: "2026-06-04T08:00:00Z", due_by: "2026-06-06T08:00:00Z", status: "pending", priority: "urgent", ai_recommendation: "Approve. Low-value, fast-track. Vendor trust 79." },
];

export const POS: PurchaseOrder[] = [
  { id: "po1", po_number: "PO-2026-0020", rfq_number: "RFQ-2026-0039", vendor_name: "PaperWorks Co", total: 17400, status: "in_progress", issued_at: "2026-05-26T10:00:00Z", delivery_date: "2026-06-20" },
  { id: "po2", po_number: "PO-2026-0019", rfq_number: "RFQ-2026-0036", vendor_name: "RackForge Systems", total: 4200, status: "acknowledged", issued_at: "2026-06-03T10:00:00Z", delivery_date: "2026-06-18" },
  { id: "po3", po_number: "PO-2026-0018", rfq_number: "RFQ-2026-0035", vendor_name: "FastTech Corp", total: 12800, status: "delivered", issued_at: "2026-05-20T10:00:00Z", delivery_date: "2026-06-02" },
  { id: "po4", po_number: "PO-2026-0017", rfq_number: "RFQ-2026-0034", vendor_name: "Cloud9 Networks", total: 28900, status: "invoiced", issued_at: "2026-05-12T10:00:00Z", delivery_date: "2026-05-28" },
  { id: "po5", po_number: "PO-2026-0016", rfq_number: "RFQ-2026-0033", vendor_name: "NorthStar Office", total: 9650, status: "completed", issued_at: "2026-04-30T10:00:00Z", delivery_date: "2026-05-20" },
];

export const INVOICES: Invoice[] = [
  { id: "i1", invoice_number: "INV-44821", po_number: "PO-2026-0017", vendor_name: "Cloud9 Networks", total: 28900, issue_date: "2026-05-30", due_date: "2026-06-29", payment_status: "unpaid", match_status: "matched" },
  { id: "i2", invoice_number: "INV-44799", po_number: "PO-2026-0016", vendor_name: "NorthStar Office", total: 9650, issue_date: "2026-05-21", due_date: "2026-06-20", payment_status: "paid", match_status: "approved" },
  { id: "i3", invoice_number: "INV-44777", po_number: "PO-2026-0015", vendor_name: "GlobalSup Industries", total: 11240, issue_date: "2026-05-18", due_date: "2026-06-17", payment_status: "disputed", match_status: "discrepancy" },
  { id: "i4", invoice_number: "INV-44756", po_number: "PO-2026-0014", vendor_name: "TechPro Supplies", total: 18200, issue_date: "2026-05-15", due_date: "2026-06-14", payment_status: "paid", match_status: "approved" },
];

export const SPEND_BY_MONTH = [
  { month: "Jan", IT: 82000, Office: 24000, Datacenter: 38000 },
  { month: "Feb", IT: 64000, Office: 31000, Datacenter: 12000 },
  { month: "Mar", IT: 91000, Office: 18000, Datacenter: 44000 },
  { month: "Apr", IT: 73000, Office: 27000, Datacenter: 26000 },
  { month: "May", IT: 110000, Office: 33000, Datacenter: 38000 },
  { month: "Jun", IT: 88000, Office: 42000, Datacenter: 31000 },
];

export const RISK_ALERTS = [
  { id: "rk1", severity: "critical" as const, title: "Delivery delay on PO-2026-0018", body: "FastTech Corp is 3 days overdue. Auto-escalated to manager.", time: "2h ago" },
  { id: "rk2", severity: "high" as const, title: "Quote 31% above market", body: "GlobalSup quoted RFQ-0040 at $82k vs $62k category average.", time: "5h ago" },
  { id: "rk3", severity: "medium" as const, title: "First-time vendor on awarded RFQ", body: "NewVendor Inc has no delivery history — monitor closely.", time: "1d ago" },
];

export const AI_RECS = [
  { id: 1, icon: "star", text: "Award RFQ-2026-0042 to TechPro Supplies — best AI score 87.4." },
  { id: 2, icon: "alert", text: "Review GlobalSup trust score — dropped 12 pts this month." },
  { id: 3, icon: "dollar", text: "Renegotiate paper contract — usage is 18% below forecast." },
];

export const ACTIVITY = [
  { id: 1, who: "Sarah Chen", action: "published RFQ-2026-0042", time: "12 min ago" },
  { id: 2, who: "TechPro Supplies", action: "submitted quotation QT-2026-0142", time: "1 hr ago" },
  { id: 3, who: "Daniel Park", action: "approved PO-2026-0019", time: "3 hr ago" },
  { id: 4, who: "AI Copilot", action: "flagged GlobalSup overpriced quote", time: "5 hr ago" },
  { id: 5, who: "Lisa Wong", action: "marked PO-2026-0017 as invoiced", time: "yesterday" },
];
