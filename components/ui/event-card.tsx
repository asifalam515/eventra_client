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
    upcoming: { label: "Upcoming", color: "bg-blue-500/10 text-blue-600" },
    ongoing: { label: "Ongoing", color: "bg-green-500/10 text-green-600" },
    completed: { label: "Completed", color: "bg-gray-500/10 text-gray-600" },
  }

  const status = (event.eventStatus || "upcoming") as keyof typeof statusConfig
  const statusStyle = statusConfig[status] ?? statusConfig.upcoming

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative flex h-full flex-col p-5 sm:p-6">
        {/* Header with status badge */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {event.name}
            </h3>
          </div>
          {status && (
            <div
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${statusStyle.color}`}
            >
              {statusStyle.label}
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        )}

        {/* Event Meta Grid */}
        <div className="mb-5 space-y-2.5">
          {/* Date */}
          {event.date && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="size-4 shrink-0 text-primary/60" />
              <span className="text-muted-foreground">{event.date}</span>
            </div>
          )}

          {/* Venue */}
          {event.venue && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="size-4 shrink-0 text-primary/60" />
              <span className="truncate text-muted-foreground">
                {event.venue}
              </span>
            </div>
          )}

          {/* Type */}
          {event.type && (
            <div className="flex items-center gap-3 text-sm">
              <Badge className="size-4 shrink-0 text-primary/60" />
              <span className="text-muted-foreground capitalize">
                {event.type}
              </span>
            </div>
          )}

          {/* Fee */}
          {event.fee && (
            <div className="flex items-center gap-3 text-sm">
              <Ticket className="size-4 shrink-0 text-primary/60" />
              <span className="font-medium text-foreground">
                {typeof event.fee === "number" ? `$${event.fee}` : event.fee}
              </span>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && (
            <div className="flex items-center gap-3 text-sm">
              <Users className="size-4 shrink-0 text-primary/60" />
              <span className="text-muted-foreground">
                {event.attendees} attendees
              </span>
            </div>
          )}

          {/* Review/Rating */}
          {event.review && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="size-4 shrink-0 fill-yellow-500 text-yellow-500" />
                <span className="font-medium text-foreground">
                  {event.review}
                </span>
              </div>
              <span className="text-muted-foreground">rating</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border/50" />

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <Button asChild className="flex-1 gap-2" size="sm">
            <Link href={`/events/${event.id}`} className="justify-center">
              <Clock className="size-4" />
              <span>Join Now</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="sm">
            <Link href={`/events/${event.id}`} className="justify-center">
              Show Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
