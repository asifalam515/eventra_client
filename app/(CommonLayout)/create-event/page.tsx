import CreateEventForm from "@/components/CommoneComponents/Event/createEventForm"

const CreateEventPage = () => {
  return (
    <section className="relative isolate overflow-hidden py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_25%_30%,hsl(var(--foreground)/0.06),transparent_35%),radial-gradient(circle_at_75%_20%,hsl(var(--primary)/0.12),transparent_32%),radial-gradient(circle_at_50%_90%,hsl(var(--foreground)/0.05),transparent_40%)]" />

      <div className="mx-auto grid min-h-[70vh] w-full max-w-4xl grid-cols-1 gap-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-5">
          <p className="inline-flex w-fit items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Event Creation
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Launch your
            <span className="block text-primary">next big event.</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            Create and manage events on Eventra. Set details, manage attendees,
            and track your events success from one place.
          </p>

          <div className="grid max-w-md grid-cols-3 gap-3 pt-4">
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <p className="font-bold text-foreground">Easy Setup</p>
              <p className="text-xs text-muted-foreground">Minutes not hours</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <p className="font-bold text-foreground">Free Tools</p>
              <p className="text-xs text-muted-foreground">All included</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <p className="font-bold text-foreground">Live Tracking</p>
              <p className="text-xs text-muted-foreground">Real-time stats</p>
            </div>
          </div>
        </div>

        <div className="w-full justify-self-center lg:justify-self-start">
          <CreateEventForm />
        </div>
      </div>
    </section>
  )
}

export default CreateEventPage
