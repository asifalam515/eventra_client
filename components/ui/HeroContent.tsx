"use client"
import { motion, type Variants } from "framer-motion"
import { ArrowRight, Calendar, MapPin, Star, Ticket, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "./button"

export type HeroFeaturedEvent = {
  id: string
  title: string
  date: string
  location: string
  description: string
  organizer: string
  feeLabel: string
  priceLabel: string
  attendeesLabel: string
}

interface HeroContentProps {
  featuredEvent: HeroFeaturedEvent
  ctaHref: string
}

const HeroContent = ({ featuredEvent, ctaHref }: HeroContentProps) => {
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

  const titleWords = featuredEvent.title.trim().split(/\s+/)
  const hasEnoughWords = titleWords.length > 2
  const leadingTitle = hasEnoughWords
    ? titleWords.slice(0, -2).join(" ")
    : featuredEvent.title
  const highlightedTitle = hasEnoughWords ? titleWords.slice(-2).join(" ") : ""

  return (
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
        {leadingTitle}
        {highlightedTitle ? (
          <>
            {" "}
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {highlightedTitle}
            </span>
          </>
        ) : null}
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
          <Link href={ctaHref}>Secure Your Spot</Link>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 bg-background/50 px-8 text-base backdrop-blur-sm"
        >
          <Link href={ctaHref}>View Full Details</Link>
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
            {featuredEvent.attendeesLabel}
          </div>
          <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Expected
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1">
          <Ticket className="mb-2 h-5 w-5 text-primary" />
          <div className="text-xl font-bold text-foreground">
            {featuredEvent.priceLabel}
          </div>
          <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {featuredEvent.feeLabel}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 text-center md:col-span-2">
          <div className="mb-1 text-sm text-muted-foreground">Organized by</div>
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
              EO
            </div>
            {featuredEvent.organizer}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default HeroContent
