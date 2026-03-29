import { ThemeProvider } from "@/components/theme-provider"
import React from "react"

export default function DashboardLayout({
  admin,
  user,
  moderator,
}: Readonly<{
  admin: React.ReactNode
  user: React.ReactNode
  moderator: React.ReactNode
}>) {
  const role = process.env.NEXT_PUBLIC_USER_ROLE || "USER"
  return (
    <ThemeProvider>
      {role === "ADMIN" ? admin : role === "USER" ? user : moderator}
    </ThemeProvider>
  )
}
