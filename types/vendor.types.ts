// vendor.types.ts

export interface Vendor {
  id: string;
  org_id?: string;

  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  category?: string[];
  contact_name?: string;
  tax_id?: string;
  payment_terms?: string;

  trust_score?: number; // 0-100

  is_approved?: boolean;
  is_blacklisted?: boolean;

  total_orders?: number;
  on_time_delivery?: number; // percent
  avg_response_days?: number;

  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VendorAnalytics {
  id: string;
  vendor_id: string;
  total_rfqs?: number;
  total_quotes?: number;
  quote_win_rate?: number;
  avg_quote_days?: number;
  avg_delivery_days?: number;
  on_time_rate?: number;
  avg_price_deviation?: number;
  dispute_rate?: number;
  trust_score?: number;
  last_computed_at?: string;
}