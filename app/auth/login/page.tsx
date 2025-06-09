"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MascotIcon } from "@/components/mascot-icon"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useTheme } from "next-themes"
import { FcGoogle } from "react-icons/fc"
import { HiOutlineMail } from "react-icons/hi"
import { LuEye, LuEyeOff } from "react-icons/lu"

// Star type definition
type Star = {
  id: number
  size: number
  x: number
  y: number
  type: 'small' | 'medium' | 'large'
  color: string
}

type ShootingStar = {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function LoginPage() {
  const router = useRouter()
  const { signIn, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [stars, setStars] = useState<Star[]>([])
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([])
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signIn(email, password)
      // No need to redirect here as the auth context handles it
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google') => {
    setSocialLoading(provider)
    setError("")
    
    try {
      // Use Supabase social login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
      
      // The redirect happens automatically by Supabase
    } catch (error: any) {
      setError(error.message || `Failed to sign in with ${provider}`)
      setSocialLoading(null)
    }
  }

  // Generate stars and shooting stars
  useEffect(() => {
    setMounted(true)
    
    // Generate fixed stars
    const generateStars = () => {
      const newStars: Star[] = []
      const starCount = 200 // Lots of stars
      
      // Small background stars
      for (let i = 0; i < starCount * 0.7; i++) {
        newStars.push({
          id: i,
          size: Math.random() * 1.5 + 0.5, // Size between 0.5-2px
          x: Math.random() * 100, // Position X (0-100%)
          y: Math.random() * 100, // Position Y (0-100%)
          type: 'small',
          color: Math.random() > 0.9 ? 'text-blue-200' : 'text-white'
        })
      }
      
      // Medium stars
      for (let i = Math.floor(starCount * 0.7); i < starCount * 0.9; i++) {
        newStars.push({
          id: i,
          size: Math.random() * 2 + 1.5, // Size between 1.5-3.5px
          x: Math.random() * 100, // Position X (0-100%)
          y: Math.random() * 100, // Position Y (0-100%)
          type: 'medium',
          color: Math.random() > 0.8 ? 'text-yellow-100' : 'text-white'
        })
      }
      
      // Large stars
      for (let i = Math.floor(starCount * 0.9); i < starCount; i++) {
        newStars.push({
          id: i,
          size: Math.random() * 2.5 + 2, // Size between 2-4.5px
          x: Math.random() * 100, // Position X (0-100%)
          y: Math.random() * 100, // Position Y (0-100%)
          type: 'large',
          color: Math.random() > 0.7 ? 'text-blue-100' : 'text-white'
        })
      }
      
      setStars(newStars)
    }
    
    // Generate shooting stars
    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = []
      const shootingStarCount = 8 // Number of shooting stars
      
      for (let i = 0; i < shootingStarCount; i++) {
        newShootingStars.push({
          id: i,
          x: Math.random() * 100, // Start position X (0-100%)
          y: Math.random() * 50, // Start position Y (0-50%)
          size: Math.random() * 3 + 2, // Size between 2-5px
          duration: Math.random() * 2 + 1, // Duration between 1-3s
          delay: Math.random() * 15 + i * 2, // Staggered delays
        })
      }
      
      setShootingStars(newShootingStars)
    }

    generateStars()
    generateShootingStars()
    
    // Regenerate shooting stars periodically
    const interval = setInterval(() => {
      if (isDark) {
        generateShootingStars()
      }
    }, 20000) // Every 20 seconds
    
    return () => clearInterval(interval)
  }, [isDark])

  return (
    <div className="container relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100/30 dark:bg-blue-500/5 blur-3xl transition-colors duration-500" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100/30 dark:bg-blue-500/5 blur-3xl transition-colors duration-500" />
      
      {/* Stars background */}
      {mounted && isDark && (
        <>
          {/* Fixed stars with twinkling effect */}
          {stars.map((star) => {
            // Different animation based on star type
            let animationProps = {};
            let animationDuration = 0;
            
            switch(star.type) {
              case 'small':
                animationProps = {
                  opacity: [0.1, 0.4, 0.1],
                  scale: [0.8, 1, 0.8],
                };
                animationDuration = 3 + (star.id % 5);
                break;
              case 'medium':
                animationProps = {
                  opacity: [0.2, 0.7, 0.2],
                  scale: [0.8, 1.2, 0.8],
                };
                animationDuration = 4 + (star.id % 4);
                break;
              case 'large':
                animationProps = {
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.3, 0.8],
                };
                animationDuration = 5 + (star.id % 3);
                break;
            }
            
            return (
              <motion.div
                key={star.id}
                className={`absolute rounded-full ${star.color === 'text-white' ? 'bg-white' : 
                  star.color === 'text-blue-100' ? 'bg-blue-100' : 
                  star.color === 'text-blue-200' ? 'bg-blue-200' : 'bg-yellow-100'}`}
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  boxShadow: star.type === 'large' ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.7)` : 'none'
                }}
                animate={animationProps}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: star.id % 10 * 0.2,
                }}
              />
            );
          })}
          
          {/* Shooting stars */}
          {shootingStars.map((star) => (
            <motion.div
              key={`shooting-${star.id}`}
              className="absolute pointer-events-none">
              <motion.div
                className="bg-gradient-to-r from-transparent via-white to-transparent"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${star.size}px`,
                  borderRadius: '100%',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.7)'
                }}
                initial={{
                  x: `${star.x}%`,
                  y: `${star.y}%`,
                  opacity: 0,
                  rotate: Math.random() * 30 - 55, // Random angle between -55 and -25 degrees
                }}
                animate={{
                  x: `${star.x + 30}%`,
                  y: `${star.y + 30}%`,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 20 + 10,
                  ease: "easeOut",
                }}
              />
            </motion.div>
          ))}
        </>
      )}
      
      <div className="relative mx-auto w-full max-w-md">
        <div className="flex flex-col items-center space-y-2 p-6 text-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/5 dark:bg-primary/10 blur-xl" />
            <MascotIcon size="xl" className="relative animate-float" />
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue your learning journey
          </p>
        </div>
        
        <div className="space-y-4 px-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to sign in to your account
            </p>
          </div>
          
          <div className="grid gap-4">
            {/* Social login buttons */}
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                className="flex h-11 items-center justify-center gap-2 transition-all hover:bg-muted/50"
                onClick={() => handleSocialLogin('google')}
                disabled={!!socialLoading}
              >
                {socialLoading === 'google' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
                <span>Continue with Google</span>
              </Button>
            </div>
            
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">
                  OR CONTINUE WITH EMAIL
                </span>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link
                    href="/auth/reset-password"
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10 transition-all duration-200 focus:scale-[1.01]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <LuEyeOff className="h-5 w-5" />
                    ) : (
                      <LuEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </form>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/90 transition-all duration-200 hover:scale-[1.02] hover:from-primary/90 hover:to-primary" 
              onClick={handleLogin} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="font-medium text-primary transition-colors hover:text-primary/80"
              >
                Sign up
              </Link>
            </p>
          </div>
          
          <p className="pb-6 pt-2 text-center text-xs text-muted-foreground">
            By signing in, you agree to Mindzi&apos;s{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
