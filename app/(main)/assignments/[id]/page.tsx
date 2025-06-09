"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Send, Wand2 } from "lucide-react"
import { format } from "date-fns"

interface Assignment {
  id: string
  title: string
  description: string
  requirements: string
  status: 'draft' | 'in_progress' | 'completed' | 'submitted'
  due_date: string | null
  created_at: string
  subject?: { name: string }
  topic?: { name: string }
}

interface AssignmentStep {
  id: string
  step_type: 'outline' | 'research' | 'draft' | 'revision' | 'final'
  content: string
  ai_suggestions: any
  user_notes: string
  created_at: string
}

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [steps, setSteps] = useState<AssignmentStep[]>([])
  const [currentStep, setCurrentStep] = useState<AssignmentStep | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAssignment()
    }
  }, [user, params.id])

  const fetchAssignment = async () => {
    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select(`
          *,
          subject:subjects(name),
          topic:topics(name)
        `)
        .eq('id', params.id)
        .single()

      if (assignmentError) throw assignmentError

      const { data: stepsData, error: stepsError } = await supabase
        .from('assignment_steps')
        .select('*')
        .eq('assignment_id', params.id)
        .order('created_at', { ascending: true })

      if (stepsError) throw stepsError

      setAssignment(assignmentData)
      setSteps(stepsData)
      setCurrentStep(stepsData[0] || null)
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentStep) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('assignment_steps')
        .update({
          content: currentStep.content,
          user_notes: currentStep.user_notes
        })
        .eq('id', currentStep.id)

      if (error) throw error
    } catch (error) {
      console.error('Error saving step:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateAI = async () => {
    if (!currentStep || !assignment) return

    setIsGenerating(true)
    try {
      // Here you would integrate with your AI service
      // For now, we'll just simulate a response
      const aiResponse = {
        suggestions: [
          "Consider adding more specific examples",
          "Expand on the main points",
          "Add a conclusion section"
        ],
        content: "AI-generated content would go here..."
      }

      const { error } = await supabase
        .from('assignment_steps')
        .update({
          ai_suggestions: aiResponse
        })
        .eq('id', currentStep.id)

      if (error) throw error

      setCurrentStep(prev => prev ? {
        ...prev,
        ai_suggestions: aiResponse
      } : null)
    } catch (error) {
      console.error('Error generating AI content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!assignment) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          status: 'submitted'
        })
        .eq('id', assignment.id)

      if (error) throw error

      setAssignment(prev => prev ? { ...prev, status: 'submitted' } : null)
      router.push('/assignments')
    } catch (error) {
      console.error('Error submitting assignment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!assignment || !currentStep) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Assignment not found</h3>
          <Button onClick={() => router.push('/assignments')}>
            Back to Assignments
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
            <p className="text-gray-600">{assignment.description}</p>
            {assignment.due_date && (
              <p className="text-sm text-gray-500 mt-2">
                Due: {format(new Date(assignment.due_date), "PPP")}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            {assignment.status !== 'submitted' && (
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{assignment.requirements}</p>
        </Card>

        <Tabs defaultValue={currentStep.step_type} className="space-y-4">
          <TabsList>
            {steps.map((step) => (
              <TabsTrigger
                key={step.id}
                value={step.step_type}
                onClick={() => setCurrentStep(step)}
              >
                {step.step_type.charAt(0).toUpperCase() + step.step_type.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={currentStep.step_type} className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={currentStep.content}
                    onChange={(e) => setCurrentStep(prev => prev ? {
                      ...prev,
                      content: e.target.value
                    } : null)}
                    placeholder="Write your content here..."
                    className="min-h-[200px]"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={currentStep.user_notes}
                    onChange={(e) => setCurrentStep(prev => prev ? {
                      ...prev,
                      user_notes: e.target.value
                    } : null)}
                    placeholder="Add your notes here..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>

                {currentStep.ai_suggestions && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">AI Suggestions</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {currentStep.ai_suggestions.suggestions?.map((suggestion: string, index: number) => (
                        <li key={index} className="text-gray-600">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 