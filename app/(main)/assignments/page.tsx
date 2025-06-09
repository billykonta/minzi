"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, FileText, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  assignment_type: string
  status: 'draft' | 'in_progress' | 'completed' | 'submitted'
  created_at: string
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAssignments()
    }
  }, [user])

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />
      case 'in_progress':
        return <Clock className="w-4 h-4" />
      case 'completed':
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-500'
      case 'in_progress':
        return 'text-blue-500'
      case 'completed':
        return 'text-green-500'
      case 'submitted':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <Link href="/assignments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </Link>
      </div>

      {assignments.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
          <p className="text-gray-500 mb-4">Create your first AI-assisted assignment</p>
          <Link href="/assignments/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Link key={assignment.id} href={`/assignments/${assignment.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold line-clamp-2">{assignment.title}</h3>
                  <div className={`flex items-center ${getStatusColor(assignment.status)}`}>
                    {getStatusIcon(assignment.status)}
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2 mb-2">{assignment.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span className="font-medium">Subject:</span>
                  <span>{assignment.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{assignment.assignment_type.replace('_', ' ')}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 