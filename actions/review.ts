"use server"

import { getParticipationsByEventIdAction } from "@/actions/participation"
import { getSessionUser } from "@/lib/session-user"
import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

type CreateReviewResponse = {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

type UpdateReviewResponse = {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

type DeleteReviewResponse = {
  success: boolean
  message: string
}

export type EventReview = {
  id: string
  eventId?: string
  userId?: string
  userName?: string
  userEmail?: string
  rating: number
  comment: string
  createdAt?: string
}

type EventReviewsResponse = {
  success: boolean
  message: string
  data: EventReview[]
}

type JsonRecord = Record<string, unknown>

function mapReview(payload: JsonRecord): EventReview | null {
  const id = String(payload.id ?? payload._id ?? payload.reviewId ?? "")
  if (!id) return null

  const userPayload =
    (payload.user as JsonRecord | undefined) ??
    (payload.reviewer as JsonRecord | undefined)

  const rating = Number(payload.rating ?? payload.stars ?? 0)

  return {
    id,
    eventId: String(payload.eventId ?? payload.event ?? "") || undefined,
    userId:
      String(payload.userId ?? payload.reviewerId ?? userPayload?.id ?? "") ||
      undefined,
    userName:
      String(
        payload.userName ??
          userPayload?.name ??
          userPayload?.fullName ??
          userPayload?.username ??
          ""
      ) || undefined,
    userEmail:
      String(payload.userEmail ?? userPayload?.email ?? "") || undefined,
    rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, rating)) : 1,
    comment: String(payload.comment ?? payload.review ?? "") || "",
    createdAt: String(payload.createdAt ?? "") || undefined,
  }
}

function extractReviewsArray(body: JsonRecord): unknown[] {
  const data = (body?.data as JsonRecord | undefined) ?? undefined

  if (Array.isArray(body)) return body
  if (Array.isArray(body?.reviews)) return body.reviews
  if (Array.isArray(body?.data)) return body.data as unknown[]
  if (data && Array.isArray(data?.reviews)) return data.reviews as unknown[]
  if (data && Array.isArray(data?.items)) return data.items as unknown[]

  return []
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

export async function createReviewAction(payload: {
  eventId: string
  rating: number
  comment: string
}): Promise<CreateReviewResponse> {
  const eventId = payload.eventId.trim()
  const comment = payload.comment.trim()
  const rating = Number(payload.rating)

  if (!eventId) {
    return {
      success: false,
      message: "Event ID is required.",
    }
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return {
      success: false,
      message: "Rating must be between 1 and 5.",
    }
  }

  if (!comment) {
    return {
      success: false,
      message: "Comment is required.",
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

  const sessionUser = await getSessionUser()

  if (!sessionUser?.id) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  const participations = await getParticipationsByEventIdAction(eventId)
  const isParticipant = participations.some((item) => {
    const participantId = item.userId?.trim()
    const participantStatus = item.status?.trim().toUpperCase()

    return participantId === sessionUser.id && participantStatus === "APPROVED"
  })

  if (!isParticipant) {
    return {
      success: false,
      message: "Only approved participants of this event can submit a review.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, rating, comment }),
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to submit review."
        ),
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "Review submitted successfully."),
      data: (body?.data as Record<string, unknown> | undefined) ?? body,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to submit review.",
    }
  }
}

export async function getEventReviewsByEventIdAction(
  eventId: string
): Promise<EventReviewsResponse> {
  const normalizedEventId = eventId.trim()

  if (!normalizedEventId) {
    return {
      success: false,
      message: "Event ID is required.",
      data: [],
    }
  }

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  try {
    const response = token
      ? await fetchWithAuthFallback(
          `${process.env.NEXT_PUBLIC_API_URL}/review/event/${normalizedEventId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
          token
        )
      : await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/review/event/${normalizedEventId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to fetch event reviews."
        ),
        data: [],
      }
    }

    const reviews = extractReviewsArray(body)
      .map((item) =>
        item && typeof item === "object" ? mapReview(item as JsonRecord) : null
      )
      .filter((item): item is EventReview => Boolean(item))

    return {
      success: true,
      message: String(
        body?.message ??
          (reviews.length
            ? "Event reviews fetched successfully."
            : "No reviews yet for this event.")
      ),
      data: reviews,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch event reviews.",
      data: [],
    }
  }
}

export async function updateReviewAction(
  reviewId: string,
  payload: {
    rating: number
    comment: string
  }
): Promise<UpdateReviewResponse> {
  const normalizedReviewId = reviewId.trim()
  const rating = Number(payload.rating)
  const comment = payload.comment.trim()

  if (!normalizedReviewId) {
    return {
      success: false,
      message: "Review ID is required.",
    }
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return {
      success: false,
      message: "Rating must be between 1 and 5.",
    }
  }

  if (!comment) {
    return {
      success: false,
      message: "Comment is required.",
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
      `${process.env.NEXT_PUBLIC_API_URL}/review/${normalizedReviewId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to update review."
        ),
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "Review updated successfully."),
      data: (body?.data as Record<string, unknown> | undefined) ?? body,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update review.",
    }
  }
}

export async function deleteReviewAction(
  reviewId: string
): Promise<DeleteReviewResponse> {
  const normalizedReviewId = reviewId.trim()

  if (!normalizedReviewId) {
    return {
      success: false,
      message: "Review ID is required.",
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
      `${process.env.NEXT_PUBLIC_API_URL}/review/${normalizedReviewId}`,
      {
        method: "DELETE",
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
          body?.message ?? body?.error ?? "Failed to delete review."
        ),
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "Review deleted successfully."),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete review.",
    }
  }
}
