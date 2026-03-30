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
  return <ThemeProvider>{admin}</ThemeProvider>
}
