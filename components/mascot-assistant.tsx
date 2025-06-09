"use client"

import { useState } from "react"
import { MascotIcon } from "@/components/mascot-icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MascotAssistantProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
  className?: string
}

export function MascotAssistant({ suggestions, onSuggestionClick, className }: MascotAssistantProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg border-2 border-primary bg-white"
        onClick={() => setIsOpen(true)}
      >
        <MascotIcon size="sm" className="h-10 w-10" />
      </Button>
    )
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 w-80 shadow-lg border-blue-200", className)}>
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-purple-500" />
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-1.5">
              <MascotIcon size="sm" className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-blue-700">Mindzi Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mb-3 text-sm font-medium">Need some help? Try these:</p>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left text-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
