"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"
import { Clock, Calendar, TrendingUp, Brain, Award, Download } from "lucide-react"

export default function AnalyticsPage() {
  // Sample data for charts
  const studyTimeData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Study Time (minutes)",
        data: [90, 120, 60, 180, 75, 210, 150],
        backgroundColor: "hsl(var(--primary) / 0.8)",
        borderColor: "hsl(var(--primary))",
        borderWidth: 2,
      },
    ],
  }

  const subjectDistributionData = {
    labels: ["Mathematics", "Physics", "Computer Science", "English", "History"],
    datasets: [
      {
        label: "Hours Spent",
        data: [12, 8, 15, 6, 4],
        backgroundColor: [
          "hsl(221.2 83.2% 53.3%)",
          "hsl(262 83.3% 57.8%)",
          "hsl(174 86% 44.7%)",
          "hsl(330 81.2% 60.4%)",
          "hsl(47 95.8% 53.1%)",
        ],
        borderColor: "hsl(var(--background))",
        borderWidth: 2,
      },
    ],
  }

  const progressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Quiz Scores",
        data: [65, 72, 78, 85],
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  // Sample strengths and weaknesses
  const strengths = [
    { subject: "Computer Science", topic: "Data Structures", score: 92 },
    { subject: "Mathematics", topic: "Calculus", score: 88 },
    { subject: "Physics", topic: "Mechanics", score: 85 },
  ]

  const weaknesses = [
    { subject: "English", topic: "Poetry Analysis", score: 62 },
    { subject: "History", topic: "World War II", score: 68 },
    { subject: "Physics", topic: "Quantum Mechanics", score: 70 },
  ]

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learning Analytics</h1>
          <p className="text-muted-foreground">Track your progress and optimize your study habits</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">24.5 hours</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-green-500">↑ 12%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">18 sessions</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-green-500">↑ 8%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">82%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-green-500">↑ 5%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mastery Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">Advanced</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">2 subjects at expert level</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Study Time</CardTitle>
            <CardDescription>Hours spent studying each day</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={studyTimeData} className="aspect-[4/3]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
            <CardDescription>Time allocation across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart data={subjectDistributionData} className="aspect-[4/3]" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Quiz scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart data={progressData} className="aspect-[3/1]" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="strengths">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="weaknesses">Areas to Improve</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="strengths" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Strengths</CardTitle>
                <CardDescription>Topics where you're performing exceptionally well</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strengths.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Brain className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {item.subject}: {item.topic}
                          </h3>
                          <p className="text-sm text-muted-foreground">You're in the top 10% of students</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{item.score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="weaknesses" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Areas to Improve</CardTitle>
                <CardDescription>Topics that need more attention and practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weaknesses.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                          <Brain className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {item.subject}: {item.topic}
                          </h3>
                          <p className="text-sm text-muted-foreground">Recommended: 2 more study sessions</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800">{item.score}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recommendations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>Personalized suggestions to improve your learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Optimize Your Study Schedule</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your data shows you're most productive between 9-11 AM. Try to schedule difficult topics during
                      this time window.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Update Schedule
                    </Button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Focus on Poetry Analysis</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This is your lowest-scoring topic. We've created a specialized study plan to help you improve.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      View Study Plan
                    </Button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">Try Spaced Repetition</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on your learning patterns, spaced repetition could improve your retention by up to 25%.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Enable Spaced Repetition
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
