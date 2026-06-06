import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServer();
    const { email, password, full_name, role = 'manager' } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    // 2. Create user in public.users table
    if (userId) {
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: userId,
          email,
          full_name,
          role,
        }
      ]);

      if (dbError) {
        // Fallback: If public table insert fails, log it but still return success since auth was created.
        console.error('Failed to insert into public.users:', dbError);
      }
    }

    if (authData.session?.access_token) {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      cookieStore.set('vend_auth', authData.session.access_token, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({ user: authData.user, session: authData.session }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
