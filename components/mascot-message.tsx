import { MascotIcon } from "@/components/mascot-icon"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface MascotMessageProps {
  message: string
  title?: string
  variant?: "default" | "info" | "success" | "warning"
  className?: string
}

export function MascotMessage({ message, title, variant = "default", className }: MascotMessageProps) {
  // Use the useTheme hook to get the current theme
  const { theme } = useTheme()
  
  // Define theme-specific gradients and colors
  const getThemeStyles = () => {
    switch(theme) {
      case 'forest':
        return {
          background: "bg-gradient-to-r from-emerald-900/90 to-green-900/90 border-emerald-700",
          icon: "bg-emerald-800 text-emerald-100"
        }
      case 'sunset':
        return {
          background: "bg-gradient-to-r from-orange-900/90 to-purple-900/90 border-orange-700",
          icon: "bg-orange-800 text-orange-100"
        }
      case 'midnight':
        return {
          background: "bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-blue-700",
          icon: "bg-blue-800 text-blue-100"
        }
      case 'dark':
        return {
          background: "bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-slate-700",
          icon: "bg-slate-800 text-slate-100"
        }
      default: // light or system theme
        return {
          background: "bg-gradient-to-r from-blue-50/95 to-indigo-50/95 border-blue-200",
          icon: "bg-blue-100 text-blue-700"
        }
    }
  }
  
  const themeStyles = getThemeStyles()
  
  // Combine theme styles with variant styles
  const variantStyles = {
    default: `${themeStyles.background}`,
    info: theme === 'light' ? "bg-gradient-to-r from-blue-50/95 to-cyan-50/95 border-blue-200" : `${themeStyles.background}`,
    success: theme === 'light' ? "bg-gradient-to-r from-green-50/95 to-emerald-50/95 border-green-200" : `${themeStyles.background}`,
    warning: theme === 'light' ? "bg-gradient-to-r from-amber-50/95 to-yellow-50/95 border-amber-200" : `${themeStyles.background}`,
  }

  const iconContainerStyles = {
    default: `${themeStyles.icon}`,
    info: theme === 'light' ? "bg-cyan-100 text-cyan-700" : `${themeStyles.icon}`,
    success: theme === 'light' ? "bg-green-100 text-green-700" : `${themeStyles.icon}`,
    warning: theme === 'light' ? "bg-amber-100 text-amber-700" : `${themeStyles.icon}`,
  }

  return (
    <Card className={cn("overflow-hidden border shadow-lg backdrop-blur-sm", variantStyles[variant], className)}>
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-4">
          <div className={cn("rounded-full p-2 shadow-md", iconContainerStyles[variant])}>
            <MascotIcon size="sm" className="h-8 w-8" withAnimation={false} />
          </div>
          <div className="flex-1 pt-1">
            {title && <h4 className="mb-1 font-semibold text-foreground dark:text-white forest:text-white sunset:text-white midnight:text-white">{title}</h4>}
            <p className="text-sm text-foreground/90 dark:text-white/90 forest:text-white/90 sunset:text-white/90 midnight:text-white/90">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
