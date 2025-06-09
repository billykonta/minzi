"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MascotIcon } from "@/components/mascot-icon"
import {
  Home,
  MessageCircle,
  BookOpen,
  FlashlightIcon as FlashCard,
  Settings,
  Menu,
  BarChart3,
  Calendar,
  FileText,
} from "lucide-react"

export function MobileNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card p-4 md:hidden">
      <div className="flex items-center gap-2">
        <MascotIcon size="sm" withAnimation={false} />
        <h1 className="text-xl font-bold text-primary">Mindzi</h1>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b p-4">
              <MascotIcon size="sm" withAnimation={false} />
              <h1 className="text-xl font-bold text-primary">Mindzi</h1>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-auto p-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
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
            <div className="border-t p-4">
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
        </SheetContent>
      </Sheet>
    </div>
  )
}
