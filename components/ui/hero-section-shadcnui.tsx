import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"
import type { HeroFeaturedEvent } from "./HeroContent"
import HeroContent from "./HeroContent"

interface ApiEvent {
  id?: string
  _id?: string
  name?: string
  title?: string
  description?: string
  date?: string
  location?: string
  venue?: string
  eventStatus?: string
  status?: string
  visibility?: string
  isPublic?: boolean
  public?: boolean
  isFeatured?: boolean
  eventType?: string
  type?: string
  organizer?: { name?: string }
  creator?: { name?: string }
  host?: { name?: string }
  createdBy?: { name?: string }
  fee?: string | number
  attendees?: number | string
}

const HERO_FALLBACK_EVENT: HeroFeaturedEvent = {
  id: "",
  title: "Explore Upcoming Events",
  date: "Date to be announced",
  location: "Online & In-person",
  description:
    "Discover public events curated by the community and secure your spot early.",
  organizer: "Eventra",
  feeLabel: "Public Event",
  priceLabel: "Free",
  attendeesLabel: "Open",
}

function normalizeEnum(value?: string) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
}

function isPublicEvent(event: ApiEvent) {
  if (typeof event.isPublic === "boolean") return event.isPublic
  if (typeof event.public === "boolean") return event.public

  const type = normalizeEnum(event.type ?? event.eventType)
  if (type) return type === "PUBLIC"

  const visibility = normalizeEnum(event.visibility)
  if (!visibility) return true

  return visibility === "PUBLIC"
}

function toDisplayDate(value?: string) {
  if (!value) return "Date to be announced"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function parseFee(value?: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value !== "string") return 0

  const normalized = value.replace(/,/g, "")
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function toHeroFeaturedEvent(event: ApiEvent): HeroFeaturedEvent | null {
  const id = String(event.id ?? event._id ?? "").trim()
  if (!id) return null

  const feeAmount = parseFee(event.fee)
  const isPaid = feeAmount > 0

  return {
    id,
    title: event.name || event.title || "Untitled Event",
    date: toDisplayDate(event.date),
    location: event.venue || event.location || "Location to be announced",
    description:
      event.description || "No description available for this featured event.",
    organizer:
      event.organizer?.name ||
      event.creator?.name ||
      event.host?.name ||
      event.createdBy?.name ||
      "Event Host",
    feeLabel: isPaid ? "Paid Event" : "Free Event",
    priceLabel: isPaid ? `$${feeAmount}` : "Free",
    attendeesLabel:
      event.attendees !== undefined && event.attendees !== null
        ? String(event.attendees)
        : "Open",
  }
}

async function getHeroFeaturedEvent(): Promise<HeroFeaturedEvent> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
      cache: "no-store",
    })

    if (!response.ok) return HERO_FALLBACK_EVENT

    const body = await response.json()
    const events = Array.isArray(body?.data) ? (body.data as ApiEvent[]) : []

    const normalizedEvents = events.filter((event) => {
      const status = normalizeEnum(event.eventStatus || event.status)
      const isAvailable = status === "AVAILABLE" || status === "UPCOMING"
      return isAvailable && isPublicEvent(event)
    })

    const featured = normalizedEvents.find((event) => event.isFeatured)
    const selectedEvent = featured || normalizedEvents[0]

    return toHeroFeaturedEvent(selectedEvent) || HERO_FALLBACK_EVENT
  } catch {
    return HERO_FALLBACK_EVENT
  }
}

export async function HeroSection() {
  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)
  const isAuthenticated = Boolean(token)
  const featuredEvent = await getHeroFeaturedEvent()
  const eventPath = featuredEvent.id ? `/events/${featuredEvent.id}` : "/events"
  const ctaHref = isAuthenticated
    ? eventPath
    : `/login?redirect=${encodeURIComponent(eventPath)}`

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-32">
      {/* Premium SaaS Background Glow & Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      {/* Hero Content */}
      <HeroContent featuredEvent={featuredEvent} ctaHref={ctaHref} />
    </section>
  )
}
