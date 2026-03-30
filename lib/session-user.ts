import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

export type SessionUser = {
  id: string
  name: string
  email: string
  photo?: string
  role?: string
}

function mapUser(payload: Record<string, unknown>): SessionUser {
  const id =
    String(payload.id ?? payload._id ?? payload.userId ?? payload.sub ?? "") ||
    ""

  const name =
    String(
      payload.name ??
        payload.fullName ??
        payload.username ??
        payload.userName ??
        "User"
    ) || "User"

  const email = String(payload.email ?? "") || ""
  const photo =
    String(payload.photo ?? payload.avatar ?? payload.image ?? "") || undefined
  const role =
    String(payload.role ?? payload.userRole ?? "USER").toUpperCase() || "USER"

  return { id, name, email, photo, role }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) return null

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      cache: "no-store",
    })

    if (!response.ok) return null

    const body = (await response.json()) as Record<string, unknown>
    const data =
      (body?.data as Record<string, unknown> | undefined) ??
      (body?.user as Record<string, unknown> | undefined) ??
      body

    if (!data || typeof data !== "object") return null

    return mapUser(data)
  } catch {
    return null
  }
}
