import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../../lib/supabase/server';

const supabase = createSupabaseServer();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
	const params = await context.params;
	const [rfqResult, quotationsResult] = await Promise.all([
		supabase.from('rfqs').select('id, title, status, org_id').eq('id', params.id).single(),
		supabase.from('quotations').select('*').eq('rfq_id', params.id).order('submitted_at', { ascending: false }),
	]);

	if (rfqResult.error || !rfqResult.data) {
		return NextResponse.json({ error: rfqResult.error?.message || 'RFQ not found' }, { status: 404 });
	}
	if (quotationsResult.error) {
		return NextResponse.json({ error: quotationsResult.error.message }, { status: 500 });
	}

	const quotations = quotationsResult.data ?? [];
	const totals = quotations.map((quotation: any) => Number(quotation.total_amount) || 0);
	const bestPrice = quotations.length > 0
		? quotations.reduce((best: any, current: any) => (Number(current.total_amount) < Number(best.total_amount) ? current : best), quotations[0])
		: null;

	const fastestDelivery = quotations.length > 0
		? quotations.reduce((best: any, current: any) => {
			const bestDays = Number(best.delivery_days ?? Number.MAX_SAFE_INTEGER);
			const currentDays = Number(current.delivery_days ?? Number.MAX_SAFE_INTEGER);
			return currentDays < bestDays ? current : best;
		}, quotations[0])
		: null;

	const bestOverall = bestPrice;
	const spread = totals.length > 1 ? Math.max(...totals) - Math.min(...totals) : 0;

	return NextResponse.json({
		rfq: rfqResult.data,
		quotations,
		ai_analysis: {
			best_price: bestPrice,
			fastest_delivery: fastestDelivery,
			best_overall: bestOverall,
			risk_flags: spread > 0 ? [`Price spread detected: ${spread.toFixed(2)}`] : [],
		},
		analyzed_at: new Date().toISOString(),
	});
}
