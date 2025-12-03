import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isRootPage = request.nextUrl.pathname === "/"
  const isPublicRoute = isLoginPage || isRootPage

  // Allow access to login page and root without token
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protect all authenticated routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
