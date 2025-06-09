"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { 
  MessageCircle, 
  BookOpen, 
  Trophy, 
  FlashlightIcon as FlashCard, 
  Clock, 
  PenLine,
  Activity,
  HistoryIcon
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { getRecentActivities, getIconForActivityType, type Activity as ActivityType } from "@/lib/student-dashboard"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface RecentActivityProps {
  loading?: boolean;
}

export function RecentActivity({ loading = false }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const activityData = await getRecentActivities(user.id)
          setActivities(activityData)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!loading) {
      fetchActivities()
    }
  }, [loading])
  
  // Get icon component based on activity type
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'chat': return MessageCircle;
      case 'quiz': return Trophy;
      case 'flashcard': return FlashCard;
      case 'summary': return BookOpen;
      case 'study': return Clock;
      case 'note': return PenLine;
      default: return Activity;
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        {loading || isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <HistoryIcon className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No activity yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your recent activities will appear here as you use Mindzi
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/chat'}>
              Start a conversation
            </Button>
          </div>
        ) : (
          // Activity list
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = getIconComponent(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`rounded-full p-1.5 ${activity.iconColor} bg-opacity-10`}>
                    <IconComponent className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.title}</p>
                      {activity.badge && (
                        <Badge variant="outline" className={activity.badgeColor}>
                          {activity.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                      {activity.subjectId && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{activity.details}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
