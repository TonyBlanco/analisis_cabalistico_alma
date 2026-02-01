import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    const sanitizedPath = request.nextUrl.pathname.replace(/\/\([^/]+\)/g, '');
    const canonicalPath = sanitizedPath.replace(/\/{2,}/g, '/') || '/';
    if (canonicalPath !== request.nextUrl.pathname) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = canonicalPath;
        return NextResponse.redirect(redirectUrl);
    }

    // Define CSP policies
    // Note: We include 'unsafe-inline' for now to ensure compatibility with existing components that might use it,
    // but we aim for a more restrictive policy later once verified.
    const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER_URL || 'https://api.groq.example';

    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://localhost:5000 ${aiProvider} https://generativelanguage.googleapis.com;
    frame-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspHeader);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
