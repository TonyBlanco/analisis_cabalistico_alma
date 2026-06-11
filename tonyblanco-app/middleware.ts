import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function connectSrcOrigins(): string[] {
    const origins = new Set<string>([
        "'self'",
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:5000',
        'https://api.studios33.app',
        'https://api.openai.com',
        'https://generativelanguage.googleapis.com',
    ]);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (apiUrl) {
        try {
            const normalized = apiUrl.replace(/\/+$/, '');
            const origin = normalized.endsWith('/api')
                ? normalized.slice(0, -4)
                : normalized;
            origins.add(new URL(origin).origin);
        } catch {
            // ignore invalid env URL
        }
    }

    return Array.from(origins);
}

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
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://accounts.google.com https://cdn.cookie-script.com https://report.cookie-script.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src ${connectSrcOrigins().join(' ')} https://challenges.cloudflare.com https://accounts.google.com https://cdn.cookie-script.com https://report.cookie-script.com;
    frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com https://cdn.cookie-script.com https://report.cookie-script.com;
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
