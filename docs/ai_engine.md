# VendorBridge AI Engine

VendorBridge AI differentiates itself from traditional procurement systems by operating an active AI Engine powered by Google Gemini 2.5 Flash. The engine performs three distinct roles:

## 1. Vendor Trust Score Algorithm

The system abandons traditional subjective vendor ratings in favor of an objective, data-driven Trust Score (0-100).

**Composite Weighting:**
- **Price Competitiveness (25%):** Automatically calculates deviation from category average price.
- **Delivery Performance (30%):** Measures strictly on-time vs. delayed Purchase Order completions.
- **Response Speed (15%):** Evaluates how quickly vendors respond to RFQ invitations.
- **Quote Win Rate (15%):** High win rates indicate consistent market competitiveness.
- **Dispute-Free Rate (15%):** Invoices or deliveries with reported issues deduct from the score.

The score dynamically updates after every completed PO, invoice, or quotation cycle, providing real-time visibility into vendor health.

## 2. AI Quotation Analyzer

Instead of requiring procurement managers to export quotes to Excel for analysis, the AI Quotation Analyzer automatically parses all submitted quotes once an RFQ closes.

**Analysis Vector:**
The engine feeds the RFQ requirements, vendor trust scores, and all raw quotation data to the Gemini API. Gemini is instructed via a strict system prompt to output a structured JSON response identifying:
1. **Best Price:** The absolute lowest bidder.
2. **Fastest Delivery:** The fastest SLA.
3. **Best Overall Value:** A weighed recommendation balancing price, delivery speed, and the Vendor's Trust Score.

## 3. Risk Detection Engine

The system proactively scans procurement activities for anomalies and risks.

**Monitored Signals:**
- **Price Spikes:** Quotes >25% higher than historical category averages.
- **Dependency Risk:** Over-reliance (>60% of spend) on a single vendor.
- **Bottlenecks:** Approvals stuck for >48 hours automatically flag for escalation.
- **Invoice Mismatches:** 3-Way Match discrepancies (PO vs. Delivery vs. Invoice) automatically halt payment processing.
