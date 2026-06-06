export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFlag {
  id: string;
  type: string;
  message: string;
  severity: RiskSeverity;
  timestamp: string;
  entity_type?: 'rfq' | 'vendor' | 'approval' | 'invoice' | 'org';
  entity_id?: string;
}

export interface RiskContext {
  rfqs: any[]; // Include active rfqs and their quotations
  vendors: any[]; 
  approvals: any[];
  invoices: any[];
  orgSpend: { total: number; byVendor: Record<string, number> };
}

export function detectRisks(context: RiskContext): RiskFlag[] {
  const flags: RiskFlag[] = [];

  // 1 & 2. RFQ & Quotation Risks
  context.rfqs.forEach((rfq) => {
    const quotations = rfq.quotations || [];
    
    // RFQ Deadline Miss (<24 hours to deadline with 0 quotations received)
    if (quotations.length === 0) {
      const hoursToDeadline = (new Date(rfq.submission_deadline).getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursToDeadline > 0 && hoursToDeadline < 24) {
        flags.push({
          id: `risk-rfq-deadline-${rfq.id}`,
          type: 'rfq_deadline_miss',
          message: `RFQ ${rfq.rfq_number} deadline is in less than 24 hours with no quotations received.`,
          severity: 'high',
          timestamp: new Date().toISOString(),
          entity_type: 'rfq',
          entity_id: rfq.id,
        });
      }
    }

    // Overpriced Quotation (All quotations exceed budget by 15%+)
    if (rfq.budget && quotations.length > 0) {
      const allOverpriced = quotations.every((q: any) => q.total_amount > rfq.budget * 1.15);
      if (allOverpriced) {
        flags.push({
          id: `risk-rfq-budget-${rfq.id}`,
          type: 'overpriced_quotations',
          message: `All quotations for RFQ ${rfq.rfq_number} exceed the budget by over 15%.`,
          severity: 'high',
          timestamp: new Date().toISOString(),
          entity_type: 'rfq',
          entity_id: rfq.id,
        });
      }
    }

    // Price Spike Detection (Quotation is 25%+ above category historical average)
    // Note: Mocking historical average to be the budget for now, or comparing to average of current quotes
    if (quotations.length >= 2) {
      const avgPrice = quotations.reduce((acc: number, q: any) => acc + Number(q.total_amount), 0) / quotations.length;
      quotations.forEach((q: any) => {
        if (Number(q.total_amount) > avgPrice * 1.25) {
          flags.push({
            id: `risk-quote-spike-${q.id}`,
            type: 'price_spike',
            message: `Quotation from Vendor ${q.vendor_id} is >25% above average for RFQ ${rfq.rfq_number}.`,
            severity: 'high',
            timestamp: new Date().toISOString(),
            entity_type: 'rfq',
            entity_id: rfq.id,
          });
        }
      });
    }
  });

  // 3. Vendor Reliability Risk (Trust Score drops below 35 for awarded vendor)
  context.vendors.forEach((vendor) => {
    if (vendor.trust_score < 35 && vendor.has_active_orders) {
      flags.push({
        id: `risk-vendor-trust-${vendor.id}`,
        type: 'vendor_reliability',
        message: `Awarded Vendor ${vendor.name} has a critical trust score of ${vendor.trust_score}.`,
        severity: 'critical',
        timestamp: new Date().toISOString(),
        entity_type: 'vendor',
        entity_id: vendor.id,
      });
    }
  });

  // 4. Approval Bottleneck (pending > 48 hours = Medium, > 5 days = High)
  context.approvals.forEach((approval) => {
    if (approval.status === 'pending') {
      const daysPending = (Date.now() - new Date(approval.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysPending > 5) {
        flags.push({
          id: `risk-approval-${approval.id}`,
          type: 'approval_bottleneck',
          message: `Approval for ${approval.entity_type} has been pending for over 5 days.`,
          severity: 'high',
          timestamp: new Date().toISOString(),
          entity_type: 'approval',
          entity_id: approval.id,
        });
      } else if (daysPending > 2) {
        flags.push({
          id: `risk-approval-${approval.id}`,
          type: 'approval_bottleneck',
          message: `Approval for ${approval.entity_type} has been pending for over 48 hours.`,
          severity: 'medium',
          timestamp: new Date().toISOString(),
          entity_type: 'approval',
          entity_id: approval.id,
        });
      }
    }
  });

  // 5. Single-Vendor Dependency (>60% of org spend going to one vendor)
  if (context.orgSpend.total > 0) {
    Object.entries(context.orgSpend.byVendor).forEach(([vendorId, spend]) => {
      if ((spend / context.orgSpend.total) > 0.6) {
        flags.push({
          id: `risk-dependency-${vendorId}`,
          type: 'single_vendor_dependency',
          message: `Over 60% of organization spend is going to a single vendor.`,
          severity: 'medium',
          timestamp: new Date().toISOString(),
          entity_type: 'org',
        });
      }
    });
  }

  // 7. Invoice Mismatch (Invoice amount differs from PO by >2%)
  context.invoices.forEach((invoice) => {
    if (invoice.po_total) {
      const variance = Math.abs(invoice.total_amount - invoice.po_total) / invoice.po_total;
      if (variance > 0.02) {
        flags.push({
          id: `risk-invoice-${invoice.id}`,
          type: 'invoice_mismatch',
          message: `Invoice ${invoice.invoice_number} differs from PO amount by more than 2%.`,
          severity: 'high',
          timestamp: new Date().toISOString(),
          entity_type: 'invoice',
          entity_id: invoice.id,
        });
      }
    }
  });

  return flags;
}

export function computeOverallRiskIndex(flags: RiskFlag[]): number {
  const counts = {
    critical: flags.filter(f => f.severity === 'critical').length,
    high: flags.filter(f => f.severity === 'high').length,
    medium: flags.filter(f => f.severity === 'medium').length,
    low: flags.filter(f => f.severity === 'low').length,
  };

  const rawScore = (counts.critical * 25) + (counts.high * 15) + (counts.medium * 8) + (counts.low * 3);
  
  // Cap at 100. In a real scenario, this would be relative to the size of the org (e.g. per 100 POs).
  return Math.min(100, rawScore);
}
