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
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
            <Sparkles className="size-5" />
          </div>
          <div className={isDesktopSidebarCollapsed ? "lg:hidden" : "block"}>
            <p className="text-sm text-muted-foreground">Eventra</p>
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
            className="hidden lg:inline-flex"
            onClick={() => setIsDesktopSidebarCollapsed((prev) => !prev)}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border/70 bg-background/80 p-3 shadow-sm">
        <p className="text-xs text-muted-foreground">Signed in as</p>
        <p className="truncate text-sm font-semibold text-foreground">
          {user?.name || "User"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {user?.email || ""}
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((item, index) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)

          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                active
                  ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span
                className={isDesktopSidebarCollapsed ? "lg:hidden" : "block"}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border/70 bg-background/80 p-3 shadow-sm">
        <p className="text-xs text-muted-foreground">Role</p>
        <p className="text-sm font-semibold text-foreground">{role}</p>
      </div>
    </>
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-cyan-50/40 to-blue-100/40 dark:via-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute top-10 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-700/20" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-700/20" />

      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <div className="relative mx-auto flex w-full max-w-400 gap-4 p-4 md:p-6">
        <aside
          className={`z-50 h-[calc(100vh-3rem)] shrink-0 rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 ${
            isDesktopSidebarCollapsed ? "w-20" : "w-72"
          } ${
            isMobileSidebarOpen
              ? "fixed top-6 left-4 w-[calc(100vw-2rem)]"
              : "hidden lg:flex lg:flex-col"
          }`}
        >
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 rounded-2xl border border-border/70 bg-card/75 p-4 shadow-sm backdrop-blur-xl md:mb-6 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  Welcome back, {user?.name || "there"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your events, participants, and activity from one place.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="size-4" /> Menu
                </Button>
                <Button
                  asChild
                  className="bg-linear-to-r from-cyan-500 to-blue-600 text-white"
                >
                  <Link href="/create-event">Create Event</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="rounded-3xl border border-border/70 bg-card/75 p-4 shadow-sm backdrop-blur-xl md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
