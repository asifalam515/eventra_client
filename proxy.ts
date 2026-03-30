import jwt, { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"
const publicRoutes = ["/", "/login", "/signup", "/events", "/events/[id]"]
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value
  let userRole = null
  if (token) {
    try {
      const decode = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY as string
      ) as JwtPayload
      userRole = decode.role as string
      console.log(userRole)
    } catch (error) {
      const res = NextResponse.redirect(new URL("/login", request.url))
      res.cookies.delete("token")
      return res
    }
  }
  if (token && ["/login", "/signup"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))
  if (!isPublic && !token) {
    return NextResponse.redirect("/login")
  }

  //role based access control
  //  admin =? /admin-dashboard
  // user =? /user-dashboard
  // moderator =? /moderator-dashboard
  const roleGroup = {
    admin: ["admin-dashboard"],
    user: ["user-dashboard", "events", "events/[id]", "/profile"],
    moderator: ["moderator-dashboard"],
  }

  for (const role in roleGroup) {
    if (roleGroup[role].some((path) => pathname.startsWith(path))) {
      if (userRole !== role) {
        const targetDashboardRoute = getDashboard(userRole)
        if (pathname !== targetDashboardRoute) {
          return NextResponse.redirect(
            new URL(targetDashboardRoute, request.url)
          )
        }
      }
    }
  }

  return NextResponse.next()
}
function getDashboard(role: string | null) {
  if (role == "admin") return "/admin-dashboard"
  if (role == "driver") return "/driver-dashboard"
  return "/dashboard"
}
