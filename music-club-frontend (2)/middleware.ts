import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isRootPage = request.nextUrl.pathname === "/"
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")

  // Allow access to login page without token
  if (isLoginPage || isRootPage) {
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
