"use client"

export type InvoiceKind = "payment" | "participant"

export class InvoiceDownloadError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "InvoiceDownloadError"
    this.status = status
  }
}

function resolveApiUrl(path: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (!apiBase) {
    throw new InvoiceDownloadError("Invoice service is not configured.")
  }

  return `${apiBase}${path}`
}

function resolveProxyUrl(path: string) {
  return `/api${path}`
}

async function fetchInvoiceBlob(path: string, token?: string): Promise<Blob> {
  const normalizedToken = token?.trim()

  if (!normalizedToken) {
    const response = await fetch(resolveProxyUrl(path), {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    })

    if (!response.ok) {
      let serverMessage = ""

      try {
        const body = (await response.json()) as Record<string, unknown>
        serverMessage = String(body?.message ?? body?.error ?? "")
      } catch {
        // Keep fallback for non-JSON error bodies.
      }

      throw new InvoiceDownloadError(
        serverMessage || `Invoice request failed (${response.status}).`,
        response.status
      )
    }

    return response.blob()
  }

  const request = async (authHeader: string) =>
    fetch(resolveApiUrl(path), {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    })

  let response = await request(`Bearer ${normalizedToken}`)

  if (response.status === 401 || response.status === 403) {
    response = await request(normalizedToken)
  }

  if (!response.ok) {
    let serverMessage = ""

    try {
      const body = (await response.json()) as Record<string, unknown>
      serverMessage = String(body?.message ?? body?.error ?? "")
    } catch {
      // Keep fallback message for non-JSON responses.
    }

    throw new InvoiceDownloadError(
      serverMessage || `Invoice request failed (${response.status}).`,
      response.status
    )
  }

  return response.blob()
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = blobUrl
  anchor.download = filename
  anchor.style.display = "none"

  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl)
  }, 1000)
}

function buildFilename(kind: InvoiceKind, id: string) {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "") || "invoice"
  return `${kind}-invoice-${safeId}.pdf`
}

export function handleInvoiceError(error: unknown) {
  if (error instanceof InvoiceDownloadError) {
    if (error.status === 401) {
      return "Your session expired. Please log in again."
    }

    if (error.status === 403) {
      return "You are not allowed to access this invoice."
    }

    if (error.status === 404) {
      return "Invoice is not available yet."
    }

    return error.message || "Failed to download invoice."
  }

  if (error instanceof TypeError) {
    return "Network error while downloading invoice. Please retry."
  }

  if (error instanceof Error) {
    return error.message || "Failed to download invoice."
  }

  return "Failed to download invoice."
}

export async function downloadPaymentInvoice(
  paymentId: string,
  token?: string
) {
  const normalizedPaymentId = paymentId.trim()
  if (!normalizedPaymentId) {
    throw new InvoiceDownloadError("Payment ID is required.")
  }

  const blob = await fetchInvoiceBlob(
    `/invoice/payment/${normalizedPaymentId}`,
    token
  )

  triggerBlobDownload(blob, buildFilename("payment", normalizedPaymentId))
}

export async function downloadParticipantInvoice(
  participantId: string,
  token?: string
) {
  const normalizedParticipantId = participantId.trim()
  if (!normalizedParticipantId) {
    throw new InvoiceDownloadError("Participant ID is required.")
  }

  const blob = await fetchInvoiceBlob(
    `/invoice/participant/${normalizedParticipantId}`,
    token
  )

  triggerBlobDownload(
    blob,
    buildFilename("participant", normalizedParticipantId)
  )
}

export async function openInvoiceInNewTab(
  kind: InvoiceKind,
  id: string,
  token?: string
) {
  const normalizedId = id.trim()
  if (!normalizedId) {
    throw new InvoiceDownloadError("Invoice ID is required.")
  }

  const path =
    kind === "payment"
      ? `/invoice/payment/${normalizedId}`
      : `/invoice/participant/${normalizedId}`

  const blob = await fetchInvoiceBlob(path, token)
  const blobUrl = window.URL.createObjectURL(blob)

  window.open(blobUrl, "_blank", "noopener,noreferrer")

  window.setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl)
  }, 60_000)
}
