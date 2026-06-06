import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../../lib/supabase/server';

const supabase = createSupabaseServer();

type RouteContext = {
	params: {
		id: string;
	};
};

export async function POST(_request: Request, { params }: RouteContext) {
	try {
		const invoiceResult = await supabase.from('invoices').select('*').eq('id', params.id).single();
		if (invoiceResult.error || !invoiceResult.data) {
			return NextResponse.json({ error: invoiceResult.error?.message || 'Invoice not found' }, { status: 404 });
		}

		const invoice = invoiceResult.data as any;
		let poTotal = Number(invoice.total_amount);
		if (invoice.po_id) {
			const { data: po } = await supabase.from('purchase_orders').select('total_amount').eq('id', invoice.po_id).single();
			if (po) poTotal = Number(po.total_amount);
		}

		const variance = Number(invoice.total_amount) - poTotal;
		const variancePct = poTotal === 0 ? 0 : (variance / poTotal) * 100;
		const itemsMatched = Array.isArray(invoice.line_items) && invoice.line_items.length > 0;
		const matched = Math.abs(variance) < 0.01 && itemsMatched;

		const matchDetails = {
			po_total: poTotal,
			invoice_total: Number(invoice.total_amount),
			variance,
			variance_pct: variancePct,
			items_matched: itemsMatched,
		};

		const updateResult = await supabase
			.from('invoices')
			.update({
				match_status: matched ? 'matched' : 'discrepancy',
				match_details: matchDetails,
				payment_status: matched ? 'approved' : invoice.payment_status,
			})
			.eq('id', params.id)
			.select()
			.single();

		if (updateResult.error || !updateResult.data) {
			return NextResponse.json({ error: updateResult.error?.message || 'Failed to update invoice match status' }, { status: 500 });
		}

		return NextResponse.json({
			match_status: updateResult.data.match_status,
			match_details: matchDetails,
			auto_approved: matched,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
