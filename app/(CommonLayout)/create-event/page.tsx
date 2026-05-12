import CreateEventForm from "@/components/CommoneComponents/Event/createEventForm"
import { Sparkles, LayoutTemplate, Zap, ShieldCheck } from "lucide-react"

const CreateEventPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[200px] -left-[200px] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-foreground mb-6 shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary" />
            Event Creation Studio
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Launch your next big event
          </h1>
          <p className="mt-4 text-lg text-muted-foreground mx-auto max-w-xl text-balance">
            Everything you need to create, manage, and scale your experience. Start by filling out the details below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-5 backdrop-blur-md shadow-sm">
              <LayoutTemplate className="size-5 text-primary mb-3" />
              <p className="font-semibold text-foreground text-sm">Elegant Setup</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Design a beautiful event page in just a few clicks.</p>
           </div>
           <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-5 backdrop-blur-md shadow-sm">
              <Zap className="size-5 text-primary mb-3" />
              <p className="font-semibold text-foreground text-sm">Instant Publishing</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Go live immediately and start accepting registrations.</p>
           </div>
           <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 p-5 backdrop-blur-md shadow-sm">
              <ShieldCheck className="size-5 text-primary mb-3" />
              <p className="font-semibold text-foreground text-sm">Secure Ticketing</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Built-in checkout and reliable participant tracking.</p>
           </div>
        </div>

        <div className="rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-xl shadow-zinc-200/40 dark:shadow-black/40">
          <CreateEventForm />
        </div>
      </div>
    </div>
  )
}

export default CreateEventPage
