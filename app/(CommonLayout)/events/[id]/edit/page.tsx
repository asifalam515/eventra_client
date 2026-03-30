import EditEventForm from "@/components/CommoneComponents/Event/editEventForm"
import jwt, { JwtPayload } from "jsonwebtoken"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

type ApiEvent = {
  id?: string
  _id?: string
  title?: string
  name?: string
  description?: string
  date?: string
  time?: string
  venue?: string
  location?: string
  type?: string
  fee?: string | number
  isFeatured?: boolean
  creatorId?: string
  creator?: {
    id?: string
    _id?: string
  }
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "MODERATOR", "MODERATORS"])

function getUserFromToken(rawToken?: string) {
  if (!rawToken)
    return { id: null as string | null, role: null as string | null }

  try {
    const token = rawToken.replace(/^Bearer\s+/i, "").trim()
    const decoded = jwt.decode(token) as JwtPayload | null

    if (!decoded) return { id: null, role: null }

    return {
      id:
        (decoded.id as string) ||
        (decoded.userId as string) ||
        (decoded.sub as string) ||
        null,
      role:
        typeof decoded.role === "string" ? decoded.role.toUpperCase() : null,
    }
  } catch {
    return { id: null, role: null }
  }
}

function getOwnerId(event: ApiEvent) {
  return event.creatorId || event.creator?.id || event.creator?._id || null
}

async function getEventById(id: string): Promise<ApiEvent | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
      {
        cache: "no-store",
      }
    )

    if (!response.ok) return null

    const body = await response.json()
    return (body?.data ?? body) as ApiEvent
  } catch {
    return null
  }
}

function toDateInputValue(date?: string) {
  if (!date) return ""
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().split("T")[0]
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/login")
  }

  const event = await getEventById(id)
  if (!event) {
    notFound()
  }

  const currentUser = getUserFromToken(token)
  const ownerId = getOwnerId(event)
  const isAdmin = currentUser.role ? ADMIN_ROLES.has(currentUser.role) : false
  const isOwner = Boolean(
    currentUser.id && ownerId && currentUser.id === ownerId
  )

  if (!isAdmin && !isOwner) {
    return (
      <section className="w-full">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only the event owner, admin, or moderator can edit this event.
          </p>

          <div className="mt-5">
            <Link
              href={`/events/${id}`}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
            >
              Back to event
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full">
      <EditEventForm
        eventId={id}
        initialValues={{
          title: event.title || event.name || "",
          description: event.description || "",
          date: toDateInputValue(event.date),
          time: event.time || "",
          venue: event.venue || event.location || "",
          type: event.type || "",
          fee: String(event.fee ?? 0),
          isFeatured: Boolean(event.isFeatured),
        }}
      />
    </section>
  )
}
