"use client"

import { loginAction, type LoginActionState } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LockKeyhole, Mail, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const AUTO_DISMISS_MS = 3500

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const initialState: LoginActionState = { status: "idle", message: "" }
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  useEffect(() => {
    // Only set up the timer if there's a message to show
    if (state.status === "idle" || !state.message) {
      return
    }

    setIsVisible(true)
    setProgress(100)

    const startTime = Date.now()
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, AUTO_DISMISS_MS - elapsed)
      setProgress((remaining / AUTO_DISMISS_MS) * 100)

      if (remaining === 0) {
        clearInterval(animationInterval)
        setIsVisible(false)
      }
    }, 30)

    return () => clearInterval(animationInterval)
  }, [state.status, state.message])

  // Redirect to homepage on successful login
  useEffect(() => {
    if (state.status === "success") {
      const redirectTarget = searchParams.get("redirect")
      const safeRedirect =
        redirectTarget && redirectTarget.startsWith("/") ? redirectTarget : "/"

      const redirectTimer = setTimeout(() => {
        router.push(safeRedirect)
      }, 1000) // 1 second delay to show success message

      return () => clearTimeout(redirectTimer)
    }
  }, [state.status, router, searchParams])

  const dismissAlert = () => {
    setIsVisible(false)
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-lg sm:p-8">
      {isVisible && state.message && (
        <div
          className={`mb-4 overflow-hidden rounded-lg border ${
            state.status === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start justify-between px-4 py-3">
            <p className="text-sm font-medium">{state.message}</p>
            <button
              type="button"
              onClick={dismissAlert}
              aria-label="Dismiss alert"
              className="ml-2 inline-flex opacity-70 transition hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="h-1 w-full bg-current opacity-20">
            <div
              className="h-full bg-current transition-all"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your events, tickets, and dashboard.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="pr-10 pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to Eventra?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default LoginForm
