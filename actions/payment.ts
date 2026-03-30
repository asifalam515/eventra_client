"use server"

import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

export type CreateIntentResult = {
  success: boolean
  message: string
  clientSecret?: string
  transactionId?: string
}

export type ConfirmPaymentResult = {
  success: boolean
  message: string
  status?: "PAID" | "PENDING_ACTION"
  paymentIntentStatus?: string
  clientSecret?: string
  alreadyConfirmed?: boolean
}

export async function createPaymentIntentAction(
  eventId: string
): Promise<CreateIntentResult> {
  const normalizedEventId = eventId.trim()

  if (!normalizedEventId) {
    return {
      success: false,
      message: "Event ID is missing.",
    }
  }

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      message: "Please log in to continue payment.",
    }
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/create-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ eventId: normalizedEventId }),
        cache: "no-store",
      }
    )

    const body = (await response.json()) as Record<string, unknown>

    if (!response.ok) {
      return {
        success: false,
        message:
          String(
            body?.message ?? body?.error ?? "Failed to create payment intent."
          ) || "Failed to create payment intent.",
      }
    }

    const data =
      (body?.data as Record<string, unknown> | undefined) ??
      (body?.payment as Record<string, unknown> | undefined) ??
      body

    const clientSecret =
      String(
        data?.clientSecret ??
          data?.client_secret ??
          data?.paymentIntentClientSecret ??
          ""
      ) || undefined

    const transactionId =
      String(
        data?.transactionId ??
          data?.transaction_id ??
          data?.paymentIntentId ??
          data?.id ??
          ""
      ) || undefined

    if (!clientSecret) {
      return {
        success: false,
        message: "Payment intent created but client secret not found.",
      }
    }

    return {
      success: true,
      message: String(body?.message ?? "Payment intent created."),
      clientSecret,
      transactionId,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create payment intent.",
    }
  }
}

export async function confirmPaymentAction(
  transactionId: string
): Promise<ConfirmPaymentResult> {
  const normalizedTransactionId = transactionId.trim()

  if (!normalizedTransactionId) {
    return {
      success: false,
      message: "Transaction ID is missing.",
    }
  }

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return {
      success: false,
      message: "Please log in to confirm payment.",
    }
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ transactionId: normalizedTransactionId }),
        cache: "no-store",
      }
    )

    const body = (await response.json()) as Record<string, unknown>

    if (!response.ok) {
      return {
        success: false,
        message:
          String(
            body?.message ?? body?.error ?? "Payment confirmation failed."
          ) || "Payment confirmation failed.",
      }
    }

    const data =
      (body?.data as Record<string, unknown> | undefined) ??
      (body?.payment as Record<string, unknown> | undefined) ??
      body

    const statusValue = String(data?.status ?? body?.status ?? "")
      .trim()
      .toUpperCase()

    const status =
      statusValue === "PAID" || statusValue === "PENDING_ACTION"
        ? (statusValue as "PAID" | "PENDING_ACTION")
        : undefined

    const paymentIntentStatus =
      String(data?.paymentIntentStatus ?? data?.stripeStatus ?? "") || undefined

    const clientSecret =
      String(data?.clientSecret ?? data?.client_secret ?? "") || undefined

    const alreadyConfirmed =
      typeof data?.alreadyConfirmed === "boolean"
        ? data.alreadyConfirmed
        : undefined

    if (!status) {
      return {
        success: false,
        message: "Invalid payment confirm response: missing status.",
      }
    }

    return {
      success: status === "PAID" || status === "PENDING_ACTION",
      message: String(body?.message ?? "Payment confirmation processed."),
      status,
      paymentIntentStatus,
      clientSecret,
      alreadyConfirmed,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Payment confirmation failed.",
    }
  }
}
