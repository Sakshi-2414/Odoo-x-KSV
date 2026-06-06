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
		if (!body.rfq_id && !body.rfq_vendor_token) {
			return NextResponse.json({ error: 'rfq_id or rfq_vendor_token is required' }, { status: 400 });
		}
		if (!body.line_items || body.total_amount === undefined || body.total_amount === null) {
			return NextResponse.json({ error: 'line_items and total_amount are required' }, { status: 400 });
		}

		let rfqId = body.rfq_id || null;
		let vendorId = body.vendor_id || null;
		let rfqVendorId = body.rfq_vendor_id || null;

		if (body.rfq_vendor_token) {
			const rfqVendorResult = await supabase.from('rfq_vendors').select('id, rfq_id, vendor_id').eq('invite_token', body.rfq_vendor_token).single();
			if (rfqVendorResult.error || !rfqVendorResult.data) {
				return NextResponse.json({ error: rfqVendorResult.error?.message || 'Invalid rfq_vendor_token' }, { status: 404 });
			}
			rfqId = rfqVendorResult.data.rfq_id;
			vendorId = rfqVendorResult.data.vendor_id || vendorId;
			rfqVendorId = rfqVendorResult.data.id;
		}

		const payload = {
			rfq_id: rfqId,
			vendor_id: vendorId,
			rfq_vendor_id: rfqVendorId,
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

