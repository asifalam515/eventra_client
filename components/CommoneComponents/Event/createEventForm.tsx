"use client"

import { createEventAction, CreateEventState } from "@/actions/event"
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

const CreateEventForm = () => {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [venue, setVenue] = useState("")
  const [type, setType] = useState("")
  const [fee, setFee] = useState("0")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const initialState: CreateEventState = { status: "idle", message: "" }
  const [state, formAction, pending] = useActionState(
    createEventAction,
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
        router.push("/events")
      }, 2000)

      return () => clearTimeout(redirectTimer)
    }
  }, [state.status, router])

  const dismissAlert = () => {
    setIsVisible(false)
  }

  const handleReset = () => {
    setTitle("")
    setDescription("")
    setDate("")
    setTime("")
    setVenue("")
    setType("")
    setFee("0")
    setIsFeatured(false)
  }

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
                onClick={dismissAlert}
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
            Create Event
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details to create and publish a new event.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <div className="relative">
              <Tag className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g., Annual Tech Conference 2025"
                className="pl-9"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              required
              placeholder="Describe your event in detail..."
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
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

          {/* Time */}
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

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="venue"
                name="venue"
                type="text"
                required
                placeholder="e.g., Conference Center, New York"
                className="pl-9"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>

          {/* Event Type */}
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

          {/* Fee */}
          <div className="space-y-2">
            <Label htmlFor="fee">Entry Fee ($)</Label>
            <Input
              id="fee"
              name="fee"
              type="number"
              placeholder="0"
              className="placeholder:text-muted-foreground"
              min="0"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>

          {/* Featured Checkbox */}
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
                <Star className="size-3.5" /> Make this event featured (featured
                events appear at the top)
              </p>
            </div>
          </div>

          {/* Buttons */}
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
              {pending ? "Creating..." : "Create Event"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={handleReset}
              disabled={pending}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateEventForm
