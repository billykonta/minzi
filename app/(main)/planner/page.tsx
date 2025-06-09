"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../lib/auth"
import { createClient } from "@supabase/supabase-js"
import { CalendarIcon, Clock, MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface StudySession {
  id: string
  subject: string
  topic: string
  start_time: string
  end_time: string
  completed: boolean
  notes?: string
}

export default function PlannerPage() {
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    startTime: "",
    endTime: "",
    notes: ""
  })

  useEffect(() => {
    if (user && date) {
      fetchStudySessions()
    }
  }, [user, date])

  const fetchStudySessions = async () => {
    try {
      setIsLoading(true)
      const startOfDay = new Date(date!)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date!)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true })

      if (error) throw error
      setStudySessions(data || [])
    } catch (error) {
      console.error('Error fetching study sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSession = async () => {
    try {
      // Validate time fields
      if (!formData.startTime || !formData.endTime) {
        alert("Please enter both start and end times.");
        return;
      }
      const [startHours, startMinutes] = formData.startTime.split(":").map(Number);
      const [endHours, endMinutes] = formData.endTime.split(":").map(Number);
      if (
        isNaN(startHours) || isNaN(startMinutes) ||
        isNaN(endHours) || isNaN(endMinutes)
      ) {
        alert("Invalid time format. Please use HH:MM.");
        return;
      }
      const startTime = new Date(date!);
      startTime.setHours(startHours, startMinutes, 0, 0);
      const endTime = new Date(date!);
      endTime.setHours(endHours, endMinutes, 0, 0);
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        alert("Invalid date/time value.");
        return;
      }
      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user?.id,
          subject: formData.subject,
          topic: formData.topic,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          notes: formData.notes || null
        })
      if (error) throw error
      setFormData({
        subject: "",
        topic: "",
        startTime: "",
        endTime: "",
        notes: ""
      })
      setShowAddDialog(false)
      fetchStudySessions()
    } catch (error) {
      console.error('Error adding study session:', error)
    }
  }

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({ completed: true })
        .eq('id', sessionId)

      if (error) throw error
      fetchStudySessions()
    } catch (error) {
      console.error('Error completing session:', error)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      fetchStudySessions()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  // Function to format the selected date
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Planner</h1>
          <p className="text-muted-foreground">Organize your study sessions and track deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Month View</span>
          </Button>
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Session</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{formatDate(date)}</CardTitle>
              <Button variant="outline" size="sm">
                AI Optimize
              </Button>
            </div>
            <CardDescription>{studySessions.length} study sessions planned</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sessions">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
                <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
              </TabsList>
              <TabsContent value="sessions" className="mt-4 space-y-4">
                {isLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading sessions...</p>
                  </div>
                ) : studySessions.length > 0 ? (
                  studySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`relative flex items-start gap-4 rounded-lg border p-4 ${
                        session.completed ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{session.topic}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit Session
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline">{session.subject}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {session.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{session.notes}</p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Button 
                            size="sm" 
                            variant={session.completed ? "outline" : "default"}
                            onClick={() => handleCompleteSession(session.id)}
                          >
                            {session.completed ? "Completed" : "Start Session"}
                          </Button>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No study sessions planned for this day</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Session
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="deadlines" className="mt-4">
                {/* Deadlines content will be implemented later */}
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Deadline
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Study Session</DialogTitle>
            <DialogDescription>Plan a new study session for your calendar</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="e.g., Mathematics"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input 
                id="topic" 
                placeholder="e.g., Calculus - Derivatives"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input 
                  id="start-time" 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input 
                  id="end-time" 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Add any notes or goals for this session..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSession}>Add Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
