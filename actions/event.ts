"use server"

import { normalizeToken } from "@/lib/token"
import jwt, { JwtPayload } from "jsonwebtoken"
import { cookies } from "next/headers"

export type CreateEventState = {
  status: "idle" | "success" | "error"
  message: string
}

export type UpdateEventState = {
  status: "idle" | "success" | "error"
  message: string
}

export type DeleteEventState = {
  status: "idle" | "success" | "error"
  message: string
}

type TokenUser = {
  id: string | null
  role: string | null
}

type ApiEvent = {
  id?: string
  _id?: string
  creatorId?: string
  creator?: {
    id?: string
    _id?: string
  }
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN", "MODERATOR", "MODERATORS"])

function getUserFromToken(token: string): TokenUser {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null
    if (!decoded) return { id: null, role: null }

    const userId =
      (decoded.id as string) ||
      (decoded.userId as string) ||
      (decoded.sub as string) ||
      null
    const role =
      typeof decoded.role === "string" ? decoded.role.toUpperCase() : null

    return { id: userId, role }
  } catch {
    return { id: null, role: null }
  }
}

function resolveEventOwnerId(event: ApiEvent) {
  return event.creatorId || event.creator?.id || event.creator?._id || null
}

function canEditEvent(currentUser: TokenUser, event: ApiEvent) {
  if (currentUser.role && ADMIN_ROLES.has(currentUser.role)) return true

  const ownerId = resolveEventOwnerId(event)
  if (!ownerId || !currentUser.id) return false

  return ownerId === currentUser.id
}

function canDeleteEvent(currentUser: TokenUser, event: ApiEvent) {
  return canEditEvent(currentUser, event)
}

export async function createEventAction(
  _preState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  try {
    const cookieStore = await cookies()
    const token = normalizeToken(cookieStore.get("token")?.value)

    if (!token) {
      return {
        status: "error",
        message: "Your session token is invalid. Please log in again.",
      }
    }

    const title = String(formData.get("title") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const date = String(formData.get("date") ?? "").trim()
    const time = String(formData.get("time") ?? "").trim()
    const venue = String(formData.get("venue") ?? "").trim()
    const type = String(formData.get("type") ?? "").trim()
    const fee = String(formData.get("fee") ?? "0").trim()
    const isFeatured = formData.get("isFeatured") === "on"

    if (!title || !description || !date || !time || !venue || !type) {
      return {
        status: "error",
        message:
          "Title, description, date, time, venue, and type are required.",
      }
    }

    const payload = {
      title,
      description,
      date: new Date(date).toISOString(),
      time,
      venue,
      type,
      fee: parseFloat(fee) || 0,
      isFeatured,
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(payload),
      cache: "no-cache",
    })

    if (!response.ok) {
      let errorMessage = "Failed to create event. Please try again."

      try {
        const errorBody = await response.json()
        errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          errorBody?.data?.message ||
          errorMessage
      } catch {
        // Keep default message when response is not JSON.
      }

      return {
        status: "error",
        message: errorMessage,
      }
    }

    return { status: "success", message: "Event created successfully!" }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Event creation failed."
    return {
      status: "error",
      message,
    }
  }
}

export async function updateEventAction(
  _preState: UpdateEventState,
  formData: FormData
): Promise<UpdateEventState> {
  try {
    const cookieStore = await cookies()
    const token = normalizeToken(cookieStore.get("token")?.value)

    if (!token) {
      return {
        status: "error",
        message: "Your session token is invalid. Please log in again.",
      }
    }

    const eventId = String(formData.get("eventId") ?? "").trim()
    const title = String(formData.get("title") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const date = String(formData.get("date") ?? "").trim()
    const time = String(formData.get("time") ?? "").trim()
    const venue = String(formData.get("venue") ?? "").trim()
    const type = String(formData.get("type") ?? "").trim()
    const fee = String(formData.get("fee") ?? "0").trim()
    const isFeatured = formData.get("isFeatured") === "on"

    if (!eventId) {
      return {
        status: "error",
        message: "Event ID is missing.",
      }
    }

    if (!title || !description || !date || !time || !venue || !type) {
      return {
        status: "error",
        message:
          "Title, description, date, time, venue, and type are required.",
      }
    }

    // Frontend-side authorization gate: owner or admin can edit.
    const eventResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        cache: "no-cache",
      }
    )

    if (!eventResponse.ok) {
      return {
        status: "error",
        message: "Unable to verify event ownership before update.",
      }
    }

    const eventBody = await eventResponse.json()
    const eventData = (eventBody?.data ?? eventBody) as ApiEvent
    const currentUser = getUserFromToken(token)

    if (!canEditEvent(currentUser, eventData)) {
      return {
        status: "error",
        message: "Only event owner or admin can update this event.",
      }
    }

    const payload = {
      title,
      description,
      date: new Date(date).toISOString(),
      time,
      venue,
      type,
      fee: parseFloat(fee) || 0,
      isFeatured,
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
        cache: "no-cache",
      }
    )

    if (!response.ok) {
      let errorMessage = "Failed to update event. Please try again."

      try {
        const errorBody = await response.json()
        errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          errorBody?.data?.message ||
          errorMessage
      } catch {
        // Keep default message when response is not JSON.
      }

      return {
        status: "error",
        message: errorMessage,
      }
    }

    return { status: "success", message: "Event updated successfully!" }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Event update failed."
    return {
      status: "error",
      message,
    }
  }
}

export async function deleteEventAction(
  _preState: DeleteEventState,
  formData: FormData
): Promise<DeleteEventState> {
  try {
    const cookieStore = await cookies()
    const token = normalizeToken(cookieStore.get("token")?.value)

    if (!token) {
      return {
        status: "error",
        message: "Your session token is invalid. Please log in again.",
      }
    }

    const eventId = String(formData.get("eventId") ?? "").trim()
    if (!eventId) {
      return {
        status: "error",
        message: "Event ID is missing.",
      }
    }

    const eventResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        cache: "no-cache",
      }
    )

    if (!eventResponse.ok) {
      return {
        status: "error",
        message: "Unable to verify event ownership before delete.",
      }
    }

    const eventBody = await eventResponse.json()
    const eventData = (eventBody?.data ?? eventBody) as ApiEvent
    const currentUser = getUserFromToken(token)

    if (!canDeleteEvent(currentUser, eventData)) {
      return {
        status: "error",
        message: "Only event owner, admin, or moderator can delete this event.",
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        cache: "no-cache",
      }
    )

    if (!response.ok) {
      let errorMessage = "Failed to delete event. Please try again."

      try {
        const errorBody = await response.json()
        errorMessage =
          errorBody?.message ||
          errorBody?.error ||
          errorBody?.data?.message ||
          errorMessage
      } catch {
        // Keep default message when response is not JSON.
      }

      return {
        status: "error",
        message: errorMessage,
      }
    }

    return { status: "success", message: "Event deleted successfully!" }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Event delete failed."
    return {
      status: "error",
      message,
    }
  }
}

export type Event = {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  type: string
  fee: number
  isFeatured: boolean
  creatorId?: string
  creator?: {
    id: string
    name: string
    email: string
  }
}

export type GetMyEventsResult = {
  success: boolean
  data: Event[]
  message: string
}

export async function getMyEventsAction(): Promise<GetMyEventsResult> {
  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      data: [],
      message: "Please log in to view your events.",
    }
  }

  try {
    // Get current user's ID from token
    const currentUser = getUserFromToken(token)
    if (!currentUser.id) {
      return {
        success: false,
        data: [],
        message: "Unable to determine user identity.",
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?createdBy=me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: "Failed to fetch your events.",
      }
    }

    const body = (await response.json()) as Record<string, unknown>
    let events = Array.isArray(body?.data) ? body.data : []

    // Filter events to ensure only current user's events are returned
    // This is a client-side safety check
    events = events.filter((event: unknown) => {
      if (typeof event !== "object" || event === null) return false
      const evt = event as Record<string, unknown>
      const ownerId = resolveEventOwnerId(evt as ApiEvent)
      return ownerId === currentUser.id
    })

    return {
      success: true,
      data: events as Event[],
      message: "Events fetched successfully.",
    }
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch your events.",
    }
  }
}
