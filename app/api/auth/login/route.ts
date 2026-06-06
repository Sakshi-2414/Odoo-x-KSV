import { NextResponse } from 'next/server';
import createSupabaseServer from '../../../../lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServer();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const userId = authData.user?.id;
    let userData = null;

    // 2. Fetch user details from public.users table
    if (userId) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      userData = dbUser;

      // Update last_login_at
      await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', userId);
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

    return NextResponse.json({ 
      user: {
        id: userId,
        email: authData.user?.email,
        ...userData
      }, 
      session: authData.session 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
