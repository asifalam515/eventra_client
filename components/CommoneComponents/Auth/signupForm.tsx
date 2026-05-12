"use client"

import { signupAction, type SignupActionState } from "@/actions/auth"
import SocialAuthButtons from "@/components/CommoneComponents/Auth/social-auth-buttons"
import { useUserContext } from "@/components/providers/user-provider"
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
  const { user } = useUserContext()
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
        router.push("/dashboard")
      }, 1000)

      return () => clearTimeout(redirectTimer)
    }
  }, [state.status, router])

  useEffect(() => {
    if (!user) return

    router.replace("/dashboard")
  }, [user, router])

  const dismissAlert = () => {
    setIsVisible(false)
  }

import { motion } from "framer-motion"

// ... existing code ...
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
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join Eventra and start managing events with ease.
        </p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} action={formAction} className="space-y-4">
        <div className="relative">
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder=" "
            className="peer h-12 pt-4 pb-1 pl-10 bg-muted/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
          <Label
            htmlFor="name"
            className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 scale-100 text-muted-foreground transition-all peer-focus:top-3 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75"
          >
            Full name
          </Label>
        </div>

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

        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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

        <div className="relative">
          <Input
            id="photo"
            name="photo"
            type="url"
            autoComplete="url"
            placeholder=" "
            className="peer h-12 pt-4 pb-1 pl-10 bg-muted/20"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
          <ImageIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" />
          <Label
            htmlFor="photo"
            className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 scale-100 text-muted-foreground transition-all peer-focus:top-3 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75"
          >
            Photo URL (optional)
          </Label>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Creating account..." : "Sign up"}
        </Button>

        <SocialAuthButtons redirectTo="/dashboard" />
      </motion.form>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  )
}

export default SignupForm
