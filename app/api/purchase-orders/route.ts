import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

function makePoNumber() {
	return `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const vendorId = searchParams.get('vendor_id');

	let query = supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }).limit(100);
	if (vendorId) {
		query = query.eq('vendor_id', vendorId);
	}

	const { data, error } = await query;
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const required = ['org_id', 'line_items', 'total_amount'];
		for (const key of required) {
			if (body[key] === undefined || body[key] === null) {
				return NextResponse.json({ error: `${key} is required` }, { status: 400 });
			}
		}

		const payload = {
			org_id: body.org_id,
			po_number: body.po_number || makePoNumber(),
			rfq_id: body.rfq_id || null,
			quotation_id: body.quotation_id || null,
			vendor_id: body.vendor_id || null,
			line_items: body.line_items,
			subtotal: body.subtotal ?? null,
			tax_rate: body.tax_rate ?? 0,
			tax_amount: body.tax_amount ?? null,
			total_amount: body.total_amount,
			currency: body.currency || 'USD',
			delivery_date: body.delivery_date || null,
			payment_terms: body.payment_terms || null,
			billing_address: body.billing_address || null,
			shipping_address: body.shipping_address || null,
			notes: body.notes || null,
			status: body.status || 'issued',
			issued_at: body.issued_at || new Date().toISOString(),
			acknowledged_at: body.acknowledged_at || null,
			delivered_at: body.delivered_at || null,
			pdf_url: body.pdf_url || null,
			created_by: body.created_by || null,
		};

		const { data, error } = await supabase.from('purchase_orders').insert([payload]).select().single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

