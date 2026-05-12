import { normalizeToken } from "@/lib/token"

type JsonRecord = Record<string, unknown>

type SocialAuthResponse = {
  success?: boolean
  message?: string
  data?: {
    token?: string
    accessToken?: string
    user?: JsonRecord
  }
  token?: string
  accessToken?: string
  user?: JsonRecord
}

export type SocialLoginResult = {
  token: string | null
  user: JsonRecord | null
  message: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function parseJsonSafe(response: Response): Promise<JsonRecord> {
  try {
    return (await response.json()) as JsonRecord
  } catch {
    return {}
  }
}

function extractMessage(payload: JsonRecord, fallback: string) {
  const message = payload?.message
  return typeof message === "string" && message.trim() ? message : fallback
}

async function postSocialLogin(
  endpoint: "/auth/social/google" | "/auth/social/facebook",
  body: Record<string, string>
): Promise<SocialLoginResult> {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable.")
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  })

  const payload = (await parseJsonSafe(response)) as SocialAuthResponse

  if (!response.ok || payload?.success === false) {
    throw new Error(
      extractMessage(
        payload as JsonRecord,
        "Social login failed. Please try again."
      )
    )
  }

  const token = normalizeToken(
    payload?.data?.token ??
      payload?.token ??
      payload?.data?.accessToken ??
      payload?.accessToken
  )

  const user =
    (payload?.data?.user as JsonRecord | undefined) ??
    (payload?.user as JsonRecord | undefined) ??
    null

  return {
    token,
    user,
    message: extractMessage(payload as JsonRecord, "Social login successful."),
  }
}

export function loginWithGoogle(idToken: string) {
  return postSocialLogin("/auth/social/google", { idToken })
}

export function loginWithFacebook(accessToken: string) {
  return postSocialLogin("/auth/social/facebook", { accessToken })
}
