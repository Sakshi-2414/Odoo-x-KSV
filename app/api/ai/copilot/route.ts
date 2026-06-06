import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';
import { processCopilotMessage, CopilotContext } from '../../../../features/ai/copilot';

const supabase = createSupabaseServer();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const message = String(body.message || '').trim();
		if (!message) {
			return NextResponse.json({ error: 'message is required' }, { status: 400 });
		}

		// In a real implementation, you would authenticate the user and get their real org.
		// Here we mock the context setup, but pull real stats from the DB.
		const orgId = body.context?.org_id;

		const [rfqsResult, approvalsResult, posResult] = await Promise.all([
			supabase.from('rfqs').select('id', { count: 'exact' }).eq('status', 'active'),
			supabase.from('approvals').select('id', { count: 'exact' }).eq('status', 'pending'),
			supabase.from('purchase_orders').select('id', { count: 'exact' }).in('status', ['issued', 'in_progress'])
		]);

		const context: CopilotContext = {
			orgName: 'VendorBridge Demo Org',
			userName: body.context?.user_name || 'Procurement Manager',
			userRole: body.context?.user_role || 'Manager',
			date: new Date().toLocaleDateString(),
			stats: {
				activeRfqs: rfqsResult.count || 0,
				pendingApprovals: approvalsResult.count || 0,
				openPos: posResult.count || 0,
			},
			dbSummary: {
				// Provide lightweight metadata or summaries for Gemini to understand current state
				recent_activity: 'Many recent RFQs for IT Equipment.'
			}
		};

		const response = await processCopilotMessage(message, context, body.history || []);

		if (orgId) {
			await supabase.from('activities').insert([{ action: 'copilot_request', metadata: { query: message.slice(0, 100) }, org_id: orgId }]);
		}

		return NextResponse.json(response);
	} catch (err: any) {
		console.error('API Error in copilot:', err);
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

