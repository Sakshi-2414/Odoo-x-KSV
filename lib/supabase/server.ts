// lib/supabase/server.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for server-side usage.
 * Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` by default.
 */
export const createSupabaseServer = (serviceRoleKey?: string): SupabaseClient => {
	const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !key) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for server Supabase client');
	}

	return createClient(url, key, { auth: { persistSession: false } });
};

export default createSupabaseServer;
