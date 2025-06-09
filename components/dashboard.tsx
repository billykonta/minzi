"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageCircle,
  BookOpen,
  FlashlightIcon as FlashCard,
  Trophy,
  Clock,
  FlameIcon as Fire,
  Zap,
  BarChart3,
  CalendarDays,
  PenLine,
  Brain,
} from "lucide-react"
import { StudyPlan } from "@/components/study-plan"
import { RecentActivity } from "@/components/recent-activity"
import { SubjectProgress } from "@/components/subject-progress"
import { MascotTip } from "@/components/mascot-tip"
import { MascotMessage } from "@/components/mascot-message"
import { QuickActionModal } from "@/components/quick-action-modal"
import { createClient } from "@supabase/supabase-js"
import { getStudentStats, formatStudyTime, calculateLevelFromXP, type StudentStats } from "@/lib/student-dashboard"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export function Dashboard() {
  const router = useRouter()
  const [greeting, setGreeting] = useState("")
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("today")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
    
    // Fetch user data
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setUserName(profile.first_name || user.email?.split('@')[0] || 'Student')
          } else {
            setUserName(user.email?.split('@')[0] || 'Student')
          }
          
          // Get student stats
          try {
            const studentStats = await getStudentStats(user.id)
            setStats(studentStats)
          } catch (statsError) {
            console.error('Error fetching student stats:', statsError)
            // Set default stats if there's an error
            setStats({
              streak: 0,
              studyTime: 0,
              xp: 0,
              level: 1,
              progress: 0,
              totalTasksCompleted: 0,
              totalQuizzesCompleted: 0,
              averageScore: 0,
              focusTime: [0, 0, 0, 0, 0, 0, 0],
              subjectDistribution: []
            })
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "flashcards":
        router.push("/tools?tab=flashcards")
        break
      case "ask":
        router.push("/chat")
        break
      case "summarize":
        router.push("/tools?tab=summarizer")
        break
      case "quiz":
        setActiveModal("quiz")
        break
      case "notes":
        router.push("/notes")
        break
      case "calendar":
        router.push("/calendar")
        break
      case "analytics":
        router.push("/analytics")
        break
      case "mindmap":
        setActiveModal("mindmap")
        break
      default:
        break
    }
  }
  
  // Function to log study activity
  const logStudyActivity = async (activityType: string, details: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Log the activity
        await supabase.from('activities').insert({
          user_id: user.id,
          type: activityType,
          title: details,
          time: new Date().toLocaleString(),
          icon: activityType,
          icon_color: getColorForActivityType(activityType),
          created_at: new Date().toISOString()
        })
        
        // Update stats
        if (stats) {
          const updatedStats = { ...stats }
          
          if (activityType === 'study') {
            updatedStats.studyTime += 30 // Add 30 minutes of study time
          } else if (activityType === 'quiz') {
            updatedStats.totalQuizzesCompleted += 1
          }
          
          // Add XP
          updatedStats.xp += 50
          
          // Recalculate level and progress
          const levelInfo = calculateLevelFromXP(updatedStats.xp)
          updatedStats.level = levelInfo.level
          updatedStats.progress = levelInfo.progress
          
          setStats(updatedStats)
          
          // Update in database
          await supabase
            .from('student_stats')
            .update({
              study_time: updatedStats.studyTime,
              total_quizzes_completed: updatedStats.totalQuizzesCompleted,
              xp: updatedStats.xp,
              level: updatedStats.level,
              progress: updatedStats.progress
            })
            .eq('user_id', user.id)
        }
      }
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }
  
  // Helper function to get color for activity type
  const getColorForActivityType = (type: string): string => {
    switch (type) {
      case 'chat': return 'text-blue-500';
      case 'quiz': return 'text-yellow-500';
      case 'flashcard': return 'text-purple-500';
      case 'summary': return 'text-teal-500';
      case 'study': return 'text-green-500';
      case 'note': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  }

  return (
    <div className="space-y-6">
      <MascotMessage
        title={`${greeting}, ${loading ? 'Student' : userName}!`}
        message="Ready to boost your learning today? I'm here to help you study smarter."
        variant="default"
        className="mb-6"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Fire className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">{stats?.streak || 0} days</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stats?.streak ? 'Keep it up! You\'re on fire!' : 'Start your streak today!'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">{formatStudyTime(stats?.studyTime || 0)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Today's focused learning</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{stats?.xp || 0} XP</span>
                  <Badge variant="outline" className="ml-auto">
                    Level {stats?.level || 1}
                  </Badge>
                </div>
                <div className="mt-2">
                  <Progress value={stats?.progress || 0} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {100 - (stats?.progress || 0)}% to Level {(stats?.level || 1) + 1}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Plan</TabsTrigger>
          <TabsTrigger value="subjects">My Subjects</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          <StudyPlan loading={loading} onTaskComplete={() => {
            logStudyActivity('study', 'Completed a study session')
          }} />
        </TabsContent>
        <TabsContent value="subjects" className="mt-4">
          <SubjectProgress loading={loading} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <RecentActivity loading={loading} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your study session with these tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("flashcards")}
            >
              <FlashCard className="h-6 w-6 text-purple-500" />
              <span>Flashcards</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("ask")}
            >
              <MessageCircle className="h-6 w-6 text-blue-500" />
              <span>Ask AI</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("summarize")}
            >
              <BookOpen className="h-6 w-6 text-teal-500" />
              <span>Summarize</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("quiz")}
            >
              <Trophy className="h-6 w-6 text-amber-500" />
              <span>Quiz Me</span>
            </Button>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("notes")}
            >
              <PenLine className="h-6 w-6 text-orange-500" />
              <span>Notes</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("calendar")}
            >
              <CalendarDays className="h-6 w-6 text-green-500" />
              <span>Calendar</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("analytics")}
            >
              <BarChart3 className="h-6 w-6 text-indigo-500" />
              <span>Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => handleQuickAction("mindmap")}
            >
              <Brain className="h-6 w-6 text-pink-500" />
              <span>Mind Map</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <MascotTip
        tip="Studies show that teaching a concept to someone else is one of the most effective ways to learn. Try explaining what you've learned to Mindzi!"
        className="mt-6"
      />

      {/* Quick Action Modals */}
      <QuickActionModal
        isOpen={activeModal === "quiz"}
        onClose={() => setActiveModal(null)}
        title="Generate a Quiz"
        type="quiz"
        onComplete={() => {
          logStudyActivity('quiz', 'Completed a quiz')
        }}
      />
      
      <QuickActionModal
        isOpen={activeModal === "mindmap"}
        onClose={() => setActiveModal(null)}
        title="Create a Mind Map"
        type="mindmap"
        onComplete={() => {
          logStudyActivity('note', 'Created a mind map')
        }}
      />
    </div>
  )
}
