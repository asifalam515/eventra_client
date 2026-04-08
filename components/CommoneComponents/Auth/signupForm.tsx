"use client"

import { signupAction, type SignupActionState } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  LockKeyhole,
  Mail,
  User,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const AUTO_DISMISS_MS = 3500

const SignupForm = () => {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [photo, setPhoto] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  const initialState: SignupActionState = { status: "idle", message: "" }
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState
  )

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      return
    }

    const showTimer = setTimeout(() => {
      setIsVisible(true)
      setProgress(100)
    }, 0)

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

    return () => {
      clearTimeout(showTimer)
      clearInterval(animationInterval)
    }
  }, [state.status, state.message])

  useEffect(() => {
    if (state.status === "success") {
      const redirectTimer = setTimeout(() => {
        router.push("/")
      }, 1000)

      return () => clearTimeout(redirectTimer)
    }
  }, [state.status, router])

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
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join Eventra and start managing events with ease.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your full name"
              className="pl-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Create a strong password"
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

        <div className="space-y-2">
          <Label htmlFor="photo">Photo URL (optional)</Label>
          <div className="relative">
            <ImageIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="photo"
              name="photo"
              type="url"
              autoComplete="url"
              placeholder="https://example.com/photo.jpg"
              className="pl-9"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default SignupForm
