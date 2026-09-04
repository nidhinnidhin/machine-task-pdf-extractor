import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible only when NOT authenticated
const PUBLIC_ONLY_ROUTES: string[] = ['/'];

// Routes that are always public (skip all middleware guards)
const ALWAYS_PUBLIC_ROUTES: string[] = ['/auth/callback'];

// Routes accessible only when authenticated
const PROTECTED_ROUTES: string[] = ['/dashboard'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always-public routes (e.g. OAuth callback) — skip all guards
  if (ALWAYS_PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check cookie presence — the access_token cookie is on the localhost domain
  // so it's readable by middleware even though it's set by localhost:4000
  const accessToken = request.cookies.get('access_token');
  const isAuthenticated = Boolean(accessToken?.value);

  // Authenticated user hitting a public-only route → go to dashboard
  if (isAuthenticated && PUBLIC_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user hitting a protected route → go to login
  if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these paths — skip _next, static, api, favicon etc.
  matcher: ['/', '/dashboard/:path*', '/auth/callback'],
};
