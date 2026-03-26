import { ThemeProvider } from "@/components/theme-provider"
import { HeroSection } from "@/components/ui/hero-section-shadcnui"
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
        <HeroSection></HeroSection>
        <ThemeProvider>{children}</ThemeProvider>
        <h1>footer</h1>
      </body>
    </html>
  )
}
