import { ThemeProvider } from "@/components/theme-provider"

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <h1>header</h1>
        <ThemeProvider>{children}</ThemeProvider>
        <h1>footer</h1>
      </body>
    </html>
  )
}
