"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"

const ASSIGNMENT_TYPES = [
  { value: 'essay', label: 'Essay' },
  { value: 'presentation', label: 'PowerPoint Presentation' },
  { value: 'report', label: 'Report (Word/PDF)' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'other', label: 'Other' }
]

export default function NewAssignmentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    subject: "",
    assignment_type: ""
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return
    setUploadedFiles(Array.from(files))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      // First create the assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          subject: formData.subject,
          assignment_type: formData.assignment_type,
          status: 'draft'
        })
        .select()
        .single()

      if (assignmentError) throw assignmentError

      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${assignmentData.id}/${file.name}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('assignments')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          setUploadProgress(((i + 1) / uploadedFiles.length) * 100)
        }
      }

      // Create initial assignment step
      await supabase
        .from('assignment_steps')
        .insert({
          assignment_id: assignmentData.id,
          step_type: 'outline',
          content: '',
          ai_suggestions: null,
          user_notes: ''
        })

      router.push(`/assignments/${assignmentData.id}`)
    } catch (error) {
      console.error('Error creating assignment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Assignment</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="assignment_type">Assignment Type</Label>
                <Select
                  value={formData.assignment_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this assignment is about"
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="List the requirements and guidelines for this assignment"
                  required
                />
              </div>

              <div>
                <Label>Upload Documents</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="cursor-pointer"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Selected files:</p>
                      <ul className="mt-1 space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Creating...'}
                </>
              ) : (
                'Create Assignment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 