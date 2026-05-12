import { getParticipationsByEventIdAction } from "@/actions/participation"
import { getEventReviewsByEventIdAction } from "@/actions/review"
import DeleteEventButton from "@/components/CommoneComponents/Event/deleteEventButton"
import EventInvoiceActions from "@/components/CommoneComponents/Event/event-invoice-actions"
import EventReviewsSection from "@/components/CommoneComponents/Event/event-reviews-section"
import InvitationSendForm from "@/components/CommoneComponents/Event/invitation-send-form"
import JoinEventButton from "@/components/CommoneComponents/Event/joinEventButton"
import PaidEventCheckoutButton from "@/components/CommoneComponents/Event/paidEventCheckoutButton"
import ParticipantsList from "@/components/CommoneComponents/Event/participantsList"
import ReviewForm from "@/components/CommoneComponents/Event/review-form"
import { Button } from "@/components/ui/button"
import jwt, { JwtPayload } from "jsonwebtoken"
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Star,
  Tag,
  Users,
  ShieldCheck,
} from "lucide-react"
import { cookies } from "next/headers"
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
  creatorId?: string
  creator?: {
    id?: string
    _id?: string
  }
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
  creatorId?: string
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "MODERATOR", "MODERATORS"])

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
  const normalized = value?.toLowerCase()

  if (
    normalized === "upcoming" ||
    normalized === "ongoing" ||
    normalized === "completed"
  ) {
    return normalized
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
    creatorId: event.creatorId || event.creator?.id || event.creator?._id,
  }
}

const formatFee = (fee?: string | number) => {
  if (fee === undefined || fee === null || fee === "") return "Free"
  if (typeof fee === "number") return `$${fee}`
  return fee
}

const getFeeAmount = (fee?: string | number) => {
  if (typeof fee === "number") return fee
  if (typeof fee === "string") {
    const parsed = Number(fee)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
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
      `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
      {
        next: { revalidate: 300 },
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
    const listResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events`,
      {
        next: { revalidate: 300 },
      }
    )

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

export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
      next: { revalidate: 300 },
    })
    if (!response.ok) return []
    const data = await response.json()
    const events = Array.isArray(data?.data) ? data.data : []
    
    // Pre-render the top 20 upcoming events at build time
    return events.slice(0, 20).map((event: any) => ({
      id: String(event.id || event._id),
    }))
  } catch (error) {
    console.error("Failed to generate static params for events:", error)
    return []
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, participations, reviewsResult] = await Promise.all([
    getEventById(id),
    getParticipationsByEventIdAction(id),
    getEventReviewsByEventIdAction(id),
  ])

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  const isAuthenticated = Boolean(token)

  let currentUserId: string | null = null
  let currentUserRole: string | null = null

  if (token) {
    try {
      const normalizedToken = token.replace(/^Bearer\s+/i, "").trim()
      const decoded = jwt.decode(normalizedToken) as JwtPayload | null
      if (decoded) {
        currentUserId =
          (decoded.id as string) ||
          (decoded.userId as string) ||
          (decoded.sub as string) ||
          null
        currentUserRole =
          typeof decoded.role === "string" ? decoded.role.toUpperCase() : null
      }
    } catch {
      // Keep anonymous defaults when token decoding fails.
    }
  }

  if (!event) {
    notFound()
  }

  const status = statusConfig[event.eventStatus]
  const feeAmount = getFeeAmount(event.fee)
  const isPaidEvent = feeAmount > 0
  const canManage =
    (currentUserRole ? ADMIN_ROLES.has(currentUserRole) : false) ||
    Boolean(
      currentUserId && event.creatorId && currentUserId === event.creatorId
    )
  const isEventHost = Boolean(
    currentUserId && event.creatorId && currentUserId === event.creatorId
  )
  const isApprovedParticipant = Boolean(
    currentUserId &&
    participations.some(
      (item) =>
        item.userId === currentUserId &&
        item.status?.trim().toUpperCase() === "APPROVED"
    )
  )
  const currentUserParticipation = participations.find(
    (item) => item.userId === currentUserId
  )
  const currentUserPaymentStatus =
    currentUserParticipation?.payment?.trim().toUpperCase() || ""
  const hasPaidForEvent = Boolean(
    currentUserParticipation &&
    (currentUserPaymentStatus === "PAID" || currentUserParticipation.paymentId)
  )
  const eventPath = `/events/${event.id}`
  const loginForEventHref = `/login?redirect=${encodeURIComponent(eventPath)}`
  const dashboardHref = isAuthenticated
    ? "/dashboard"
    : "/login?redirect=%2Fdashboard"

  return (
    <section className="w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24">
      {/* Ambient Hero Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-indigo-900/40 to-black/80 z-10" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
           {/* We would put an event cover image here, but since we don't have one, we use an elegant noise/mesh pattern */}
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent z-20" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-30 -mt-20 md:-mt-32">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Main Details */}
          <div className="flex-1 w-full space-y-8">
            <div className="rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 p-6 sm:p-10 shadow-sm backdrop-blur-xl">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase ${status.color}`}
                >
                  {status.label}
                </span>
                {event.type && (
                  <span className="rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-foreground">
                    {event.type}
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
                {event.name}
              </h1>

              <div className="mt-8 flex flex-col gap-6 border-y border-zinc-200/60 dark:border-zinc-800/60 py-8">
                 <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-foreground">
                       <Calendar className="size-5" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-foreground">{formatDate(event.date)}</p>
                       <p className="text-sm text-muted-foreground">{event.time || "Time to be announced"}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-foreground">
                       <MapPin className="size-5" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-foreground">{event.venue || "Location not specified"}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">About this event</h2>
                <p className="max-w-3xl leading-relaxed text-muted-foreground text-lg whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Participants Section */}
            <ParticipantsList
              eventId={event.id}
              canManage={canManage}
              initialParticipations={participations}
            />

            {/* Reviews Section */}
            <div className="rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 p-6 sm:p-10 shadow-sm backdrop-blur-xl">
              <EventReviewsSection
                reviews={reviewsResult.data}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />

              {event.eventStatus === "completed" && isApprovedParticipant && (
                <div className="mt-8 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-8">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground mb-4">Leave a Review</h3>
                  <ReviewForm eventId={event.id} />
                </div>
              )}

              {event.eventStatus === "completed" && !isApprovedParticipant && (
                <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 text-center text-sm text-muted-foreground">
                  Only approved participants of this completed event can submit a review.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Ticket Action Card */}
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 p-6 shadow-xl shadow-zinc-200/40 dark:shadow-black/40">
              <div className="mb-6 text-center">
                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Ticket Price</p>
                 <p className="text-4xl font-bold tracking-tight text-foreground">{formatFee(event.fee)}</p>
              </div>

              <div className="space-y-4">
                {isPaidEvent ? (
                  isAuthenticated ? (
                    hasPaidForEvent ? (
                      <Button variant="secondary" className="w-full h-14 rounded-2xl text-base" disabled>
                        <CheckCircle2 className="size-5 mr-2" /> Already Paid
                      </Button>
                    ) : (
                      <div className="w-full [&>button]:h-14 [&>button]:w-full [&>button]:rounded-2xl [&>button]:text-base">
                         <PaidEventCheckoutButton
                           eventId={event.id}
                           amountLabel={formatFee(event.fee)}
                         />
                      </div>
                    )
                  ) : (
                    <Button asChild className="w-full h-14 rounded-2xl text-base bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link href={loginForEventHref}>
                        <DollarSign className="size-5 mr-2" /> Pay {formatFee(event.fee)}
                      </Link>
                    </Button>
                  )
                ) : isAuthenticated ? (
                  <div className="w-full [&>button]:h-14 [&>button]:w-full [&>button]:rounded-2xl [&>button]:text-base [&>button]:bg-foreground [&>button]:text-background hover:[&>button]:bg-foreground/90">
                     <JoinEventButton eventId={event.id} />
                  </div>
                ) : (
                  <Button asChild className="w-full h-14 rounded-2xl text-base bg-foreground hover:bg-foreground/90 text-background">
                    <Link href={loginForEventHref}>
                      <Users className="size-5 mr-2" /> Join Event
                    </Link>
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3 pt-4">
                  {canManage && (
                    <Button asChild variant="outline" className="h-12 rounded-xl">
                      <Link href={`/events/${event.id}/edit`}>Edit</Link>
                    </Button>
                  )}
                  {canManage && <DeleteEventButton eventId={event.id} />}
                </div>
                
                <Button asChild variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground">
                  <Link href={dashboardHref}>
                    View Dashboard
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex justify-center">
                 <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <span>{event.review ? `${event.review} average rating` : "No ratings yet"}</span>
                    <span className="mx-2 w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <Users className="size-4" />
                    <span>{participations.length || event.attendees || 0} attending</span>
                 </div>
              </div>
            </div>

            {currentUserParticipation && (
              <div className="rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 p-5 backdrop-blur-xl">
                <EventInvoiceActions
                  participantId={currentUserParticipation.id}
                  paymentId={currentUserParticipation.paymentId}
                />
              </div>
            )}

            {isEventHost && (
              <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                   <ShieldCheck className="size-4 text-primary" /> Host Tools
                </h3>
                <InvitationSendForm eventId={event.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
