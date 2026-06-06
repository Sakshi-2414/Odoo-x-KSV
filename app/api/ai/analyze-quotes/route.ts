import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';
import { analyzeQuotations, RFQContext, QuotationData } from '../../../../features/ai/quotation-analyzer';

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

		// Map db data to structures expected by the analyzer
		const rfqContext: RFQContext = {
			title: rfqResult.data.title,
			budget: rfqResult.data.budget,
			deadline: rfqResult.data.submission_deadline,
			items: rfqResult.data.items,
		};

		const quotationDataList: QuotationData[] = quotations.map((q: any) => {
			const vendor = vendorsResult.data?.find((v: any) => v.id === q.vendor_id);
			return {
				id: q.id,
				vendor_id: q.vendor_id,
				vendor_name: vendor?.name || 'Unknown Vendor',
				trust_score: vendor?.trust_score || 50,
				total_amount: Number(q.total_amount),
				unit_price: q.line_items?.[0]?.unit_price ? Number(q.line_items[0].unit_price) : null,
				delivery_days: q.delivery_days ? Number(q.delivery_days) : null,
				payment_terms: q.payment_terms || null,
				on_time_history: vendor?.on_time_delivery ? Number(vendor.on_time_delivery) : undefined,
				attachments: Boolean(q.attachments && q.attachments.length > 0),
			};
		});

		// Call Gemini analyzer
		const aiAnalysis = await analyzeQuotations(rfqContext, quotationDataList);

		// Update quotations in DB with the AI score/analysis
		// This is just mapping back some context if needed, though strictly we might just store the analysis against the RFQ.
		await supabase.from('rfqs').update({ ai_summary: aiAnalysis.recommendation }).eq('id', body.rfq_id);

		return NextResponse.json({
			analysis: aiAnalysis,
			processing_time_ms: Date.now() - startedAt,
		});
	} catch (err: any) {
		console.error('API Error in analyze-quotes:', err);
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}


