"use server"

import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt?: string
}

type AdminUsersResponse = {
  success: boolean
  message: string
  data: AdminUser[]
}

type AdminUserResponse = {
  success: boolean
  message: string
  data?: AdminUser
}

type BanUserResponse = {
  success: boolean
  message: string
}

type UpdateUserRoleResponse = {
  success: boolean
  message: string
}

export type AdminEvent = {
  id: string
  title: string
  description?: string
  date?: string
  time?: string
  venue?: string
  type?: string
  fee?: string | number
  isFeatured?: boolean
  status?: string
  creatorId?: string
}

export type AdminEventsQuery = {
  page?: number
  limit?: number
  search?: string
  type?: string
  isFeatured?: boolean
}

type AdminEventsResponse = {
  success: boolean
  message: string
  data: AdminEvent[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

type AdminEventResponse = {
  success: boolean
  message: string
  data?: AdminEvent
}

type DeleteAdminEventResponse = {
  success: boolean
  message: string
}

type FeatureAdminEventResponse = {
  success: boolean
  message: string
}

type UpdateAdminEventStatusResponse = {
  success: boolean
  message: string
}

type DeleteAdminReviewResponse = {
  success: boolean
  message: string
}

export type AdminAnalytics = {
  totalUsers: number
  totalEvents: number
  totalReviews: number
  totalParticipations: number
  totalRevenue: number
}

export type AdminActivityLog = {
  id: string
  action: string
  targetId?: string
  details?: string
  createdAt?: string
  adminId?: string
  admin?: {
    id?: string
    name?: string
    email?: string
  }
}

export type AdminActivityLogsQuery = {
  page?: number
  limit?: number
}

type AdminAnalyticsResponse = {
  success: boolean
  message: string
  data: AdminAnalytics
}

type AdminActivityLogsResponse = {
  success: boolean
  message: string
  data: {
    logs: AdminActivityLog[]
    total: number
    page: number
    limit: number
  }
}

type JsonRecord = Record<string, unknown>

function mapUser(payload: Record<string, unknown>): AdminUser | null {
  const profile =
    (payload.user as JsonRecord | undefined) ??
    (payload.profile as JsonRecord | undefined)

  const id = String(
    payload.id ??
      payload._id ??
      payload.userId ??
      profile?.id ??
      profile?._id ??
      ""
  )
  if (!id) return null

  return {
    id,
    name:
      String(
        payload.name ??
          payload.fullName ??
          payload.username ??
          profile?.name ??
          profile?.fullName ??
          profile?.username ??
          "Unknown User"
      ) || "Unknown User",
    email: String(payload.email ?? profile?.email ?? "") || "",
    role: String(
      payload.role ?? payload.userRole ?? profile?.role ?? "USER"
    ).toUpperCase(),
    status: String(
      payload.status ?? payload.userStatus ?? profile?.status ?? "ACTIVE"
    ).toUpperCase(),
    createdAt:
      String(payload.createdAt ?? profile?.createdAt ?? "") || undefined,
  }
}

function mapEvent(payload: JsonRecord): AdminEvent | null {
  const id = String(payload.id ?? payload._id ?? payload.eventId ?? "")
  if (!id) return null

  return {
    id,
    title: String(payload.title ?? payload.name ?? "Untitled Event"),
    description: String(payload.description ?? "") || undefined,
    date: String(payload.date ?? "") || undefined,
    time: String(payload.time ?? "") || undefined,
    venue: String(payload.venue ?? payload.location ?? "") || undefined,
    type: String(payload.type ?? "") || undefined,
    fee:
      typeof payload.fee === "number" || typeof payload.fee === "string"
        ? payload.fee
        : undefined,
    isFeatured:
      typeof payload.isFeatured === "boolean" ? payload.isFeatured : undefined,
    status:
      String(payload.eventStatus ?? payload.status ?? "").toUpperCase() ||
      undefined,
    creatorId:
      String(
        payload.creatorId ??
          (payload.creator as JsonRecord | undefined)?.id ??
          (payload.creator as JsonRecord | undefined)?._id ??
          ""
      ) || undefined,
  }
}

function mapActivityLog(payload: JsonRecord): AdminActivityLog | null {
  const id = String(payload.id ?? payload._id ?? payload.logId ?? "")
  if (!id) return null

  const adminPayload =
    (payload.admin as JsonRecord | undefined) ??
    (payload.actor as JsonRecord | undefined)

  return {
    id,
    action: String(payload.action ?? payload.type ?? "UNKNOWN"),
    targetId: String(payload.targetId ?? payload.target ?? "") || undefined,
    details: String(payload.details ?? payload.description ?? "") || undefined,
    createdAt: String(payload.createdAt ?? "") || undefined,
    adminId: String(payload.adminId ?? adminPayload?.id ?? "") || undefined,
    admin: adminPayload
      ? {
          id: String(adminPayload.id ?? "") || undefined,
          name: String(adminPayload.name ?? "") || undefined,
          email: String(adminPayload.email ?? "") || undefined,
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

function extractUsersArray(body: JsonRecord): unknown[] {
  const data = (body?.data as JsonRecord | undefined) ?? undefined

  if (Array.isArray(body)) return body
  if (Array.isArray(body?.users)) return body.users
  if (Array.isArray(body?.data)) return body.data as unknown[]
  if (data && Array.isArray(data?.users)) return data.users as unknown[]
  if (data && Array.isArray(data?.result)) return data.result as unknown[]
  if (data && Array.isArray(data?.items)) return data.items as unknown[]

  return []
}

function extractEventsArray(body: JsonRecord): unknown[] {
  const data = (body?.data as JsonRecord | undefined) ?? undefined

  if (Array.isArray(body)) return body
  if (Array.isArray(body?.events)) return body.events
  if (Array.isArray(body?.data)) return body.data as unknown[]
  if (data && Array.isArray(data?.events)) return data.events as unknown[]
  if (data && Array.isArray(data?.result)) return data.result as unknown[]
  if (data && Array.isArray(data?.items)) return data.items as unknown[]

  return []
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

async function getAuthToken() {
  const cookieStore = await cookies()
  return normalizeToken(cookieStore.get("token")?.value)
}

export async function getAllUsersAction(): Promise<AdminUsersResponse> {
  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
      data: [],
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
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
          body?.message ?? body?.error ?? "Failed to fetch users."
        ),
        data: [],
      }
    }

    const rawUsers = extractUsersArray(body)

    const users = rawUsers
      .map((item) =>
        item && typeof item === "object"
          ? mapUser(item as Record<string, unknown>)
          : null
      )
      .filter((item): item is AdminUser => Boolean(item))

    return {
      success: true,
      message: String(
        body?.message ??
          (users.length ? "Users fetched successfully." : "No users found.")
      ),
      data: users,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch users.",
      data: [],
    }
  }
}

export async function getUserByIdAction(
  userId: string
): Promise<AdminUserResponse> {
  const normalizedUserId = userId.trim()

  if (!normalizedUserId) {
    return {
      success: false,
      message: "User ID is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${normalizedUserId}`,
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
          body?.message ?? body?.error ?? "Failed to fetch user."
        ),
      }
    }

    const payload =
      (body?.data as Record<string, unknown> | undefined) ??
      ((body?.data as Record<string, unknown> | undefined)?.user as
        | Record<string, unknown>
        | undefined) ??
      (body?.user as Record<string, unknown> | undefined) ??
      body

    const mapped =
      payload && typeof payload === "object" ? mapUser(payload) : null

    if (!mapped) {
      return {
        success: false,
        message: "User data not found in response.",
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "User fetched successfully."),
      data: mapped,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch user.",
    }
  }
}

export async function banUserAction(userId: string): Promise<BanUserResponse> {
  const normalizedUserId = userId.trim()

  if (!normalizedUserId) {
    return {
      success: false,
      message: "User ID is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${normalizedUserId}/ban`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "BLOCKED" }),
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to block user."
        ),
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "User blocked successfully."),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to block user.",
    }
  }
}

export async function makeUserModeratorAction(
  userId: string
): Promise<UpdateUserRoleResponse> {
  const normalizedUserId = userId.trim()

  if (!normalizedUserId) {
    return {
      success: false,
      message: "User ID is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${normalizedUserId}/role`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "MODERATOR" }),
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to update user role."
        ),
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "User is now MODERATOR."),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user role.",
    }
  }
}

export async function getAdminEventsAction(
  query: AdminEventsQuery = {}
): Promise<AdminEventsResponse> {
  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
      data: [],
    }
  }

  const searchParams = new URLSearchParams()

  if (typeof query.page === "number") {
    searchParams.set("page", String(query.page))
  }
  if (typeof query.limit === "number") {
    searchParams.set("limit", String(query.limit))
  }
  if (query.search?.trim()) {
    searchParams.set("search", query.search.trim())
  }
  if (query.type?.trim()) {
    searchParams.set("type", query.type.trim())
  }
  if (typeof query.isFeatured === "boolean") {
    searchParams.set("isFeatured", String(query.isFeatured))
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/events${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`

  try {
    const response = await fetchWithAuthFallback(
      url,
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
          body?.message ?? body?.error ?? "Failed to fetch events."
        ),
        data: [],
      }
    }

    const rawEvents = extractEventsArray(body)
    const events = rawEvents
      .map((item) =>
        item && typeof item === "object" ? mapEvent(item as JsonRecord) : null
      )
      .filter((item): item is AdminEvent => Boolean(item))

    const metaSource =
      (body?.meta as JsonRecord | undefined) ??
      ((body?.data as JsonRecord | undefined)?.meta as JsonRecord | undefined)

    return {
      success: true,
      message: String(
        body?.message ??
          (events.length ? "Events fetched successfully." : "No events found.")
      ),
      data: events,
      meta: {
        page:
          typeof metaSource?.page === "number" ? metaSource.page : undefined,
        limit:
          typeof metaSource?.limit === "number" ? metaSource.limit : undefined,
        total:
          typeof metaSource?.total === "number" ? metaSource.total : undefined,
        totalPages:
          typeof metaSource?.totalPages === "number"
            ? metaSource.totalPages
            : undefined,
      },
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch events.",
      data: [],
    }
  }
}

export async function getAdminEventByIdAction(
  eventId: string
): Promise<AdminEventResponse> {
  const normalizedEventId = eventId.trim()

  if (!normalizedEventId) {
    return {
      success: false,
      message: "Event ID is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/events/${normalizedEventId}`,
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
          body?.message ?? body?.error ?? "Failed to fetch event."
        ),
      }
    }

    const payload =
      (body?.data as JsonRecord | undefined) ??
      ((body?.data as JsonRecord | undefined)?.event as
        | JsonRecord
        | undefined) ??
      (body?.event as JsonRecord | undefined) ??
      body

    const mapped = payload ? mapEvent(payload) : null

    if (!mapped) {
      return {
        success: false,
        message: "Event data not found in response.",
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "Event fetched successfully."),
      data: mapped,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch event.",
    }
  }
}

export async function deleteAdminEventAction(
  eventId: string
): Promise<DeleteAdminEventResponse> {
  const normalizedEventId = eventId.trim()

  if (!normalizedEventId) {
    return {
      success: false,
      message: "Event ID is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/events/${normalizedEventId}`,
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
          body?.message ?? body?.error ?? "Failed to delete event."
        ),
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "Event deleted successfully."),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete event.",
    }
  }
}

export async function featureAdminEventAction(
  eventId: string,
  isFeatured = true
): Promise<FeatureAdminEventResponse> {
  const normalizedEventId = eventId.trim()

  if (!normalizedEventId) {
    return {
      success: false,
      message: "Event ID is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/events/${normalizedEventId}/feature`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFeatured }),
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to update featured status."
        ),
      }
    }

    return {
      success: true,
      message: String(
        body?.message ??
          (isFeatured
            ? "Event marked as featured successfully."
            : "Event featured status updated successfully.")
      ),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update featured status.",
    }
  }
}

export async function updateAdminEventStatusAction(
  eventId: string,
  eventStatus: string
): Promise<UpdateAdminEventStatusResponse> {
  const normalizedEventId = eventId.trim()
  const normalizedEventStatus = eventStatus.trim().toUpperCase()

  if (!normalizedEventId) {
    return {
      success: false,
      message: "Event ID is required.",
    }
  }

  if (!normalizedEventStatus) {
    return {
      success: false,
      message: "Event status is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/events/${normalizedEventId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventStatus: normalizedEventStatus }),
        cache: "no-store",
      },
      token
    )

    const body = await parseResponseBody(response)

    if (!response.ok) {
      return {
        success: false,
        message: String(
          body?.message ?? body?.error ?? "Failed to update event status."
        ),
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "Event status updated successfully."),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update event status.",
    }
  }
}

export async function deleteAdminReviewAction(
  reviewId: string
): Promise<DeleteAdminReviewResponse> {
  const normalizedReviewId = reviewId.trim()

  if (!normalizedReviewId) {
    return {
      success: false,
      message: "Review ID is required.",
    }
  }

  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${normalizedReviewId}`,
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

export async function getAdminAnalyticsAction(): Promise<AdminAnalyticsResponse> {
  const token = await getAuthToken()

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
      data: {
        totalUsers: 0,
        totalEvents: 0,
        totalReviews: 0,
        totalParticipations: 0,
        totalRevenue: 0,
      },
    }
  }

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/analytics`,
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
          body?.message ?? body?.error ?? "Failed to fetch dashboard analytics."
        ),
        data: {
          totalUsers: 0,
          totalEvents: 0,
          totalReviews: 0,
          totalParticipations: 0,
          totalRevenue: 0,
        },
      }
    }

    const payload = ((body?.data as JsonRecord | undefined) ??
      body) as JsonRecord

    return {
      success: true,
      message: String(
        body?.message ?? "Dashboard analytics fetched successfully."
      ),
      data: {
        totalUsers: Number(payload?.totalUsers ?? 0) || 0,
        totalEvents: Number(payload?.totalEvents ?? 0) || 0,
        totalReviews: Number(payload?.totalReviews ?? 0) || 0,
        totalParticipations: Number(payload?.totalParticipations ?? 0) || 0,
        totalRevenue: Number(payload?.totalRevenue ?? 0) || 0,
      },
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard analytics.",
      data: {
        totalUsers: 0,
        totalEvents: 0,
        totalReviews: 0,
        totalParticipations: 0,
        totalRevenue: 0,
      },
    }
  }
}

export async function getAdminActivityLogsAction(
  query: AdminActivityLogsQuery = {}
): Promise<AdminActivityLogsResponse> {
  const token = await getAuthToken()

  const fallback = {
    logs: [] as AdminActivityLog[],
    total: 0,
    page: query.page && query.page > 0 ? query.page : 1,
    limit: query.limit && query.limit > 0 ? query.limit : 20,
  }

  if (!token) {
    return {
      success: false,
      message: "Unauthorized. Please log in.",
      data: fallback,
    }
  }

  const searchParams = new URLSearchParams()
  searchParams.set(
    "page",
    String(query.page && query.page > 0 ? query.page : 1)
  )
  searchParams.set(
    "limit",
    String(query.limit && query.limit > 0 ? query.limit : 20)
  )

  try {
    const response = await fetchWithAuthFallback(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/activity-logs?${searchParams.toString()}`,
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
          body?.message ?? body?.error ?? "Failed to fetch activity logs."
        ),
        data: fallback,
      }
    }

    const dataPayload = (body?.data as JsonRecord | undefined) ?? body
    const logsPayload =
      (Array.isArray(dataPayload?.logs) ? dataPayload.logs : undefined) ??
      (Array.isArray(body?.logs) ? body.logs : undefined) ??
      []

    const logs = logsPayload
      .map((item) =>
        item && typeof item === "object"
          ? mapActivityLog(item as JsonRecord)
          : null
      )
      .filter((item): item is AdminActivityLog => Boolean(item))

    return {
      success: true,
      message: String(body?.message ?? "Activity logs fetched successfully"),
      data: {
        logs,
        total: Number(dataPayload?.total ?? 0) || 0,
        page: Number(dataPayload?.page ?? fallback.page) || fallback.page,
        limit: Number(dataPayload?.limit ?? fallback.limit) || fallback.limit,
      },
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch activity logs.",
      data: fallback,
    }
  }
}
