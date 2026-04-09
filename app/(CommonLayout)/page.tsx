import ChatAssistant from "@/components/CommoneComponents/AIChat/chat-assistant"
import { CallToAction } from "@/components/ui/cta-3"
import { HeroSection } from "@/components/ui/hero-section-shadcnui"
import HomeEventsSlider, {
  type HomeEventSlide,
} from "@/components/ui/home-events-slider"
import PlatformReviewsSection from "@/components/ui/platform-reviews-section"
import UpcomingEventsSection from "@/components/ui/upcoming-events-section"
import {
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
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

type JsonRecord = Record<string, unknown>

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

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value)
}

async function parseJsonSafe(response: Response): Promise<JsonRecord> {
  try {
    return (await response.json()) as JsonRecord
  } catch {
    return {}
  }
}

const page = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
    cache: "no-store",
  })

  const events = await parseJsonSafe(response)
  const allEvents: Event[] = Array.isArray(events?.data)
    ? (events.data as Event[])
    : []
  const publicEvents = allEvents.filter((event: Event) => isPublicEvent(event))
  const availablePublicEvents = publicEvents.filter((event: Event) => {
    const status = normalizeEnum(event.eventStatus || event.status)
    return status === "AVAILABLE" || status === "UPCOMING"
  })

  const paidPublicEvents = publicEvents.filter((event: Event) => {
    const numericFee = Number(event.fee ?? 0)
    return Number.isFinite(numericFee) && numericFee > 0
  })

  const hostCount = new Set(
    publicEvents
      .map(
        (event: Event) =>
          event.organizer?.name ||
          event.creator?.name ||
          event.host?.name ||
          event.createdBy?.name
      )
      .filter(Boolean)
  ).size

  const ratedEvents = publicEvents.filter(
    (event: Event) => typeof event.review === "number" && event.review > 0
  )
  const averageRating = ratedEvents.length
    ? ratedEvents.reduce((sum, event) => sum + Number(event.review ?? 0), 0) /
      ratedEvents.length
    : 0

  const eventList: HomeEventSlide[] = allEvents
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

  const serviceCards = [
    {
      title: "Event Discovery",
      description:
        "Search and join verified public experiences curated from active events.",
      metric: `${formatCompactNumber(availablePublicEvents.length)} active events`,
      href: "/events",
      icon: CalendarDays,
    },
    {
      title: "Paid Ticketing",
      description:
        "Secure checkout for premium events with transparent pricing and flow.",
      metric: `${formatCompactNumber(paidPublicEvents.length)} paid events`,
      href: "/events",
      icon: CreditCard,
    },
    {
      title: "Trusted Hosts",
      description:
        "Create and attend with confidence through organizer-based identity context.",
      metric: `${formatCompactNumber(hostCount)} unique hosts`,
      href: "/create-event",
      icon: ShieldCheck,
    },
    {
      title: "Community Quality",
      description:
        "Feedback and participation signals help surface consistently better events.",
      metric:
        averageRating > 0
          ? `${averageRating.toFixed(1)} average rating`
          : "Fresh reviews incoming",
      href: "/events",
      icon: Users,
    },
  ]

  return (
    <div className="space-y-12">
      <HeroSection />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Ask the AI Event Assistant
            </h2>
            <p className="mt-1 text-muted-foreground">
              Get personalized recommendations based on live event data.
            </p>
          </div>
        </div>

        <ChatAssistant />
      </section>

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

      <UpcomingEventsSection />
      <PlatformReviewsSection />

      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-amber-50/90 via-background to-cyan-50/80 p-6 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.45)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-100/70 px-3 py-1 text-xs font-semibold tracking-widest text-amber-700 uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Eventra Services
              </span>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Built-in services for premium event journeys
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  From discovery to payment and participation, every flow is
                  connected to live data in your event ecosystem.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Explore dashboard services
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {serviceCards.map((service) => {
              const Icon = service.icon

              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group rounded-2xl border border-border/70 bg-background/80 p-5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Service
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-foreground">
                        {service.title}
                      </h3>
                    </div>
                    <span className="rounded-lg border border-border/80 bg-secondary/60 p-2 text-foreground transition group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  <p className="mt-5 inline-flex rounded-lg border border-cyan-400/40 bg-cyan-100/70 px-3 py-1 text-sm font-semibold text-cyan-800">
                    {service.metric}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default page
