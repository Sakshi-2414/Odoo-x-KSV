import { NextResponse } from 'next/server';
import { processApprovalDecision } from '../../../../../features/procurement/approval';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
	const params = await context.params;
	try {
		const { id } = await params;
		const body = await request.json();
		if (!body.action || !['approve', 'reject'].includes(body.action)) {
			return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
		}

		const result = await processApprovalDecision(
			id, 
			body.action === 'approve' ? 'approved' : 'rejected', 
			body.comments,
			body.approver_id // Should ideally be pulled from auth session
		);

		return NextResponse.json(result);
	} catch (err: any) {
		console.error('Approval error:', err);
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
