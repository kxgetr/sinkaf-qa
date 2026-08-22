import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // 1. GEO BLOCK (China and Russia)
  // On Vercel, x-vercel-ip-country header contains the country code
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
  
  const blockedCountries = (process.env.BLOCKED_COUNTRIES || 'CN,RU').split(',');

  if (country && blockedCountries.includes(country)) {
    return NextResponse.json({ ok: false, code: "GEO_ACCESS_BLOCKED" }, { status: 403 });
  }

  // Next: Normal request flow
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
