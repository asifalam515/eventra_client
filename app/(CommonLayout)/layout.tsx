import { UserProvider } from "@/components/providers/user-provider"
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/ui/hover-footer"
import Navbar from "@/components/ui/navbar"
import { getSessionUser } from "@/lib/session-user"

export default async function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getSessionUser()

  return (
    <UserProvider initialUser={user}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <Navbar />

        <main>
          <ThemeProvider>{children}</ThemeProvider>
        </main>
        <Footer />
      </div>
    </UserProvider>
  )
}
