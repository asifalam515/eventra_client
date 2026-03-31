"use client"

import { createReviewAction } from "@/actions/review"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

export default function ReviewForm({ eventId }: { eventId: string }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createReviewAction({
        eventId,
        rating,
        comment,
      })

      if (!result.success) {
        setToast({
          type: "error",
          message: result.message,
        })
        return
      }

      setComment("")
      setRating(5)
      setToast({
        type: "success",
        message: result.message,
      })
    })
  }

  const isSubmitDisabled = isPending || comment.trim().length < 8

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-500/10 via-transparent to-transparent" />

      <div className="relative space-y-4">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Post Event Feedback
          </p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Share Your Review
          </h3>
          <p className="text-sm text-muted-foreground">
            This event is completed. Rate your experience and leave a detailed
            comment to help future participants.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Rating
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                disabled={isPending}
                className="rounded-md p-1 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              >
                <Star
                  className={`size-6 ${
                    value <= rating
                      ? "fill-amber-400 text-amber-500"
                      : "text-muted-foreground/50"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-medium text-foreground">
              {rating}/5
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Excellent event with great speakers."
            rows={5}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isPending}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Minimum 8 characters. Be constructive and specific.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Your review will be visible to other users.
          </p>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full sm:w-auto"
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>

      {toast && (
        <div className="fixed right-6 bottom-6 z-50">
          <div
            className={`max-w-xs rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-900/40 dark:text-emerald-100"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/80 dark:bg-red-900/40 dark:text-red-100"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </section>
  )
}
