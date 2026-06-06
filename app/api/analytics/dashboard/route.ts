import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

function startOfMonthIso() {
	const now = new Date();
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function sum(values: Array<number | null | undefined>) {
	return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

export async function GET() {
	const [rfqsResult, approvalsResult, purchaseOrdersResult, quotationsResult, vendorsResult, activitiesResult] = await Promise.all([
		supabase.from('rfqs').select('id, status, category, budget, created_at').in('status', ['active', 'under_review']),
		supabase.from('approvals').select('id, status, created_at').eq('status', 'pending'),
		supabase.from('purchase_orders').select('id, total_amount, status, created_at, issued_at, org_id').gte('created_at', startOfMonthIso()),
		supabase.from('quotations').select('id, vendor_id, total_amount, status, submitted_at, rfq_id').order('submitted_at', { ascending: false }).limit(25),
		supabase.from('vendors').select('id, name, trust_score, total_orders, on_time_delivery, avg_response_days, is_approved').order('trust_score', { ascending: false }).limit(20),
		supabase.from('activities').select('id, title, created_at').order('created_at', { ascending: false }).limit(10),
	]);

	const errors = [rfqsResult.error, approvalsResult.error, purchaseOrdersResult.error, quotationsResult.error, vendorsResult.error, activitiesResult.error].filter(Boolean);
	if (errors.length > 0) {
		return NextResponse.json({ error: errors[0]?.message || 'Failed to load dashboard analytics' }, { status: 500 });
	}

	const activeRfqs = rfqsResult.data?.length ?? 0;
	const pendingApprovals = approvalsResult.data?.length ?? 0;
	const monthSpend = sum((purchaseOrdersResult.data ?? []).map((row) => Number(row.total_amount)));
	const vendorRisk = (vendorsResult.data ?? []).filter((vendor) => !vendor.is_approved || (Number(vendor.trust_score) || 0) < 50).length;
	const riskScore = Math.max(0, Math.min(100, Math.round((vendorRisk * 12) + (pendingApprovals * 8) + Math.max(0, 10 - activeRfqs))));

	const spendByCategoryMap = new Map<string, number>();
	for (const rfq of rfqsResult.data ?? []) {
		const key = rfq.category || 'Uncategorized';
		spendByCategoryMap.set(key, (spendByCategoryMap.get(key) || 0) + Number(rfq.budget || 0));
	}

	const spendByCategory = Array.from(spendByCategoryMap.entries()).map(([category, amount]) => ({ category, amount }));

	const vendorPerformance = (vendorsResult.data ?? []).map((vendor) => ({
		vendor_id: vendor.id,
		name: vendor.name,
		trust_score: vendor.trust_score ?? 0,
		total_orders: vendor.total_orders ?? 0,
		on_time_delivery: vendor.on_time_delivery ?? null,
		avg_response_days: vendor.avg_response_days ?? null,
	}));

	const recentActivity = (activitiesResult.data ?? []).map((activity) => ({
		id: activity.id,
		title: activity.title,
		created_at: activity.created_at,
	}));

	return NextResponse.json({
		kpis: {
			active_rfqs: activeRfqs,
			pending_approvals: pendingApprovals,
			month_spend: monthSpend,
			risk_score: riskScore,
		},
		spend_by_category: spendByCategory,
		vendor_performance: vendorPerformance,
		recent_activity: recentActivity,
		quotations_reviewed: quotationsResult.data?.length ?? 0,
	});
}
