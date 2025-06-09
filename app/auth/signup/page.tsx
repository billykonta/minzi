"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { MascotIcon } from "@/components/mascot-icon"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { UserEducationInfo } from "@/lib/supabase"
import { useTheme } from "next-themes"
import { FcGoogle } from "react-icons/fc"
import { HiOutlineMail, HiOutlineUser } from "react-icons/hi"
import { LuEye, LuEyeOff, LuGraduationCap } from "react-icons/lu"

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

export default function SignupPage() {
  const router = useRouter()
  const { signUp, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [educationType, setEducationType] = useState<UserEducationInfo["type"]>("high_school")
  const [grade, setGrade] = useState("")
  const [major, setMajor] = useState("")
  const [field, setField] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [stars, setStars] = useState<Star[]>([])
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([])
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Starting signup process...")
      
      // Check if Supabase is configured properly
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error("Supabase configuration missing")
        throw new Error("Server configuration error. Please contact support.")
      }
      
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error("Please fill in all required fields")
      }
      
      console.log("Input validation passed")
      console.log("Email:", email)
      console.log("Name:", name)
      console.log("Education type:", educationType)

      // Create education info object with required validation
      const educationInfo: UserEducationInfo = {
        type: educationType,
      }

      // Add specific education fields based on type with validation
      if (educationType === "high_school") {
        if (!grade) {
          console.log("Validation failed - missing grade for high school")
          throw new Error("Please select your grade")
        }
        educationInfo.grade = grade
        console.log("Grade:", grade)
      } else if (educationType === "university") {
        if (!major) {
          console.log("Validation failed - missing major for university")
          throw new Error("Please enter your major")
        }
        educationInfo.major = major
        console.log("Major:", major)
      } else if (educationType === "self_study" || educationType === "professional") {
        if (!field) {
          console.log("Validation failed - missing field for " + educationType)
          throw new Error("Please enter your field of interest")
        }
        educationInfo.field = field
        console.log("Field:", field)
      }

      console.log("Education info prepared:", educationInfo)
      console.log("Calling signUp function...")
      
      // Test Supabase connection
      try {
        console.log("Testing Supabase connection...")
        // Try to query the profiles table instead of a non-existent test_connection table
        const { data: testData, error: testError } = await supabase.from('profiles').select('id').limit(1)
        
        if (testError) {
          console.error("Supabase connection error:", testError)
          console.log("Supabase connection test: Failed")
          // Don't throw here, just log the error
        } else {
          console.log("Supabase connection test: Successful", testData)
        }
        
        // Also check if we can access the auth API
        const { data: authData, error: authError } = await supabase.auth.getSession()
        console.log("Auth API test:", authError ? "Failed" : "Successful")
        if (authError) {
          console.error("Auth API error:", authError)
        } else {
          console.log("Auth session data available:", !!authData.session)
        }
      } catch (connErr) {
        console.error("Unexpected error testing connection:", connErr)
      }
      
      // Call signUp from auth context with complete education info
      console.log("Final education info being sent to database:", educationInfo)
      await signUp(email, password, {
        name,
        education: educationInfo,
      })
      
      console.log("SignUp function completed successfully")
    } catch (error: any) {
      console.error("Signup error:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      
      // Handle different error types with more user-friendly messages
      if (error.message?.includes('duplicate key')) {
        setError("This email is already registered. Please use a different email or try logging in.")
      } else if (error.message?.includes('network')) {
        setError("Network error. Please check your internet connection and try again.")
      } else if (error.message?.includes('configuration')) {
        setError("Server configuration error. Please contact support.")
      } else if (error.message?.includes('auth')) {
        setError("Authentication service error. Please try again later.")
      } else {
        setError(error.message || "An error occurred during signup. Please try again.")
      }
      
      // Log additional diagnostic information
      console.log("Supabase URL configured:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("Supabase key configured:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (provider: 'google') => {
    try {
      setSocialLoading(provider)
      setError("")
      console.log(`Starting ${provider} authentication...`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === 'google' ? {
            // Optional Google-specific parameters
            access_type: 'offline',
            prompt: 'consent'
          } : undefined
        }
      })
      
      if (error) {
        console.error(`${provider} auth error:`, error)
        throw error
      }
      
      // The user will be redirected to the OAuth provider
      console.log(`${provider} auth initiated, redirecting...`, data)
    } catch (error: any) {
      console.error(`${provider} auth error:`, error)
      setError(error.message || `Failed to authenticate with ${provider}`)
      setSocialLoading(null)
    }
  }

  const nextStep = () => {
    console.log("nextStep function called", { currentStep, email, password, name })
    
    // Validate inputs before proceeding
    if (!email || !password || !name) {
      console.log("Validation failed - missing required fields")
      setError("Please fill in all required fields")
      return
    }
    
    if (password.length < 8) {
      console.log("Validation failed - password too short")
      setError("Password must be at least 8 characters long")
      return
    }
    
    // Clear any previous errors
    setError("")
    console.log("Moving to step 2")
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
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
            Join Mindzi
          </h1>
          <p className="text-sm text-muted-foreground">
            Create your account and start your learning journey
          </p>
        </div>

        <div className="space-y-4 px-6">
          <div className="pb-4 space-y-1">
            <h2 className="text-xl font-semibold">Sign Up</h2>
            <p className="text-sm text-muted-foreground">
              {currentStep === 1 
                ? "Create your account credentials" 
                : "Tell us about your education"}
            </p>
            <div className="mt-3 flex w-full justify-between">
              <div className={`h-1.5 w-[48%] rounded-full transition-colors ${currentStep >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-1.5 w-[48%] rounded-full transition-colors ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>
          <div className="pb-4">
            {currentStep === 1 && (
              <>
                {/* Social signup buttons */}
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="flex h-11 items-center justify-center gap-2 transition-all hover:bg-muted/50"
                    onClick={() => handleSocialSignup('google')}
                    disabled={!!socialLoading}
                    type="button"
                  >
                    {socialLoading === 'google' ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <FcGoogle className="h-5 w-5" />
                    )}
                    <span>Continue with Google</span>
                  </Button>
                </div>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">
                      OR CONTINUE WITH EMAIL
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log("Form submitted, currentStep:", currentStep);
              if (currentStep === 2) {
                console.log("Calling handleSignup");
                handleSignup(e);
              } else {
                console.log("Calling nextStep");
                nextStep();
              }
            }}>
              <div className="space-y-4">
                {currentStep === 1 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <HiOutlineUser className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-10 transition-all duration-200 focus:scale-[1.01]"
                        />
                      </div>
                    </div>
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
                          required
                          className="pl-10 transition-all duration-200 focus:scale-[1.01]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
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
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                  </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="education-type" className="text-sm font-medium">Education Type</Label>
                    <div className="relative">
                      <LuGraduationCap className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Select 
                        value={educationType} 
                        onValueChange={(value) => setEducationType(value as UserEducationInfo["type"])}
                      >
                        <SelectTrigger id="education-type" className="pl-10 transition-all duration-200 focus:scale-[1.01]">
                          <SelectValue placeholder="Select your education type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="self_study">Self Study</SelectItem>
                          <SelectItem value="professional">Professional Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {educationType === "high_school" && (
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade/Year</Label>
                      <Select value={grade} onValueChange={setGrade}>
                        <SelectTrigger id="grade" className="transition-all duration-200 focus:scale-[1.01]">
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9th Grade / Freshman</SelectItem>
                          <SelectItem value="10">10th Grade / Sophomore</SelectItem>
                          <SelectItem value="11">11th Grade / Junior</SelectItem>
                          <SelectItem value="12">12th Grade / Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {educationType === "university" && (
                    <div className="space-y-2">
                      <Label htmlFor="major">Major/Field of Study</Label>
                      <Input
                        id="major"
                        placeholder="e.g., Computer Science, Biology"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="transition-all duration-200 focus:scale-[1.01]"
                      />
                    </div>
                  )}

                  {["professional", "self_study"].includes(educationType) && (
                    <div className="space-y-2">
                      <Label htmlFor="field">Field of Interest</Label>
                      <Input
                        id="field"
                        placeholder="e.g., Data Science, Web Development"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        className="transition-all duration-200 focus:scale-[1.01]"
                      />
                    </div>
                  )}
                </div>
              )}
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                <div className="flex w-full gap-2 pt-2">
                  {currentStep === 2 && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                    >
                      Back
                    </Button>
                  )}
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 transition-all duration-200 hover:scale-[1.02] hover:from-primary/90 hover:to-primary"
                    disabled={isLoading || authLoading}
                    onClick={() => console.log("Button clicked, currentStep:", currentStep)}
                  >
                    {(isLoading || authLoading) ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        {currentStep === 1 ? "Processing..." : "Creating account..."}
                      </>
                    ) : (
                      currentStep === 1 ? "Next" : "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <div className="pt-0">
            <p className="w-full text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href="/auth/login" 
                className="font-medium text-primary transition-colors hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </div>
          <p className="pb-6 pt-2 text-center text-xs text-muted-foreground">
            By continuing, you agree to Mindzi&apos;s{" "}
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
