import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes by role
const protectedRoutes = {
    citizen: ['/citizen', '/request', '/profile', '/notifications', '/guide'],
    coordinator: ['/coordinator', '/missions', '/requests'],
    rescue_team: ['/team', '/missions', '/report'],
    manager: ['/manager', '/inventory'],
    admin: ['/admin', '/settings', '/users'],
};

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if it's a public route
    if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api'))) {
        return NextResponse.next();
    }

    // Get token from cookies or headers
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // If no token and accessing protected route, redirect to login
    if (!token) {
        const isProtectedRoute = Object.values(protectedRoutes).some(routes =>
            routes.some(route => pathname.startsWith(route))
        );

        if (isProtectedRoute) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }
    }

    // TODO: Add token verification and role-based access control
    // For now, we'll allow access if token exists
    // In production, decode JWT and verify user role matches route requirements

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
