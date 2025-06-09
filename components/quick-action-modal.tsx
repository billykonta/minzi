"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MascotIcon } from "@/components/mascot-icon"
import { Loader2 } from "lucide-react"

interface QuickActionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  type: "quiz" | "flashcards" | "summarize" | "mindmap"
  onComplete?: () => void
}

export function QuickActionModal({ isOpen, onClose, title, type, onComplete }: QuickActionModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [questionCount, setQuestionCount] = useState("10")
  const [mindmapType, setMindmapType] = useState("concept")

  const handleSubmit = () => {
    setIsLoading(true)

    // Simulate processing
    setTimeout(() => {
      setIsLoading(false)

      // Redirect to the appropriate tool with pre-filled data
      if (type === "quiz") {
        router.push(
          `/tools?tab=quiz&subject=${subject}&content=${encodeURIComponent(content)}&difficulty=${difficulty}&count=${questionCount}`,
        )
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete()
        }
      } else if (type === "flashcards") {
        router.push(
          `/tools?tab=flashcards&subject=${subject}&content=${encodeURIComponent(content)}`,
        )
        if (onComplete) {
          onComplete()
        }
      } else if (type === "summarize") {
        router.push(
          `/tools?tab=summarizer&subject=${subject}&content=${encodeURIComponent(content)}`,
        )
        if (onComplete) {
          onComplete()
        }
      } else if (type === "mindmap") {
        router.push(
          `/tools?tab=mindmap&subject=${subject}&content=${encodeURIComponent(content)}&type=${mindmapType}`,
        )
        if (onComplete) {
          onComplete()
        }
      } else {
        onClose()
      }
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MascotIcon size="sm" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {type === "quiz"
              ? "Generate a quiz to test your knowledge on any subject."
              : type === "flashcards"
                ? "Create flashcards to help you memorize key concepts."
                : type === "summarize"
                  ? "Summarize text to extract the most important information."
                  : "Create a mind map to visualize concepts and their relationships."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="english">English Literature</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content or Topic</Label>
            <Textarea
              id="content"
              placeholder={
                type === "quiz"
                  ? "Enter the topic or paste content to generate questions from..."
                  : type === "flashcards"
                    ? "Enter the topic or content for your flashcards..."
                    : type === "summarize"
                      ? "Paste the text you want to summarize..."
                      : "Enter the main concept or topic for your mind map..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {type === "quiz" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="question-count">Number of Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger id="question-count">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {type === "mindmap" && (
            <div className="grid gap-2">
              <Label htmlFor="mindmap-type">Mind Map Type</Label>
              <Select value={mindmapType} onValueChange={setMindmapType}>
                <SelectTrigger id="mindmap-type">
                  <SelectValue placeholder="Select mind map type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concept">Concept Map</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical Map</SelectItem>
                  <SelectItem value="spider">Spider Map</SelectItem>
                  <SelectItem value="flowchart">Flowchart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!subject || !content || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate ${type === "quiz" ? "Quiz" : type === "flashcards" ? "Flashcards" : type === "summarize" ? "Summary" : "Mind Map"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
