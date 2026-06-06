// quotation.types.ts

export interface QuotationLineItem {
	item_id?: string;
	unit_price: number;
	qty: number;
	total?: number;
	description?: string;
}

export interface Quotation {
	id: string;
	rfq_id?: string;
	vendor_id?: string;
	rfq_vendor_id?: string;
	quote_number?: string;
	line_items: QuotationLineItem[];
	total_amount: number;
	currency?: string;
	delivery_days?: number;
	delivery_date?: string; // YYYY-MM-DD
	validity_days?: number;
	payment_terms?: string;
	notes?: string;
	attachments?: string[];
	ai_score?: number;
	ai_analysis?: Record<string, any>;
	price_deviation?: number;
	status?: 'submitted' | 'under_review' | 'shortlisted' | 'awarded' | 'rejected';
	submitted_at?: string;
	reviewed_at?: string;
}
