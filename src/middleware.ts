import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;

  const { pathname } = request.nextUrl;
  
  // Ignore static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // If there's no auth_token cookie, redirect to the main app's login
  if (!authToken) {
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3000/login';
    return NextResponse.redirect(new URL(loginUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
