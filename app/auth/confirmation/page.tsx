"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MascotIcon } from "@/components/mascot-icon"
import { CheckCircle2 } from "lucide-react"

export default function ConfirmationPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <Card className="w-full overflow-hidden">
          <div className="bg-primary/10 p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <MascotIcon size="lg" className="animate-bounce" />
                <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">Account Created!</h1>
                <p className="text-muted-foreground">
                  Your Mindzi journey is about to begin
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Thank you for signing up</h2>
                <p>
                  We've sent a confirmation email to your inbox. Please verify your email to fully activate your account.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" style={{ animationDelay: "0.4s" }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting to homepage in {countdown} seconds...
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <Button
              onClick={() => router.push("/")}
              className="transition-all duration-200 hover:scale-[1.02]"
            >
              Go to Dashboard Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
