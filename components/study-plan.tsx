"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, CheckCircle, Clock, Play, CalendarDays } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { getStudyTasks, updateStudyTask, type StudyTask } from "@/lib/student-dashboard"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface StudyPlanProps {
  loading?: boolean;
  onTaskComplete?: () => void;
}

export function StudyPlan({ loading = false, onTaskComplete }: StudyPlanProps) {
  const router = useRouter()
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudyTasks = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const tasks = await getStudyTasks(user.id)
          setStudyTasks(tasks)
        }
      } catch (error) {
        console.error('Error fetching study tasks:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!loading) {
      fetchStudyTasks()
    }
  }, [loading])

  const completedTasks = studyTasks.filter((task) => task.completed).length
  const totalTasks = studyTasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const handleStartSession = (task: StudyTask) => {
    // Navigate to the appropriate tool based on the subject
    if (task.subject.toLowerCase().includes('physics')) {
      router.push(`/tools?tab=quiz&subject=physics&content=${encodeURIComponent(task.topic)}`)
    } else if (task.subject.toLowerCase().includes('computer')) {
      router.push(`/tools?tab=flashcards&subject=computer-science&content=${encodeURIComponent(task.topic)}`)
    } else {
      router.push(`/chat?topic=${encodeURIComponent(task.topic)}&subject=${task.subject.toLowerCase()}`)
    }
  }

  const handleViewSchedule = () => {
    router.push("/planner")
  }
  
  const handleCompleteTask = async (taskId: string) => {
    try {
      setUpdatingTaskId(taskId)
      
      // Update the task in the database
      const success = await updateStudyTask(taskId, { completed: true })
      
      if (success) {
        // Update local state
        setStudyTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, completed: true } : task
          )
        )
        
        // Call the onTaskComplete callback if provided
        if (onTaskComplete) {
          onTaskComplete()
        }
      }
    } catch (error) {
      console.error('Error completing task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }
  
  const handleRescheduleTask = async (taskId: string) => {
    try {
      setUpdatingTaskId(taskId)
      
      // Update the current flag in the database
      const success = await updateStudyTask(taskId, { current: false })
      
      if (success) {
        // Update local state
        setStudyTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, current: false } : task
          )
        )
        
        // Navigate to planner
        router.push("/planner")
      }
    } catch (error) {
      console.error('Error rescheduling task:', error)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Study Plan</CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewSchedule}>
            <CalendarDays className="mr-2 h-4 w-4" />
            View Full Schedule
          </Button>
        </div>
        {loading || isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : (
          <>
            <CardDescription>
              {completedTasks} of {totalTasks} tasks completed
            </CardDescription>
            <Progress value={progressPercentage} className="h-2" />
          </>
        )}
      </CardHeader>
      <CardContent>
        {loading || isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : studyTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No study tasks scheduled</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You don't have any study tasks scheduled for today. Create a study plan to get started.
            </p>
            <Button className="mt-4" onClick={handleViewSchedule}>
              Create Study Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {studyTasks.map((task) => (
              <div
                key={task.id}
                className={`relative flex items-start gap-4 rounded-lg border p-4 ${
                  task.current ? "border-primary bg-primary/5" : ""
                } ${task.completed ? "opacity-60" : ""}`}
              >
                {task.completed ? (
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                ) : task.current ? (
                  <Play className="mt-0.5 h-5 w-5 text-primary" />
                ) : (
                  <BookOpen className="mt-0.5 h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.topic}</h3>
                    <Badge variant="outline">{task.subject}</Badge>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{task.time}</span>
                    <span className="mx-2">•</span>
                    <span>{task.duration} min</span>
                  </div>
                  {task.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
                  )}
                  {!task.completed && (
                    <div className="mt-3 flex gap-2">
                      {task.current && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartSession(task)}
                          disabled={updatingTaskId === task.id}
                        >
                          Start Session
                        </Button>
                      )}
                      <Button 
                        variant={task.current ? "outline" : "default"} 
                        size="sm" 
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={updatingTaskId === task.id}
                      >
                        Mark Complete
                      </Button>
                      {task.current && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRescheduleTask(task.id)}
                          disabled={updatingTaskId === task.id}
                        >
                          Reschedule
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
