import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function GET() {
	const { data, error } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(100);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}
