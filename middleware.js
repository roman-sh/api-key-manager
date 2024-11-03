import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log('session', session);

  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res;
  }

  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboards', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/login', '/dashboards/:path*', '/auth/callback'],
}; 