import DashboardShell from "@/components/DashboardComponents/dashboard-shell"
import { UserProvider } from "@/components/providers/user-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { getSessionUser } from "@/lib/session-user"
import { redirect } from "next/navigation"
import React from "react"

export default async function DashboardLayout({
  admin,
  user,
  moderator,
}: Readonly<{
  admin: React.ReactNode
  user: React.ReactNode
  moderator: React.ReactNode
}>) {
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    redirect("/login")
  }

  const role = sessionUser?.role?.toUpperCase() || "USER"

  const roleView =
    role === "ADMIN"
      ? admin
      : role === "MODERATOR" || role === "MODERATORS"
        ? moderator
        : user

  return (
    <UserProvider initialUser={sessionUser}>
      <ThemeProvider>
        <DashboardShell role={role}>{roleView}</DashboardShell>
      </ThemeProvider>
    </UserProvider>
  )
}
