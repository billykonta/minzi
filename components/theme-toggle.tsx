"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { FiSun, FiMoon } from "react-icons/fi"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div 
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/50 text-blue-900/80 dark:bg-slate-800 dark:text-slate-200", 
          className
        )}
      >
        <FiSun className="h-5 w-5" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <motion.button
      aria-label="Toggle theme"
      className={cn(
        "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors",
        isDark 
          ? "bg-slate-800 text-slate-200 hover:bg-slate-700" 
          : "bg-blue-100/50 text-blue-900/80 hover:bg-blue-100",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
        <motion.div
          initial={false}
          animate={{
            y: isDark ? 0 : -30,
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <FiMoon className="h-5 w-5" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            y: isDark ? 30 : 0,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <FiSun className="h-5 w-5" />
        </motion.div>
      </div>
      
      {/* Decorative stars that appear in dark mode */}
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-yellow-200"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isDark ? [0, 1, 0] : 0,
            scale: isDark ? [0.5, 1, 0.5] : 0.5,
            x: isDark ? [-10 + i * 10, -5 + i * 10] : -10 + i * 10,
            y: isDark ? [-10 + i * 5, -5 + i * 5] : -10 + i * 5,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            delay: i * 0.3,
          }}
          style={{
            top: `${20 + i * 15}%`,
            left: `${20 + i * 20}%`,
          }}
        />
      ))}
    </motion.button>
  )
}
