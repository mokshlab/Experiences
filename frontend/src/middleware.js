import { NextResponse } from 'next/server'

/**
 * Next.js Middleware — Centralized Route Protection
 * 
 * Runs on the Edge before every matched route.
 * Checks for the JWT auth cookie and redirects
 * unauthenticated users to the sign-in page.
 * Redirects authenticated users away from auth pages.
 * 
 * Public routes (no auth required):
 *   /           — Landing page
 *   /auth/*     — Sign in & sign up
 *   /explore    — Public experience feed
 */

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/experiences',
  '/links',
  '/analytics',
  '/profile',
]

// Auth pages — redirect logged-in users to dashboard
const AUTH_ROUTES = ['/auth/signin', '/auth/signup']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Redirect authenticated users away from auth pages → dashboard
  if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  
  if (!isProtected) {
    return NextResponse.next()
  }

  // No auth token → redirect to sign-in with callback
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

// Only run middleware on app routes, skip static files & internals
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
