import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function GET() {
	const { data, error } = await supabase.from('approvals').select('*').order('created_at', { ascending: false }).limit(100);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const required = ['entity_type', 'entity_id'];
		for (const key of required) {
			if (!body[key]) return NextResponse.json({ error: `${key} is required` }, { status: 400 });
		}

		const payload = {
			org_id: body.org_id || null,
			entity_type: body.entity_type,
			entity_id: body.entity_id,
			step: body.step ?? 1,
			approver_id: body.approver_id || null,
			status: body.status || 'pending',
			comments: body.comments || null,
			approved_at: body.approved_at || null,
			due_by: body.due_by || null,
		};

		const { data, error } = await supabase.from('approvals').insert([payload]).select().single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

