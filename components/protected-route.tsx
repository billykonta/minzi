"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user && !pathname.startsWith("/auth")) {
      router.push("/auth/login")
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (!isLoading && user && pathname.startsWith("/auth")) {
      router.push("/")
    }
  }, [user, isLoading, router, pathname])

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If on auth page and not authenticated, or on protected page and authenticated, show children
  if ((pathname.startsWith("/auth") && !user) || (!pathname.startsWith("/auth") && user)) {
    return <>{children}</>
  }

  // Otherwise, show nothing (will redirect)
  return null
}
