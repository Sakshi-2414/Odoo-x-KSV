import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

function makePoNumber() {
	return `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		if (!body.quotation_id) {
			return NextResponse.json({ error: 'quotation_id is required' }, { status: 400 });
		}

		const quotationResult = await supabase
			.from('quotations')
			.select('*, vendors(*), rfqs(*)')
			.eq('id', body.quotation_id)
			.single();

		if (quotationResult.error || !quotationResult.data) {
			return NextResponse.json({ error: quotationResult.error?.message || 'Quotation not found' }, { status: 404 });
		}

		const quotation = quotationResult.data as any;
		const payload = {
			org_id: quotation.rfqs?.org_id || quotation.org_id || body.org_id || null,
			po_number: makePoNumber(),
			rfq_id: quotation.rfq_id,
			quotation_id: quotation.id,
			vendor_id: quotation.vendor_id,
			line_items: quotation.line_items,
			subtotal: quotation.total_amount,
			tax_rate: body.tax_rate ?? 0,
			tax_amount: body.tax_amount ?? null,
			total_amount: quotation.total_amount,
			currency: quotation.currency || 'USD',
			delivery_date: body.delivery_date || quotation.delivery_date || null,
			payment_terms: body.payment_terms || quotation.payment_terms || null,
			billing_address: body.billing_address || null,
			shipping_address: body.shipping_address || null,
			notes: body.notes || quotation.notes || null,
			status: 'issued',
			issued_at: new Date().toISOString(),
			created_by: body.created_by || null,
		};

		const insertResult = await supabase.from('purchase_orders').insert([payload]).select().single();
		if (insertResult.error || !insertResult.data) {
			return NextResponse.json({ error: insertResult.error?.message || 'Failed to generate purchase order' }, { status: 500 });
		}

		await supabase.from('approvals').insert([{ entity_type: 'purchase_order', entity_id: insertResult.data.id, status: 'pending', org_id: payload.org_id }]);

		return NextResponse.json({
			purchase_order: insertResult.data,
			email_sent: false,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
