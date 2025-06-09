"use client"

import { useState, useEffect } from "react"
import { MascotIcon } from "@/components/mascot-icon"
import { cn } from "@/lib/utils"

interface MascotBubbleProps {
  messages: string[]
  interval?: number
  className?: string
  position?: "left" | "right"
  size?: "sm" | "md" | "lg"
  variant?: "default" | "highlight" | "primary"
}

export function MascotBubble({
  messages,
  interval = 5000,
  className,
  position = "left",
  size = "md",
  variant = "default",
}: MascotBubbleProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return

    const timer = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
    }, interval)

    return () => clearInterval(timer)
  }, [messages, interval])

  const currentMessage = messages[currentMessageIndex]

  const sizeMap = {
    sm: {
      container: "gap-2",
      mascot: "sm",
      bubble: "max-w-[200px] p-2 text-sm",
    },
    md: {
      container: "gap-3",
      mascot: "md",
      bubble: "max-w-[250px] p-3",
    },
    lg: {
      container: "gap-4",
      mascot: "lg",
      bubble: "max-w-[300px] p-4",
    },
  }

  const variantMap = {
    default: "bg-primary/10 text-foreground",
    highlight: "bg-amber-100 text-amber-900 border border-amber-200",
    primary: "bg-primary text-primary-foreground",
  }

  return (
    <div
      className={cn("flex items-end", position === "right" && "flex-row-reverse", sizeMap[size].container, className)}
    >
      <MascotIcon size={sizeMap[size].mascot as any} />
      <div
        className={cn(
          "relative rounded-lg shadow-md font-medium",
          variantMap[variant],
          sizeMap[size].bubble,
          position === "left" && "rounded-bl-none",
          position === "right" && "rounded-br-none",
        )}
      >
        <p>{currentMessage}</p>
        <div
          className={cn(
            "absolute bottom-0 h-4 w-4",
            variantMap[variant],
            position === "left" && "-left-2 rounded-br-lg",
            position === "right" && "-right-2 rounded-bl-lg",
          )}
        />
      </div>
    </div>
  )
}
