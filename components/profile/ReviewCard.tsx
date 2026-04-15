import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ReportDialog } from "@/components/review/Reportdialog"
import { StarIcon, Calendar, MessageCircle } from "lucide-react"

interface ReviewCardProps {
  review: {
    id: string
    alias: string
    created_at: string
    overall: number
    veracity?: number
    punctuality?: number
    communication?: number
    hygiene?: number
    price?: number
    duration?: number
    value_price?: number
    details: string
    review_images?: { id: string; image_url: string }[]
    genuine_experience?: boolean
  }
  onImageClick?: (url: string) => void
}

export function ReviewCard({ review, onImageClick }: ReviewCardProps) {
  return (
    <Card className="overflow-hidden bg-card/50">
      <CardHeader className="pb-3 bg-secondary/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs bg-primary/20 text-primary">
                {review.alias.substring(0, 2).toUpperCase()}
              </div>
              {review.alias}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(review.created_at).toLocaleDateString("es-ES")}
              </span>
              {review.genuine_experience && (
                <span className="text-green-500 font-medium">✓ Experiencia Confirmada</span>
              )}
            </CardDescription>
          </div>

          <div className="flex flex-col items-end gap-2">
            {review.overall && (
              <div className="flex items-center gap-1 bg-background px-3 py-1 rounded-full shadow-sm border">
                <span className="font-bold text-sm">{review.overall}/5</span>
                <StarIcon className="h-3.5 w-3.5 fill-primary text-primary" />
              </div>
            )}
            <ReportDialog reviewId={review.id} variant="icon" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Detalles de precio */}
        {review.price && (
          <div className="flex flex-wrap gap-4 text-sm bg-secondary/20 p-3 rounded-lg border border-border/50">
            <div>
              <span className="text-muted-foreground">Precio pagado: </span>
              <span className="font-medium">{review.price}€</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duración: </span>
              <span className="font-medium">{review.duration} min</span>
            </div>
            {review.value_price && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Calidad/Precio: </span>
                <Progress value={(review.value_price / 5) * 100} className="w-16 h-2" />
              </div>
            )}
          </div>
        )}

        {/* Valoraciones compactas */}
        {(review.veracity || review.punctuality || review.communication || review.hygiene) && (
          <div className="grid grid-cols-4 gap-2 text-xs bg-muted/30 p-3 rounded-lg">
            {[
              { label: "Veracidad", value: review.veracity },
              { label: "Puntualidad", value: review.punctuality },
              { label: "Comunicación", value: review.communication },
              { label: "Higiene", value: review.hygiene },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-muted-foreground">{label}</p>
                <p className="mt-1 font-semibold">{value ?? "-"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Texto */}
        <div className="relative">
          <MessageCircle className="absolute -left-2 -top-2 h-8 w-8 text-muted-foreground/10" />
          <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-line relative z-10 pl-4 border-l-2 border-primary/20">
            {review.details}
          </p>
        </div>
        {/* Texto */}
        <div className="relative">
          <MessageCircle className="absolute -left-2 -top-2 h-8 w-8 text-muted-foreground/10" />
          <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-line relative z-10 pl-4 border-l-2 border-primary/20">
            {review.details}
          </p>
        </div>

        {/* Galería de fotos de la visita */}
        {review.review_images && review.review_images.length > 0 && (
          <div className="pt-4 border-t mt-4">
            <p className="text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-widest">
              Fotos de la visita ({review.review_images.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {review.review_images.map((img: any) => (
                <div
                  key={img.id}
                  onClick={() => onImageClick?.(img.image_url)}
                  className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-secondary shadow-sm hover:ring-2 hover:ring-primary transition-all cursor-zoom-in group"
                >
                  <img
                    src={img.image_url}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt="Foto de la visita"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ────────────────────────────── */}
      </CardContent>
    </Card>
  )
}