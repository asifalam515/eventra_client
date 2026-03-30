import jwt, { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const AUTH_ROUTES = ["/login", "/signup"]
const DASHBOARD_BASE = "/dashboard"

function getDashboardRoute(role: string | null) {
  if (role === "ADMIN") return "/dashboard/admin-dashboard"
  if (role === "MODERATORS") return "/dashboard/moderator-dashboard"
  return "/dashboard/user-dashboard"
}

function getRoleFromToken(token?: string) {
  if (!token) return null

  // Decode role from token payload. The API issues the token, so decoding avoids
  // rejecting valid tokens when frontend/backed secrets differ.
  try {
    const decoded = jwt.decode(token) as JwtPayload | null
    return typeof decoded?.role === "string" ? decoded.role : null
  } catch {
    return null
  }
}

function isPublicPath(pathname: string) {
  if (pathname === "/") return true
  if (AUTH_ROUTES.includes(pathname)) return true
  if (pathname === "/events" || pathname.startsWith("/events/")) return true
  return false
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  const role = getRoleFromToken(token)
  const isAuthenticated = Boolean(token)
  const isDashboardRoute =
    pathname === DASHBOARD_BASE || pathname.startsWith(`${DASHBOARD_BASE}/`)

  // Logged-in users should not visit auth pages.
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL(getDashboardRoute(role), request.url))
  }

  // Protect dashboard section.
  if (isDashboardRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isDashboardRoute && isAuthenticated) {
    const targetDashboard = getDashboardRoute(role)

    // /dashboard -> role landing page
    if (pathname === DASHBOARD_BASE) {
      return NextResponse.redirect(new URL(targetDashboard, request.url))
    }

    // Restrict direct dashboard child routes by role.
    const roleAllowedPrefixes: Record<string, string[]> = {
      ADMIN: ["/dashboard/admin-dashboard"],
      MODERATORS: ["/dashboard/moderator-dashboard"],
      USER: ["/dashboard/user-dashboard"],
    }

    const currentRole = role ?? "user"
    const allowed = roleAllowedPrefixes[currentRole] ?? roleAllowedPrefixes.user
    const canAccess = allowed.some(
      (allowedPrefix) =>
        pathname === allowedPrefix || pathname.startsWith(`${allowedPrefix}/`)
    )

    if (!canAccess) {
      return NextResponse.redirect(new URL(targetDashboard, request.url))
    }
  }

  // Keep common/public pages open.
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
