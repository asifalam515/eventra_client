"use client"

import type { Event } from "@/actions/event"
import type { MyInvitation } from "@/actions/invitation"
import MyInvitationsPanel from "@/components/CommoneComponents/Dashboard/my-invitations-panel"
import ProfileCard from "@/components/CommoneComponents/Dashboard/ProfileCard"
import UserEventParticipantsManager from "@/components/CommoneComponents/Dashboard/user-event-participants-manager"
import UserInvoicesPanel from "@/components/CommoneComponents/Dashboard/user-invoices-panel"
import UserMyEventsPanel from "@/components/CommoneComponents/Dashboard/user-my-events-panel"
import { useUserContext } from "@/components/providers/user-provider"
import {
  Calendar,
  CreditCard,
  FileText,
  History,
  Menu,
  User,
  UserCheck,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

type Section =
  | "events"
  | "participants"
  | "registrations"
  | "payments"
  | "invitations"
  | "profile"

type WorkspaceProps = {
  initialEvents: Event[]
  initialInvitations: MyInvitation[]
}

const sectionItems: Array<{
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = [
  {
    id: "events",
    label: "My Events",
    icon: Calendar,
    description: "Manage your created events, edit details, and delete events.",
  },
  {
    id: "participants",
    label: "Manage Participants",
    icon: UserCheck,
    description: "Review and approve/reject join requests for your events.",
  },
  {
    id: "registrations",
    label: "My Registrations",
    icon: FileText,
    description: "See events you joined and download registration invoices.",
  },
  {
    id: "payments",
    label: "Payment History",
    icon: CreditCard,
    description: "View completed payments and download payment invoices.",
  },
  {
    id: "invitations",
    label: "Invitations",
    icon: History,
    description:
      "View invitations sent by event organizers and accept/decline.",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    description: "Manage your profile information and account details.",
  },
]

export default function UserDashboardWorkspace({
  initialEvents,
  initialInvitations,
}: WorkspaceProps) {
  const { user } = useUserContext()
  const [activeSection, setActiveSection] = useState<Section>("events")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const sectionContent = useMemo(() => {
    switch (activeSection) {
      case "events":
        return <UserMyEventsPanel initialEvents={initialEvents} />
      case "participants":
        return <UserEventParticipantsManager events={initialEvents} />
      case "registrations":
        return <UserInvoicesPanel initialView="registrations" />
      case "payments":
        return <UserInvoicesPanel initialView="payments" />
      case "invitations":
        return <MyInvitationsPanel initialInvitations={initialInvitations} />
      case "profile":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Profile Information
            </h2>
            <ProfileCard />
          </div>
        )
      default:
        return null
    }
  }, [activeSection, initialEvents, initialInvitations])

  if (!user) return null

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/70 bg-card/80 shadow-sm backdrop-blur transition-all duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        {/* Header */}
        <div className="border-b border-border/70 p-4">
          <div className="flex items-center justify-between gap-2">
            {!isSidebarCollapsed && (
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden rounded-lg p-1.5 hover:bg-muted lg:inline-flex"
              aria-label="Toggle sidebar"
            >
              <Menu className="size-4" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex rounded-lg p-1.5 hover:bg-muted lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="border-b border-border/70 p-3">
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || ""}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {sectionItems.map((item) => {
            const Icon = item.icon
            const active = item.id === activeSection

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id)
                  setIsSidebarOpen(false)
                }}
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

      {/* Main Content */}
      <div className="min-w-0 flex-1 space-y-4 p-4 lg:p-0">
        {/* Top Bar */}
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Dashboard
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {sectionItems.find((s) => s.id === activeSection)?.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {sectionItems.find((s) => s.id === activeSection)?.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex rounded-lg border border-border/70 p-2 hover:bg-muted lg:hidden"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur md:p-5">
          {sectionContent}
        </section>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
