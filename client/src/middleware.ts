import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define paths that are public (accessible without a token)
  const isPublicPath = path === '/login' || path === '/signup';

  // Get the token from the cookies. I'm assuming the token is named 'token'.
  const token = request.cookies.get('token')?.value || '';

  // Redirect to login if trying to access a protected path without a token
  if (!isPublicPath && !token && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Redirect to dashboard if an authenticated user tries to access login/signup
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

// Config to specify which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};