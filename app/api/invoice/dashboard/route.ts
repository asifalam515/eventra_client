import { normalizeToken } from "@/lib/token"
import { cookies } from "next/headers"

const registrationEndpoints = [
  "/participation/my",
  "/participation/my-participations",
  "/participation/registrations",
  "/participation/my-registrations",
]

const paymentEndpoints = [
  "/payment/my",
  "/payment/history",
  "/payment/my-payments",
]

type JsonValue = Record<string, unknown> | unknown[] | null

async function fetchWithAuthFallback(url: string, token: string) {
  let response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (response.status === 401 || response.status === 403) {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      cache: "no-store",
    })
  }

  return response
}

async function fetchFirstWorkingEndpoint(
  baseUrl: string,
  endpoints: string[],
  token: string
): Promise<JsonValue> {
  for (const endpoint of endpoints) {
    const response = await fetchWithAuthFallback(`${baseUrl}${endpoint}`, token)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("AUTH_REQUIRED")
      }

      continue
    }

    try {
      return (await response.json()) as Record<string, unknown> | unknown[]
    } catch {
      return null
    }
  }

  return null
}

export async function GET() {
  const cookieStore = await cookies()
  const token = normalizeToken(cookieStore.get("token")?.value)

  if (!token) {
    return new Response(
      JSON.stringify({
        message: "Please log in to view registrations and payments.",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    )
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

  try {
    const [registrations, payments] = await Promise.all([
      fetchFirstWorkingEndpoint(apiBase, registrationEndpoints, token),
      fetchFirstWorkingEndpoint(apiBase, paymentEndpoints, token),
    ])

    return new Response(
      JSON.stringify({
        registrations,
        payments,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "AUTH_REQUIRED") {
      return new Response(
        JSON.stringify({
          message: "Your session expired. Please log in again.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({ message: "Unable to load invoice data right now." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
