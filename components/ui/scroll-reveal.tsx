"use client"

import { motion } from "framer-motion"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  yOffset?: number
  duration?: number
  delay?: number
}

export function ScrollReveal({
  children,
  className = "",
  yOffset = 40,
  duration = 0.8,
  delay = 0,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Apple-style cinematic ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
