"use client"

import {
  UpdateParticipationStatusState,
  updateParticipationStatusAction,
} from "@/actions/participation"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useMemo, useState } from "react"

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "BANNED"] as const

type StatusOption = (typeof STATUS_OPTIONS)[number]

function toStatus(value?: string): StatusOption {
  const normalized = String(value ?? "").toUpperCase()
  if (STATUS_OPTIONS.includes(normalized as StatusOption)) {
    return normalized as StatusOption
  }
  return "PENDING"
}

export default function UpdateParticipationStatusControl({
  eventId,
  userId,
  currentStatus,
  onUpdated,
}: {
  eventId: string
  userId: string
  currentStatus?: string
  onUpdated?: (status: string) => void
}) {
  const router = useRouter()
  const [status, setStatus] = useState<StatusOption>(toStatus(currentStatus))

  const initialState: UpdateParticipationStatusState = useMemo(
    () => ({ status: "idle", message: "" }),
    []
  )

  const [state, formAction, pending] = useActionState(
    updateParticipationStatusAction,
    initialState
  )

  useEffect(() => {
    if (state.status === "success") {
      onUpdated?.(status)
      router.refresh()
    }
  }, [state.status, router, onUpdated, status])

  useEffect(() => {
    setStatus(toStatus(currentStatus))
  }, [currentStatus])

  return (
    <form action={formAction} className="flex flex-col gap-1 sm:items-end">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="userId" value={userId} />

      <div className="flex items-center gap-2">
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusOption)}
          disabled={pending}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="h-8 text-xs"
        >
          {pending ? "Updating..." : "Update"}
        </Button>
      </div>

      {state.status !== "idle" && (
        <p
          className={`text-xs ${
            state.status === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
