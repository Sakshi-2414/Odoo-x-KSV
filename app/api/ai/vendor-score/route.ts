import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';
import { computeVendorTrustScore, VendorMetrics } from '../../../../features/ai/vendor-scorer';

const supabase = createSupabaseServer();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const vendorId = body.vendor_id;
		if (!vendorId) {
			return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
		}

		const [vendorResult, quotationResult, analyticsResult] = await Promise.all([
			supabase.from('vendors').select('*').eq('id', vendorId).single(),
			supabase.from('quotations').select('id, total_amount, submitted_at, status').eq('vendor_id', vendorId),
			supabase.from('vendor_analytics').select('*').eq('vendor_id', vendorId).single()
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

		const analytics = analyticsResult.data || {
			avg_price_deviation: 0,
			on_time_rate: 0.9,
			avg_response_days: 2,
			total_won: quotations.filter((q: any) => q.status === 'awarded').length,
			total_submitted: totalQuotes,
			dispute_rate: 0
		};

		const metrics: VendorMetrics = {
			avg_price_deviation: Number(analytics.avg_price_deviation || 0),
			on_time_rate: Number(analytics.on_time_rate || (vendorResult.data.on_time_delivery ? vendorResult.data.on_time_delivery / 100 : 0.9)),
			avg_response_days: Number(analytics.avg_response_days || vendorResult.data.avg_response_days || 2),
			total_won: Number(analytics.total_won || quotations.filter((q: any) => q.status === 'awarded').length),
			total_submitted: Number(analytics.total_submitted || totalQuotes),
			dispute_rate: Number(analytics.dispute_rate || 0),
			is_approved: Boolean(vendorResult.data.is_approved),
			is_blacklisted: Boolean(vendorResult.data.is_blacklisted),
		};

		const trustScore = computeVendorTrustScore(metrics);

		// Update vendor with new score
		await supabase.from('vendors').update({ trust_score: trustScore }).eq('id', vendorId);

		return NextResponse.json({
			vendor_id: vendorId,
			analysis: {
				trust_score: trustScore,
				total_rfqs: totalRfqs,
				total_quotes: totalQuotes,
				quote_win_rate: totalQuotes > 0 ? Math.round((metrics.total_won / totalQuotes) * 100) : 0,
				avg_quote_days: quotations.length > 0 ? Math.round(quotations.length * 1.8) : null,
				risk_flags: vendorResult.data.is_blacklisted ? ['Vendor is blacklisted'] : [],
			},
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
