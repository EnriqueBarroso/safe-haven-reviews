import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReportDialog } from "@/components/review/Reportdialog"
import { Calendar, MessageCircle } from "lucide-react"

interface QuestionCardProps {
  review: {
    id: string
    alias: string
    created_at: string
    details: string
  }
}

export function QuestionCard({ review }: QuestionCardProps) {
  return (
    <Card className="overflow-hidden border-amber-200/50 bg-amber-50/10">
      <CardHeader className="pb-3 bg-amber-500/5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs bg-amber-500/20 text-amber-700">
                {review.alias.substring(0, 2).toUpperCase()}
              </div>
              {review.alias}
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200/50 bg-amber-50 ml-2"
              >
                Pregunta al Foro
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {new Date(review.created_at).toLocaleDateString("es-ES")}
            </CardDescription>
          </div>
          <ReportDialog reviewId={review.id} variant="icon" />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative">
          <MessageCircle className="absolute -left-2 -top-2 h-8 w-8 text-amber-500/10" />
          <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-line relative z-10 pl-4 border-l-2 border-amber-500/30">
            {review.details}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}