"use client"

import { Button } from "@/components/ui/button"
import { motion, type Variants } from "framer-motion"
import { ArrowRight, Calendar, MapPin, Star, Ticket, Users } from "lucide-react"

// In a real scenario, this data would be passed as props fetched from your database
// where the Admin has flagged an event as "Featured"
const featuredEvent = {
  title: "NextGen SaaS Founders Summit",
  date: "October 15-17, 2026",
  location: "San Francisco & Virtual",
  description:
    "Join industry leaders, visionary founders, and top-tier investors for a three-day immersive experience exploring the future of cloud software and AI.",
  organizer: "Eventra Originals",
  fee: "Public Paid",
  price: "$299",
  attendees: "1,200+",
}

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Premium SaaS Background Glow */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container flex flex-col items-center justify-center px-4 text-center"
      >
        {/* Featured Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
            <Star className="h-4 w-4 fill-primary/50" />
            Featured Event
          </span>
        </motion.div>

        {/* Event Title */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl"
        >
          {featuredEvent.title.split(" ").slice(0, -2).join(" ")}{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {featuredEvent.title.split(" ").slice(-2).join(" ")}
          </span>
        </motion.h1>

        {/* Event Meta Data (Date & Location) */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-muted-foreground md:text-base"
        >
          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-1">
            <Calendar className="h-4 w-4" />
            {featuredEvent.date}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-1">
            <MapPin className="h-4 w-4" />
            {featuredEvent.location}
          </div>
        </motion.div>

        {/* Event Description */}
        <motion.p
          variants={itemVariants}
          className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground/80 md:text-xl"
        >
          {featuredEvent.description}
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
        >
          <Button
            size="lg"
            className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
          >
            Secure Your Spot
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 bg-background/50 px-8 text-base backdrop-blur-sm"
          >
            View Full Details
          </Button>
        </motion.div>

        {/* Bottom Details / Stats (Replaces the generic downloads/components stats) */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-8 rounded-2xl border border-border/50 bg-muted/20 p-8 backdrop-blur-md md:grid-cols-4"
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <Users className="mb-2 h-5 w-5 text-primary" />
            <div className="text-xl font-bold text-foreground">
              {featuredEvent.attendees}
            </div>
            <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Expected
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1">
            <Ticket className="mb-2 h-5 w-5 text-primary" />
            <div className="text-xl font-bold text-foreground">
              {featuredEvent.price}
            </div>
            <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {featuredEvent.fee}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 text-center md:col-span-2">
            <div className="mb-1 text-sm text-muted-foreground">
              Organized by
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                EO
              </div>
              {featuredEvent.organizer}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
