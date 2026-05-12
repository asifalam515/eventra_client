import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

async function fetchWithAuthFallback(url: string, token: string) {
  let response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (response.status === 401 || response.status === 403) {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
      },
      cache: "no-store",
    })
  }

  return response
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await context.params

  if (!paymentId?.trim()) {
    return new Response(
      JSON.stringify({ message: "Payment ID is required." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (!apiBase) {
    return new Response(
      JSON.stringify({ message: "API URL is not configured." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  const backendResponse = await fetchWithAuthFallback(
    `${apiBase}/invoice/payment/${paymentId}`,
    token
  )

  if (!backendResponse.ok) {
    const rawBody = await backendResponse.text()

    return new Response(
      rawBody || JSON.stringify({ message: "Invoice request failed." }),
      {
        status: backendResponse.status,
        headers: {
          "Content-Type":
            backendResponse.headers.get("content-type") || "application/json",
        },
      }
    )
  }

  const blob = await backendResponse.blob()

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type":
        backendResponse.headers.get("content-type") || "application/pdf",
      "Content-Disposition":
        backendResponse.headers.get("content-disposition") ||
        `attachment; filename="payment-invoice-${paymentId}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
