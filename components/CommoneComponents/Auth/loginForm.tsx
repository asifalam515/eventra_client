"use client"

import { motion } from "framer-motion"

import { loginAction, type LoginActionState } from "@/actions/auth"
import SocialAuthButtons from "@/components/CommoneComponents/Auth/social-auth-buttons"
import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Eye, EyeOff, LockKeyhole, Mail, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const AUTO_DISMISS_MS = 3500

const DEMO_ACCOUNTS = {
  admin: {
    label: "Login as admin",
    email: "asif@gmail.com",
    password: "password1234",
  },
  moderator: {
    label: "Login as moderator",
    email: "tamim@gmail.com",
    password: "tamim@gmail.com",
  },
  user: {
    label: "Login as user",
    email: "asifkhan@gmail.com",
    password: "asifkhan@gmail.com",
  },
} as const

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUserContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false)

  const initialState: LoginActionState = { status: "idle", message: "" }
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  useEffect(() => {
    // Only set up the timer if there's a message to show
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

  useEffect(() => {
    if (!user) return

    router.replace("/dashboard")
  }, [user, router])

  const dismissAlert = () => {
    setIsVisible(false)
  }

  const fillDemoAccount = (role: keyof typeof DEMO_ACCOUNTS) => {
    const account = DEMO_ACCOUNTS[role]

    setEmail(account.email)
    setPassword(account.password)
    setShowPassword(false)
    setIsVisible(false)
    setIsDemoMenuOpen(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="rounded-2xl border border-border/60 bg-card/90 p-6 shadow-lg sm:p-8"
    >
      {isVisible && state.message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
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
        </motion.div>
      )}
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your events, tickets, and dashboard.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-5 rounded-xl border border-dashed border-border/70 bg-muted/30 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-foreground">Demo accounts</p>
          <p className="text-xs text-muted-foreground">
            Pick one preset to auto-fill the login form.
          </p>
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-between px-3"
            onClick={() => setIsDemoMenuOpen((prev) => !prev)}
            aria-expanded={isDemoMenuOpen}
            aria-haspopup="menu"
          >
            <span>Use demo credentials</span>
            <ChevronDown
              className={`size-4 transition-transform ${isDemoMenuOpen ? "rotate-180" : ""}`}
            />
          </Button>

          {isDemoMenuOpen && (
            <div
              className="absolute top-full right-0 left-0 z-10 mt-2 overflow-hidden rounded-xl border border-border/70 bg-card p-2 shadow-lg"
              role="menu"
              aria-label="Demo login credentials"
            >
              {Object.entries(DEMO_ACCOUNTS).map(([role, account]) => (
                <button
                  key={role}
                  type="button"
                  className="flex w-full items-start justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  onClick={() =>
                    fillDemoAccount(role as keyof typeof DEMO_ACCOUNTS)
                  }
                >
                  <span className="font-medium">{account.label}</span>
                  <span className="ml-4 text-xs text-muted-foreground">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} action={formAction} className="space-y-4">
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder=" "
            className="peer h-12 pt-4 pb-1 pl-10 bg-muted/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
          <Label
            htmlFor="email"
            className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 scale-100 text-muted-foreground transition-all peer-focus:top-3 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75"
          >
            Email address
          </Label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder=" "
              className="peer h-12 pt-4 pb-1 pl-10 pr-10 bg-muted/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
            <Label
              htmlFor="password"
              className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 scale-100 text-muted-foreground transition-all peer-focus:top-3 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75"
            >
              Password
            </Label>
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

        <SocialAuthButtons
          redirectTo={searchParams.get("redirect") ?? "/dashboard"}
        />
      </motion.form>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5 text-center text-sm text-muted-foreground">
        New to Eventra?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground hover:underline"
        >
          Create an account
        </Link>
      </motion.p>
    </motion.div>
  )
}

export default LoginForm
