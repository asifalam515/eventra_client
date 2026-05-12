import LoginForm from "@/components/CommoneComponents/Auth/loginForm"
import { Sparkles } from "lucide-react"

const Page = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Left Branding Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-indigo-900/40 to-black/80 z-10" />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px]" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]" />
        </div>
        
        <div className="relative z-20 flex items-center gap-2 font-bold tracking-widest uppercase text-sm">
          <Sparkles className="size-5 text-primary" />
          Eventra
        </div>

        <div className="relative z-20 mt-auto max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-balance leading-tight">
            The platform for <br />
            <span className="text-primary-foreground/70">unforgettable events.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Access your personalized dashboard, monitor upcoming events, and stay in control of registrations from one elegant interface.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please enter your details to sign in.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
