"use client"

import { updateEventAction, type UpdateEventState } from "@/actions/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Tag,
  Type,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const AUTO_DISMISS_MS = 3500
const EVENT_TYPES = ["PUBLIC", "PRIVATE"]

type EditEventFormProps = {
  eventId: string
  initialValues: {
    title: string
    description: string
    date: string
    time: string
    venue: string
    type: string
    fee: string
    isFeatured: boolean
  }
}

const EditEventForm = ({ eventId, initialValues }: EditEventFormProps) => {
  const router = useRouter()

  const [title, setTitle] = useState(initialValues.title)
  const [description, setDescription] = useState(initialValues.description)
  const [date, setDate] = useState(initialValues.date)
  const [time, setTime] = useState(initialValues.time)
  const [venue, setVenue] = useState(initialValues.venue)
  const [type, setType] = useState(initialValues.type)
  const [fee, setFee] = useState(initialValues.fee)
  const [isFeatured, setIsFeatured] = useState(initialValues.isFeatured)

  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const initialState: UpdateEventState = { status: "idle", message: "" }
  const [state, formAction, pending] = useActionState(
    updateEventAction,
    initialState
  )

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return
    }

    const showTimer = setTimeout(() => {
      setIsVisible(true)
      setProgress(100)
    }, 0)

    const startTime = Date.now()
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, AUTO_DISMISS_MS - elapsed)
      setProgress((remaining / AUTO_DISMISS_MS) * 100)

      if (remaining === 0) {
        clearInterval(animationInterval)
        setIsVisible(false)
      }
    }, 30)

    return () => {
      clearTimeout(showTimer)
      clearInterval(animationInterval)
    }
  }, [state.status, state.message])

  useEffect(() => {
    if (state.status === "success") {
      const redirectTimer = setTimeout(() => {
        router.push(`/events/${eventId}`)
      }, 1800)

      return () => clearTimeout(redirectTimer)
    }
  }, [state.status, eventId, router])

  return (
    <>
      {isVisible && state.message && (
        <div
          className="fixed top-5 right-5 z-70 w-[calc(100vw-2.5rem)] max-w-sm"
          role="alert"
          aria-live="polite"
        >
          <div
            className={`overflow-hidden rounded-xl border shadow-xl backdrop-blur ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                : "border-red-200 bg-red-50/95 text-red-800"
            }`}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              {state.status === "success" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <p className="flex-1 text-sm font-medium">{state.message}</p>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                aria-label="Dismiss notification"
                className="inline-flex shrink-0 opacity-70 transition hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="h-1 w-full bg-current/20">
              <div
                className="h-full bg-current transition-all"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-lg sm:p-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Event
          </h1>
          <p className="text-sm text-muted-foreground">
            Update your event details and save the changes.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />

          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <div className="relative">
              <Tag className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="title"
                name="title"
                type="text"
                required
                className="pl-9"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              required
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Event Date</Label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                name="date"
                type="date"
                required
                className="pl-9"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Event Time</Label>
            <div className="relative">
              <Clock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="time"
                name="time"
                type="time"
                required
                className="pl-9"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="venue"
                name="venue"
                type="text"
                required
                className="pl-9"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <div className="relative">
              <Type className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                id="type"
                name="type"
                required
                className="block w-full appearance-none rounded-lg border border-input bg-background py-2 pr-4 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select an event type</option>
                {EVENT_TYPES.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">Entry Fee ($)</Label>
            <Input
              id="fee"
              name="fee"
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>

          <div className="flex items-start space-x-2">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              className="mt-1 size-4 rounded border-input"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <div className="flex flex-col space-y-1">
              <Label
                htmlFor="isFeatured"
                className="cursor-pointer leading-none font-medium"
              >
                Feature this event
              </Label>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5" /> Mark this event as featured
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="h-10 flex-1"
              disabled={
                pending ||
                !title ||
                !description ||
                !date ||
                !time ||
                !venue ||
                !type
              }
            >
              {pending ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" className="h-10" asChild>
              <a href={`/events/${eventId}`}>Cancel</a>
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default EditEventForm
