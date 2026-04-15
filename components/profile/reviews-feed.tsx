"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StarRating } from "@/components/star-rating"
import { Flag, User, Euro, Clock, Loader2, CheckCircle2 } from "lucide-react"

interface Review {
  id: string
  alias: string
  date: string
  rating: number
  veracity: number
  punctuality: number
  communication: number
  hygiene: number
  overall: number
  price: number
  duration: number
  comment: string
}

interface ReviewsFeedProps {
  reviews: Review[]
}

const REPORT_REASONS = [
  { value: "fake", label: "Reseña falsa o spam" },
  { value: "offensive", label: "Contenido ofensivo o inapropiado" },
  { value: "personal_info", label: "Expone información personal" },
  { value: "other", label: "Otro motivo" },
]

export function ReviewsFeed({ reviews }: ReviewsFeedProps) {
  const [sortBy, setSortBy] = useState("date")

  // Estado del modal de reporte
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "rating-high":
        return b.rating - a.rating
      case "rating-low":
        return a.rating - b.rating
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "date":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleOpenReport = (reviewId: string) => {
    setReportingReviewId(reviewId)
    setReportReason("")
    setReportDetails("")
    setReportSuccess(false)
  }

  const handleCloseReport = () => {
    setReportingReviewId(null)
    setReportReason("")
    setReportDetails("")
    setReportSuccess(false)
  }

  const handleSubmitReport = async () => {
    if (!reportReason || !reportingReviewId) return

    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from("reports").insert({
        review_id: reportingReviewId,
        reporter_id: user?.id ?? null,
        reason: reportReason,
        details: reportDetails.trim() || null,
        status: "pending",
      })

      if (error) throw error

      setReportSuccess(true)
    } catch (error: any) {
      console.error("Error submitting report:", error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Reseñas ({reviews.length})</CardTitle>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Más recientes</SelectItem>
              <SelectItem value="rating-high">Mejor valoración</SelectItem>
              <SelectItem value="rating-low">Peor valoración</SelectItem>
              <SelectItem value="price-high">Mayor precio</SelectItem>
              <SelectItem value="price-low">Menor precio</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              {/* Cabecera reseña */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{review.alias}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(review.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="font-semibold text-primary">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Ratings compactos */}
              <div className="mt-4 grid grid-cols-5 gap-2 rounded-lg bg-muted/50 p-3 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground">Veracidad</p>
                  <p className="mt-1 font-semibold">{review.veracity}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Puntualidad</p>
                  <p className="mt-1 font-semibold">{review.punctuality}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Comunicación</p>
                  <p className="mt-1 font-semibold">{review.communication}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Higiene</p>
                  <p className="mt-1 font-semibold">{review.hygiene}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Global</p>
                  <p className="mt-1 font-semibold">{review.overall}</p>
                </div>
              </div>

              {/* Precio y duración */}
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Euro className="h-3.5 w-3.5" />
                  <span>{review.price} EUR</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{review.duration} min</span>
                </div>
              </div>

              {/* Comentario */}
              <p className="mt-4 leading-relaxed text-foreground/90">
                {review.comment}
              </p>

              {/* Botón reportar */}
              <div className="mt-4 border-t border-border pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => handleOpenReport(review.id)}
                >
                  <Flag className="mr-1.5 h-3 w-3" />
                  Reportar esta reseña
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal de reporte */}
      <Dialog open={!!reportingReviewId} onOpenChange={handleCloseReport}>
        <DialogContent className="sm:max-w-md">
          {reportSuccess ? (
            // Estado de éxito
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <DialogHeader>
                <DialogTitle>Reporte enviado</DialogTitle>
                <DialogDescription>
                  Gracias por ayudar a mantener la comunidad. Revisaremos tu reporte lo antes posible.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={handleCloseReport} className="mt-2">
                Cerrar
              </Button>
            </div>
          ) : (
            // Formulario de reporte
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-destructive" />
                  Reportar reseña
                </DialogTitle>
                <DialogDescription>
                  Ayúdanos a mantener la comunidad. Tu reporte será revisado por el equipo de moderación.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo del reporte</Label>
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Selecciona un motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">
                    Detalles adicionales{" "}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </Label>
                  <Textarea
                    id="details"
                    placeholder="Describe brevemente el problema..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseReport} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSubmitReport}
                  disabled={!reportReason || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar reporte
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}