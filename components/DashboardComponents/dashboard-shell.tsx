"use client"

import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Calendar,
  LayoutDashboard,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
          {
            href: "/dashboard/admin-dashboard",
            label: "User Management",
            icon: Users,
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-cyan-50 to-blue-100">
      <div className="pointer-events-none absolute top-10 -left-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[1600px] gap-4 p-4 md:p-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 rounded-3xl border border-white/60 bg-white/65 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Eventra</p>
              <h2 className="text-base font-semibold text-slate-900">
                Dashboard
              </h2>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white/80 p-3">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-slate-500">
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow"
                      : "text-slate-700 hover:bg-white/80"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200/70 bg-white/80 p-3">
            <p className="text-xs text-slate-500">Role</p>
            <p className="text-sm font-semibold text-slate-800">{role}</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-xl md:mb-6 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
                  Welcome back, {user?.name || "there"}
                </h1>
                <p className="text-sm text-slate-600">
                  Manage your events, participants, and activity from one place.
                </p>
              </div>
              <Button
                asChild
                className="bg-linear-to-r from-cyan-500 to-blue-600 text-white"
              >
                <Link href="/create-event">Create Event</Link>
              </Button>
            </div>
          </header>

          <main className="rounded-3xl border border-white/70 bg-white/70 p-4 backdrop-blur-xl md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
