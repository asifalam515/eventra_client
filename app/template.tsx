"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Dashboard and specific routes might not want full page transitions to avoid layout shifts in the sidebar
  // We'll apply the transition globally, but keep it very subtle and smooth (Linear/Vercel style)
  const isDashboard = pathname?.startsWith("/dashboard")

  if (isDashboard) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1], // Custom cinematic spring-like ease (Apple style)
      }}
    >
      {children}
    </motion.div>
  )
}
