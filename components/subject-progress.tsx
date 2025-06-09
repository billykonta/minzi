"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, AlertCircle, BookOpen, Plus, Calendar } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { getSubjects, getSubjectColor, type Subject } from "@/lib/student-dashboard"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface SubjectProgressProps {
  loading?: boolean;
}

export function SubjectProgress({ loading = false }: SubjectProgressProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const subjectData = await getSubjects(user.id)
          setSubjects(subjectData)
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!loading) {
      fetchSubjects()
    }
  }, [loading])
  
  const handleStudyNow = (subjectId: string, subjectName: string) => {
    router.push(`/chat?subject=${encodeURIComponent(subjectName.toLowerCase())}`)
  }
  
  const handleViewTopics = (subjectId: string) => {
    router.push(`/subjects/${subjectId}`)
  }
  
  const handleAddSubject = () => {
    router.push('/subjects/new')
  }

  return (
    <div className="space-y-4">
      {loading || isLoading ? (
        // Loading skeleton
        <>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div className="flex gap-2 self-start sm:self-center">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      ) : subjects.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No subjects added yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first subject to start tracking your progress
          </p>
          <Button className="mt-4" onClick={handleAddSubject}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
      ) : (
        // Subject list
        <>
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: subject.color || getSubjectColor(subject.name) }}
                      />
                      <h3 className="font-semibold">{subject.name}</h3>
                      {subject.alert && (
                        <Badge variant="outline" className="gap-1 text-amber-500 border-amber-200 bg-amber-50">
                          <AlertCircle className="h-3 w-3" />
                          {subject.alertMessage}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Next session: {subject.nextSession}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-medium">
                        {subject.topicsCompleted}/{subject.topics} topics
                      </span>
                      <span className="text-muted-foreground">({subject.progress}% complete)</span>
                    </div>
                    <Progress 
                      value={subject.progress} 
                      className="h-2" 
                      style={{ 
                        '--progress-background': subject.color || getSubjectColor(subject.name) 
                      } as React.CSSProperties} 
                    />
                    
                    {subject.examDates && subject.examDates.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {subject.examDates[0].title}: {subject.examDates[0].date}
                          {subject.examDates.length > 1 && ` (+${subject.examDates.length - 1} more)`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 self-start sm:self-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTopics(subject.id)}
                    >
                      View Topics
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleStudyNow(subject.id, subject.name)}
                    >
                      Study Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleAddSubject}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Subject
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
