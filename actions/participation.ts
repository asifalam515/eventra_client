"use server"

import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

export type JoinParticipationState = {
  status: "idle" | "success" | "error"
  message: string
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
