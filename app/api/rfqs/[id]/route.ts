import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

type RouteContext = {
	params: {
		id: string;
	};
};

export async function GET(_request: Request, { params }: RouteContext) {
	const { data, error } = await supabase.from('rfqs').select('*').eq('id', params.id).single();
	if (error || !data) return NextResponse.json({ error: error?.message || 'RFQ not found' }, { status: 404 });
	return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteContext) {
	try {
		const body = await request.json();
		const updatePayload: Record<string, unknown> = {};
		for (const key of ['title', 'description', 'category', 'items', 'budget', 'currency', 'submission_deadline', 'delivery_date', 'delivery_address', 'status', 'priority', 'ai_summary']) {
			if (body[key] !== undefined) updatePayload[key] = body[key];
		}
		updatePayload.updated_at = new Date().toISOString();
		const { data, error } = await supabase.from('rfqs').update(updatePayload).eq('id', params.id).select().single();
		if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to update RFQ' }, { status: 500 });
		return NextResponse.json(data);
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

