import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

function makeInvoiceNumber() {
	return `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function GET() {
	const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(100);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const required = ['org_id', 'line_items', 'total_amount', 'issue_date', 'due_date'];
		for (const key of required) {
			if (body[key] === undefined || body[key] === null) {
				return NextResponse.json({ error: `${key} is required` }, { status: 400 });
			}
		}

		const payload = {
			org_id: body.org_id,
			invoice_number: body.invoice_number || makeInvoiceNumber(),
			po_id: body.po_id || null,
			vendor_id: body.vendor_id || null,
			line_items: body.line_items,
			subtotal: body.subtotal ?? null,
			tax_amount: body.tax_amount ?? null,
			total_amount: body.total_amount,
			currency: body.currency || 'USD',
			issue_date: body.issue_date,
			due_date: body.due_date,
			payment_status: body.payment_status || 'unpaid',
			match_status: body.match_status || 'pending',
			match_details: body.match_details || null,
			pdf_url: body.pdf_url || null,
			paid_at: body.paid_at || null,
		};

		const { data, error } = await supabase.from('invoices').insert([payload]).select().single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

