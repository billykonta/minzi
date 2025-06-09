"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MascotIcon } from "@/components/mascot-icon"
import { MascotMessage } from "@/components/mascot-message"
import { CheckCircle, XCircle, Clock, ArrowRight, RotateCcw } from "lucide-react"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizResultProps {
  subject: string
  questions: Question[]
  onReset: () => void
}

export function QuizResult({ subject, questions, onReset }: QuizResultProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1))
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = Number.parseInt(value)
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleShowExplanation = () => {
    setShowExplanation(true)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    }
  }

  if (quizCompleted) {
    const score = calculateScore()

    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>Subject: {subject}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-5xl font-bold">{score.percentage}%</div>
            <p className="text-muted-foreground">
              You got {score.correct} out of {score.total} questions correct
            </p>
          </div>

          <MascotMessage
            title={score.percentage >= 80 ? "Great job!" : score.percentage >= 60 ? "Good effort!" : "Keep practicing!"}
            message={
              score.percentage >= 80
                ? "You've mastered this topic! Consider moving on to more advanced material."
                : score.percentage >= 60
                  ? "You're making good progress. Review the questions you missed and try again."
                  : "Don't worry! Learning takes time. Review the material and try again later."
            }
            variant={score.percentage >= 80 ? "success" : score.percentage >= 60 ? "info" : "warning"}
          />

          <div className="space-y-2">
            <h3 className="font-medium">Question Summary</h3>
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-md p-2 ${
                    selectedAnswers[index] === question.correctAnswer
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm">Question {index + 1}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {selectedAnswers[index] === question.correctAnswer ? "Correct" : "Incorrect"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => window.print()}>Save Results</Button>
        </CardFooter>
      </Card>
    )
  }

  const question = questions[currentQuestion]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz: {subject}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">{question.question}</div>

        <RadioGroup value={selectedAnswers[currentQuestion].toString()} onValueChange={handleAnswerSelect}>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="rounded-md bg-blue-50 p-4 text-blue-700">
            <div className="mb-2 flex items-center gap-2">
              <MascotIcon size="sm" />
              <span className="font-medium">Explanation</span>
            </div>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleShowExplanation}
          disabled={selectedAnswers[currentQuestion] === -1 || showExplanation}
        >
          Show Explanation
        </Button>
        <Button onClick={handleNext} disabled={selectedAnswers[currentQuestion] === -1}>
          {currentQuestion < questions.length - 1 ? (
            <>
              Next Question
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Complete Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
