"use client"

import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Calendar,
  LayoutDashboard,
  Menu,
  Shield,
  Sparkles,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type DashboardShellProps = {
  role: string
  children: React.ReactNode
}

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname.startsWith(href)
}

export default function DashboardShell({
  role,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const { user } = useUserContext()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false)

  const commonLinks: NavItem[] = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/events",
      label: "Events",
      icon: Calendar,
    },
  ]

  const roleLinks: NavItem[] =
    role === "ADMIN"
      ? [
          {
            href: "/dashboard/admin-dashboard",
            label: "Admin Control",
            icon: Shield,
          },
        ]
      : role === "MODERATOR" || role === "MODERATORS"
        ? [
            {
              href: "/dashboard/moderator-dashboard",
              label: "Moderator Hub",
              icon: Shield,
            },
          ]
        : [
            {
              href: "/dashboard/user-dashboard",
              label: "My Profile",
              icon: Activity,
            },
          ]

  const links = [...commonLinks, ...roleLinks]

  const sidebar = (
    <>
      <div className="mb-6 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="size-5" />
          </div>
          <div className={isDesktopSidebarCollapsed ? "lg:hidden" : "block"}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Eventra</p>
            <h2 className="text-base font-semibold text-foreground">
              Dashboard
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsDesktopSidebarCollapsed((prev) => !prev)}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-border/50 bg-muted/20 p-4 shadow-inner">
        <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Signed in as</p>
        <p className="truncate text-sm font-bold text-foreground">
          {user?.name || "User"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {user?.email || ""}
        </p>
      </div>

      <nav className="space-y-1.5 flex-1 relative">
        {links.map((item, index) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)

          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors z-10 ${
                active
                  ? "text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebarActiveTab"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="size-4 shrink-0" />
              <AnimatePresence>
                {(!isDesktopSidebarCollapsed || isMobileSidebarOpen) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden block"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-border/50 bg-muted/20 p-4 shadow-inner">
        <p className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Role</p>
        <p className="text-sm font-bold text-foreground capitalize">{role.toLowerCase()}</p>
      </div>
    </>
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute top-10 -left-24 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[600px] w-[600px] rounded-full bg-slate-500/5 blur-[120px]" />

      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="relative mx-auto flex w-full max-w-7xl gap-6 p-4 md:p-8">
        <aside
          className={`z-50 h-[calc(100vh-4rem)] shrink-0 rounded-3xl border border-border/50 bg-card/40 p-6 shadow-xl backdrop-blur-2xl transition-all duration-300 flex flex-col ${
            isDesktopSidebarCollapsed ? "w-[88px]" : "w-72"
          } ${
            isMobileSidebarOpen
              ? "fixed top-8 left-4 w-[calc(100vw-2rem)]"
              : "hidden lg:flex"
          }`}
        >
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1 flex flex-col gap-6">
          <header className="rounded-3xl border border-border/50 bg-card/40 p-6 shadow-sm backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  Welcome back, {user?.name || "there"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your events, participants, and activity from one place.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="lg:hidden rounded-xl"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="size-4" /> <span className="ml-2">Menu</span>
                </Button>
                <Button
                  asChild
                  className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40"
                >
                  <Link href="/create-event">Create Event</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 rounded-3xl border border-border/50 bg-card/40 p-6 shadow-sm backdrop-blur-2xl md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
