// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
	// don't throw at import-time in environments where admin isn't needed, but warn
	// (projects can still import and guard themselves)
	// eslint-disable-next-line no-console
	console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — admin client will not be available');
}

export const supabaseAdmin = (url && serviceKey) ? createClient(url, serviceKey) : null;

export default supabaseAdmin;
