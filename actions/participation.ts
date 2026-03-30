"use server"

import { normalizeToken } from "@/lib/token"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export type JoinParticipationState = {
  status: "idle" | "success" | "error"
  message: string
}

export type UpdateParticipationStatusState = {
  status: "idle" | "success" | "error"
  message: string
}

const PARTICIPATION_STATUSES = new Set([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "BANNED",
])

export type EventParticipation = {
  id: string
  eventId?: string
  userId?: string
  status?: string
  createdAt?: string
  userName?: string
  userEmail?: string
}

function normalizeParticipation(
  payload: Record<string, unknown>
): EventParticipation | null {
  const id =
    String(payload.id ?? payload._id ?? payload.participationId ?? "") || ""

  if (!id) return null

  const userPayload =
    (payload.user as Record<string, unknown> | undefined) ??
    (payload.participant as Record<string, unknown> | undefined)

  return {
    id,
    eventId: String(payload.eventId ?? payload.event ?? "") || undefined,
    userId:
      String(
        payload.userId ??
          payload.participantId ??
          userPayload?.id ??
          userPayload?._id ??
          ""
      ) || undefined,
    status:
      String(payload.status ?? payload.participationStatus ?? "") || undefined,
    createdAt: String(payload.createdAt ?? payload.joinedAt ?? "") || undefined,
    userName:
      String(
        userPayload?.name ??
          userPayload?.fullName ??
          userPayload?.username ??
          payload.userName ??
          ""
      ) || undefined,
    userEmail:
      String(userPayload?.email ?? payload.userEmail ?? "") || undefined,
  }
}

export async function getParticipationsByEventIdAction(
  eventId: string
): Promise<EventParticipation[]> {
  const normalizedEventId = eventId.trim()
  if (!normalizedEventId) return []

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/participation/${normalizedEventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        cache: "no-store",
      }
    )

    if (!response.ok) return []

    const body = (await response.json()) as Record<string, unknown>
    const rawList =
      (Array.isArray(body?.data) ? body.data : undefined) ??
      (Array.isArray(body?.participations) ? body.participations : undefined) ??
      (Array.isArray(body) ? body : undefined) ??
      []

    return rawList
      .map((item) =>
        item && typeof item === "object"
          ? normalizeParticipation(item as Record<string, unknown>)
          : null
      )
      .filter((item): item is EventParticipation => Boolean(item))
  } catch {
    return []
  }
}

export async function joinParticipationAction(
  _prevState: JoinParticipationState,
  formData: FormData
): Promise<JoinParticipationState> {
  try {
    const cookieStore = await cookies()
    const token = normalizeToken(cookieStore.get("token")?.value)

    if (!token) {
      return {
        status: "error",
        message: "Please log in to join this event.",
      }
    }

    const eventId = String(formData.get("eventId") ?? "").trim()

    if (!eventId) {
      return {
        status: "error",
        message: "Event ID is missing.",
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/participation/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ eventId }),
        cache: "no-store",
      }
    )

    if (!response.ok) {
      let errorMessage = "Unable to send join request."

      try {
        const errorBody = await response.json()
        errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          errorBody?.data?.message ||
          errorMessage
      } catch {
        // Keep default error message when response is not JSON.
      }

      return {
        status: "error",
        message: errorMessage,
      }
    }

    return {
      status: "success",
      message: "Join request sent successfully.",
    }
  } catch (error: unknown) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to send join request.",
    }
  }
}

export async function joinParticipationByEventIdAction(
  eventId: string
): Promise<JoinParticipationState> {
  const formData = new FormData()
  formData.set("eventId", eventId)
  return joinParticipationAction({ status: "idle", message: "" }, formData)
}

export async function updateParticipationStatusAction(
  _prevState: UpdateParticipationStatusState,
  formData: FormData
): Promise<UpdateParticipationStatusState> {
  try {
    const cookieStore = await cookies()
    const token = normalizeToken(cookieStore.get("token")?.value)

    if (!token) {
      return {
        status: "error",
        message: "Please log in to update participant status.",
      }
    }

    const eventId = String(formData.get("eventId") ?? "").trim()
    const userId = String(formData.get("userId") ?? "").trim()
    const status = String(formData.get("status") ?? "")
      .trim()
      .toUpperCase()

    if (!eventId || !userId || !status) {
      return {
        status: "error",
        message: "eventId, userId, and status are required.",
      }
    }

    if (!PARTICIPATION_STATUSES.has(status)) {
      return {
        status: "error",
        message: "Invalid status value.",
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/participation/update-status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          eventId,
          userId,
          status,
        }),
        cache: "no-store",
      }
    )

    if (!response.ok) {
      let errorMessage = "Failed to update participation status."

      try {
        const errorBody = await response.json()
        errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          errorBody?.data?.message ||
          errorMessage
      } catch {
        // Keep fallback message when response body is not JSON.
      }

      return {
        status: "error",
        message: errorMessage,
      }
    }

    revalidatePath(`/events/${eventId}`)

    return {
      status: "success",
      message: "Participant status updated successfully.",
    }
  } catch (error: unknown) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to update participant status.",
    }
  }
}

export async function updateParticipationStatusByFieldsAction(
  eventId: string,
  userId: string,
  status: "PENDING" | "APPROVED" | "REJECTED" | "BANNED"
): Promise<UpdateParticipationStatusState> {
  const formData = new FormData()
  formData.set("eventId", eventId)
  formData.set("userId", userId)
  formData.set("status", status)

  return updateParticipationStatusAction(
    { status: "idle", message: "" },
    formData
  )
}
