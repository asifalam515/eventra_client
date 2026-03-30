"use server"

import { SessionUser, getSessionUser } from "@/lib/session-user"
import { normalizeToken } from "@/lib/token"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

interface UpdateProfilePayload {
  name?: string
  email?: string
  photo?: string
}

interface UpdateProfileResponse {
  success: boolean
  message: string
  data?: Record<string, unknown>
  error?: string
}

export async function updateProfileAction(
  userId: string,
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      message: "Unauthorized",
      error: "No authentication token found",
    }
  }

  try {
    // Filter out undefined values
    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    )

    if (Object.keys(updatePayload).length === 0) {
      return {
        success: false,
        message: "No fields to update",
        error: "Please provide at least one field to update",
      }
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/profile/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(updatePayload),
        cache: "no-store",
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Failed to update profile",
        error: data?.error || `HTTP ${response.status}`,
      }
    }

    const nextToken = normalizeToken(
      data?.data?.token ??
        data?.token ??
        data?.data?.accessToken ??
        data?.accessToken
    )

    // Some backends issue a fresh token after profile updates.
    if (nextToken) {
      cookieStore.set({
        name: "token",
        value: nextToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    revalidatePath("/dashboard")

    return {
      success: true,
      message: data?.message || "Profile updated successfully",
      data: data?.data || data,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      message: "Failed to update profile",
      error: errorMessage,
    }
  }
}

export async function getCurrentUserAction(): Promise<SessionUser | null> {
  return getSessionUser()
}
