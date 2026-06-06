import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function POST(request: Request) {
	const startedAt = Date.now();
	try {
		const body = await request.json();
		if (!body.rfq_id) {
			return NextResponse.json({ error: 'rfq_id is required' }, { status: 400 });
		}

		const [rfqResult, quotationsResult, vendorsResult] = await Promise.all([
			supabase.from('rfqs').select('*').eq('id', body.rfq_id).single(),
			supabase.from('quotations').select('*').eq('rfq_id', body.rfq_id).order('submitted_at', { ascending: false }),
			supabase.from('vendors').select('id, name, trust_score, is_approved, on_time_delivery, avg_response_days').limit(200),
		]);

		if (rfqResult.error || !rfqResult.data) {
			return NextResponse.json({ error: rfqResult.error?.message || 'RFQ not found' }, { status: 404 });
		}
		if (quotationsResult.error) {
			return NextResponse.json({ error: quotationsResult.error.message }, { status: 500 });
		}
		if (vendorsResult.error) {
			return NextResponse.json({ error: vendorsResult.error.message }, { status: 500 });
		}

		const quotations = quotationsResult.data ?? [];
		if (quotations.length === 0) {
			return NextResponse.json({
				analysis: {
					best_price: null,
					fastest_delivery: null,
					best_overall: null,
					risk_flags: ['No quotations available for this RFQ'],
					market_context: 'No competitor quotations were submitted yet.',
					recommendation: 'Invite more vendors or extend the submission deadline.',
				},
				processing_time_ms: Date.now() - startedAt,
			});
		}

		const bestPrice = quotations.reduce((best: any, current: any) => (Number(current.total_amount) < Number(best.total_amount) ? current : best), quotations[0]);
		const fastestDelivery = quotations.reduce((best: any, current: any) => {
			const bestDays = Number(best.delivery_days ?? Number.MAX_SAFE_INTEGER);
			const currentDays = Number(current.delivery_days ?? Number.MAX_SAFE_INTEGER);
			return currentDays < bestDays ? current : best;
		}, quotations[0]);

		const averagePrice = quotations.reduce((total: number, quotation: any) => total + Number(quotation.total_amount || 0), 0) / quotations.length;
		const selectedVendor = vendorsResult.data?.find((vendor: any) => vendor.id === bestPrice.vendor_id) || null;
		const bestOverall = quotations.reduce((best: any, current: any) => {
			const bestScore = Number(best.ai_score ?? 0) + (Number(best.total_amount) <= averagePrice ? 5 : 0);
			const currentScore = Number(current.ai_score ?? 0) + (Number(current.total_amount) <= averagePrice ? 5 : 0);
			return currentScore > bestScore ? current : best;
		}, quotations[0]);

		const riskFlags: string[] = [];
		if (selectedVendor && !selectedVendor.is_approved) riskFlags.push('Best price vendor is not approved');
		if (quotations.length >= 2) {
			const totals = quotations.map((quotation: any) => Number(quotation.total_amount) || 0);
			const spread = Math.max(...totals) - Math.min(...totals);
			if (spread > averagePrice * 0.2) riskFlags.push('Large price spread detected across quotations');
		}

		const recommendation = selectedVendor && selectedVendor.is_approved
			? `Award to ${selectedVendor.name} based on price and vendor health.`
			: 'Review vendor approval status before awarding the quotation.';

		return NextResponse.json({
			analysis: {
				best_price: bestPrice,
				fastest_delivery: fastestDelivery,
				best_overall: bestOverall,
				risk_flags: riskFlags,
				market_context: `Compared ${quotations.length} quotation(s) against an average price of ${averagePrice.toFixed(2)} ${rfqResult.data.currency || 'USD'}.`,
				recommendation,
			},
			processing_time_ms: Date.now() - startedAt,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

