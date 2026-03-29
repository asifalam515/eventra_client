"use client"

import { ArrowLeft, Compass, Home, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

const NotFoundAnimation = () => {
  const router = useRouter()

  return (
    <section className="relative isolate overflow-hidden bg-background py-10 sm:py-14 lg:py-20">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_20%,hsl(var(--primary)/0.18),transparent_32%),radial-gradient(circle_at_88%_22%,hsl(var(--foreground)/0.08),transparent_28%),radial-gradient(circle_at_50%_95%,hsl(var(--primary)/0.1),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-size-[48px_48px] opacity-30" />

      <div className="mx-auto flex min-h-[75vh] w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl rounded-3xl border border-border/50 bg-card/65 p-6 text-center shadow-lg shadow-primary/5 backdrop-blur-md sm:p-10 lg:p-12">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            Eventra Navigation Guard
          </div>

          <p className="text-sm font-medium tracking-wider text-muted-foreground">
            ERROR 404
          </p>

          <h1 className="mt-2 text-5xl leading-none font-extrabold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Lost in{" "}
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Eventra
            </span>
          </h1>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            We could not find that page
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The page may have been moved, deleted, or the URL might be
            incorrect. You can go back or continue browsing Eventra.
          </p>

          <div className="mx-auto mt-7 grid w-full max-w-2xl grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
              <div className="text-lg font-bold text-foreground">404</div>
              <div className="text-xs tracking-wide uppercase">Status</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
              <div className="text-lg font-bold text-foreground">Route</div>
              <div className="text-xs tracking-wide uppercase">Not found</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
              <div className="text-lg font-bold text-foreground">Safe</div>
              <div className="text-xs tracking-wide uppercase">
                No data lost
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="h-12 w-full gap-2 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 sm:w-auto"
            >
              <Link href="/" aria-label="Go to homepage">
                <Home className="size-4" />
                Back to Home
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full bg-background/50 px-8 text-base backdrop-blur-sm sm:w-auto"
              onClick={() => router.back()}
              aria-label="Go to previous page"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>

            <Button
              asChild
              variant="secondary"
              size="lg"
              className="h-12 w-full gap-2 px-8 text-base sm:w-auto"
            >
              <Link href="/dashboard" aria-label="Open dashboard">
                <Compass className="size-4" />
                Dashboard
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 w-full gap-2 px-8 text-base sm:w-auto"
            >
              <Link href="/events" aria-label="Explore events">
                <Search className="size-4" />
                Explore Events
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Need account access? Continue from the{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              login page
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}

export default NotFoundAnimation
export { NotFoundAnimation }
// ✅ Alias required by 21st.dev:
export { NotFoundAnimation as Component }
