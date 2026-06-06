import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

export async function GET() {
  try {
    const supabase = createSupabaseServer();

    // 1. Fetch Active RFQs
    const { count: activeRfqs } = await supabase
      .from('rfqs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'published', 'evaluating']);

    // 2. Fetch Pending Approvals
    const { count: pendingApprovals } = await supabase
      .from('approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 3. Total Spend (mock calculation or sum from purchase orders)
    // For now we'll sum PO amounts if possible, but fallback to a placeholder
    const { data: pos } = await supabase.from('purchase_orders').select('total_amount');
    const totalSpend = pos?.reduce((acc, po) => acc + (po.total_amount || 0), 0) || 1200000;

    // 4. Fetch recent activity (if table exists, otherwise mock)
    const { data: activities, error: activityError } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      metrics: {
        activeRfqs: activeRfqs || 0,
        pendingApprovals: pendingApprovals || 0,
        totalSpend,
        riskScore: 92, // Placeholder
      },
      activities: activityError ? [] : activities,
      // Pass some static fallback arrays for charts if not fully seeded
      spendByMonth: [
        { month: "Jan", IT: 120, Office: 45, Datacenter: 80 },
        { month: "Feb", IT: 135, Office: 50, Datacenter: 85 },
        { month: "Mar", IT: 110, Office: 40, Datacenter: 90 },
        { month: "Apr", IT: 150, Office: 60, Datacenter: 95 },
        { month: "May", IT: 180, Office: 55, Datacenter: 100 },
        { month: "Jun", IT: 160, Office: 48, Datacenter: 110 },
      ],
      aiRecs: [
        { type: "award", title: "Award RFQ-2026-004", reason: "Dell offers 12% lower cost than average." },
        { type: "risk", title: "Supplier Delay Warning", reason: "Acme Corp has missed 2 delivery deadlines." }
      ],
      riskAlerts: [
        { level: "high", message: "Approval bottleneck in IT Dept (4 delays)" }
      ]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
