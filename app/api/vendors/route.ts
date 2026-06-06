import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function GET() {
	const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false }).limit(100);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const required = ['org_id', 'name', 'email'];
		for (const k of required) {
			if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 });
		}

		const payload = {
			org_id: body.org_id,
			name: body.name,
			email: body.email,
			phone: body.phone || null,
			address: body.address || null,
			country: body.country || null,
			category: body.category || null,
			contact_name: body.contact_name || null,
			trust_score: body.trust_score || 50.0,
			is_approved: body.is_approved || false,
			total_orders: body.total_orders || 0,
			created_at: new Date().toISOString(),
		};

		const { data, error } = await supabase.from('vendors').insert([payload]).select().single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

