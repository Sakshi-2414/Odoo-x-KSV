# Procurement Workflows

VendorBridge AI implements a complete end-to-end procurement loop, moving from RFQ generation to final invoice payment.

## 1. RFQ to Quotation Workflow

1. **RFQ Creation:** A procurement officer generates an RFQ (via form or AI Copilot). Upon publishing, the RFQ enters the `active` state.
2. **Vendor Invitations:** The system matches the RFQ category to qualified vendors and triggers email invitations containing magic links.
3. **Quotation Submission:** Vendors log into the Vendor Portal via the magic link and submit their structured quotes (price, delivery time, terms).
4. **Analysis Phase:** Once the deadline hits (or manually triggered), the AI Quotation Analyzer ranks all submissions.

## 2. Multi-Tier Approval Workflow

To maintain compliance without slowing down velocity, VendorBridge utilizes dynamic approval routing:

1. **Standard Flow:** When an officer selects a winning quotation, an approval request is created for the Procurement Manager.
2. **Auto-Escalation:** If the quotation total exceeds an organizational threshold (e.g., $10,000), the system automatically adds a second approval tier (Director level).
3. **Approval Action:** Approvers can review the AI justification and original quotes. Upon final approval, the quotation state moves to `awarded`.

## 3. Purchase Order Generation

1. **Automated POs:** The moment a quotation receives final approval, VendorBridge automatically generates a Draft Purchase Order.
2. **Issuance:** The PO inherits all line items, terms, and delivery dates from the winning quotation.
3. **Acknowledgment:** The PO is emailed to the vendor, who must acknowledge receipt and confirm the delivery schedule.

## 4. Invoicing & 3-Way Match

The final step of the procurement loop ensures financial accuracy:
1. **Invoice Submission:** The vendor submits an invoice referencing the PO number.
2. **3-Way Match:** The system automatically verifies that the Invoice Amount == PO Amount == Goods Receipt Amount.
3. **Approval for Payment:** If the match is successful, the invoice is cleared for payment. Any discrepancy (e.g., a 2% variance) automatically flags the invoice for manual financial review.
