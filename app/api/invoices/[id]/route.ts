import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, purchase_orders(*), vendors(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Invoice fetch exception:", err);
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createSupabaseServer();

  try {
    const body = await request.json();
    const { payment_status } = body;

    const { data, error } = await supabase
      .from('invoices')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
  }
}
