import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Camera, Clock, MessageCircle, Sparkles, Star } from "lucide-react"

interface RatingsBreakdownProps {
  ratings: {
    veracity: number
    punctuality: number
    communication: number
    hygiene: number
    overall: number
  }
}

const ratingCategories = [
  {
    key: "veracity" as const,
    label: "Veracity / Photo Accuracy",
    icon: Camera,
  },
  {
    key: "punctuality" as const,
    label: "Punctuality",
    icon: Clock,
  },
  {
    key: "communication" as const,
    label: "Communication & Friendliness",
    icon: MessageCircle,
  },
  {
    key: "hygiene" as const,
    label: "Hygiene & Environment",
    icon: Sparkles,
  },
  {
    key: "overall" as const,
    label: "Overall Experience",
    icon: Star,
  },
]

export function RatingsBreakdown({ ratings }: RatingsBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratingCategories.map((category) => (
          <div key={category.key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <category.icon className="h-4 w-4 text-muted-foreground" />
                <span>{category.label}</span>
              </div>
              <span className="font-semibold text-primary">
                {ratings[category.key].toFixed(1)}
              </span>
            </div>
            <Progress
              value={(ratings[category.key] / 5) * 100}
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
