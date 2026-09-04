import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes accessible only when NOT authenticated
const PUBLIC_ONLY_ROUTES: string[] = ['/'];

// Routes that are always public (skip all middleware guardsdsd)
const ALWAYS_PUBLIC_ROUTES: string[] = ['/auth/callback'];

// Routes accessible only when authenticated
const PROTECTED_ROUTES: string[] = ['/dashboard'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Always-public routes (e.g. OAuth callback) — skip all guards
  if (ALWAYS_PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check cookie presence — works because the cookie domain is .nidhintech.site
  // shared between pdf.nidhintech.site (backend) and pdfextractor.nidhintech.site (frontend)
  const accessToken = request.cookies.get('access_token');
  const isAuthenticated = Boolean(accessToken?.value);

  // Authenticated user hitting a public-only route → redirect to dashboard
  if (isAuthenticated && PUBLIC_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user hitting a protected route → redirect to login
  if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // Prevent the browser from caching auth-sensitive pages in bfcache.
  // Without this, clicking "Back" restores the stale page from memory,
  // bypassing the middleware entirely and showing the wrong page.
  if (PUBLIC_ONLY_ROUTES.includes(pathname)) {
    // Login page: never cache — an authenticated user must never see this from cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  } else if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    // Dashboard: private content, must not be cached publicly
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return response;
}

export const config = {
  // Only run middleware on these paths — skip _next, static, api, favicon etc.
  matcher: ['/', '/dashboard/:path*', '/auth/callback'],
};
