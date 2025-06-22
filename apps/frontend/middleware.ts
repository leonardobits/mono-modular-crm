import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth-token")?.value;

  // Redirecionar usuários logados para longe de páginas de autenticação
  if (
    authToken &&
    (pathname === "/login" || pathname === "/register" || pathname === "/reset")
  ) {
    return NextResponse.redirect(new URL("/users", request.url));
  }

  // Proteger rotas que precisam de autenticação
  if (pathname === "/users" || pathname.startsWith("/users/")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/users/:path*", "/login", "/register", "/reset"],
};
