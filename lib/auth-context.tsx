"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { UserEducationInfo } from "./supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: UserData) => Promise<void>
  signOut: () => Promise<void>
}

interface UserData {
  name: string
  education: UserEducationInfo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      setIsLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error getting session:", error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      throw error
    }
    
    router.push("/")
    router.refresh()
    setIsLoading(false)
  }

  const signUp = async (email: string, password: string, userData: UserData) => {
    setIsLoading(true)
    console.log("Auth context: Starting signUp process", { email, userData })
    
    // Validate education data is complete
    const { education } = userData
    console.log("Auth context: Validating education data", education)
    
    if (!education.type) {
      console.error("Auth context: Missing education type")
      throw new Error("Education type is required")
    }
    
    // Validate specific education fields based on type
    if (education.type === "high_school" && !education.grade) {
      console.error("Auth context: Missing grade for high school student")
      throw new Error("Grade is required for high school students")
    } else if (education.type === "university" && !education.major) {
      console.error("Auth context: Missing major for university student")
      throw new Error("Major is required for university students")
    } else if (["self_study", "professional"].includes(education.type) && !education.field) {
      console.error(`Auth context: Missing field for ${education.type}`)
      throw new Error(`Field is required for ${education.type}`)
    }
    
    try {
      console.log("Auth context: Calling supabase.auth.signUp with validated data")
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      console.log("Auth context: signUp response", { data, error })
      
      if (error) {
        console.error("Auth context: signUp error", error)
        throw error
      }
      
      // If successful, also create a profile record with default study values
      if (data.user) {
        console.log("Auth context: Creating user profile with education data and default study values")
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          name: userData.name,
          education_type: education.type,
          education_grade: education.grade || null,
          education_major: education.major || null,
          education_field: education.field || null,
          study_hours_per_week: 0,
          study_goals: '',
          study_preferences: {},
          study_schedule: {},
          study_stats: {
            total_study_time: 0,
            subjects_studied: 0,
            flashcards_created: 0,
            flashcards_reviewed: 0,
            notes_created: 0,
            last_study_date: null
          }
        })
        
        if (profileError) {
          console.error("Auth context: Error creating profile", profileError)
          // Don't throw here, as the auth account was created successfully
          // We'll handle profile creation on next login if needed
        } else {
          console.log("Auth context: Profile created successfully with default study values")
        }
      }
      
      console.log("Auth context: signUp successful, redirecting to confirmation page")
      router.push("/auth/confirmation")
    } catch (err) {
      console.error("Auth context: Unexpected error during signUp", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
    
    router.push("/auth/login")
    router.refresh()
    setIsLoading(false)
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}
