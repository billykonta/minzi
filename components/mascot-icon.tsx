import type React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface MascotIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  withAnimation?: boolean
}

export function MascotIcon({ className, size = "md", withAnimation = true, ...props }: MascotIconProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }

  return (
    <div className={cn(sizeMap[size], withAnimation && "animate-float", "relative", className)} {...props}>
      <Image src="/images/mindzi-mascot.png" alt="Mindzi mascot" fill className="object-contain" priority />
    </div>
  )
}
