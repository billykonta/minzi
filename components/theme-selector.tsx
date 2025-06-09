"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FiSun, 
  FiMoon, 
  FiMonitor, 
  FiChevronDown, 
  FiCheck,
  FiX 
} from "react-icons/fi"
import { 
  RiMoonClearFill, 
  RiSunFill,
  RiPaletteFill 
} from "react-icons/ri"
import { 
  PiMoonStarsFill, 
  PiSunHorizonFill,
  PiPaintBucketFill
} from "react-icons/pi"
import { cn } from "@/lib/utils"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Theme options with their properties
const themes = [
  {
    id: "light",
    name: "Light",
    icon: RiSunFill,
    description: "Clean and bright interface",
    preview: "bg-white border-blue-100",
    accent: "bg-blue-500"
  },
  {
    id: "dark",
    name: "Dark",
    icon: RiMoonClearFill,
    description: "Dark mode with stars",
    preview: "bg-slate-900 border-slate-800",
    accent: "bg-blue-400"
  },
  {
    id: "midnight",
    name: "Midnight",
    icon: PiMoonStarsFill,
    description: "Deep blue night theme",
    preview: "bg-indigo-950 border-indigo-900",
    accent: "bg-indigo-400"
  },
  {
    id: "sunset",
    name: "Sunset",
    icon: PiSunHorizonFill,
    description: "Warm orange and purple tones",
    preview: "bg-gradient-to-br from-orange-950 to-purple-950 border-orange-900",
    accent: "bg-orange-500"
  },
  {
    id: "forest",
    name: "Forest",
    icon: PiPaintBucketFill,
    description: "Calming green theme",
    preview: "bg-emerald-950 border-emerald-900",
    accent: "bg-emerald-500"
  },
  {
    id: "system",
    name: "System",
    icon: FiMonitor,
    description: "Follow system preferences",
    preview: "bg-gradient-to-r from-slate-100 to-slate-900 border-slate-400",
    accent: "bg-slate-500"
  }
]

export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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

  // Get current theme info
  const currentTheme = themes.find(t => t.id === theme) || themes[0]
  const ThemeIcon = currentTheme.icon

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.button
          aria-label="Select theme"
          className={cn(
            "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition-colors",
            theme === "dark" || theme === "midnight" || theme === "forest" || theme === "sunset"
              ? "bg-slate-800 text-slate-200 hover:bg-slate-700" 
              : "bg-blue-100/50 text-blue-900/80 hover:bg-blue-100",
            className
          )}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            initial={false}
            animate={{ scale: [0.8, 1], opacity: [0, 1] }}
            transition={{ duration: 0.2 }}
          >
            <ThemeIcon className="h-6 w-6" />
          </motion.div>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-0 overflow-hidden rounded-xl border shadow-xl",
          theme === "dark" || theme === "midnight" || theme === "forest" || theme === "sunset"
            ? "bg-slate-950 border-slate-800"
            : "bg-white/95 border-slate-200 backdrop-blur-sm"
        )}
        align="end"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold">Select Theme</h3>
          <p className="text-sm text-muted-foreground">Personalize your Mindzi experience</p>
        </div>
        <Separator />
        <div className="p-4 grid gap-3">
          {themes.map((themeOption) => {
            const isActive = theme === themeOption.id
            const ThemeOptionIcon = themeOption.icon
            
            return (
              <Button
                key={themeOption.id}
                variant="ghost"
                className={cn(
                  "flex h-16 w-full items-center justify-start gap-3 rounded-lg px-3 py-2",
                  theme === "dark" || theme === "midnight" || theme === "forest" || theme === "sunset"
                    ? "hover:bg-slate-800/50"
                    : "hover:bg-slate-100",
                  isActive && (theme === "dark" || theme === "midnight" || theme === "forest" || theme === "sunset"
                    ? "bg-slate-800/50"
                    : "bg-slate-100")
                )}
                onClick={() => {
                  setTheme(themeOption.id)
                  localStorage.setItem("mindzi-theme-preference", themeOption.id)
                  setIsOpen(false)
                }}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md border",
                  themeOption.preview
                )}>
                  <div className={cn(
                    "h-4 w-4 rounded-full",
                    themeOption.accent
                  )} />
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{themeOption.name}</span>
                    {isActive && (
                      <FiCheck className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{themeOption.description}</span>
                </div>
              </Button>
            )
          })}
        </div>
        <Separator />
        <div className="p-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
            className="text-xs"
          >
            <FiX className="mr-1 h-3 w-3" />
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
