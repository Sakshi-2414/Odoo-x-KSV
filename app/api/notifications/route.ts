import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../lib/supabase/server';

const supabase = createSupabaseServer();

export async function GET() {
	const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data);
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const required = ['title', 'message'];
		for (const key of required) {
			if (!body[key]) return NextResponse.json({ error: `${key} is required` }, { status: 400 });
		}

		const payload = {
			org_id: body.org_id || null,
			user_id: body.user_id || null,
			type: body.type || 'info',
			title: body.title,
			message: body.message,
			is_read: body.is_read || false,
			data: body.data || null,
		};

		const { data, error } = await supabase.from('notifications').insert([payload]).select().single();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data, { status: 201 });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
	}
}

