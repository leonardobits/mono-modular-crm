import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value

  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/users')

  if (isAdminRoute) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/users/:path*'],
} 