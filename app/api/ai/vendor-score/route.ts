import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const vendorId = body.vendor_id;
		if (!vendorId) {
			return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
		}

		const [vendorResult, quotationResult] = await Promise.all([
			supabase.from('vendors').select('*').eq('id', vendorId).single(),
			supabase.from('quotations').select('id, total_amount, submitted_at, status').eq('vendor_id', vendorId),
		]);

		if (vendorResult.error || !vendorResult.data) {
			return NextResponse.json({ error: vendorResult.error?.message || 'Vendor not found' }, { status: 404 });
		}

		if (quotationResult.error) {
			return NextResponse.json({ error: quotationResult.error.message }, { status: 500 });
		}

		const quotations = quotationResult.data ?? [];
		const totalQuotes = quotations.length;
		const totalRfqs = body.org_id
			? ((await supabase.from('rfqs').select('id').eq('org_id', body.org_id)).data?.length ?? 0)
			: 0;
		const approvedBoost = vendorResult.data.is_approved ? 15 : -10;
		const trustScore = Math.max(0, Math.min(100, Math.round((Number(vendorResult.data.trust_score) || 50) + approvedBoost + Math.min(totalQuotes * 2, 10))));

		return NextResponse.json({
			vendor_id: vendorId,
			analysis: {
				trust_score: trustScore,
				total_rfqs: totalRfqs,
				total_quotes: totalQuotes,
				quote_win_rate: totalQuotes > 0 ? Math.round((quotations.filter((quotation: any) => quotation.status === 'awarded').length / totalQuotes) * 100) : 0,
				avg_quote_days: quotations.length > 0 ? Math.round(quotations.length * 1.8) : null,
				risk_flags: vendorResult.data.is_blacklisted ? ['Vendor is blacklisted'] : [],
			},
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
