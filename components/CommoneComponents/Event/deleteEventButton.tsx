"use client"

import { deleteEventAction, type DeleteEventState } from "@/actions/event"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const AUTO_DISMISS_MS = 3500

type DeleteEventButtonProps = {
  eventId: string
}

const DeleteEventButton = ({ eventId }: DeleteEventButtonProps) => {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const initialState: DeleteEventState = { status: "idle", message: "" }
  const [state, formAction, pending] = useActionState(
    deleteEventAction,
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
      }, 1200)

      return () => clearTimeout(redirectTimer)
    }
  }, [state.status, router])

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

      <form
        action={formAction}
        onSubmit={(e) => {
          const confirmed = window.confirm(
            "Are you sure you want to delete this event? This action cannot be undone."
          )
          if (!confirmed) {
            e.preventDefault()
          }
        }}
      >
        <input type="hidden" name="eventId" value={eventId} />
        <Button type="submit" variant="destructive" disabled={pending}>
          <Trash2 className="size-4" />
          {pending ? "Deleting..." : "Delete Event"}
        </Button>
      </form>
    </>
  )
}

export default DeleteEventButton
