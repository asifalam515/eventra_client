import LoginForm from "@/components/CommoneComponents/Auth/loginForm"

const Page = () => {
  return (
    <section className="relative isolate overflow-hidden py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--foreground)/0.06),transparent_35%),radial-gradient(circle_at_85%_15%,hsl(var(--primary)/0.12),transparent_32%),radial-gradient(circle_at_50%_90%,hsl(var(--foreground)/0.05),transparent_40%)]" />

      <div className="mx-auto grid min-h-[75vh] w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-5">
          <p className="inline-flex w-fit items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Eventra Account Access
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Sign in and pick up
            <span className="block text-primary">
              right where you left off.
            </span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            Access your personalized dashboard, monitor upcoming events, and
            stay in control of registrations from one place.
          </p>

          <div className="grid max-w-md grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <p className="text-lg font-bold text-foreground">100+</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <p className="text-lg font-bold text-foreground">24/7</p>
              <p className="text-xs text-muted-foreground">Access</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <p className="text-lg font-bold text-foreground">Secure</p>
              <p className="text-xs text-muted-foreground">Auth</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <LoginForm />
        </div>
      </div>
    </section>
  )
}

export default Page
