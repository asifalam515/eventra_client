"use client"

import {
  Badge,
  Calendar,
  Clock,
  MapPin,
  Star,
  Ticket,
  Users,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "./button"

interface EventCardProps {
  event: {
    id: string
    name: string
    description: string
    date?: string
    venue?: string
    eventStatus?: "upcoming" | "ongoing" | "completed"
    fee?: string | number
    review?: number
    type?: string
    attendees?: number
  }
}

export function EventCard({ event }: EventCardProps) {
  // Determine status color and label
  const statusConfig = {
    upcoming: { label: "Upcoming", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-500/30" },
    ongoing: { label: "Live Now", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30 animate-pulse" },
    completed: { label: "Completed", color: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-700" },
  }

  const status = (event.eventStatus || "upcoming") as keyof typeof statusConfig
  const statusStyle = statusConfig[status] ?? statusConfig.upcoming

  return (
    <motion.div
      whileHover={{ 
        y: -8, 
        scale: 1.015,
        boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.15)"
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group glass-card relative overflow-hidden rounded-3xl"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:bg-primary/20" />

      {/* Content */}
      <div className="relative flex h-full flex-col p-6 sm:p-8">
        {/* Header with status badge */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {event.name}
            </h3>
          </div>
          {status && (
            <div
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider whitespace-nowrap shadow-sm ${statusStyle.color}`}
            >
              {statusStyle.label}
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        {/* Event Meta Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Date */}
          {event.date && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar className="size-4 shrink-0" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Venue */}
          {event.venue && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-4 shrink-0" />
              </div>
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                {event.venue}
              </span>
            </div>
          )}

          {/* Fee */}
          {event.fee && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Ticket className="size-4 shrink-0" />
              </div>
              <span className="font-semibold text-foreground">
                {typeof event.fee === "number" ? `$${event.fee}` : event.fee}
              </span>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="size-4 shrink-0" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {event.attendees} <span className="hidden sm:inline font-normal text-muted-foreground">attending</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-3 pt-4 border-t border-border/50">
          <Button asChild className="flex-1 gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" size="default">
            <Link href={`/events/${event.id}`} className="justify-center">
              <span>Join Now</span>
              <Clock className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" size="default">
            <Link href={`/events/${event.id}`} className="justify-center">
              Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
