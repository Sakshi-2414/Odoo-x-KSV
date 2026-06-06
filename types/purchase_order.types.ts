// purchase_order.types.ts

export interface POLineItem {
  item_id?: string;
  description?: string;
  qty: number;
  unit_price?: number;
  subtotal?: number;
}

export interface PurchaseOrder {
  id: string;
  org_id?: string;
  po_number?: string;
  rfq_id?: string;
  quotation_id?: string;
  vendor_id?: string;
  line_items: POLineItem[];
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount: number;
  currency?: string;
  delivery_date?: string;
  payment_terms?: string;
  billing_address?: string;
  shipping_address?: string;
  notes?: string;
  status?:
    | 'draft'
    | 'issued'
    | 'acknowledged'
    | 'in_progress'
    | 'delivered'
    | 'invoiced'
    | 'completed'
    | 'cancelled';
  issued_at?: string;
  acknowledged_at?: string;
  delivered_at?: string;
  pdf_url?: string;
  created_by?: string;
  created_at?: string;
}
