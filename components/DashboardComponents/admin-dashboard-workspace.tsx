"use client"

import {
  AdminActivityLog,
  AdminAnalytics,
  AdminEvent,
  AdminUser,
} from "@/actions/admin"
import AdminActivityLogsPanel from "@/components/DashboardComponents/admin-activity-logs-panel"
import AdminEventsPanel from "@/components/DashboardComponents/admin-events-panel"
import AdminProfilePanel from "@/components/DashboardComponents/admin-profile-panel"
import AdminUsersPanel from "@/components/DashboardComponents/admin-users-panel"
import { useUserContext } from "@/components/providers/user-provider"
import { Button } from "@/components/ui/button"
import {
  CalendarRange,
  CircleDollarSign,
  History,
  Menu,
  MessageSquareText,
  Shield,
  UserCog,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

type Section = "events" | "users" | "activity" | "profile"

type WorkspaceProps = {
  usersResult: {
    success: boolean
    message: string
    data: AdminUser[]
  }
  eventsResult: {
    success: boolean
    message: string
    data: AdminEvent[]
  }
  analyticsResult: {
    success: boolean
    message: string
    data: AdminAnalytics
  }
  logsResult: {
    success: boolean
    message: string
    data: {
      logs: AdminActivityLog[]
      total: number
      page: number
      limit: number
    }
  }
}

const sectionItems: Array<{
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = [
  {
    id: "events",
    label: "Events Management",
    icon: Shield,
    description: "Manage event listing, status, and moderation actions.",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    description: "Inspect users, assign roles, and block suspicious users.",
  },
  {
    id: "activity",
    label: "Activity Logs",
    icon: History,
    description: "Track audit history of admin moderation actions.",
  },
  {
    id: "profile",
    label: "Admin Profile",
    icon: UserCog,
    description: "Manage admin identity and profile information.",
  },
]

export default function AdminDashboardWorkspace({
  usersResult,
  eventsResult,
  analyticsResult,
  logsResult,
}: WorkspaceProps) {
  const { user } = useUserContext()
  const [activeSection, setActiveSection] = useState<Section>("events")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const activeConfig = useMemo(
    () =>
      sectionItems.find((item) => item.id === activeSection) ?? sectionItems[0],
    [activeSection]
  )

  const handleSelectSection = (section: Section) => {
    setActiveSection(section)
    setIsSidebarOpen(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value)
  }

  const metricCards = [
    {
      label: "Total Users",
      value: String(analyticsResult.data.totalUsers),
      icon: Users,
      tint: "from-cyan-500/15 to-cyan-500/5",
    },
    {
      label: "Total Events",
      value: String(analyticsResult.data.totalEvents),
      icon: CalendarRange,
      tint: "from-blue-500/15 to-blue-500/5",
    },
    {
      label: "Total Reviews",
      value: String(analyticsResult.data.totalReviews),
      icon: MessageSquareText,
      tint: "from-amber-500/15 to-amber-500/5",
    },
    {
      label: "Participations",
      value: String(analyticsResult.data.totalParticipations),
      icon: UserRoundCheck,
      tint: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(analyticsResult.data.totalRevenue),
      icon: CircleDollarSign,
      tint: "from-violet-500/15 to-violet-500/5",
    },
  ]

  return (
    <div className="relative grid min-h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`z-50 h-fit rounded-2xl border border-border/70 bg-card/90 p-3 shadow-sm transition-all duration-300 lg:sticky lg:top-6 ${
          isSidebarCollapsed ? "lg:w-20" : "lg:w-72"
        } ${
          isSidebarOpen
            ? "fixed top-4 left-4 w-[calc(100vw-2rem)]"
            : "hidden lg:block"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className={`${isSidebarCollapsed ? "lg:hidden" : "block"}`}>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Admin Workspace
            </p>
            <p className="text-sm font-semibold text-foreground">Navigation</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            >
              <Menu className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-border/70 bg-background/60 p-3">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.name || "Admin"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email || ""}
          </p>
        </div>

        <nav className="space-y-1.5">
          {sectionItems.map((item) => {
            const Icon = item.icon
            const active = item.id === activeSection

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSection(item.id)}
                className={`group w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? "border-primary/30 bg-primary/10 shadow-sm"
                    : "border-transparent hover:border-border hover:bg-background/70"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`size-4 shrink-0 ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <div
                    className={`${isSidebarCollapsed ? "lg:hidden" : "block"}`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        active ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Dashboard Analytics
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Real-time Platform Overview
              </h2>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                analyticsResult.success
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100"
              }`}
            >
              {analyticsResult.success ? "Live" : "Unavailable"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metricCards.map((metric) => {
              const Icon = metric.icon

              return (
                <article
                  key={metric.label}
                  className={`rounded-xl border border-border/70 bg-linear-to-br ${metric.tint} p-3 shadow-sm`}
                >
                  <div className="mb-3 inline-flex rounded-lg border border-border/70 bg-background/70 p-2">
                    <Icon className="size-4 text-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-1 truncate text-xl font-semibold text-foreground">
                    {metric.value}
                  </p>
                </article>
              )
            })}
          </div>
          {!analyticsResult.success && (
            <p className="mt-3 text-xs text-muted-foreground">
              {analyticsResult.message}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Admin Section
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {activeConfig.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeConfig.description}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="size-4" /> Menu
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur md:p-5">
          {activeSection === "events" && (
            <AdminEventsPanel
              initialEvents={eventsResult.data}
              initialMessage={eventsResult.message}
              initialMessageType={eventsResult.success ? "success" : "error"}
            />
          )}

          {activeSection === "users" && (
            <AdminUsersPanel
              initialUsers={usersResult.data}
              initialMessage={usersResult.message}
              initialMessageType={usersResult.success ? "success" : "error"}
            />
          )}

          {activeSection === "activity" && (
            <AdminActivityLogsPanel
              initialLogs={logsResult.data.logs}
              initialTotal={logsResult.data.total}
              initialPage={logsResult.data.page}
              initialLimit={logsResult.data.limit}
              initialMessage={logsResult.message}
              initialMessageType={logsResult.success ? "success" : "error"}
            />
          )}

          {activeSection === "profile" && <AdminProfilePanel />}
        </section>
      </div>
    </div>
  )
}
