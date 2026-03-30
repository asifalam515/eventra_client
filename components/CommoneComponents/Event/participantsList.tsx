"use client"

import UpdateParticipationStatusControl from "@/components/CommoneComponents/Event/updateParticipationStatusControl"
import {
  PARTICIPATION_STATUS_UPDATED_EVENT,
  type ParticipationStatusUpdatedDetail,
} from "@/lib/participation-events"
import { useEffect, useMemo, useState } from "react"

type ParticipationItem = {
  id: string
  userId?: string
  status?: string
  createdAt?: string
  userName?: string
  userEmail?: string
}

function formatDate(value?: string) {
  if (!value) return ""

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

export default function ParticipantsList({
  eventId,
  canManage,
  initialParticipations,
}: {
  eventId: string
  canManage: boolean
  initialParticipations: ParticipationItem[]
}) {
  const [items, setItems] = useState<ParticipationItem[]>(initialParticipations)

  useEffect(() => {
    setItems(initialParticipations)
  }, [initialParticipations])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<ParticipationStatusUpdatedDetail>
      const detail = customEvent.detail
      if (!detail || detail.eventId !== eventId) return

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.userId && item.userId === detail.userId
        )

        if (existingIndex >= 0) {
          const next = [...prev]
          next[existingIndex] = {
            ...next[existingIndex],
            status: detail.status,
            userName: detail.userName || next[existingIndex].userName,
            userEmail: detail.userEmail || next[existingIndex].userEmail,
            createdAt: detail.createdAt || next[existingIndex].createdAt,
          }
          return next
        }

        return [
          {
            id: `${detail.userId}-${Date.now()}`,
            userId: detail.userId,
            status: detail.status,
            userName: detail.userName,
            userEmail: detail.userEmail,
            createdAt: detail.createdAt,
          },
          ...prev,
        ]
      })
    }

    window.addEventListener(
      PARTICIPATION_STATUS_UPDATED_EVENT,
      handler as EventListener
    )

    return () => {
      window.removeEventListener(
        PARTICIPATION_STATUS_UPDATED_EVENT,
        handler as EventListener
      )
    }
  }, [eventId])

  const total = useMemo(() => items.length, [items])

  return (
    <div className="mt-8 rounded-xl border border-border/60 bg-background/70 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Participants
        </h2>
        <span className="rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground">
          {total} total
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No participation records found for this event yet.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.userName || "Participant"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.userEmail || item.userId || "No user info"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground uppercase">
                  {item.status || "joined"}
                </span>
                {item.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                )}
              </div>

              {canManage && item.userId && (
                <UpdateParticipationStatusControl
                  eventId={eventId}
                  userId={item.userId}
                  currentStatus={item.status}
                  onUpdated={(nextStatus) => {
                    setItems((prev) =>
                      prev.map((entry) =>
                        entry.userId === item.userId
                          ? { ...entry, status: nextStatus }
                          : entry
                      )
                    )
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
