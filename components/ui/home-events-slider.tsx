"use client"

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

export type HomeEventSlide = {
  id: string
  title: string
  date?: string
  organizer?: string
  fee?: string | number
}

function formatDate(value?: string) {
  if (!value) return "Date TBD"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function parseFee(value?: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value !== "string") return 0

  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/)
  if (!match) return 0

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : 0
}

function getFeeBadge(value?: string | number) {
  const fee = parseFee(value)

  if (fee <= 0) {
    return {
      label: "Free",
      className: "border-emerald-300/60 bg-emerald-500/10 text-emerald-700",
    }
  }

  return {
    label: `Paid $${fee.toFixed(0)}`,
    className: "border-amber-300/60 bg-amber-500/10 text-amber-700",
  }
}

export default function HomeEventsSlider({
  events,
}: {
  events: HomeEventSlide[]
}) {
  const slides = useMemo(() => events.slice(0, 9), [events])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const canGoPrevious = activeIndex > 0
  const canGoNext = activeIndex < Math.max(slides.length - 1, 0)

  const goPrevious = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0))
  }

  const goNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, Math.max(slides.length - 1, 0)))
  }

  useEffect(() => {
    if (slides.length <= 1 || isHovered) return

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [slides.length, isHovered])

  if (slides.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300/60 bg-slate-100/40 px-6 py-10 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
        No AVAILABLE PUBLIC events are available right now.
      </div>
    )
  }

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-white via-slate-50 to-cyan-50 p-4 shadow-xl shadow-cyan-100/30 sm:p-6 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/30 dark:shadow-cyan-950/10"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-linear-to-r from-white via-white/50 to-transparent dark:from-slate-950 dark:via-slate-950/45" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-linear-to-l from-cyan-50 via-cyan-50/45 to-transparent dark:from-cyan-950/30 dark:via-cyan-950/20" />

      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700 uppercase dark:text-cyan-300">
            Upcoming Public Events
          </p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            What&apos;s Happening Next
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrevious}
            disabled={!canGoPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            aria-label="Previous event"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-800 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:border-cyan-400/40 dark:bg-cyan-400/10 dark:text-cyan-200"
            aria-label="Next event"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((event) => {
            const feeBadge = getFeeBadge(event.fee)

            return (
              <article
                key={event.id}
                className="min-w-full rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="max-w-2xl text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                    {event.title}
                  </h3>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${feeBadge.className}`}
                  >
                    {feeBadge.label}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                    <CalendarDays className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                    <UserRound className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Organizer: {event.organizer || "Event Host"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/events/${event.id}`}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                  >
                    View Event
                  </Link>
                  <Link
                    href="/events"
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Browse More
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {slides.map((event, index) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex
                ? "w-8 bg-cyan-600 dark:bg-cyan-400"
                : "w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
            }`}
            aria-label={`Go to event ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
