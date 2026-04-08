import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react"
import Link from "next/link"

type JsonRecord = Record<string, unknown>

async function parseJsonSafe(response: Response): Promise<JsonRecord> {
  try {
    return (await response.json()) as JsonRecord
  } catch {
    return {}
  }
}

interface UpcomingEvent {
  id?: string
  _id?: string
  name?: string
  title?: string
  description?: string
  date?: string
  location?: string
  venue?: string
  fee?: string | number
  eventStatus?: string
  status?: string
  organizer?: { name?: string }
  creator?: { name?: string }
  host?: { name?: string }
  createdBy?: { name?: string }
}

function formatEventDate(value?: string) {
  if (!value) return "Date will be announced"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function parseFee(value?: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value !== "string") return 0

  const normalized = value.replace(/,/g, "")
  const match = normalized.match(/\d+(?:\.\d+)?/)
  if (!match) return 0

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : 0
}

function getFeeLabel(value?: string | number) {
  const fee = parseFee(value)

  if (fee <= 0) {
    return {
      text: "Free Entry",
      className: "border-emerald-300/60 bg-emerald-500/10 text-emerald-700",
    }
  }

  return {
    text: `$${fee.toFixed(0)} ticket`,
    className: "border-amber-300/60 bg-amber-500/10 text-amber-700",
  }
}

export default async function UpcomingEventsSection() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events/upcoming`,
    {
      cache: "no-store",
    }
  )

  const payload = await parseJsonSafe(response)
  const events: UpcomingEvent[] = payload?.data ?? []

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-cyan-50/80 via-background to-amber-50/70 p-6 shadow-[0_18px_65px_-30px_rgba(0,0,0,0.4)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-cyan-100/70 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-cyan-800 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Upcoming Collection
            </span>

            <div>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                All Upcoming Events
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Discover every upcoming experience from your live Eventra API,
                curated with premium cards for faster selection.
              </p>
            </div>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur transition hover:border-foreground/30 hover:bg-background"
          >
            Browse event directory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const eventId = String(event.id ?? event._id ?? "")
              const eventTitle = event.name || event.title || "Untitled Event"
              const organizerName =
                event.organizer?.name ||
                event.creator?.name ||
                event.host?.name ||
                event.createdBy?.name ||
                "Event Host"
              const fee = getFeeLabel(event.fee)
              const venue =
                event.venue || event.location || "Venue to be confirmed"

              if (!eventId) return null

              return (
                <article
                  key={eventId}
                  className="group relative rounded-2xl border border-border/70 bg-background/85 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-cyan-500/0 via-cyan-500/0 to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-foreground">
                        {eventTitle}
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${fee.className}`}
                      >
                        {fee.text}
                      </span>
                    </div>

                    {event.description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    ) : null}

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/35 px-3 py-2">
                        <CalendarDays className="h-4 w-4 text-cyan-700" />
                        <span className="font-medium text-foreground">
                          {formatEventDate(event.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/35 px-3 py-2">
                        <MapPin className="h-4 w-4 text-cyan-700" />
                        <span className="truncate font-medium text-foreground">
                          {venue}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/35 px-3 py-2">
                        <UserRound className="h-4 w-4 text-cyan-700" />
                        <span className="truncate font-medium text-foreground">
                          Host: {organizerName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                        <Ticket className="h-3.5 w-3.5" />
                        Upcoming
                      </span>

                      <Link
                        href={`/events/${eventId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition hover:opacity-90"
                      >
                        View details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-foreground">
              No upcoming events found right now.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              New events will appear here as soon as they are scheduled.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
