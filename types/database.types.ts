// database.types.ts

export type UserRole = 'admin' | 'manager' | 'officer' | 'vendor';

export interface User {
	id: string;
	email: string;
	full_name: string;
	avatar_url?: string;
	role: UserRole;
	department?: string;
	org_id?: string;
	is_active?: boolean;
	last_login_at?: string; // ISO timestamp
	created_at?: string;
	updated_at?: string;
}

export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo_url?: string;
	plan?: string;
	settings?: Record<string, any>;
	created_at?: string;
}

export interface Approval {
	id: string;
	org_id?: string;
	entity_type: 'rfq' | 'quotation' | 'purchase_order';
	entity_id: string;
	step?: number;
	approver_id?: string;
	status?: 'pending' | 'approved' | 'rejected' | 'escalated' | 'skipped';
	comments?: string;
	approved_at?: string;
	due_by?: string;
	is_overdue?: boolean;
	created_at?: string;
}

export interface Notification {
	id: string;
	user_id?: string;
	type: string;
	title: string;
	message?: string;
	data?: any;
	is_read?: boolean;
	created_at?: string;
}

export interface Activity {
	id: string;
	org_id?: string;
	user_id?: string;
	entity_type?: string;
	entity_id?: string;
	action: string;
	metadata?: any;
	ip_address?: string;
	created_at?: string;
}
