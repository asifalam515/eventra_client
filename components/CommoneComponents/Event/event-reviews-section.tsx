"use client"

import { deleteAdminReviewAction } from "@/actions/admin"
import {
  deleteReviewAction,
  EventReview,
  updateReviewAction,
} from "@/actions/review"
import { Button } from "@/components/ui/button"
import { Check, PencilLine, Star, Trash2, X } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

function formatDate(value?: string) {
  if (!value) return ""

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

export default function EventReviewsSection({
  reviews,
  currentUserId,
  currentUserRole,
}: {
  reviews: EventReview[]
  currentUserId?: string | null
  currentUserRole?: string | null
}) {
  const [items, setItems] = useState(reviews)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState("")
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isPending, startTransition] = useTransition()
  const normalizedRole = currentUserRole?.trim().toUpperCase()
  const isAdmin = normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN"

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  const handleStartEdit = (review: EventReview) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
  }

  const handleCancelEdit = () => {
    setEditingReviewId(null)
    setEditRating(5)
    setEditComment("")
  }

  const handleSaveEdit = (reviewId: string) => {
    startTransition(async () => {
      const result = await updateReviewAction(reviewId, {
        rating: editRating,
        comment: editComment,
      })

      if (!result.success) {
        setToast({ type: "error", message: result.message })
        return
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === reviewId
            ? { ...item, rating: editRating, comment: editComment.trim() }
            : item
        )
      )
      setToast({ type: "success", message: result.message })
      handleCancelEdit()
    })
  }

  const handleDeleteReview = (review: EventReview) => {
    const isOwner = Boolean(currentUserId && review.userId === currentUserId)
    const canDelete = isOwner || isAdmin

    if (!canDelete) {
      setToast({
        type: "error",
        message: "You are not allowed to delete this review.",
      })
      return
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    )

    if (!confirmed) return

    startTransition(async () => {
      const result = isAdmin
        ? await deleteAdminReviewAction(review.id)
        : await deleteReviewAction(review.id)

      if (!result.success) {
        setToast({ type: "error", message: result.message })
        return
      }

      setItems((prev) => prev.filter((item) => item.id !== review.id))

      if (editingReviewId === review.id) {
        handleCancelEdit()
      }

      setToast({ type: "success", message: result.message })
    })
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Community Feedback
          </p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Event Reviews
          </h3>
        </div>
        <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          {items.length} review{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-background/50 p-5 text-sm text-muted-foreground">
          No reviews posted yet for this event.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-border/70 bg-background/70 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.userName || "Anonymous"}
                  </p>
                  {currentUserId && review.userId === currentUserId && (
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      You
                    </span>
                  )}
                  {formatDate(review.createdAt) && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  )}
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-100">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {review.rating}/5
                </div>
              </div>

              {editingReviewId === review.id ? (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEditRating(value)}
                        disabled={isPending}
                        className="rounded-md p-1 transition hover:scale-105 disabled:opacity-60"
                      >
                        <Star
                          className={`size-5 ${
                            value <= editRating
                              ? "fill-amber-400 text-amber-500"
                              : "text-muted-foreground/50"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={4}
                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isPending}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(review.id)}
                      disabled={isPending || editComment.trim().length < 8}
                    >
                      <Check className="size-4" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isPending}
                    >
                      <X className="size-4" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {review.comment || "No written comment."}
                  </p>

                  {(currentUserId && review.userId === currentUserId) ||
                  isAdmin ? (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {currentUserId && review.userId === currentUserId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(review)}
                            disabled={isPending}
                          >
                            <PencilLine className="size-4" /> Edit Review
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteReview(review)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>
      )}

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
