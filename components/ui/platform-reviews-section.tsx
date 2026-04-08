import {
  CalendarDays,
  MessageSquareText,
  Sparkles,
  Star,
  Users,
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

interface PlatformReview {
  id: string
  rating: number
  comment: string
  createdAt?: string
  userName: string
  userPhoto?: string | null
  eventTitle?: string
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2)

  if (parts.length === 0) return "EV"

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("")
}

function extractResponseData(payload: JsonRecord) {
  const nested = (payload.data as JsonRecord | undefined) ?? undefined

  const avgReview = Number(payload.avgReview ?? nested?.avgReview ?? 0)
  const reviewCount = Number(payload.reviewCount ?? nested?.reviewCount ?? 0)

  const reviewsCandidate =
    payload.reviews ??
    nested?.reviews ??
    (Array.isArray(payload.data) ? payload.data : undefined)

  const reviewArray = Array.isArray(reviewsCandidate) ? reviewsCandidate : []

  const reviews = reviewArray
    .map<PlatformReview | null>((item) => {
      if (!item || typeof item !== "object") return null

      const source = item as JsonRecord
      const user = (source.user as JsonRecord | undefined) ?? undefined
      const event = (source.event as JsonRecord | undefined) ?? undefined

      const id = String(source.id ?? source._id ?? "")
      if (!id) return null

      const rawRating = Number(source.rating ?? 0)

      return {
        id,
        rating: Number.isFinite(rawRating)
          ? Math.max(1, Math.min(5, rawRating))
          : 1,
        comment: String(source.comment ?? "").trim(),
        createdAt: String(source.createdAt ?? "") || undefined,
        userName:
          String(user?.name ?? source.userName ?? "").trim() || "Anonymous",
        userPhoto:
          user?.photo === null
            ? null
            : String(user?.photo ?? "").trim() || undefined,
        eventTitle:
          String(event?.title ?? source.eventTitle ?? "") || undefined,
      }
    })
    .filter((item): item is PlatformReview => item !== null)

  return {
    avgReview: Number.isFinite(avgReview) ? avgReview : 0,
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : reviews.length,
    reviews,
  }
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.round(rating)

    return (
      <Star
        key={`${rating}-${index}`}
        className={`h-4 w-4 ${filled ? "fill-amber-400 text-amber-500" : "text-slate-300"}`}
      />
    )
  })
}

export default async function PlatformReviewsSection() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/review`, {
    cache: "no-store",
  })

  const payload = await parseJsonSafe(response)
  const { avgReview, reviewCount, reviews } = extractResponseData(payload)

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-rose-50/80 via-background to-orange-50/70 p-6 shadow-[0_20px_65px_-32px_rgba(0,0,0,0.45)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-rose-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/60 bg-rose-100/75 px-3 py-1 text-xs font-semibold tracking-[0.15em] text-rose-800 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Platform Voice
            </span>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                What People Say About Eventra
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Live community feedback from your platform-level reviews
                endpoint.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/75 p-4 backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Community Rating
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-3xl leading-none font-black text-foreground">
                {avgReview > 0 ? avgReview.toFixed(1) : "0.0"}
              </span>
              <span className="pb-1 text-sm font-medium text-muted-foreground">
                / 5
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {renderStars(avgReview)}
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              {reviewCount} total review{reviewCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <article
                key={review.id}
                className="group rounded-2xl border border-border/70 bg-background/85 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-rose-300/60 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {review.userPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.userPhoto}
                        alt={review.userName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-rose-500/20 to-orange-500/20 text-xs font-bold text-foreground">
                        {getInitials(review.userName)}
                      </div>
                    )}

                    <div>
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">
                        {review.userName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {review.rating.toFixed(1)}
                  </span>
                </div>

                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                  {review.comment || "No comment added."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
                    {review.eventTitle
                      ? `Event: ${review.eventTitle}`
                      : "General platform feedback"}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="sm:col-span-2 xl:col-span-3">
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-foreground">
                  Reviews will appear here soon.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once users submit feedback, this section updates
                  automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4 text-rose-700" />
            Trusted by active organizers and attendees
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg border border-foreground/20 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-foreground/35"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Explore events & leave a review
          </Link>
        </div>
      </div>
    </section>
  )
}
