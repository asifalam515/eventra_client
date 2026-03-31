"use client"

import { sendInvitationAction } from "@/actions/invitation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MailPlus, Send, UserRound } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

type ToastState = {
  type: "success" | "error"
  message: string
}

export default function InvitationSendForm({ eventId }: { eventId: string }) {
  const [userId, setUserId] = useState("")
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  const handleSendInvite = () => {
    startTransition(async () => {
      const result = await sendInvitationAction({
        userId,
        eventId,
      })

      if (!result.success) {
        setToast({ type: "error", message: result.message })
        return
      }

      setUserId("")
      setToast({ type: "success", message: result.message })
    })
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-sky-500/10 via-transparent to-transparent" />

      <div className="relative space-y-4">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Invitations
          </p>
          <h3 className="mt-1 text-xl font-semibold text-foreground">
            Invite User to This Event
          </h3>
          <p className="text-sm text-muted-foreground">
            Send direct invitation to a user by their user ID.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/70 p-4">
          <label className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <UserRound className="size-3.5" /> Invitee User ID
          </label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="be25e4a0-fd03-418c-b533-8a0b61f9e5a3"
            className="bg-background"
            disabled={isPending}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Invitees can pay and accept for paid events.
            </p>
            <Button
              type="button"
              onClick={handleSendInvite}
              disabled={isPending || !userId.trim()}
            >
              {isPending ? (
                <>
                  <Send className="size-4 animate-pulse" /> Sending...
                </>
              ) : (
                <>
                  <MailPlus className="size-4" /> Send Invitation
                </>
              )}
            </Button>
          </div>
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
