// invoice.types.ts

export interface InvoiceLineItem {
  item_id?: string;
  description?: string;
  qty: number;
  unit_price?: number;
  subtotal?: number;
}

export interface Invoice {
  id: string;
  org_id?: string;
  invoice_number?: string;
  po_id?: string;
  vendor_id?: string;
  line_items: InvoiceLineItem[];
  subtotal?: number;
  tax_amount?: number;
  total_amount: number;
  currency?: string;
  issue_date?: string;
  due_date?: string;
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'disputed';
  match_status?: 'pending' | 'matched' | 'discrepancy' | 'approved';
  match_details?: Record<string, any>;
  pdf_url?: string;
  paid_at?: string;
  created_at?: string;
}
