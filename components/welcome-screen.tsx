"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "Welcome to Mindzi!",
      message: "Hi there! I'm Mindzi, your AI study assistant. I'm here to help you learn smarter, not harder!",
    },
    {
      title: "Your Study Companion",
      message:
        "I can help you create flashcards, summarize texts, generate quizzes, and answer your questions about any subject.",
    },
    {
      title: "Track Your Progress",
      message:
        "I'll help you keep track of your study sessions, deadlines, and learning progress with personalized analytics.",
    },
    {
      title: "Let's Get Started!",
      message: "I'm excited to help you achieve your learning goals! Let's start our journey together.",
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-24 w-24 relative">
            <Image src="/images/mindzi-mascot.png" alt="Mindzi mascot" fill className="object-contain animate-float" />
          </div>
          <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "relative rounded-lg p-4 font-medium shadow-md",
              "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200",
              "mx-auto max-w-sm",
            )}
          >
            <p>{currentStep.message}</p>
            <div className="absolute bottom-0 h-4 w-4 -left-2 rounded-br-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-r border-blue-200" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStep((prev) => Math.max(0, prev - 1))} disabled={step === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep((prev) => prev + 1)
              } else {
                onComplete()
              }
            }}
          >
            {step < steps.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
