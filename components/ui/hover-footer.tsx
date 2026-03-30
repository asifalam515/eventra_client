"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons"
import { motion } from "framer-motion" // Note: Updated to framer-motion as it's the standard package name
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

// 1. Your TextHoverEffect Component (Unchanged)
export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string
  duration?: number
  automatic?: boolean
  className?: string
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" })

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect()
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      })
    }
  }, [cursor])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("cursor-pointer uppercase select-none", className)}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="25%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#80eeb4" />
              <stop offset="75%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-neutral-200 font-[helvetica] text-7xl font-bold dark:stroke-neutral-800"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-primary/50 font-[helvetica] text-7xl font-bold"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent font-[helvetica] text-7xl font-bold"
      >
        {text}
      </text>
    </svg>
  )
}

// 2. Your Background Gradient (Tweaked slightly for a SaaS dark mode feel)
export const FooterBackgroundGradient = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(100% 100% at 50% 0%, hsl(var(--primary)/0.05) 0%, transparent 100%)",
      }}
    />
  )
}

// 3. The Main Footer Component
export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-background pt-16 sm:pt-24">
      <FooterBackgroundGradient />

      <div className="relative z-10 container flex flex-col items-center justify-center px-4">
        {/* Section 4: Call To Action */}
        <div className="mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to host your next big event?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of organizers managing public and private events
            seamlessly. Create your event today or discover what's happening
            near you.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              <Link href="/create-event">Create Event</Link>{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full bg-background/50 backdrop-blur-sm sm:w-auto"
              asChild
            >
              <Link href="/events">Explore Events</Link>
            </Button>
          </div>
        </div>

        {/* Brand Animation */}
        <div className="mb-8 h-[150px] w-full sm:h-[250px]">
          <TextHoverEffect text="EVENTRA" />
        </div>

        {/* Footer Links Grid */}
        <div className="grid w-full grid-cols-2 gap-8 border-t border-border/40 py-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <div className="rounded-lg bg-primary p-1.5">
                <Zap className="size-5 fill-current text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Eventra</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The premier platform for secure, seamless event management and
              ticketing.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/events"
                  className="transition-colors hover:text-primary"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-primary"
                >
                  Login / Signup
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-foreground">Connect</h3>
            <div className="flex gap-4 text-muted-foreground">
              <a href="#" className="transition-colors hover:text-primary">
                <TwitterLogoIcon className="h-5 w-5" />
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                <GitHubLogoIcon className="h-5 w-5" />
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                <LinkedInLogoIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Eventra Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
