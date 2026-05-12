import ChatAssistant from "@/components/CommoneComponents/AIChat/chat-assistant"
import { CallToAction } from "@/components/ui/cta-3"
import { HeroSection } from "@/components/ui/hero-section-shadcnui"
import HomeEventsSlider, {
  type HomeEventSlide,
} from "@/components/ui/home-events-slider"
import PlatformReviewsSection from "@/components/ui/platform-reviews-section"
import UpcomingEventsSection from "@/components/ui/upcoming-events-section"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import {
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight,
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <HeroSection />
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-32 pb-32">
        {/* Featured Events Section */}
        <ScrollReveal>
          <section className="relative mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-semibold tracking-tight text-foreground text-balance">
                  Trending experiences
                </h2>
                <p className="mt-4 text-lg text-muted-foreground text-balance">
                  Discover the most highly anticipated events happening around you.
                </p>
              </div>
              <Link
                href="/events"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                Explore all events
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mx-auto w-full">
              <HomeEventsSlider events={eventList} />
            </div>
          </section>
        </ScrollReveal>

        {/* AI Assistant Section */}
        <ScrollReveal>
          <section className="space-y-6">
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
        </ScrollReveal>

        {/* Services Bento Grid */}
        <ScrollReveal>
          <section className="relative">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance mb-6">
                Everything you need to host and attend
              </h2>
              <p className="text-lg text-muted-foreground text-balance">
                A complete toolkit designed for modern event organizers and passionate attendees.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {serviceCards.map((service, idx) => {
                const Icon = service.icon
                return (
                  <Link
                    key={service.title}
                    href={service.href}
                    className={`group relative overflow-hidden rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/20 dark:hover:shadow-black/40 hover:-translate-y-1 ${idx === 0 || idx === 3 ? "lg:col-span-2" : "lg:col-span-1"}`}
                  >
                    <div className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
                      <Icon className="size-6 text-foreground" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                      {service.description}
                    </p>
                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {service.metric}
                      </span>
                      <div className="size-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 bg-white dark:bg-zinc-800">
                        <ArrowRight className="size-4" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        </ScrollReveal>

        {/* Upcoming List Section */}
        <ScrollReveal>
          <section className="space-y-6">
            <UpcomingEventsSection />
          </section>
        </ScrollReveal>

        {/* Reviews Section */}
        <ScrollReveal>
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  What people say
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Hear from our vibrant community of hosts and attendees.
                </p>
              </div>
            </div>
            <PlatformReviewsSection />
          </section>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal>
          <section className="relative">
            <div className="relative overflow-hidden rounded-[3rem] bg-zinc-900 px-6 py-24 sm:px-16 sm:py-32 lg:px-24 text-center shadow-2xl">
              {/* Ambient Background */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-indigo-900/40 to-black/80 z-10" />
              <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                 <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[128px]" />
                 <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[128px]" />
              </div>

              <div className="relative z-20">
                <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl text-balance">
                  Ready to create your next unforgettable experience?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-300 text-balance">
                  Join thousands of organizers and attendees on the most elegant event platform.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
                  <Link
                    href="/create-event"
                    className="rounded-full bg-white px-8 py-4 text-sm font-bold text-zinc-900 shadow-xl hover:bg-zinc-100 hover:scale-105 transition-all duration-300"
                  >
                    Create Event Now
                  </Link>
                  <Link href="/events" className="text-sm font-semibold leading-6 text-white flex items-center gap-2 group hover:text-zinc-300 transition-colors">
                    Explore Events <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>
    </div>
  )
}

export default page
