import { CallToAction } from "@/components/ui/cta-3"
import { HeroSection } from "@/components/ui/hero-section-shadcnui"
import HomeEventsSlider, {
  type HomeEventSlide,
} from "@/components/ui/home-events-slider"
import Link from "next/link"

interface Event {
  id: string
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
  eventType?: string
  organizer?: { name?: string }
  creator?: { name?: string }
  host?: { name?: string }
  createdBy?: { name?: string }
  fee?: string | number
  review?: number
  type?: string
  attendees?: number
}

function normalizeEnum(value?: string) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
}

function isPublicEvent(event: Event) {
  if (typeof event.isPublic === "boolean") return event.isPublic
  if (typeof event.public === "boolean") return event.public

  const type = normalizeEnum(event.type ?? event.eventType)
  if (type) {
    return type === "PUBLIC"
  }

  const visibility = normalizeEnum(event.visibility)

  if (!visibility) return true

  return visibility === "PUBLIC"
}

const page = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
    cache: "no-store",
  })

  const events = await response.json()
  const eventList: HomeEventSlide[] = (events?.data ?? [])
    .filter((event: Event) => {
      const status = normalizeEnum(event.eventStatus || event.status)
      return (
        (status === "AVAILABLE" || status === "UPCOMING") &&
        isPublicEvent(event)
      )
    })
    .slice(0, 9)
    .map((event: Event) => ({
      id: String(event.id ?? event._id ?? ""),
      title: event.name || event.title || "Untitled Event",
      date: event.date,
      organizer:
        event.organizer?.name ||
        event.creator?.name ||
        event.host?.name ||
        event.createdBy?.name ||
        "Event Host",
      fee: event.fee,
    }))
    .filter((event: HomeEventSlide) => Boolean(event.id))

  return (
    <div className="space-y-12">
      <HeroSection />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Featured Events on Home
            </h2>
            <p className="mt-1 text-muted-foreground">
              Swipe through upcoming public events directly from the homepage.
            </p>
          </div>

          <Link
            href="/events"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            View all events
          </Link>
        </div>

        <HomeEventsSlider events={eventList} />
        <CallToAction></CallToAction>
      </section>
    </div>
  )
}

export default page
