"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MascotIcon } from "@/components/mascot-icon"
import { Home, MessageCircle, BookOpen, FlashlightIcon as FlashCard, Settings, BarChart3, Calendar, FileText } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Ask Mindzi",
      icon: MessageCircle,
      href: "/chat",
      active: pathname === "/chat",
    },
    {
      label: "My Subjects",
      icon: BookOpen,
      href: "/subjects",
      active: pathname === "/subjects",
    },
    {
      label: "Assignments",
      icon: FileText,
      href: "/assignments",
      active: pathname === "/assignments",
    },
    {
      label: "Study Tools",
      icon: FlashCard,
      href: "/tools",
      active: pathname === "/tools",
    },
    {
      label: "Study Planner",
      icon: Calendar,
      href: "/planner",
      active: pathname === "/planner",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      active: pathname === "/analytics",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <div className={cn("relative hidden h-screen w-72 flex-col border-r bg-card p-4 md:flex", className)}>
      <div className="flex items-center gap-2 px-2">
        <MascotIcon size="sm" withAnimation={false} />
        <h1 className="text-2xl font-bold text-primary">Mindzi</h1>
      </div>
      <ScrollArea className="flex-1 py-6">
        <nav className="flex flex-col gap-2 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                route.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto rounded-lg bg-muted p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-primary to-purple-500">
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold">A</span>
          </div>
          <div>
            <p className="text-sm font-medium">Alex Johnson</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </div>
      </div>
    </div>
  )
}
