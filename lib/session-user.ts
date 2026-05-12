import { SessionUser, mapSessionUser } from "@/lib/session-user-mapper"
import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

export type { SessionUser } from "@/lib/session-user-mapper"

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

    return mapSessionUser(data)
  } catch {
    return null
  }
}
