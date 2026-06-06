# Design & UX Guidelines

VendorBridge AI is designed to look like a premium, next-generation "Command Center" rather than a traditional, rigid ERP system.

## Design Philosophy

- **Cosmic Slate Theme:** A cohesive dark-mode aesthetic utilizing deep slate grays (`zinc-950`, `zinc-900`) contrasted with striking electric blues and glowing accents.
- **Glassmorphism:** Extensive use of blurred backgrounds (`backdrop-blur-xl`), translucent borders (`border-white/10`), and subtle inner shadows to create a sense of depth and modernity.
- **Micro-interactions:** Interactive hover states on all cards, buttons, and table rows to ensure the application feels alive and responsive.

## Color System

- **Background (Base):** Custom very dark blue/gray (Slate 950)
- **Primary Accent:** Electric Indigo / Blue (`#3b82f6` to `#6366f1`)
- **Success (Trust / Approvals):** Emerald Green (`#10b981`)
- **Warning (Alerts / Average Trust):** Amber (`#f59e0b`)
- **Danger (High Risk):** Rose/Red (`#ef4444`)

## Key UI Components

### 1. The Procurement Command Center (Dashboard)
The main dashboard serves as a flight deck for procurement officers. It features:
- **Metric Cards:** High-level KPIs (Spend, RFQs, Alerts) with glowing accents.
- **Live RFQ Tracker:** A visual progress bar system tracking RFQ lifecycle and quotation collection.
- **Risk Feed:** A chronological feed of AI-detected risks (price spikes, delivery delays).

### 2. AI Copilot Overlay
The Gemini-powered AI Copilot is an omnipresent slide-over panel accessible from anywhere in the application.
- It floats above the UI with a heavy glassmorphic blur.
- It parses user intent and can render complex React components (e.g., Quotation Comparison Cards) directly inside the chat feed.

### 3. Typography
- **Headings & Display Elements:** Clean, modern geometric sans-serif fonts to give a tech-forward feel.
- **Data Tables:** Tabular numerals and high-contrast text for critical financial numbers.
