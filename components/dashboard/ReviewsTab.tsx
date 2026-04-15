"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2, MessageSquare, MapPin, Star,
  Calendar, CheckCircle2, Clock, FileEdit,
  PenLine, Trash2,
} from "lucide-react"

interface Review {
  id: string
  created_at: string
  status?: string
  rating?: number
  details?: string
  price?: number
  duration?: number
  profiles?: { name: string; city: string }
}

interface ReviewsTabProps {
  reviews: Review[]
  loading: boolean
  onEdit: (review: Review) => void
  onDelete: (id: string) => void
}

function StatusBadge({ status }: { status?: string }) {
  switch (status) {
    case "published":
      return (
        <Badge className="gap-1 bg-primary/20 text-primary hover:bg-primary/30">
          <CheckCircle2 className="h-3 w-3" /> Publicada
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" /> Pendiente
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <FileEdit className="h-3 w-3" /> Borrador
        </Badge>
      )
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric", month: "short", day: "numeric",
  })
}

export function ReviewsTab({ reviews, loading, onEdit, onDelete }: ReviewsTabProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Mis Reseñas</CardTitle>
          <CardDescription className="mt-1">
            Puedes editar o borrar tus reseñas.
          </CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/submit-review">Nueva Reseña</Link>
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary h-6 w-6" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Todavía no has publicado ninguna reseña.</p>
            <Button size="sm" className="mt-4" asChild>
              <Link href="/submit-review">Escribir primera reseña</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <span className="text-lg font-semibold text-muted-foreground">
                        {review.profiles?.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">
                          {review.profiles?.name ?? "Perfil eliminado"}
                        </h3>
                        <StatusBadge status={review.status} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {review.profiles?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{review.profiles.city}</span>
                          </div>
                        )}
                        {review.rating && review.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            <span>{review.rating}/5</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline" size="sm" className="gap-1.5"
                      onClick={() => onEdit(review)}
                    >
                      <PenLine className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {review.details && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2 border-t border-border pt-3">
                    {review.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}