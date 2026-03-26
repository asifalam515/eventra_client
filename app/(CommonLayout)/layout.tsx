import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/ui/navbar"

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar></Navbar>
        <h1>header</h1>
        <ThemeProvider>{children}</ThemeProvider>
        <h1>footer</h1>
      </body>
    </html>
  )
}
