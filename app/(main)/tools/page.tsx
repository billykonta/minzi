"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FlashlightIcon as FlashCard, BookOpen, Trophy, Upload, Loader2 } from "lucide-react"
import { MascotAssistant } from "@/components/mascot-assistant"

export default function ToolsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("flashcards")
  const [isGenerating, setIsGenerating] = useState(false)
  const [flashcardText, setFlashcardText] = useState("")
  const [summaryText, setSummaryText] = useState("")
  const [quizText, setQuizText] = useState("")
  const [quizSubject, setQuizSubject] = useState("")
  const [quizDifficulty, setQuizDifficulty] = useState("medium")
  const [quizQuestionCount, setQuizQuestionCount] = useState("10")
  const [flashcardSuggestion, setFlashcardSuggestion] = useState("")
  const [summarySuggestion, setSummarySuggestion] = useState("")
  const [quizSuggestion, setQuizSuggestion] = useState("")
  
  // State for API results
  const [flashcards, setFlashcards] = useState<{ front: string; back: string }[]>([])
  const [summary, setSummary] = useState<string>("") 
  const [quiz, setQuiz] = useState<{ question: string; options: string[]; correctAnswer: number; explanation: string }[]>([])
  const [showResults, setShowResults] = useState(false)

  // Reset results when switching tabs
  useEffect(() => {
    setShowResults(false);
    setFlashcards([]);
    setSummary("");
    setQuiz([]);
  }, [activeTab]);

  // Handle URL parameters when redirected from quick actions
  useEffect(() => {
    const tab = searchParams.get("tab")
    const subject = searchParams.get("subject")
    const content = searchParams.get("content")
    const difficulty = searchParams.get("difficulty")
    const count = searchParams.get("count")

    if (tab) {
      setActiveTab(tab)
    }

    if (content) {
      if (tab === "flashcards") {
        setFlashcardText(content)
      } else if (tab === "summarizer") {
        setSummaryText(content)
      } else if (tab === "quiz") {
        setQuizText(content)
      }
    }

    if (subject && tab === "quiz") {
      setQuizSubject(subject)
    }

    if (difficulty && tab === "quiz") {
      setQuizDifficulty(difficulty)
    }

    if (count && tab === "quiz") {
      setQuizQuestionCount(count)
    }

    // Auto-generate if all required fields are filled
    if (tab === "quiz" && subject && content && difficulty && count) {
      handleGenerate("quiz")
    }
  }, [searchParams])

  const handleGenerate = async (tool: string) => {
    setIsGenerating(true)
    setShowResults(false)

    try {
      if (tool === "flashcards") {
        const response = await fetch("/api/tools/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: flashcardText,
            count: 20, // You can make this dynamic based on user selection
            difficulty: "medium", // You can make this dynamic based on user selection
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate flashcards");
        }

        const data = await response.json();
        console.log("Flashcards generated:", data);
        setFlashcards(data.flashcards || []);
        setShowResults(true);
      } else if (tool === "summarizer") {
        const response = await fetch("/api/tools/summarizer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: summaryText,
            length: "medium", // You can make this dynamic based on user selection
            style: "bullet", // You can make this dynamic based on user selection
            highlightConcepts: true, // You can make this dynamic based on user selection
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate summary");
        }

        const data = await response.json();
        console.log("Summary generated:", data);
        setSummary(data.summary || "");
        setShowResults(true);
      } else if (tool === "quiz") {
        const response = await fetch("/api/tools/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: quizText,
            subject: quizSubject,
            difficulty: quizDifficulty,
            count: parseInt(quizQuestionCount),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate quiz");
        }

        const data = await response.json();
        console.log("Quiz generated:", data);
        setQuiz(data.questions || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error(`Error generating ${tool}:`, error);
      // Handle error, e.g., show error message to user
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (activeTab === "flashcards") {
      setFlashcardText(suggestion)
    } else if (activeTab === "summarizer") {
      setSummaryText(suggestion)
    } else if (activeTab === "quiz") {
      setQuizText(suggestion)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Study Tools</h1>
        <p className="text-muted-foreground">AI-powered tools to enhance your learning experience</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <FlashCard className="h-4 w-4" />
            <span>Flashcards</span>
          </TabsTrigger>
          <TabsTrigger value="summarizer" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Summarizer</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Quiz Generator</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Flashcard Generator</CardTitle>
              <CardDescription>Create AI-powered flashcards from your notes or textbooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flashcard-input">Enter your text or notes</Label>
                <Textarea
                  id="flashcard-input"
                  placeholder="Paste your notes or text here..."
                  className="min-h-32"
                  value={flashcardText}
                  onChange={(e) => setFlashcardText(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </Button>
                <span className="text-xs text-muted-foreground">or drag and drop (PDF, DOCX, TXT)</span>
              </div>
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="flashcard-count">Number of cards</Label>
                    <Select defaultValue="20">
                      <SelectTrigger id="flashcard-count">
                        <SelectValue placeholder="Select number of cards" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 cards</SelectItem>
                        <SelectItem value="20">20 cards</SelectItem>
                        <SelectItem value="30">30 cards</SelectItem>
                        <SelectItem value="50">50 cards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flashcard-difficulty">Difficulty level</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="flashcard-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="spaced-repetition" />
                  <Label htmlFor="spaced-repetition">Enable spaced repetition</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                onClick={() => handleGenerate("flashcards")}
                disabled={!flashcardText.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  "Generate Flashcards"
                )}
              </Button>
              
              {showResults && flashcards.length > 0 && (
                <div className="mt-4 w-full">
                  <h3 className="mb-3 text-lg font-medium">Generated Flashcards</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {flashcards.slice(0, 6).map((card, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-primary/10 p-3">
                          <CardTitle className="text-sm">{card.front}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <p className="text-sm">{card.back}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {flashcards.length > 6 && (
                    <Button variant="link" className="mt-2">
                      View all {flashcards.length} flashcards
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="summarizer" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Text Summarizer</CardTitle>
              <CardDescription>Create concise summaries of your study materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary-input">Enter text to summarize</Label>
                <Textarea
                  id="summary-input"
                  placeholder="Paste your text here..."
                  className="min-h-32"
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </Button>
                <span className="text-xs text-muted-foreground">or drag and drop (PDF, DOCX, TXT)</span>
              </div>
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="summary-length">Summary length</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="summary-length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                        <SelectItem value="medium">Medium (3-4 paragraphs)</SelectItem>
                        <SelectItem value="long">Long (5+ paragraphs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary-style">Summary style</Label>
                    <Select defaultValue="bullet">
                      <SelectTrigger id="summary-style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullet">Bullet points</SelectItem>
                        <SelectItem value="paragraph">Paragraphs</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="key-concepts" defaultChecked />
                  <Label htmlFor="key-concepts">Highlight key concepts</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                onClick={() => handleGenerate("summarizer")}
                disabled={!summaryText.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
              
              {showResults && summary && (
                <div className="mt-4 w-full">
                  <h3 className="mb-3 text-lg font-medium">Generated Summary</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: summary }} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Generator</CardTitle>
              <CardDescription>Create practice quizzes from your study materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-input">Enter your study material</Label>
                <Textarea
                  id="quiz-input"
                  placeholder="Paste your notes or text here..."
                  className="min-h-32"
                  value={quizText}
                  onChange={(e) => setQuizText(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </Button>
                <span className="text-xs text-muted-foreground">or drag and drop (PDF, DOCX, TXT)</span>
              </div>
              <div className="space-y-2">
                <Label>Quiz Options</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="question-count">Number of questions</Label>
                    <Select value={quizQuestionCount} onValueChange={setQuizQuestionCount}>
                      <SelectTrigger id="question-count">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 questions</SelectItem>
                        <SelectItem value="10">10 questions</SelectItem>
                        <SelectItem value="15">15 questions</SelectItem>
                        <SelectItem value="20">20 questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question types</Label>
                    <Select defaultValue="mixed">
                      <SelectTrigger id="question-type">
                        <SelectValue placeholder="Select types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple">Multiple choice only</SelectItem>
                        <SelectItem value="true-false">True/False only</SelectItem>
                        <SelectItem value="short">Short answer only</SelectItem>
                        <SelectItem value="mixed">Mixed types</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="timed-quiz" />
                  <Label htmlFor="timed-quiz">Enable timed quiz mode</Label>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="explanations" defaultChecked />
                  <Label htmlFor="explanations">Include answer explanations</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                onClick={() => handleGenerate("quiz")}
                disabled={!quizText.trim() || !quizSubject || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
              
              {showResults && quiz.length > 0 && (
                <div className="mt-4 w-full">
                  <h3 className="mb-3 text-lg font-medium">Generated Quiz</h3>
                  <div className="space-y-6">
                    {quiz.slice(0, 3).map((question, qIndex) => (
                      <Card key={qIndex}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{qIndex + 1}. {question.question}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div 
                                key={oIndex} 
                                className={`flex items-center gap-2 rounded-md p-2 ${oIndex === question.correctAnswer ? 'bg-green-100 dark:bg-green-900/20' : ''}`}
                              >
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${oIndex === question.correctAnswer ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                                  {['A', 'B', 'C', 'D'][oIndex]}
                                </div>
                                <div>{option}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="text-sm text-muted-foreground">
                          <div className="italic">{question.explanation}</div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  {quiz.length > 3 && (
                    <Button variant="link" className="mt-2">
                      View all {quiz.length} questions
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <MascotAssistant
        suggestions={
          activeTab === "flashcards"
            ? [
                "The cell is the basic structural and functional unit of all organisms. Cells are composed of cytoplasm enclosed within a membrane...",
                "The periodic table is a tabular arrangement of chemical elements, organized by their atomic number, electron configuration...",
                "In mathematics, a function is a relation between a set of inputs and a set of permissible outputs...",
              ]
            : activeTab === "summarizer"
              ? [
                  "The American Revolution was a political revolution that occurred between 1765 and 1783 during which colonists in the Thirteen American Colonies rejected the British monarchy...",
                  "Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy...",
                  "Machine learning is a branch of artificial intelligence and computer science which focuses on the use of data and algorithms to imitate the way that humans learn...",
                ]
              : [
                  "The human digestive system consists of the gastrointestinal tract plus the accessory organs of digestion...",
                  "World War II was a global war that lasted from 1939 to 1945. It involved the vast majority of the world's countries...",
                  "The water cycle, also known as the hydrologic cycle, describes the continuous movement of water on, above and below the surface of the Earth...",
                ]
        }
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  )
}
