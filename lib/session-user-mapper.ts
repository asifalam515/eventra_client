export type SessionUser = {
  id: string
  name: string
  email: string
  photo?: string
  role?: string
}

export function mapSessionUser(payload: Record<string, unknown>): SessionUser {
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
