# VendorBridge AI — Complete Hackathon Blueprint
**"Your AI Procurement Officer"**

---

# SECTION 1 — Executive Product Vision

## The Problem

Procurement is broken at most mid-market and enterprise companies. Teams juggle spreadsheets, email chains, PDF quotations, and manual approval workflows that generate delays, cost overruns, and audit nightmares.

Current challenges:
- RFQ creation takes 2–3 days of manual coordination
- Quotation comparison is a spreadsheet exercise prone to human error
- Vendor selection is opaque — driven by relationship bias, not data
- Approval bottlenecks cause 30–60 day PO cycles
- No real-time visibility into procurement spend or vendor risk
- Existing tools (SAP Ariba, Oracle) cost $200K+/year and require 6-month implementations

## Why VendorBridge AI Is Different

Every other procurement tool gives you a database. VendorBridge AI gives you an AI Procurement Officer that works 24/7.

The difference is intent. When a Procurement Manager asks "who should I buy 500 laptops from?", SAP Ariba shows you a list of vendors. VendorBridge AI analyzes your vendor history, current quotations, delivery performance, price trends, and risk signals — then tells you exactly who to pick and why, with confidence scores.

## Business Value

- Reduce RFQ-to-PO cycle time from 45 days → 7 days
- Cut procurement costs 12–18% through AI-driven vendor selection
- Eliminate approval bottlenecks with smart escalation
- Full audit trail for compliance
- Deploy in hours, not months

## Innovation Factor

1. AI Copilot with natural language procurement commands
2. Vendor Trust Score — dynamic scoring algorithm (0–100)
3. AI Quotation Analyzer — automatic best-value detection
4. Risk Detection Engine — real-time procurement risk alerts
5. Procurement Command Center — live operations dashboard
6. One-click RFQ-to-PO-to-Invoice pipeline

---

# SECTION 2 — Complete User Journey

## Primary Flow

```
PROCUREMENT OFFICER
        │
        ▼
┌─────────────────────┐
│   AI Copilot Prompt │  ← "Create RFQ for 100 laptops"
│   or Manual Form    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   RFQ Creation      │  ← Title, specs, deadline, budget, category
│   Auto-categorized  │     AI suggests relevant vendors automatically
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Vendor Invitation  │  ← System emails vendors (via Resend)
│  (Email + Portal)   │     Vendors get magic link to quotation portal
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Vendor Portal      │  ← Vendor logs in, submits quotation
│  Quotation Form     │     Price, delivery, terms, attachments
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  AI Quotation       │  ← Gemini 2.5 Flash analyzes all quotes
│  Analysis Engine    │     Best Price / Fastest / Best Value
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Approval Workflow  │  ← Manager reviews AI recommendation
│  (Single/Multi-tier)│     Approve / Reject / Request Changes
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Purchase Order     │  ← Auto-generated from approved quotation
│  Generation         │     PDF created, sent to vendor via email
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Invoice            │  ← Vendor submits invoice against PO
│  Processing         │     3-way match: PO ↔ Receipt ↔ Invoice
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Analytics &        │  ← Spend by category, vendor performance,
│  Reporting          │     AI insights, monthly procurement summary
└─────────────────────┘
```

## Vendor Journey (Parallel)

```
VENDOR
   │
   ▼
Receives email invitation
   │
   ▼
Clicks magic link → Vendor Portal
   │
   ▼
Reviews RFQ specifications
   │
   ▼
Submits Quotation (price, delivery date, terms)
   │
   ▼
Waits for decision notification
   │
   ▼
If won → Receives PO via email
   │
   ▼
Submits Invoice → Payment processed
```

---

# SECTION 3 — Database Architecture

## Complete Schema

### users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  role          TEXT NOT NULL CHECK (role IN ('admin','manager','officer','vendor')),
  department    TEXT,
  org_id        UUID REFERENCES organizations(id),
  is_active     BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### organizations
```sql
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  plan        TEXT DEFAULT 'starter',
  settings    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### vendors
```sql
CREATE TABLE vendors (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID REFERENCES organizations(id),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  address           TEXT,
  country           TEXT,
  category          TEXT[],
  contact_name      TEXT,
  tax_id            TEXT,
  payment_terms     TEXT,
  trust_score       DECIMAL(5,2) DEFAULT 50.00,
  is_approved       BOOLEAN DEFAULT FALSE,
  is_blacklisted    BOOLEAN DEFAULT FALSE,
  total_orders      INT DEFAULT 0,
  on_time_delivery  DECIMAL(5,2) DEFAULT 0,
  avg_response_days DECIMAL(5,2) DEFAULT 0,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### rfqs
```sql
CREATE TABLE rfqs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  rfq_number      TEXT UNIQUE NOT NULL,  -- RFQ-2025-0001
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL,
  items           JSONB NOT NULL,         -- [{name, qty, unit, specs}]
  budget          DECIMAL(15,2),
  currency        TEXT DEFAULT 'USD',
  submission_deadline TIMESTAMPTZ NOT NULL,
  delivery_date   DATE,
  delivery_address TEXT,
  status          TEXT DEFAULT 'draft' CHECK (status IN (
                    'draft','active','under_review','awarded','closed','cancelled')),
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  ai_summary      TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### rfq_vendors
```sql
CREATE TABLE rfq_vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id          UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id       UUID REFERENCES vendors(id),
  invited_at      TIMESTAMPTZ DEFAULT NOW(),
  invite_token    TEXT UNIQUE,
  email_sent      BOOLEAN DEFAULT FALSE,
  viewed_at       TIMESTAMPTZ,
  responded_at    TIMESTAMPTZ,
  status          TEXT DEFAULT 'invited' CHECK (status IN (
                    'invited','viewed','submitted','declined','awarded','rejected'))
);
```

### quotations
```sql
CREATE TABLE quotations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id            UUID REFERENCES rfqs(id),
  vendor_id         UUID REFERENCES vendors(id),
  rfq_vendor_id     UUID REFERENCES rfq_vendors(id),
  quote_number      TEXT UNIQUE NOT NULL,
  line_items        JSONB NOT NULL,        -- [{item_id, unit_price, qty, total}]
  total_amount      DECIMAL(15,2) NOT NULL,
  currency          TEXT DEFAULT 'USD',
  delivery_days     INT,
  delivery_date     DATE,
  validity_days     INT DEFAULT 30,
  payment_terms     TEXT,
  notes             TEXT,
  attachments       TEXT[],               -- Supabase Storage paths
  ai_score          DECIMAL(5,2),         -- AI overall score 0-100
  ai_analysis       JSONB,               -- {strengths, risks, recommendation}
  price_deviation   DECIMAL(5,2),         -- % vs market average
  status            TEXT DEFAULT 'submitted' CHECK (status IN (
                    'submitted','under_review','shortlisted','awarded','rejected')),
  submitted_at      TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at       TIMESTAMPTZ
);
```

### approvals
```sql
CREATE TABLE approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  entity_type     TEXT NOT NULL CHECK (entity_type IN ('rfq','quotation','purchase_order')),
  entity_id       UUID NOT NULL,
  step            INT DEFAULT 1,
  approver_id     UUID REFERENCES users(id),
  status          TEXT DEFAULT 'pending' CHECK (status IN (
                    'pending','approved','rejected','escalated','skipped')),
  comments        TEXT,
  approved_at     TIMESTAMPTZ,
  due_by          TIMESTAMPTZ,
  is_overdue      BOOLEAN GENERATED ALWAYS AS (due_by < NOW() AND status = 'pending') STORED,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### purchase_orders
```sql
CREATE TABLE purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  po_number       TEXT UNIQUE NOT NULL,   -- PO-2025-0001
  rfq_id          UUID REFERENCES rfqs(id),
  quotation_id    UUID REFERENCES quotations(id),
  vendor_id       UUID REFERENCES vendors(id),
  line_items      JSONB NOT NULL,
  subtotal        DECIMAL(15,2),
  tax_rate        DECIMAL(5,2) DEFAULT 0,
  tax_amount      DECIMAL(15,2),
  total_amount    DECIMAL(15,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  delivery_date   DATE,
  payment_terms   TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  notes           TEXT,
  status          TEXT DEFAULT 'issued' CHECK (status IN (
                    'draft','issued','acknowledged','in_progress',
                    'delivered','invoiced','completed','cancelled')),
  issued_at       TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  pdf_url         TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### invoices
```sql
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id),
  invoice_number  TEXT UNIQUE NOT NULL,
  po_id           UUID REFERENCES purchase_orders(id),
  vendor_id       UUID REFERENCES vendors(id),
  line_items      JSONB NOT NULL,
  subtotal        DECIMAL(15,2),
  tax_amount      DECIMAL(15,2),
  total_amount    DECIMAL(15,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  issue_date      DATE NOT NULL,
  due_date        DATE NOT NULL,
  payment_status  TEXT DEFAULT 'unpaid' CHECK (payment_status IN (
                    'unpaid','partial','paid','overdue','disputed')),
  match_status    TEXT DEFAULT 'pending' CHECK (match_status IN (
                    'pending','matched','discrepancy','approved')),
  match_details   JSONB,                  -- 3-way match results
  pdf_url         TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### notifications
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT,
  data        JSONB,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### activities
```sql
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id),
  user_id     UUID REFERENCES users(id),
  entity_type TEXT,
  entity_id   UUID,
  action      TEXT NOT NULL,
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### vendor_analytics
```sql
CREATE TABLE vendor_analytics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id           UUID REFERENCES vendors(id) UNIQUE,
  total_rfqs          INT DEFAULT 0,
  total_quotes        INT DEFAULT 0,
  quote_win_rate      DECIMAL(5,2) DEFAULT 0,
  avg_quote_days      DECIMAL(5,2) DEFAULT 0,
  avg_delivery_days   DECIMAL(5,2) DEFAULT 0,
  on_time_rate        DECIMAL(5,2) DEFAULT 0,
  avg_price_deviation DECIMAL(5,2) DEFAULT 0,
  dispute_rate        DECIMAL(5,2) DEFAULT 0,
  trust_score         DECIMAL(5,2) DEFAULT 50,
  last_computed_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

# SECTION 4 — Role-Based Access Design

## Role Matrix

| Feature | Admin | Manager | Officer | Vendor |
|---------|-------|---------|---------|--------|
| View all RFQs | ✅ | ✅ | Own dept | Own |
| Create RFQ | ✅ | ✅ | ✅ | ❌ |
| Delete RFQ | ✅ | ❌ | ❌ | ❌ |
| Invite vendors | ✅ | ✅ | ✅ | ❌ |
| View quotations | ✅ | ✅ | ✅ | Own |
| Submit quotation | ❌ | ❌ | ❌ | ✅ |
| Approve/reject | ✅ | ✅ | ❌ | ❌ |
| Generate PO | ✅ | ✅ | ❌ | ❌ |
| Submit invoice | ❌ | ❌ | ❌ | ✅ |
| View analytics | ✅ | ✅ | Limited | Own |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| AI Copilot | ✅ | ✅ | ✅ | ❌ |
| Vendor scores | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

## Role-Specific Dashboard Views

**Admin:**
Full org-wide command center. All metrics, all vendors, all RFQs, user management, billing.

**Manager:**
Approval queue (primary focus), spend analytics by department, team performance, AI recommendations, risk alerts.

**Procurement Officer:**
My RFQs, active quotations, vendor search, AI Copilot for creating RFQs and comparing quotes.

**Vendor:**
My submitted quotations, active RFQ invitations, PO tracker, invoice submission portal.

---

# SECTION 5 — AI Procurement Copilot

## Design

The Copilot is a persistent chat panel (right sidebar or modal overlay) powered by Gemini 2.5 Flash.

It has full access to the user's org data through a structured system prompt injection.

## System Prompt Architecture

```
You are VendorBridge AI, the procurement intelligence officer for {org_name}.

Current user: {user_name} ({role})
Today: {date}
Organization context:
- Active RFQs: {count}
- Pending approvals: {count}
- Open POs: {count}

Database context (live):
{relevant_db_summary_json}

You can perform these actions by responding with structured JSON:
- create_rfq: Create a new RFQ
- search_vendors: Find matching vendors
- compare_quotes: Analyze quotations
- generate_report: Produce spending report
- get_status: Check entity status
- send_alert: Flag risk to manager

Always respond conversationally, then include action JSON if an action is needed.
```

## Sample Prompt → Response Flows

**Prompt:** "Create RFQ for 100 laptops, budget $80,000, needed in 3 weeks"

**Flow:**
1. Gemini parses intent → `create_rfq` action
2. Extracts: item=laptops, qty=100, budget=80000, deadline=+21days
3. Returns structured JSON + confirmation message
4. Frontend opens pre-filled RFQ form
5. User reviews and publishes

**Prompt:** "Who offers the best quote for RFQ-2025-0042?"

**Flow:**
1. Backend fetches all quotations for RFQ-0042
2. Passes to Gemini with vendor trust scores
3. Gemini returns ranked analysis with reasoning
4. Frontend renders comparison card

**Prompt:** "Show delayed vendors this month"

**Flow:**
1. Query vendor_analytics for on_time_rate < 80%
2. Pass vendor list + delivery data to Gemini
3. Returns narrative summary + risk flags

**Prompt:** "Generate monthly spending report for June"

**Flow:**
1. Aggregate POs + invoices for June
2. Gemini writes natural-language executive summary
3. Frontend renders with charts

## UX Design

- Floating chat button (bottom-right) on all internal pages
- Opens as a slide-in panel (480px wide)
- Message history persists in session
- Quick-action chips below input: "Create RFQ", "Compare Quotes", "Check Status"
- Loading state shows "Analyzing your procurement data..."
- Actions render as interactive cards inside the chat

---

# SECTION 6 — AI Vendor Recommendation Engine

## Vendor Trust Score Algorithm

The Trust Score (0–100) is a weighted composite of five signals:

```
Trust Score = (
  (Price Competitiveness × 0.25) +
  (Delivery Performance × 0.30) +
  (Response Speed × 0.15) +
  (Quote Win Rate × 0.15) +
  (Dispute-Free Rate × 0.15)
)
```

### Signal Definitions

**Price Competitiveness (0–100)**
Measures how a vendor's historical pricing compares to market average per category.
- Score 100 = consistently 10%+ below market average
- Score 50 = at market average
- Score 0 = consistently 20%+ above market average

Formula: `100 - clamp((avg_price_deviation + 20) × 2.5, 0, 100)`

**Delivery Performance (0–100)**
On-time delivery percentage across all completed POs.
`on_time_rate × 100`

**Response Speed (0–100)**
How quickly the vendor responds to RFQ invitations.
- ≤1 day = 100
- 2 days = 85
- 3 days = 70
- 5 days = 50
- 7+ days = 20
- No response = 0

Formula: `max(0, 100 - (avg_response_days × 12))`

**Quote Win Rate (0–100)**
Percentage of submitted quotes that won contracts.
This signals quote quality and market competitiveness.
`(total_won / total_submitted) × 100`

**Dispute-Free Rate (0–100)**
Percentage of invoices and deliveries without disputes.
`(1 - dispute_rate) × 100`

### Trust Score Tiers

| Score | Label | Color | Badge |
|-------|-------|-------|-------|
| 85–100 | Elite Vendor | Teal | ⭐ Elite |
| 70–84 | Trusted | Green | ✓ Trusted |
| 55–69 | Good Standing | Blue | Good |
| 40–54 | Average | Amber | Average |
| 25–39 | Needs Review | Orange | ⚠ Review |
| 0–24 | High Risk | Red | 🚨 Risk |

### Score Update Trigger

Trust Score recomputes automatically:
- After every PO completion
- After every invoice resolution
- After every quotation outcome
- Nightly batch update for all vendors

---

# SECTION 7 — AI Quotation Analyzer

## Module Design

After all quotations are submitted (or deadline passes), the AI Quotation Analyzer automatically runs.

### Inputs to Gemini

```json
{
  "rfq": {
    "title": "100 Dell Laptops - Core i7",
    "budget": 80000,
    "deadline": "2025-07-15",
    "items": [{"name": "Laptop", "qty": 100, "specs": "Core i7, 16GB RAM, 512GB SSD"}]
  },
  "quotations": [
    {
      "vendor": "TechPro Supplies",
      "trust_score": 82,
      "total": 76500,
      "unit_price": 765,
      "delivery_days": 14,
      "payment_terms": "Net 30",
      "on_time_history": 0.91,
      "attachments": true
    },
    ...
  ]
}
```

### AI Output Structure

```json
{
  "best_price": {
    "vendor_id": "uuid",
    "vendor_name": "TechPro Supplies",
    "total": 76500,
    "savings_vs_budget": 3500,
    "reasoning": "Lowest unit price at $765, within budget, complete specs match"
  },
  "fastest_delivery": {
    "vendor_id": "uuid",
    "vendor_name": "FastTech Corp",
    "delivery_days": 10,
    "reasoning": "10-day delivery vs category average of 18 days"
  },
  "best_overall": {
    "vendor_id": "uuid",
    "vendor_name": "TechPro Supplies",
    "score": 87.4,
    "reasoning": "Best balance of price ($765/unit), strong trust score (82), reliable delivery (91% on-time), complete documentation"
  },
  "risk_flags": [
    {
      "vendor_id": "uuid",
      "flag": "First-time vendor, no delivery history",
      "severity": "medium"
    }
  ],
  "market_context": "Average laptop procurement in this spec range: $790–$840/unit. All quotes are within reasonable range.",
  "recommendation": "Award to TechPro Supplies. Best overall value with proven track record."
}
```

### Comparison UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  AI QUOTATION ANALYSIS — RFQ-2025-0042                       │
│  3 quotations received  •  Analyzed by Gemini 2.5 Flash      │
├──────────────┬──────────────────┬───────────────────────────┤
│ 🏆 BEST PRICE│ ⚡ FASTEST DELIVERY│ ⭐ BEST OVERALL VALUE     │
│ TechPro      │ FastTech Corp    │ TechPro Supplies          │
│ $76,500      │ 10 days          │ Score: 87.4/100           │
│ $3,500 saved │ vs 18d avg       │ Recommended ✓             │
├──────────────┴──────────────────┴───────────────────────────┤
│  Vendor Comparison Table                                     │
│  ┌────────────┬────────┬──────────┬──────────┬──────────┐   │
│  │ Vendor     │ Total  │ Delivery │ Trust    │ AI Score │   │
│  ├────────────┼────────┼──────────┼──────────┼──────────┤   │
│  │ TechPro    │$76,500 │ 14 days  │ 82 ✓     │ 87.4 ⭐  │   │
│  │ FastTech   │$79,200 │ 10 days  │ 71 ✓     │ 79.1     │   │
│  │ GlobalSup  │$82,000 │ 21 days  │ 45 ⚠     │ 58.3     │   │
│  └────────────┴────────┴──────────┴──────────┴──────────┘   │
│                                                              │
│  [Award to TechPro Supplies →]  [View Full Analysis]        │
└──────────────────────────────────────────────────────────────┘
```

---

# SECTION 8 — AI Risk Detection Engine

## Risk Signals Monitored

### 1. Price Spike Detection
- Trigger: Quotation is 25%+ above category historical average
- Severity: High
- Action: Flag quotation, alert procurement officer

### 2. Overpriced Quotation
- Trigger: All quotations exceed budget by 15%+
- Severity: High
- Action: Alert manager, suggest budget revision or re-RFQ

### 3. Vendor Reliability Risk
- Trigger: Trust Score drops below 35 for awarded vendor
- Severity: Critical
- Action: Alert, recommend alternate vendor

### 4. Approval Bottleneck
- Trigger: Approval pending > 48 hours (medium) or > 5 days (high)
- Severity: Medium → High
- Action: Escalate notification to next approver

### 5. Single-Vendor Dependency
- Trigger: >60% of org spend going to one vendor
- Severity: Medium
- Action: Monthly alert to procurement manager

### 6. RFQ Deadline Miss
- Trigger: <24 hours to deadline with 0 quotations received
- Severity: High
- Action: Auto-extend deadline or alert + re-invite vendors

### 7. Invoice Mismatch (3-Way Match Fail)
- Trigger: Invoice amount differs from PO by >2%
- Severity: High
- Action: Flag for manual review, block auto-payment

## Risk Dashboard Cards

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 🚨 ACTIVE RISKS  │ │ ⚠ WATCH LIST     │ │ ✓ RESOLVED TODAY │
│     4            │ │     7            │ │     12           │
│ 2 Critical       │ │ 5 Overdue Apprvls│ │ 8 Price flags    │
│ 2 High           │ │ 2 Low-trust POs  │ │ 4 Invoice issues │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Risk Scoring Formula

```
Overall Procurement Risk Index (0–100):
= (Critical × 25 + High × 15 + Medium × 8 + Low × 3) / Max_Possible × 100
```

Score interpretation:
- 0–20: Low Risk (Green)
- 21–40: Moderate Risk (Amber)
- 41–60: Elevated Risk (Orange)
- 61–100: High Risk (Red)

---

# SECTION 9 — Procurement Command Center

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  VendorBridge AI     [Search...]          🔔 3   @User ▾                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Good morning, Sarah.  You have 3 approvals pending and 2 risk alerts.  [→ AI] │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ ACTIVE RFQs │  │  PENDING    │  │  MONTH SPEND│  │  RISK SCORE │           │
│  │     12      │  │  APPROVALS  │  │   $248,400  │  │  24 / Low   │           │
│  │ +3 this wk  │  │      3      │  │  ▲ 12% MoM  │  │  ● Green    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                  │
│  ┌────────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │  LIVE RFQ TRACKER                      │  │  PENDING APPROVALS             │ │
│  │  ─────────────────────                 │  │  ─────────────────────         │ │
│  │  RFQ-0042  Laptops ×100   ▓▓▓▓▓░░ 4Q  │  │  PO-0021  $76,500  2 days ago │ │
│  │  RFQ-0041  Office Chairs  ▓▓▓▓▓▓░ 6Q  │  │  RFQ-0039  $12,000  5 hrs ago │ │
│  │  RFQ-0040  Server Racks   ▓▓░░░░░ 2Q  │  │  PO-0019  $4,200   1 day ago  │ │
│  │  RFQ-0039  Printer Paper  ▓▓▓▓▓▓▓ ✓   │  │                               │ │
│  └────────────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                                  │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │  SPEND ANALYTICS (6 months)         │  │  AI RECOMMENDATIONS              │  │
│  │  [Bar chart by category]            │  │  ─────────────────────────────── │  │
│  │                                     │  │  ⭐ Award RFQ-0042 to TechPro    │  │
│  │                                     │  │  ⚠ Review GlobalSup trust score  │  │
│  │                                     │  │  💰 Renegotiate paper contract   │  │
│  └─────────────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │  VENDOR RISK ALERTS                                                          │ │
│  │  🚨 FastTech Corp — Delivery delayed on PO-0018 (3 days overdue)           │ │
│  │  ⚠  NewVendor Inc — First order, no delivery history. Monitor closely.     │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Widget Descriptions

**Active RFQs Card** — Count of RFQs in active/under_review status. Trend vs last week.

**Pending Approvals Card** — Count of approvals awaiting action by current user. Red badge if any overdue.

**Month Spend Card** — Sum of all POs issued this month. Month-over-month trend arrow.

**Risk Score Card** — Current procurement risk index (0–100) with color coding.

**Live RFQ Tracker** — Real-time table showing active RFQs with quotation count progress bar and status.

**Pending Approvals List** — Sorted by urgency, with amount and time pending. One-click approve/review.

**Spend Analytics Chart** — 6-month bar chart by category (IT, Facilities, Operations, etc.)

**AI Recommendations Panel** — Top 3 AI-generated actions the user should take today.

**Vendor Risk Alerts Feed** — Live stream of risk events, most critical first.

---

# SECTION 10 — UI/UX Design System

## Color Palette

**Primary:** Indigo `#4F46E5` — Buttons, active states, links
**Background:** `#FAFAFA` (page), `#FFFFFF` (cards), `#F4F4F5` (sidebar)
**Text:** `#111827` (primary), `#6B7280` (secondary), `#9CA3AF` (muted)
**Success:** `#10B981`  **Warning:** `#F59E0B`  **Danger:** `#EF4444`  **Info:** `#3B82F6`

**Dark mode equivalents auto-switched via Tailwind `dark:` prefix**

## Typography

**Display/Headings:** `Geist` (Next.js native) — Clean, modern, technical
**Body/UI:** `Inter` — Proven enterprise legibility
**Monospace (PO numbers, IDs):** `JetBrains Mono` — Distinctive, scannable

## Card Design

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.card:hover {
  border-color: #C7D2FE;
  box-shadow: 0 4px 12px rgba(79,70,229,0.08);
}
```

## Sidebar Design

```
Width: 240px (collapsed: 64px)
Background: #0F172A (dark sidebar — premium feel)
Text: #94A3B8 (inactive), #FFFFFF (active)
Active item: Indigo left border + light indigo bg

Nav sections:
- Overview
  Dashboard | Activity
- Procurement
  RFQs | Quotations | Approvals
- Operations
  Purchase Orders | Invoices
- Intelligence
  AI Copilot | Analytics | Reports
- Admin
  Vendors | Users | Settings
```

## Status Badge System

```
Draft:      Gray bg   #F3F4F6  /  text #374151
Active:     Blue bg   #EFF6FF  /  text #1D4ED8
Pending:    Amber bg  #FFFBEB  /  text #92400E
Approved:   Green bg  #ECFDF5  /  text #065F46
Rejected:   Red bg   #FEF2F2  /  text #991B1B
Awarded:    Indigo bg #EEF2FF  /  text #3730A3
```

## Table Design

```
- Zebra rows: alternating #FFFFFF / #F9FAFB
- Header: 12px uppercase, letter-spacing 0.05em, color #6B7280
- Row height: 52px
- Hover: #F5F3FF (light indigo tint)
- Sticky header on scroll
- Column sorting with animated caret
- Bulk select with floating action bar
```

---

# SECTION 11 — Screen-by-Screen Design

## Screen 1: Login

**Purpose:** Authentication entry point

**Layout:**
Split screen — Left: branding panel (dark), Right: login form

**Left Panel:**
- VendorBridge AI logo (white)
- Tagline: "Your AI Procurement Officer"
- Animated: rotating procurement stats ("$2.4M saved this month", "847 RFQs processed")
- 3 feature pills: "AI Analysis", "Instant POs", "Smart Approvals"

**Right Panel:**
- "Sign in to VendorBridge AI"
- Email + Password fields
- SSO button (Google)
- "Forgot password" link
- Demo credentials for judges

**Actions:** Login, Google SSO, Demo access

---

## Screen 2: Dashboard (Command Center)

**Purpose:** Central operations overview

**Layout:** Top metrics → Middle dual-column → Bottom full-width

**Components:**
- Welcome banner with AI-generated daily briefing
- 4 KPI cards (Active RFQs, Pending Approvals, Month Spend, Risk Score)
- Live RFQ Tracker table
- Pending Approvals queue
- Spend Analytics chart (Recharts BarChart)
- AI Recommendations panel
- Vendor Risk Alerts feed
- Procurement Timeline (recent activity)

**Actions:** Quick-create RFQ, Approve, View RFQ, Launch AI Copilot

---

## Screen 3: Vendor Management

**Purpose:** Complete vendor registry and performance

**Layout:** Search + filter bar → Vendor grid/list toggle

**Components:**
- Search bar with category filter
- Trust Score filter (Elite / Trusted / Average / Risk)
- Vendor cards showing: name, category, trust score gauge, last order date
- Vendor detail slide-over:
  - Trust Score breakdown (radar chart)
  - Order history
  - Quotation win rate
  - Risk flags
  - Contact info
  - Edit/Blacklist actions

**Actions:** Add vendor, Invite to RFQ, View history, Edit, Blacklist

---

## Screen 4: RFQ Creation

**Purpose:** Create and publish Request for Quotation

**Layout:** Multi-step form (3 steps)

**Step 1 — Details:**
- Title, Category (dropdown), Priority
- Description (rich text)
- Budget (optional — AI hides from vendors)
- Submission Deadline, Expected Delivery Date
- AI suggestion bar: "Based on your specs, budget should be ~$75,000–$90,000"

**Step 2 — Items:**
- Line item builder (name, quantity, unit, specifications)
- Add/remove rows
- Import from CSV option

**Step 3 — Vendor Invitation:**
- AI-recommended vendors (top 5 by category + trust score)
- Search to add more
- Preview invitation email
- Publish button

**Actions:** Save draft, Publish, Preview, Cancel

---

## Screen 5: Quotation Submission (Vendor Portal)

**Purpose:** Vendor-facing form to submit quotation

**Layout:** Clean single-column form

**Components:**
- RFQ summary (read-only): title, items, deadline
- Line item pricing table (vendor fills in unit prices)
- Delivery date picker
- Payment terms dropdown
- Notes textarea
- File upload (Supabase Storage)
- Preview and Submit

**Actions:** Save draft, Submit quotation

---

## Screen 6: Quotation Comparison

**Purpose:** AI-powered comparison of all received quotations

**Layout:** Top AI verdict → Comparison table → Detail panels

**Components:**
- 3 AI Winner Cards: Best Price, Fastest Delivery, Best Overall
- Vendor comparison table (sortable by any column)
- AI Analysis accordion: reasoning for each vendor
- Risk flags section
- Market context panel
- "Award to [Vendor]" CTA button

**Actions:** Award to vendor, Request revision, Reject quotation

---

## Screen 7: Approval Workflow

**Purpose:** Review and approve/reject procurement entities

**Layout:** Queue view + Detail panel

**Components:**
- Approval queue (pending items sorted by urgency)
- Filter: By type (RFQ/PO/Invoice), By urgency
- Detail panel (right side):
  - Entity summary
  - AI recommendation
  - Quotation comparison summary
  - Comment field
  - Approve / Reject / Escalate buttons
  - Approval history trail

**Actions:** Approve, Reject with comment, Escalate, View full details

---

## Screen 8: Purchase Orders

**Purpose:** Manage all issued purchase orders

**Layout:** Filterable table + Detail view

**Components:**
- PO table: PO number, vendor, amount, status, delivery date
- Status filter: Issued / In Progress / Delivered / Invoiced
- PO detail modal:
  - Full PO PDF preview
  - Line items
  - Vendor info
  - Status timeline
  - Send via email button
- Generate PO from approved quotation (one click)

**Actions:** Generate PO, Send email, Download PDF, Mark delivered

---

## Screen 9: Invoices

**Purpose:** Invoice management and 3-way match

**Layout:** Table + Detail + Match status

**Components:**
- Invoice table: number, vendor, PO reference, amount, status
- 3-Way Match Indicator: PO ✓ / Receipt ✓ / Invoice ✓
- Invoice detail:
  - Invoice PDF preview
  - Match status with discrepancy highlights
  - Approve for payment / Dispute buttons
- AI flag for discrepancies

**Actions:** Approve payment, Dispute, Download PDF, Send reminder

---

## Screen 10: Reports & Analytics

**Purpose:** Procurement intelligence and reporting

**Layout:** Date range selector → 4-tab report views

**Tabs:**
1. **Spend Overview** — Spend by category (donut), monthly trend (line), top vendors by spend
2. **Vendor Performance** — Trust score distribution, on-time rates, response time rankings
3. **Procurement Efficiency** — RFQ-to-PO cycle time, approval turnaround, cost savings vs budget
4. **AI Insights** — Gemini-generated executive summary with bullet recommendations

**Actions:** Export PDF, Export CSV, Share report, Set date range

---

## Screen 11: Settings

**Purpose:** Org configuration

**Sections:**
- Organization profile
- User management + role assignment
- Approval workflow builder (define approval chains by amount threshold)
- Email templates (RFQ invitation, PO, invoice)
- Notification preferences
- API keys
- Billing

---

# SECTION 12 — Hackathon Demo Flow (5 Minutes)

## Demo Script

### Minute 0:00–0:30 — Hook (The Problem)
> "Every procurement team is drowning in spreadsheets, email chains, and missed deadlines. We built VendorBridge AI — your AI Procurement Officer."

Show: Login screen, then Dashboard. Point out the AI briefing banner at the top.

### Minute 0:30–1:30 — AI Creates an RFQ
> "Instead of filling out a form, I'll just talk to the AI."

Open AI Copilot. Type: *"Create RFQ for 200 office chairs, budget $40,000, needed in 4 weeks."*

Watch the RFQ form auto-fill. AI recommends 5 vendors based on category and trust score.

Hit Publish. Vendor invitation emails go out instantly (show Resend integration).

### Minute 1:30–2:30 — Vendor Submits Quotation
> "Meanwhile, the vendor receives this email..."

Switch to vendor portal (second browser tab). Show the clean quotation form. Fill in prices and delivery date. Submit.

Back on main dashboard — the quotation appears in real-time.

### Minute 2:30–3:15 — AI Analyzes Quotations
> "This is where it gets powerful."

Open RFQ detail → Quotation Comparison tab.

Show the three AI winner cards: Best Price, Fastest Delivery, Best Overall Value.

Point to the AI reasoning: "Gemini analyzed pricing, vendor history, trust scores, and risk — and recommends awarding to TechPro Supplies."

### Minute 3:15–3:45 — One-Click Approval → PO Generated
> "The manager approves with one click."

Open Approval queue. Show the pending approval with AI recommendation. Click Approve.

Watch PO auto-generate: PO-2025-0043, complete with line items, terms, and PDF.

Show the email sent to vendor via Resend.

### Minute 3:45–4:30 — Invoice + 3-Way Match
> "Vendor submits invoice. AI checks it automatically."

Show invoice being submitted. AI runs 3-way match (PO ↔ Receipt ↔ Invoice). Green checkmarks. Auto-approved.

### Minute 4:30–5:00 — AI Insights Close
> "Last thing — ask the AI anything."

Type in Copilot: *"How much did we spend on office furniture this quarter?"*

AI returns: "Q2 office furniture spend: $87,400 across 4 vendors. Top vendor: TechPro Supplies (52%). Recommendation: consolidate to reduce shipping costs."

> "That's VendorBridge AI. Procurement that works at the speed of thought."

---

# SECTION 13 — Folder Structure

```
vendorbridge-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Sidebar + topbar layout
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── vendors/
│   │   │   ├── page.tsx             # Vendor list
│   │   │   └── [id]/page.tsx        # Vendor detail
│   │   ├── rfqs/
│   │   │   ├── page.tsx             # RFQ list
│   │   │   ├── create/page.tsx      # Multi-step RFQ form
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # RFQ detail
│   │   │       └── quotations/page.tsx  # Quotation comparison
│   │   ├── quotations/
│   │   │   └── page.tsx
│   │   ├── approvals/
│   │   │   └── page.tsx
│   │   ├── purchase-orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── vendor-portal/
│   │   └── rfq/[token]/
│   │       └── page.tsx             # Public vendor quotation form
│   ├── api/
│   │   ├── ai/
│   │   │   ├── copilot/route.ts     # AI copilot endpoint
│   │   │   ├── analyze-quotes/route.ts
│   │   │   └── vendor-score/route.ts
│   │   ├── vendors/route.ts
│   │   ├── rfqs/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── quotations/route.ts
│   │   ├── approvals/route.ts
│   │   ├── purchase-orders/
│   │   │   ├── route.ts
│   │   │   └── generate-pdf/route.ts
│   │   ├── invoices/route.ts
│   │   ├── analytics/route.ts
│   │   └── notifications/route.ts
│   └── layout.tsx                   # Root layout
│
├── components/
│   ├── ui/                          # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── PageHeader.tsx
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── RFQTracker.tsx
│   │   ├── ApprovalQueue.tsx
│   │   ├── SpendChart.tsx
│   │   ├── AIRecommendations.tsx
│   │   └── RiskAlertsFeed.tsx
│   ├── vendors/
│   │   ├── VendorCard.tsx
│   │   ├── VendorDetail.tsx
│   │   └── TrustScoreGauge.tsx
│   ├── rfqs/
│   │   ├── RFQForm/
│   │   │   ├── Step1Details.tsx
│   │   │   ├── Step2Items.tsx
│   │   │   └── Step3Vendors.tsx
│   │   └── RFQStatusBadge.tsx
│   ├── quotations/
│   │   ├── QuotationCompare.tsx
│   │   ├── AIWinnerCard.tsx
│   │   └── VendorCompareTable.tsx
│   ├── ai/
│   │   ├── CopilotPanel.tsx
│   │   ├── CopilotMessage.tsx
│   │   └── CopilotActions.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── ConfirmDialog.tsx
│
├── features/
│   ├── ai/
│   │   ├── copilot.ts               # Copilot logic + intent parsing
│   │   ├── quotation-analyzer.ts    # Quotation analysis pipeline
│   │   ├── vendor-scorer.ts         # Trust score computation
│   │   └── risk-detector.ts         # Risk engine
│   ├── procurement/
│   │   ├── rfq.ts
│   │   ├── quotation.ts
│   │   ├── approval.ts
│   │   └── purchase-order.ts
│   └── notifications/
│       └── notifier.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser client
│   │   ├── server.ts                # Server client
│   │   └── admin.ts                 # Admin client (service role)
│   ├── gemini.ts                    # Gemini 2.5 Flash client
│   ├── resend.ts                    # Email client
│   └── pdf.ts                       # PO/invoice PDF generation
│
├── hooks/
│   ├── useRFQs.ts
│   ├── useVendors.ts
│   ├── useApprovals.ts
│   ├── useRealtime.ts               # Supabase realtime subscriptions
│   └── useAICopilot.ts
│
├── services/
│   ├── rfq.service.ts
│   ├── vendor.service.ts
│   ├── quotation.service.ts
│   ├── approval.service.ts
│   ├── po.service.ts
│   └── invoice.service.ts
│
├── types/
│   ├── database.types.ts            # Supabase auto-generated types
│   ├── rfq.types.ts
│   ├── vendor.types.ts
│   ├── quotation.types.ts
│   └── ai.types.ts
│
├── utils/
│   ├── formatters.ts                # Currency, date formatters
│   ├── generators.ts                # PO number, RFQ number generators
│   ├── validators.ts
│   └── constants.ts
│
├── middleware.ts                    # Auth middleware
├── next.config.ts
├── tailwind.config.ts
├── components.json                  # Shadcn config
└── package.json
```

---

# SECTION 14 — API Architecture

## Authentication APIs

### POST /api/auth/login
```json
// Request
{ "email": "user@org.com", "password": "***" }

// Response
{ "user": { "id": "uuid", "role": "manager", "name": "Sarah" }, "session": { "access_token": "...", "expires_at": 1234567890 } }
```

## Vendor APIs

### GET /api/vendors
```
Query: ?category=IT&trust_min=60&search=tech&page=1&limit=20
Response: { vendors: [...], total: 45, page: 1 }
```

### POST /api/vendors
```json
// Request
{ "name": "TechPro Supplies", "email": "sales@techpro.com", "category": ["IT", "Electronics"], "contact_name": "John Smith" }

// Response
{ "vendor": { "id": "uuid", "trust_score": 50.00, ...fields } }
```

### GET /api/vendors/{id}/analytics
```json
// Response
{ "trust_score": 82.4, "breakdown": { "price_competitiveness": 85, "delivery_performance": 91, "response_speed": 80, "win_rate": 75, "dispute_free_rate": 94 }, "history": { "total_orders": 24, "total_spend": 284500, "avg_delivery_days": 12.4 } }
```

## RFQ APIs

### POST /api/rfqs
```json
// Request
{ "title": "100 Dell Laptops - Core i7", "category": "IT Equipment", "items": [{ "name": "Dell Laptop", "qty": 100, "unit": "units", "specs": "Core i7, 16GB, 512GB SSD" }], "budget": 80000, "submission_deadline": "2025-07-10T23:59:00Z", "delivery_date": "2025-07-25", "vendor_ids": ["uuid1", "uuid2", "uuid3"] }

// Response
{ "rfq": { "id": "uuid", "rfq_number": "RFQ-2025-0042", "status": "active" }, "invitations_sent": 3 }
```

### GET /api/rfqs/{id}/quotations
```json
// Response
{ "rfq": { "id": "uuid", "title": "...", "status": "under_review" }, "quotations": [...], "ai_analysis": { "best_price": {...}, "fastest_delivery": {...}, "best_overall": {...}, "risk_flags": [...] }, "analyzed_at": "2025-07-05T14:23:00Z" }
```

## Quotation APIs

### POST /api/quotations (Vendor portal — public with token)
```json
// Request (authenticated by rfq_vendor invite_token)
{ "rfq_vendor_token": "abc123", "line_items": [{ "item_name": "Dell Laptop", "unit_price": 765, "qty": 100, "total": 76500 }], "total_amount": 76500, "delivery_days": 14, "payment_terms": "Net 30", "notes": "Includes 2-year warranty" }
```

## Approval APIs

### POST /api/approvals/{id}/decide
```json
// Request
{ "action": "approve", "comments": "Best value for budget. AI recommendation confirmed." }

// Response
{ "approval": { "status": "approved", "approved_at": "..." }, "next_step": null, "po_generated": { "po_number": "PO-2025-0043" } }
```

## Purchase Order APIs

### POST /api/purchase-orders/generate
```json
// Request
{ "quotation_id": "uuid" }

// Response
{ "purchase_order": { "id": "uuid", "po_number": "PO-2025-0043", "pdf_url": "..." }, "email_sent": true }
```

## Invoice APIs

### POST /api/invoices/{id}/match
```json
// Response
{ "match_status": "matched", "match_details": { "po_total": 76500, "invoice_total": 76500, "variance": 0, "variance_pct": 0, "items_matched": true }, "auto_approved": true }
```

## AI APIs

### POST /api/ai/copilot
```json
// Request
{ "message": "Create RFQ for 100 laptops, budget $80,000", "context": { "user_id": "uuid", "org_id": "uuid" }, "history": [...previous_messages] }

// Response
{ "message": "I'll create that RFQ for you. Here's what I've prepared:", "action": { "type": "create_rfq", "data": { "title": "100 Laptops", "budget": 80000, "category": "IT Equipment" } }, "suggestions": ["Add delivery deadline", "Specify brand preference"] }
```

### POST /api/ai/analyze-quotes
```json
// Request
{ "rfq_id": "uuid" }

// Response
{ "analysis": { "best_price": {...}, "fastest_delivery": {...}, "best_overall": {...}, "risk_flags": [...], "market_context": "...", "recommendation": "..." }, "processing_time_ms": 1240 }
```

### GET /api/analytics/dashboard
```json
// Response
{ "kpis": { "active_rfqs": 12, "pending_approvals": 3, "month_spend": 248400, "risk_score": 24 }, "spend_by_category": [...], "vendor_performance": [...], "recent_activity": [...] }
```

---

# SECTION 15 — Implementation Roadmap

## Team Roles

- **Member 1 (Frontend A):** Dashboard, Vendor Management, Navigation/Layout
- **Member 2 (Frontend B):** RFQ Creation, Quotation Comparison, Approval screens, PO/Invoice views
- **Member 3 (Backend):** Supabase schema, all API routes, auth, email (Resend), PDF generation
- **Member 4 (AI + Integration):** Gemini integration, AI Copilot, Quotation Analyzer, Trust Score engine, Risk Detector, End-to-end wiring

---

## Hour-by-Hour Execution Plan

### Hour 1 (0:00–1:00) — Foundation

**All members simultaneously:**
- Set up Next.js 15 + TypeScript + Tailwind + Shadcn
- Configure Supabase project (auth + database)
- Run all `CREATE TABLE` scripts
- Set up environment variables
- Push base repo to GitHub, all members clone

**Member 3 specifically:**
- Set up Supabase RLS policies (row-level security)
- Create Supabase auth configuration
- Deploy base schema + seed demo data

---

### Hour 2 (1:00–2:00) — Core Architecture

**Member 1:**
- Build Sidebar component (dark, 240px)
- Build TopBar component
- Build dashboard layout wrapper
- Build 4 MetricCard components (skeleton-ready)

**Member 2:**
- Scaffold all page routes under `(dashboard)/`
- Build StatusBadge, EmptyState, LoadingSpinner shared components
- Build RFQ list page (table structure)

**Member 3:**
- Build `/api/vendors` CRUD
- Build `/api/rfqs` CRUD
- Build `/api/quotations` CRUD
- Connect Resend email client
- Build invite token system for vendor portal

**Member 4:**
- Set up Gemini 2.5 Flash client (`lib/gemini.ts`)
- Build base prompt templates
- Set up `/api/ai/copilot` route skeleton
- Research Gemini structured output (JSON mode)

---

### Hour 3 (2:00–3:00) — Feature Buildout Begins

**Member 1:**
- Build SpendChart (Recharts BarChart, 6-month spend)
- Build RFQTracker component (live list with progress bars)
- Build ApprovalQueue widget
- Build RiskAlertsFeed component
- Wire dashboard to `/api/analytics/dashboard`

**Member 2:**
- Build multi-step RFQ Creation form (3 steps)
- Step 1: Details form (title, category, budget, deadline)
- Step 2: Line items builder (dynamic add/remove rows)
- Step 3: Vendor invitation selector

**Member 3:**
- Build `/api/approvals` routes (list, decide)
- Build `/api/purchase-orders` (generate, list, get)
- Build `/api/invoices` (list, submit, match)
- Build number generators (RFQ-2025-XXXX, PO-2025-XXXX)

**Member 4:**
- Build Trust Score calculator (`features/ai/vendor-scorer.ts`)
- Implement all 5 signal formulas
- Build nightly recompute function
- Build `/api/vendors/{id}/analytics` endpoint

---

### Hour 4 (3:00–4:00) — AI Core + Vendor Portal

**Member 1:**
- Build Vendor Management page (grid + filters)
- Build VendorCard component with TrustScoreGauge
- Build Vendor detail slide-over
- Connect to vendor APIs

**Member 2:**
- Build Vendor Portal (`app/vendor-portal/rfq/[token]/`)
- Build quotation submission form
- File upload to Supabase Storage
- Build Approval Workflow page (queue + detail panel)

**Member 3:**
- Build PDF generation for POs and Invoices (`lib/pdf.ts`)
- Build Supabase realtime subscriptions for notifications
- Implement 3-way invoice matching logic
- Build email templates (RFQ invite, PO, invoice)

**Member 4:**
- Build AI Quotation Analyzer (`features/ai/quotation-analyzer.ts`)
- Implement Gemini prompt for quote comparison
- Parse and structure AI response into winner cards
- Build `/api/ai/analyze-quotes` endpoint
- Test with real multi-vendor quotation data

---

### Hour 5 (4:00–5:00) — Quotation Comparison + Risk Engine

**Member 1:**
- Build AIRecommendations panel
- Connect dashboard realtime (Supabase subscribe)
- Add Framer Motion animations to KPI cards (count-up)
- Polish dashboard layout + responsive

**Member 2:**
- Build Quotation Comparison page
- Build AIWinnerCard components (3 winner tiles)
- Build VendorCompareTable (sortable)
- Wire "Award to vendor" → approval flow

**Member 3:**
- Finalize all API error handling + validation
- Add API middleware (auth check, org check)
- Seed realistic demo data (5 vendors, 3 RFQs, 6 quotations, 2 POs, 1 invoice)
- Test complete end-to-end flow

**Member 4:**
- Build Risk Detector (`features/ai/risk-detector.ts`)
- Implement all 7 risk signal detectors
- Build risk score computation
- Wire risk alerts to notifications table
- Build risk alert feed on dashboard

---

### Hour 6 (5:00–6:00) — AI Copilot + PO/Invoice Screens

**Member 1:**
- Build CopilotPanel (slide-in from right)
- Build CopilotMessage component (user/AI bubbles)
- Build quick-action chips
- Add floating Copilot button to all pages

**Member 2:**
- Build Purchase Orders page (table + detail modal)
- Build Invoice page (table + 3-way match display)
- Build Reports page (4 tabs with charts)
- Build Settings page (basic structure)

**Member 3:**
- Finalize Resend integration (test all email sends)
- Fix any API bugs found during testing
- Add Supabase RLS policies for vendor role
- Ensure vendor portal works with invite token

**Member 4:**
- Wire AI Copilot to real API (`/api/ai/copilot`)
- Implement intent parsing (create_rfq, analyze_quotes, etc.)
- Handle action responses that trigger UI actions
- Build natural language report generation prompt

---

### Hour 7 (6:00–7:00) — Integration + Polish

**All members:**
- Integration testing: complete end-to-end flow (Login → RFQ → Quotation → AI Analysis → Approval → PO → Invoice)
- Fix bugs found in integration testing
- Ensure mobile responsiveness

**Member 1:**
- Add Framer Motion page transitions
- Polish sidebar active states + transitions
- Add skeleton loading states everywhere
- Empty state illustrations

**Member 2:**
- Polish all form UX (field validation, error states)
- Add success toasts (Sonner)
- Multi-step form progress indicator animation
- Polish vendor portal (clean, welcoming design)

**Member 3:**
- Performance: add indexes to all FK columns in Postgres
- Add error logging
- Ensure all PDFs generate correctly

**Member 4:**
- AI Copilot polish: streaming response (show typing indicator)
- Add conversation history persistence (session storage)
- Test all AI endpoints with edge cases
- Write AI prompt for daily procurement briefing (dashboard banner)

---

### Hour 8 (7:00–8:00) — Demo Preparation + Deployment

**Member 3:**
- Deploy to Vercel
- Set all environment variables in Vercel
- Seed production database with perfect demo data:
  - 8 vendors with varied trust scores (20–92)
  - 3 active RFQs in different states
  - 2 RFQs with multiple quotations ready for AI analysis
  - 1 approved PO
  - 1 invoice awaiting matching
- Test production deployment

**All others:**
- Test every demo step on production URL
- Fix any production-specific bugs

---

### Hour 9 (8:00–9:00) — Final Polish + Demo Rehearsal

**All members:**
- Rehearse 5-minute demo script 3 times
- Assign roles: who presents, who operates browser tabs, who answers questions
- Prepare slide deck (optional: 3 slides max — problem, solution, live demo)
- Prepare backup: screen recording of full demo in case of internet issues
- Check all demo data is in correct state (reset if needed)

---

## Critical Path (Non-Negotiables)

These must work perfectly for demo:
1. ✅ Login works
2. ✅ Dashboard shows live data
3. ✅ RFQ creation completes all 3 steps
4. ✅ Vendor portal opens from invite link and accepts quotation
5. ✅ AI Quotation Analysis runs and shows winner cards
6. ✅ One-click approval → PO generated
7. ✅ AI Copilot responds to at least 3 demo prompts
8. ✅ Invoice submitted and matched

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Gemini API slow | Cache analysis results, pre-run during demo setup |
| PDF generation fails | Use simple HTML-to-text fallback PO |
| Email not received live | Show Resend dashboard as proof of delivery |
| Supabase quota hit | Use local seed data for demo fallback |
| Demo data corrupted | Script to reset demo data in 30 seconds |

---

# APPENDIX: Winning Edge Checklist

## What judges will notice:

- [ ] AI actually works (not mocked)
- [ ] Real-time updates (no page refresh needed)
- [ ] Vendor Trust Score is visually compelling
- [ ] Quotation comparison is dramatically better than a spreadsheet
- [ ] The AI Copilot responds naturally and takes real actions
- [ ] UI looks like a $100K SaaS product, not a hackathon project
- [ ] End-to-end flow actually completes (RFQ → PO → Invoice)
- [ ] Metrics on dashboard are live, not hardcoded
- [ ] The presenter knows the product cold
- [ ] Demo has a clear narrative arc (problem → solution → wow moment)

## Wow Moments to Emphasize:

1. "Just type what you need" → AI creates the RFQ
2. "Three vendors quoted. AI analyzed all three in 2 seconds."
3. "One click. Purchase order generated. Email sent."
4. "Ask the AI anything about your procurement data."

---

*VendorBridge AI — Built for the future of procurement operations.*
*"Your AI Procurement Officer"*
