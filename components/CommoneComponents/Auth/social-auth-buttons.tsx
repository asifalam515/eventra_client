"use client"

import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import { mapSessionUser, SessionUser } from "@/lib/session-user-mapper"
import { loginWithFacebook, loginWithGoogle } from "@/lib/social-auth"
import { normalizeToken, persistClientToken } from "@/lib/token"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type Provider = "google" | "facebook"

type SocialAuthButtonsProps = {
  redirectTo?: string
}

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleIdAPI = {
  initialize: (input: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  prompt: () => void
}

type FacebookLoginResponse = {
  authResponse?: {
    accessToken?: string
  }
  status?: string
}

type FacebookSDK = {
  init: (options: {
    appId: string
    cookie: boolean
    xfbml: boolean
    version: string
  }) => void
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope?: string }
  ) => void
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleIdAPI
      }
    }
    FB?: FacebookSDK
    fbAsyncInit?: () => void
  }
}

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client"
const FACEBOOK_SCRIPT_SRC = "https://connect.facebook.net/en_US/sdk.js"

let googleScriptPromise: Promise<void> | null = null
let facebookScriptPromise: Promise<void> | null = null

function safeMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function ensureGoogleScript() {
  if (typeof window === "undefined")
    return Promise.reject(
      new Error("Google Sign-In is only available in the browser.")
    )
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error("Unable to load Google Sign-In SDK."))
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

function ensureFacebookScript(appId: string) {
  if (typeof window === "undefined")
    return Promise.reject(
      new Error("Facebook Login is only available in the browser.")
    )
  if (window.FB) return Promise.resolve()
  if (facebookScriptPromise) return facebookScriptPromise

  facebookScriptPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (!window.FB) {
        reject(new Error("Unable to initialize Facebook SDK."))
        return
      }

      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v22.0",
      })

      resolve()
    }

    const script = document.createElement("script")
    script.src = FACEBOOK_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error("Unable to load Facebook SDK."))
    document.head.appendChild(script)
  })

  return facebookScriptPromise
}

async function requestGoogleIdToken(clientId: string) {
  await ensureGoogleScript()

  const googleId = window.google?.accounts?.id
  if (!googleId) {
    throw new Error("Google Sign-In SDK is not available.")
  }

  return await new Promise<string>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Google login timed out. Please try again."))
    }, 60000)

    googleId.initialize({
      client_id: clientId,
      callback: (response) => {
        window.clearTimeout(timeout)

        if (!response?.credential) {
          reject(
            new Error(
              "Google login was cancelled or did not return an ID token."
            )
          )
          return
        }

        resolve(response.credential)
      },
    })

    googleId.prompt()
  })
}

async function requestFacebookAccessToken(appId: string) {
  await ensureFacebookScript(appId)

  const sdk = window.FB
  if (!sdk) {
    throw new Error("Facebook SDK is not available.")
  }

  return await new Promise<string>((resolve, reject) => {
    sdk.login(
      (response) => {
        const token = response?.authResponse?.accessToken

        if (!token) {
          reject(
            new Error(
              "Facebook login was cancelled or did not return an access token."
            )
          )
          return
        }

        resolve(token)
      },
      { scope: "email,public_profile" }
    )
  })
}

async function fetchCurrentUser(token: string | null) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiBaseUrl) return null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = token
  }

  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    method: "GET",
    credentials: "include",
    headers,
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as Record<string, unknown>
  const data =
    (payload.data as Record<string, unknown> | undefined) ??
    (payload.user as Record<string, unknown> | undefined) ??
    payload

  if (!data || typeof data !== "object") {
    return null
  }

  return mapSessionUser(data)
}

export default function SocialAuthButtons({
  redirectTo,
}: SocialAuthButtonsProps) {
  const router = useRouter()
  const { setUser } = useUserContext()
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID

  const targetPath = useMemo(() => {
    if (redirectTo && redirectTo.startsWith("/")) return redirectTo
    return "/dashboard"
  }, [redirectTo])

  async function applyAuthSuccess(
    nextToken: string | null,
    rawUser: Record<string, unknown> | null
  ) {
    const normalizedToken = normalizeToken(nextToken)
    if (normalizedToken) {
      persistClientToken(normalizedToken)
    }

    let nextUser: SessionUser | null = null
    if (rawUser && typeof rawUser === "object") {
      nextUser = mapSessionUser(rawUser)
    }

    if (!nextUser) {
      nextUser = await fetchCurrentUser(normalizedToken)
    }

    if (nextUser) {
      setUser(nextUser)
    }

    router.push(targetPath)
    router.refresh()
  }

  async function handleGoogleLogin() {
    if (!googleClientId) {
      setErrorMessage(
        "Google login is not configured. Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID."
      )
      return
    }

    setErrorMessage("")
    setLoadingProvider("google")

    try {
      const idToken = await requestGoogleIdToken(googleClientId)
      const result = await loginWithGoogle(idToken)
      await applyAuthSuccess(result.token, result.user)
    } catch (error) {
      setErrorMessage(
        safeMessage(error, "Google login failed. Please try again.")
      )
    } finally {
      setLoadingProvider(null)
    }
  }

  async function handleFacebookLogin() {
    if (!facebookAppId) {
      setErrorMessage(
        "Facebook login is not configured. Missing NEXT_PUBLIC_FACEBOOK_APP_ID."
      )
      return
    }

    setErrorMessage("")
    setLoadingProvider("facebook")

    try {
      const accessToken = await requestFacebookAccessToken(facebookAppId)
      const result = await loginWithFacebook(accessToken)
      await applyAuthSuccess(result.token, result.user)
    } catch (error) {
      setErrorMessage(
        safeMessage(error, "Facebook login failed. Please try again.")
      )
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative py-1 text-center text-xs tracking-[0.16em] text-muted-foreground uppercase">
        <span className="relative z-10 bg-card/90 px-2">or continue with</span>
        <span className="absolute inset-x-0 top-1/2 z-0 h-px -translate-y-1/2 bg-border/70" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={handleGoogleLogin}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === "google" ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Continue with Google"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={handleFacebookLogin}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === "facebook" ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Continue with Facebook"
          )}
        </Button>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-red-300/60 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
