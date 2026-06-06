import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../../lib/supabase/server';

const supabase = createSupabaseServer();

type RouteContext = {
	params: {
		id: string;
	};
};

export async function POST(request: Request, { params }: RouteContext) {
	try {
		const body = await request.json();
		if (!body.action || !['approve', 'reject', 'escalate', 'skip'].includes(body.action)) {
			return NextResponse.json({ error: 'action must be approve, reject, escalate, or skip' }, { status: 400 });
		}

		const statusMap: Record<string, string> = {
			approve: 'approved',
			reject: 'rejected',
			escalate: 'escalated',
			skip: 'skipped',
		};

		const { data: approval, error } = await supabase
			.from('approvals')
			.update({
				status: statusMap[body.action],
				comments: body.comments || null,
				approved_at: body.action === 'approve' ? new Date().toISOString() : null,
			})
			.eq('id', params.id)
			.select()
			.single();

		if (error || !approval) {
			return NextResponse.json({ error: error?.message || 'Approval not found' }, { status: 404 });
		}

		let poGenerated: { po_number?: string } | null = null;
		if (body.action === 'approve' && approval.entity_type === 'purchase_order') {
			const { data: po } = await supabase.from('purchase_orders').select('po_number').eq('id', approval.entity_id).single();
			poGenerated = po ? { po_number: po.po_number } : null;
		}

		return NextResponse.json({
			approval,
			next_step: null,
			po_generated: poGenerated,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
