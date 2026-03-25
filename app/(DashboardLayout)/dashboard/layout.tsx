import { ThemeProvider } from "@/components/theme-provider"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <h1>Dashboard Header</h1>
        <ThemeProvider>{children}</ThemeProvider>
        <h1>Dashboard Footer</h1>
      </body>
    </html>
  )
}
