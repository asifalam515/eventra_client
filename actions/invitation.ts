"use server"

import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

export type SentInvitation = {
  id: string
  status?: string
  payment?: string
  createdAt?: string
  eventId?: string
  userId?: string
  email?: string
}

export type InvitationEvent = {
  id: string
  title?: string
  description?: string
  date?: string
  time?: string
  venue?: string
  type?: string
  eventStatus?: string
  fee?: number
  isFeatured?: boolean
}

export type MyInvitation = SentInvitation & {
  event?: InvitationEvent
}

type SendInvitationResponse = {
  success: boolean
  message: string
  data?: SentInvitation
}

type MyInvitationsResponse = {
  success: boolean
  message: string
  data: MyInvitation[]
}

type InvitationMutationResponse = {
  success: boolean
  message: string
  data?: MyInvitation
}

type JsonRecord = Record<string, unknown>

function mapInvitation(payload: JsonRecord): MyInvitation | null {
  const id = String(payload.id ?? payload._id ?? payload.invitationId ?? "")
  if (!id) return null

  const eventPayload =
    (payload.event as JsonRecord | undefined) ??
    (payload.eventInfo as JsonRecord | undefined)

  return {
    id,
    status: String(payload.status ?? "") || undefined,
    payment:
      String(payload.payment ?? payload.paymentStatus ?? "") || undefined,
    createdAt: String(payload.createdAt ?? "") || undefined,
    eventId: String(payload.eventId ?? eventPayload?.id ?? "") || undefined,
    userId: String(payload.userId ?? "") || undefined,
    event: eventPayload
      ? {
          id: String(eventPayload.id ?? eventPayload._id ?? ""),
          title:
            String(eventPayload.title ?? eventPayload.name ?? "") || undefined,
          description: String(eventPayload.description ?? "") || undefined,
          date: String(eventPayload.date ?? "") || undefined,
          time: String(eventPayload.time ?? "") || undefined,
          venue:
            String(eventPayload.venue ?? eventPayload.location ?? "") ||
            undefined,
          type: String(eventPayload.type ?? "") || undefined,
          eventStatus: String(eventPayload.eventStatus ?? "") || undefined,
          fee:
            typeof eventPayload.fee === "number"
              ? eventPayload.fee
              : Number(eventPayload.fee ?? 0) || 0,
          isFeatured:
            typeof eventPayload.isFeatured === "boolean"
              ? eventPayload.isFeatured
              : undefined,
        }
      : undefined,
  }
}

async function parseResponseBody(response: Response): Promise<JsonRecord> {
  try {
    return (await response.json()) as JsonRecord
  } catch {
    return {}
  }
}

async function fetchWithAuthFallback(
  url: string,
  init: RequestInit,
  token: string
) {
  const rawResponse = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: token,
    },
  })

  if (rawResponse.status !== 401 && rawResponse.status !== 403) {
    return rawResponse
  }

  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function sendInvitationAction(payload: {
  email: string
  eventId: string
}): Promise<SendInvitationResponse> {
  const email = payload.email.trim()
  const eventId = payload.eventId.trim()

  if (!email || !eventId) {
    return {
      success: false,
      message: "Both email and eventId are required.",
    }
  }

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/invitation/send-by-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, eventId }),
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to send invitation."
        ),
      }
    }

    const data = ((body?.data as JsonRecord | undefined) ?? body) as JsonRecord

    return {
      success: true,
      message: String(body?.message ?? "Invitation sent successfully"),
      data: {
        id: String(data?.id ?? data?._id ?? ""),
        status: String(data?.status ?? "") || undefined,
        payment: String(data?.payment ?? "") || undefined,
        createdAt: String(data?.createdAt ?? "") || undefined,
        eventId: String(data?.eventId ?? "") || undefined,
        userId: String(data?.userId ?? "") || undefined,
        email:
          String(data?.email ?? data?.userEmail ?? data?.inviteeEmail ?? "") ||
          undefined,
      },
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send invitation.",
    }
  }
}

export async function getMyInvitationsAction(): Promise<MyInvitationsResponse> {
  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
      data: [],
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/invitation/my-invitations`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to fetch invitations."
        ),
        data: [],
      }
    }

    const rawInvitations =
      (Array.isArray(body?.data) ? body.data : undefined) ??
      (Array.isArray(body?.invitations) ? body.invitations : undefined) ??
      []

    const invitations = rawInvitations
      .map((item) =>
        item && typeof item === "object"
          ? mapInvitation(item as JsonRecord)
          : null
      )
      .filter((item): item is MyInvitation => Boolean(item))

    return {
      success: true,
      message: String(body?.message ?? "Invitations retrieved successfully"),
      data: invitations,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch invitations.",
      data: [],
    }
  }
}

export async function acceptInvitationAction(
  invitationId: string
): Promise<InvitationMutationResponse> {
  const normalizedInvitationId = invitationId.trim()

  if (!normalizedInvitationId) {
    return {
      success: false,
      message: "Invitation ID is required.",
    }
  }

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/invitation/${normalizedInvitationId}/accept`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to accept invitation."
        ),
      }
    }

    const payload = ((body?.data as JsonRecord | undefined) ??
      body) as JsonRecord

    return {
      success: true,
      message: String(body?.message ?? "Invitation accepted successfully."),
      data: mapInvitation(payload) ?? undefined,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to accept invitation.",
    }
  }
}

export async function declineInvitationAction(
  invitationId: string
): Promise<InvitationMutationResponse> {
  const normalizedInvitationId = invitationId.trim()

  if (!normalizedInvitationId) {
    return {
      success: false,
      message: "Invitation ID is required.",
    }
  }

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/invitation/${normalizedInvitationId}/decline`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to decline invitation."
        ),
      }
    }

    const payload = ((body?.data as JsonRecord | undefined) ??
      body) as JsonRecord

    return {
      success: true,
      message: String(body?.message ?? "Invitation declined successfully."),
      data: mapInvitation(payload) ?? undefined,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to decline invitation.",
    }
  }
}
