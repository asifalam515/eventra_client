"use client"

import type { Event } from "@/actions/event"
import {
  getParticipationsByEventIdAction,
  updateParticipationStatusByFieldsAction,
  type EventParticipation,
} from "@/actions/participation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

type UserEventParticipantsManagerProps = {
  events: Event[]
}

export default function UserEventParticipantsManager({
  events,
}: UserEventParticipantsManagerProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events.length > 0 ? events[0].id : null
  )
  const [participants, setParticipants] = useState<EventParticipation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [updatingParticipantId, setUpdatingParticipantId] = useState<
    string | null
  >(null)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  useEffect(() => {
    if (!selectedEventId) return

    const loadParticipants = async () => {
      setIsLoading(true)
      const result = await getParticipationsByEventIdAction(selectedEventId)
      setParticipants(result)
      setIsLoading(false)
    }

    loadParticipants()
  }, [selectedEventId])

  const handleUpdateStatus = (
    participantId: string,
    userId: string,
    newStatus: "APPROVED" | "REJECTED" | "BANNED"
  ) => {
    if (!selectedEventId) return

    setUpdatingParticipantId(participantId)
    startTransition(async () => {
      const result = await updateParticipationStatusByFieldsAction(
        selectedEventId,
        userId,
        newStatus
      )

      if (result.status === "success") {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === participantId ? { ...p, status: newStatus } : p
          )
        )

        setFeedbackMessage({
          type: "success",
          message: `Participant ${newStatus.toLowerCase()}!`,
        })
      } else {
        setFeedbackMessage({
          type: "error",
          message: result.message,
        })
      }

      setUpdatingParticipantId(null)
      setTimeout(() => setFeedbackMessage(null), 5000)
    })
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <p className="text-center text-slate-600">
          Create events to manage participants.
        </p>
      </div>
    )
  }

  const pendingRequests = participants.filter((p) => p.status === "PENDING")
  const approvedParticipants = participants.filter(
    (p) => p.status === "APPROVED"
  )
  const rejectedRequests = participants.filter((p) => p.status === "REJECTED")

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Manage Participants
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

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Select Event
        </label>
        <select
          value={selectedEventId || ""}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <p className="text-center text-slate-600">Loading participants...</p>
        </div>
      ) : participants.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <p className="text-center text-slate-600">
            No join requests for this event yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-amber-900">
                <Clock className="size-4" />
                Pending Join Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                {pendingRequests.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded bg-white p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {participant.userName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {participant.userEmail}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          handleUpdateStatus(
                            participant.id,
                            participant.userId || "",
                            "APPROVED"
                          )
                        }
                        disabled={
                          isPending || updatingParticipantId === participant.id
                        }
                      >
                        <CheckCircle className="mr-1 size-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleUpdateStatus(
                            participant.id,
                            participant.userId || "",
                            "REJECTED"
                          )
                        }
                        disabled={
                          isPending || updatingParticipantId === participant.id
                        }
                      >
                        <XCircle className="mr-1 size-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {approvedParticipants.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-green-900">
                <CheckCircle className="size-4" />
                Approved Participants ({approvedParticipants.length})
              </h3>
              <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                {approvedParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded bg-white p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {participant.userName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {participant.userEmail}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleUpdateStatus(
                          participant.id,
                          participant.userId || "",
                          "BANNED"
                        )
                      }
                      disabled={
                        isPending || updatingParticipantId === participant.id
                      }
                    >
                      Ban
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejectedRequests.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-red-900">
                <XCircle className="size-4" />
                Rejected Requests ({rejectedRequests.length})
              </h3>
              <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
                {rejectedRequests.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded bg-white p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {participant.userName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {participant.userEmail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
