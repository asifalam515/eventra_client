import { Button } from "@/components/ui/button"
import { ArrowRightIcon, CalendarRange, Sparkles } from "lucide-react"
import Link from "next/link"

export function CallToAction() {
  return (
    <section className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card/80 px-5 py-8 shadow-lg backdrop-blur sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.2),transparent_45%),radial-gradient(circle_at_85%_15%,hsl(var(--foreground)/0.08),transparent_35%),radial-gradient(circle_at_50%_100%,hsl(var(--primary)/0.12),transparent_45%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            <Sparkles className="size-3.5" /> Eventra Community
          </p>

          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Host your next experience or join one near you
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Discover public events, send invitations by email, and manage
            participants from one modern dashboard built for organizers and
            attendees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="lg">
            <Link href="/events">
              <CalendarRange className="size-4" /> Explore Events
            </Link>
          </Button>

          <Button asChild size="lg">
            <Link href="/create-event">
              Create Event <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
