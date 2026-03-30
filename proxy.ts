import jwt, { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"
const publicRoutes = ["/", "/login", "/signup", "/events", "/events/[id]"]
export async function proxy(request: NextRequest) {
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
  return NextResponse.next()
}
