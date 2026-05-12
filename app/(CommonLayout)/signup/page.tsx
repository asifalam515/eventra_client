import SignupForm from "@/components/CommoneComponents/Auth/signupForm"
import { Sparkles } from "lucide-react"

const Page = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-row-reverse">
      {/* Right Branding Panel (Reversed for visual variety) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-linear-to-bl from-indigo-900/40 via-primary/30 to-black/80 z-10" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
           <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
           <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]" />
        </div>
        
        <div className="relative z-20 flex items-center gap-2 font-bold tracking-widest uppercase text-sm self-end">
          <Sparkles className="size-5 text-primary" />
          Eventra
        </div>

        <div className="relative z-20 mt-auto max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-balance leading-tight">
            Start hosting <br />
            <span className="text-primary-foreground/70">smarter events.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Set up your profile in seconds, discover trending events, and get your personalized dashboard ready from day one.
          </p>
        </div>
      </div>

      {/* Left Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-12 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/50 dark:border-zinc-800/50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your details to get started with Eventra.
            </p>
          </div>

          <div className="mt-8">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
