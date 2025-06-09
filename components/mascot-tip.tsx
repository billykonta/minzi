import { MascotIcon } from "@/components/mascot-icon"
import { Card, CardContent } from "@/components/ui/card"
import { LightbulbIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MascotTipProps {
  tip: string
  className?: string
}

export function MascotTip({ tip, className }: MascotTipProps) {
  return (
    <Card className={cn("overflow-hidden border-blue-200 shadow-md", className)}>
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-purple-500" />
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <MascotIcon size="sm" className="mt-1 flex-shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-blue-700">
              <LightbulbIcon className="h-4 w-4" />
              <span>Mindzi Tip</span>
            </div>
            <p className="text-sm font-medium">{tip}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
