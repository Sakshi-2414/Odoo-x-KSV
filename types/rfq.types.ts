// rfq.types.ts

export interface RFQItem {
	name: string;
	qty: number;
	unit?: string;
	specs?: string;
	item_id?: string;
}

export interface RFQ {
	id: string;
	org_id?: string;
	rfq_number?: string;
	title: string;
	description?: string;
	category?: string;
	items: RFQItem[];
	budget?: number;
	currency?: string;
	submission_deadline?: string; // ISO timestamp
	delivery_date?: string; // YYYY-MM-DD
	delivery_address?: string;
	status?:
		| 'draft'
		| 'active'
		| 'under_review'
		| 'awarded'
		| 'closed'
		| 'cancelled';
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	ai_summary?: string;
	created_by?: string;
	created_at?: string;
	updated_at?: string;
}

export interface RFQVendor {
	id: string;
	rfq_id: string;
	vendor_id?: string;
	invited_at?: string;
	invite_token?: string;
	email_sent?: boolean;
	viewed_at?: string;
	responded_at?: string;
	status?: 'invited' | 'viewed' | 'submitted' | 'declined' | 'awarded' | 'rejected';
}
