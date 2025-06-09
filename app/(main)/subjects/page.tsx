"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Clock, AlertCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      description: "Calculus, Algebra, Statistics",
      progress: 78,
      nextSession: "Today, 3:00 PM",
      alert: false,
      topics: 12,
      topicsCompleted: 9,
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Physics",
      description: "Mechanics, Thermodynamics, Electromagnetism",
      progress: 45,
      nextSession: "Tomorrow, 10:00 AM",
      alert: true,
      alertMessage: "Quiz coming up in 3 days",
      topics: 10,
      topicsCompleted: 4,
      color: "bg-purple-500",
    },
    {
      id: 3,
      name: "Computer Science",
      description: "Algorithms, Data Structures, Programming",
      progress: 92,
      nextSession: "Today, 1:00 PM",
      alert: false,
      topics: 15,
      topicsCompleted: 14,
      color: "bg-teal-500",
    },
    {
      id: 4,
      name: "English Literature",
      description: "Shakespeare, Poetry, Modern Literature",
      progress: 30,
      nextSession: "Wednesday, 2:30 PM",
      alert: true,
      alertMessage: "Essay due in 5 days",
      topics: 8,
      topicsCompleted: 2,
      color: "bg-pink-500",
    },
    {
      id: 5,
      name: "History",
      description: "World History, Ancient Civilizations",
      progress: 65,
      nextSession: "Friday, 11:00 AM",
      alert: false,
      topics: 10,
      topicsCompleted: 6,
      color: "bg-amber-500",
    },
  ]

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Subjects</h1>
          <p className="text-muted-foreground">Manage and track your learning progress</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search subjects..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Subject
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="all">All Subjects</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="overflow-hidden">
                <div className={`h-2 w-full ${subject.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle>{subject.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit Subject
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Subject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{subject.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {subject.topicsCompleted}/{subject.topics} topics
                    </span>
                    <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                  <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Next: {subject.nextSession}</span>
                  </div>
                  {subject.alert && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
                      <AlertCircle className="h-3 w-3" />
                      <span>{subject.alertMessage}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    View Topics
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects
              .filter((subject) => subject.progress > 0 && subject.progress < 100)
              .map((subject) => (
                <Card key={subject.id} className="overflow-hidden">
                  <div className={`h-2 w-full ${subject.color}`} />
                  <CardHeader className="pb-2">
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {subject.topicsCompleted}/{subject.topics} topics
                      </span>
                      <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                    <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Next: {subject.nextSession}</span>
                    </div>
                    {subject.alert && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
                        <AlertCircle className="h-3 w-3" />
                        <span>{subject.alertMessage}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Topics
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects
              .filter((subject) => subject.progress === 100)
              .map((subject) => (
                <Card key={subject.id} className="overflow-hidden">
                  <div className={`h-2 w-full ${subject.color}`} />
                  <CardHeader className="pb-2">
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {subject.topicsCompleted}/{subject.topics} topics
                      </span>
                      <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Topics
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects
              .filter((subject) => subject.alert)
              .map((subject) => (
                <Card key={subject.id} className="overflow-hidden">
                  <div className={`h-2 w-full ${subject.color}`} />
                  <CardHeader className="pb-2">
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>{subject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {subject.topicsCompleted}/{subject.topics} topics
                      </span>
                      <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                    <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Next: {subject.nextSession}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm text-amber-500">
                      <AlertCircle className="h-3 w-3" />
                      <span>{subject.alertMessage}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Topics
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>Create a new subject to track your learning progress</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input id="subject-name" placeholder="e.g., Biology" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject-description">Description</Label>
              <Input id="subject-description" placeholder="e.g., Cell Biology, Genetics, Ecology" />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {["bg-blue-500", "bg-purple-500", "bg-teal-500", "bg-pink-500", "bg-amber-500", "bg-green-500"].map(
                  (color) => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded-full ${color} ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                      aria-label={`Select ${color} color`}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>Add Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
