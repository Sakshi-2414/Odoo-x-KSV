import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function GET() {
	const { data, error } = await supabase.from('rfqs').select('*').order('created_at', { ascending: false }).limit(50);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const required = ['org_id', 'rfq_number', 'title', 'category', 'items', 'submission_deadline'];
		for (const k of required) {
			if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 });
		}

		const payload = {
			org_id: body.org_id,
			rfq_number: body.rfq_number,
			title: body.title,
			description: body.description || null,
			category: body.category,
			items: body.items,
			budget: body.budget || null,
			currency: body.currency || 'USD',
			submission_deadline: body.submission_deadline,
			delivery_date: body.delivery_date || null,
			status: body.status || 'draft',
			created_by: body.created_by || null,
			created_at: new Date().toISOString(),
		};

		const { data, error } = await supabase.from('rfqs').insert([payload]).select().single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

