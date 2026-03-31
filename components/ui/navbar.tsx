"use client"

import { logoutAction } from "@/actions/auth"
import { useUserContext } from "@/components/providers/user-provider"
import {
  Calendar,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Ticket,
  UserCircle,
  Zap,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Navbar() {
  const { user } = useUserContext()
  const [openSearch, setOpenSearch] = React.useState(false)
  const [openProfile, setOpenProfile] = React.useState(false)
  const createEventHref = user
    ? "/create-event"
    : "/login?redirect=/create-event"

  React.useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) return
      if (!event.target.closest("[data-profile-menu]")) {
        setOpenProfile(false)
      }
    }

    window.addEventListener("mousedown", closeOnOutsideClick)
    return () => window.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="rounded-lg bg-primary p-1.5">
              <Zap className="size-5 fill-current text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Eventra</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center lg:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/">Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/events">Explore Events</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Global Search Trigger */}
          <Button
            variant="outline"
            className="relative hidden h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:flex md:w-40 lg:w-64"
            onClick={() => setOpenSearch(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none absolute top-1.5 right-1.5 hidden h-6 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* User Auth/Action Buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />

            {user ? (
              <div className="relative" data-profile-menu>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => setOpenProfile((prev) => !prev)}
                  aria-expanded={openProfile}
                  aria-haspopup="menu"
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={`${user.name} profile`}
                      className="size-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-28 truncate text-sm">{user.name}</span>
                  <ChevronDown className="size-4" />
                </Button>

                {openProfile && (
                  <div
                    className="absolute top-11 right-0 z-50 w-72 rounded-xl border border-border/70 bg-background p-3 shadow-xl"
                    role="menu"
                  >
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={`${user.name} profile`}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                          {initials}
                        </span>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-border/60 px-3 py-2 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5" />
                        Role: {user.role || "USER"}
                      </p>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="justify-start"
                      >
                        <Link href={createEventHref}>
                          <PlusCircle className="mr-2 size-4" /> Create Event
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="justify-start"
                      >
                        <Link href="/dashboard">
                          <UserCircle className="mr-2 size-4" /> Profile
                          Dashboard
                        </Link>
                      </Button>

                      <form action={logoutAction}>
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <LogOut className="mr-2 size-4" /> Logout
                        </Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" className="gap-2 shadow-md" asChild>
                  <Link href={createEventHref}>
                    <PlusCircle className="size-4" />
                    <span>Create Event</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenSearch(true)}
            >
              <Search className="size-5" />
            </Button>
            <MobileMenu />
          </div>
        </div>
      </div>

      {/* Global Search Dialog */}
      <SearchDialog open={openSearch} setOpen={setOpenSearch} />
    </header>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="size-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function MobileMenu() {
  const { user } = useUserContext()
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            Eventra
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="flex flex-col space-y-3">
            <Link href="/" className="text-lg font-medium">
              Home
            </Link>
            <Link href="/events" className="text-lg font-medium">
              Browse Events
            </Link>
            <Link href="/dashboard" className="text-lg font-medium">
              Dashboard
            </Link>
          </div>

          <hr />

          {user ? (
            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={`${user.name} profile`}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {initials}
                  </span>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email || "No email"}
                  </p>
                </div>
              </div>

              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="justify-start gap-2"
                >
                  <Link href="/create-event">
                    <PlusCircle className="size-4" /> Create Event
                  </Link>
                </Button>
              </SheetClose>

              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="justify-start gap-2"
                >
                  <Link href="/dashboard">
                    <UserCircle className="size-4" /> Profile
                  </Link>
                </Button>
              </SheetClose>

              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="size-4" /> Logout
                </Button>
              </form>
            </div>
          ) : (
            <div className="grid gap-2">
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/login">
                  <UserCircle className="size-4" /> Login
                </Link>
              </Button>
              <Button asChild className="justify-start gap-2">
                <Link href="/signup">
                  <PlusCircle className="size-4" /> Get Started
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SearchDialog({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (o: boolean) => void
}) {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search events, organizers, or categories..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Access">
          <CommandItem className="cursor-pointer">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Public Free Events</span>
          </CommandItem>
          <CommandItem className="cursor-pointer">
            <Ticket className="mr-2 h-4 w-4" />
            <span>My Registered Events</span>
          </CommandItem>
          <CommandItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
