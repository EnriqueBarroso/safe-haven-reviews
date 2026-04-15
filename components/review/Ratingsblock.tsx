"use client"

import { useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { StarPicker } from "@/components/review/Starpicker"
import { Camera, Clock, MessageSquare, Sparkles, TrendingUp, Star } from "lucide-react"

export interface Ratings {
  veracity: number
  punctuality: number
  communication: number
  hygiene: number
  overall: number
  value_price: number
}

interface RatingsBlockProps {
  ratings: Ratings
  onChange: (ratings: Ratings) => void
}

const CATEGORIES = [
  {
    key: "veracity" as const,
    label: "Veracidad de fotos",
    description: "¿Las fotos coinciden con la realidad?",
    icon: Camera,
  },
  {
    key: "punctuality" as const,
    label: "Puntualidad",
    description: "¿Fue puntual y respetó el horario?",
    icon: Clock,
  },
  {
    key: "communication" as const,
    label: "Comunicación",
    description: "¿Fue fácil contactar y comunicarse?",
    icon: MessageSquare,
  },
  {
    key: "hygiene" as const,
    label: "Higiene y limpieza",
    description: "¿El entorno y la persona estaban limpios?",
    icon: Sparkles,
  },
]

const VALUE_LABELS: Record<number, string> = {
  1: "Muy caro para lo que es",
  2: "Algo caro",
  3: "Precio justo",
  4: "Buena relación calidad/precio",
  5: "Excelente valor",
}

export function RatingsBlock({ ratings, onChange }: RatingsBlockProps) {
  const setRating = (key: keyof Ratings, value: number) => {
    onChange({ ...ratings, [key]: value })
  }

  // Calcula overall automáticamente
  useEffect(() => {
    const { veracity, punctuality, communication, hygiene } = ratings
    if (veracity && punctuality && communication && hygiene) {
      const avg = Math.round((veracity + punctuality + communication + hygiene) / 4)
      onChange({ ...ratings, overall: avg })
    }
  }, [ratings.veracity, ratings.punctuality, ratings.communication, ratings.hygiene])

  const allRated =
    ratings.veracity > 0 &&
    ratings.punctuality > 0 &&
    ratings.communication > 0 &&
    ratings.hygiene > 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg">Valoraciones</h3>
        <p className="text-sm text-muted-foreground mt-1">
          La puntuación global se calcula automáticamente.
        </p>
      </div>

      <div className="space-y-4">
        {/* Estrellas por categoría */}
        {CATEGORIES.map(({ key, label, description, icon: Icon }) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50"
          >
            <div className="flex items-start gap-3 sm:w-56 shrink-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="sm:flex-1">
              <StarPicker
                value={ratings[key]}
                onChange={(v) => setRating(key, v)}
              />
            </div>
          </div>
        ))}

        {/* Slider calidad/precio */}
        <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Relación calidad/precio</p>
              <p className="text-xs text-muted-foreground">
                ¿El precio fue justo para lo que ofrecía?
              </p>
            </div>
          </div>
          <div className="space-y-3 px-1">
            <Slider
              value={[ratings.value_price]}
              onValueChange={(v) => setRating("value_price", v[0])}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Muy caro</span>
              <span className="font-medium text-primary">
                {VALUE_LABELS[ratings.value_price]}
              </span>
              <span>Excelente valor</span>
            </div>
          </div>
        </div>

        {/* Resumen overall */}
        {allRated && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
            <span className="font-medium text-sm">Puntuación global calculada</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    s <= ratings.overall
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="font-bold text-primary ml-1">{ratings.overall}/5</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}