import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon).*)'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Si está en / con sesión activa → redirigir a dashboard
  if (pathname === '/') {
    return token
      ? NextResponse.redirect(new URL('/dashboard', req.url))
      : NextResponse.next();
  }

  // Rutas protegidas: redirigir a / si no hay cookie
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}
