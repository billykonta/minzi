"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSelector } from "@/components/theme-selector"
import { ThemeBackground } from "@/components/theme-background"
import { cn } from "@/lib/utils"
import { WelcomeScreen } from "@/components/welcome-screen"
import { AuthProvider } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { supabase } from "@/lib/supabase"
import { testSupabaseConnection } from "@/lib/supabase-test"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [showWelcome, setShowWelcome] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("mindzi-visited")
    if (!hasVisited) {
      setShowWelcome(true)
    }
    
    // Test Supabase connection on startup
    const testConnection = async () => {
      console.log("🚀 Application started - testing Supabase connection")
      await testSupabaseConnection()
    }
    
    testConnection()
  }, [])

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
    localStorage.setItem("mindzi-visited", "true")
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-white dark:bg-black font-sans antialiased transition-colors duration-500", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="mindzi-theme" themes={["light", "dark", "midnight", "sunset", "forest", "system"]}>
          <AuthProvider>
            <ProtectedRoute>
              <ThemeBackground />
              {children}
              {mounted && showWelcome && <WelcomeScreen onComplete={handleWelcomeComplete} />}
              <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
              </div>
            </ProtectedRoute>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
