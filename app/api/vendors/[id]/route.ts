import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

const supabase = createSupabaseServer();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
	const params = await context.params;
	const { data, error } = await supabase.from('vendors').select('*').eq('id', params.id).single();
	if (error || !data) return NextResponse.json({ error: error?.message || 'Vendor not found' }, { status: 404 });
	return NextResponse.json(data);
}

export async function PATCH(request: Request, context: RouteContext) {
	const params = await context.params;
	try {
		const body = await request.json();
		const updatePayload: Record<string, unknown> = {};
		for (const key of ['name', 'email', 'phone', 'address', 'country', 'category', 'contact_name', 'trust_score', 'is_approved']) {
			if (body[key] !== undefined) updatePayload[key] = body[key];
		}
		const { data, error } = await supabase.from('vendors').update(updatePayload).eq('id', params.id).select().single();
		if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to update vendor' }, { status: 500 });
		return NextResponse.json(data);
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}
