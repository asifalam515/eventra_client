"use client"

import type { Event } from "@/actions/event"
import { deleteEventAction } from "@/actions/event"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Edit, MapPin, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"

type UserMyEventsPanelProps = {
  initialEvents: Event[]
}

export default function UserMyEventsPanel({
  initialEvents,
}: UserMyEventsPanelProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isPending, startTransition] = useTransition()
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleDeleteEvent = (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return
    }

    setDeletingEventId(eventId)
    startTransition(async () => {
      const formData = new FormData()
      formData.set("eventId", eventId)

      const result = await deleteEventAction(
        { status: "idle", message: "" },
        formData
      )

      if (result.status === "success") {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        setFeedbackMessage({
          type: "success",
          message: "Event deleted successfully.",
        })
      } else {
        setFeedbackMessage({
          type: "error",
          message: result.message,
        })
      }
      setTimeout(() => setFeedbackMessage(null), 5000)

      setDeletingEventId(null)
    })
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            No Events Created
          </h3>
          <p className="mb-4 text-slate-600">
            You haven&apos;t created any events yet. Start by creating your
            first event!
          </p>
          <Link href="/create-event">
            <Button>Create Event</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        My Events ({events.length})
      </h2>

      {feedbackMessage && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            feedbackMessage.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedbackMessage.message}
        </div>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  {event.title}
                </h3>
                <p className="mb-4 text-slate-600">{event.description}</p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="size-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="size-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="size-4" />
                    <span>{event.venue}</span>
                  </div>
                  {event.fee > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="size-4" />
                      <span>${event.fee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {event.type}
              </span>
              {event.isFeatured && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  🌟 Featured
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/events/${event.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 size-4" />
                  Edit Event
                </Button>
              </Link>

              <Link href={`/events/${event.id}`}>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 size-4" />
                  View Participants
                </Button>
              </Link>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteEvent(event.id)}
                disabled={isPending || deletingEventId === event.id}
              >
                <Trash2 className="mr-2 size-4" />
                {deletingEventId === event.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Clock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
