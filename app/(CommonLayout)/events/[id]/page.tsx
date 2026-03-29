import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Tag,
  Users,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

type EventStatus = "upcoming" | "ongoing" | "completed"

interface ApiEvent {
  id?: string
  _id?: string
  name?: string
  title?: string
  description?: string
  date?: string
  time?: string
  location?: string
  venue?: string
  eventStatus?: EventStatus | string
  fee?: string | number
  review?: number
  type?: string
  attendees?: number
}

interface EventDetails {
  id: string
  name: string
  description: string
  date?: string
  time?: string
  venue?: string
  eventStatus: EventStatus
  fee?: string | number
  review?: number
  type?: string
  attendees?: number
}

const statusConfig: Record<EventStatus, { label: string; color: string }> = {
  upcoming: {
    label: "Upcoming",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  ongoing: {
    label: "Ongoing",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  completed: {
    label: "Completed",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
}

const normalizeStatus = (value?: string): EventStatus => {
  if (value === "upcoming" || value === "ongoing" || value === "completed") {
    return value
  }

  return "upcoming"
}

const normalizeEvent = (event: ApiEvent): EventDetails | null => {
  const id = event.id || event._id
  if (!id) return null

  return {
    id,
    name: event.name || event.title || "Untitled Event",
    description: event.description || "No description provided for this event.",
    date: event.date,
    time: event.time,
    venue: event.venue || event.location,
    eventStatus: normalizeStatus(event.eventStatus),
    fee: event.fee,
    review: event.review,
    type: event.type,
    attendees: event.attendees,
  }
}

const formatFee = (fee?: string | number) => {
  if (fee === undefined || fee === null || fee === "") return "Free"
  if (typeof fee === "number") return `$${fee}`
  return fee
}

const formatDate = (date?: string) => {
  if (!date) return "Date not announced"

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

async function getEventById(id: string): Promise<EventDetails | null> {
  try {
    const detailResponse = await fetch(
      `http://localhost:5000/api/v1/events/${id}`,
      {
        cache: "no-store",
      }
    )

    if (detailResponse.ok) {
      const detailData = await detailResponse.json()
      const normalized = normalizeEvent(detailData?.data ?? detailData)
      if (normalized) return normalized
    }
  } catch {
    // Continue to list fallback when detail endpoint is unavailable.
  }

  try {
    const listResponse = await fetch("http://localhost:5000/api/v1/events", {
      cache: "no-store",
    })

    if (!listResponse.ok) return null

    const listData = await listResponse.json()
    const list = Array.isArray(listData?.data) ? listData.data : []
    const matched = list.find(
      (item: ApiEvent) => item.id === id || item._id === id
    )

    return matched ? normalizeEvent(matched) : null
  } catch {
    return null
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  const status = statusConfig[event.eventStatus]

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />

        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${status.color}`}
            >
              {status.label}
            </span>
            {event.type && (
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                {event.type}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {event.name}
          </h1>

          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            {event.description}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground uppercase">
                <Calendar className="size-3.5" />
                Date
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(event.date)}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground uppercase">
                <Clock className="size-3.5" />
                Time
              </div>
              <p className="text-sm font-medium text-foreground">
                {event.time || "To be announced"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground uppercase">
                <MapPin className="size-3.5" />
                Venue
              </div>
              <p className="text-sm font-medium text-foreground">
                {event.venue || "Location not specified"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground uppercase">
                <DollarSign className="size-3.5" />
                Fee
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatFee(event.fee)}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground uppercase">
                <Users className="size-3.5" />
                Attendees
              </div>
              <p className="text-sm font-medium text-foreground">
                {event.attendees ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground uppercase">
                <Star className="size-3.5" />
                Rating
              </div>
              <p className="text-sm font-medium text-foreground">
                {event.review ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/events">Back to Events</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/dashboard">
                <Tag className="size-4" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
