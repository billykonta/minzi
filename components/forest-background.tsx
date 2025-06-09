"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

export function ForestBackground() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isForestTheme = theme === "forest"

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return isForestTheme ? (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-black/30 z-10" /> {/* Overlay to darken the image slightly */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/forest-background.jpg')",
          filter: "brightness(0.7) saturate(1.2)"
        }}
      />
    </div>
  ) : null
}
