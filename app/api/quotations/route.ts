import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function GET() {
	const { data, error } = await supabase.from('quotations').select('*').order('submitted_at', { ascending: false }).limit(50);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const required = ['rfq_id', 'vendor_id', 'line_items', 'total_amount'];
		for (const k of required) {
			if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 });
		}

		const payload = {
			rfq_id: body.rfq_id,
			vendor_id: body.vendor_id,
			rfq_vendor_id: body.rfq_vendor_id || null,
			quote_number: body.quote_number || null,
			line_items: body.line_items,
			total_amount: body.total_amount,
			currency: body.currency || 'USD',
			status: body.status || 'submitted',
			submitted_at: new Date().toISOString(),
			ai_analysis: body.ai_analysis || null,
		};

		const { data, error } = await supabase.from('quotations').insert([payload]).select().single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

