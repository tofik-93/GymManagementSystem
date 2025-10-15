import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  // ✅ Public paths that don’t need auth
  const publicPaths = ["/login", "/_next", "/api"]
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // ✅ Read cookies safely
  const auth = req.cookies.get("gym_auth")?.value || null
  const expiry = req.cookies.get("gym_auth_expiry")?.value || null
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
  if (!auth || !expiry || Date.now() > Number(expiry)) {
    // Redirect to login if session invalid or expired
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!login|api|_next|favicon.ico).*)"],
}
