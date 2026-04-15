"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Euro, Clock, TrendingUp } from "lucide-react"
import type { ReviewFormData } from "../review-form"

interface Step3Props {
  formData: ReviewFormData
  updateFormData: (updates: Partial<ReviewFormData>) => void
}

export function Step3Details({ formData, updateFormData }: Step3Props) {
  const getValueLabel = (value: number) => {
    if (value < 25) return "Poco valor"
    if (value < 50) return "Por debajo de la media"
    if (value < 75) return "Buena relación"
    return "Excelente relación"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Detalles y Precio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ayuda a otros a entender el valor y el contexto de tu experiencia
        </p>
      </div>

      <div className="space-y-6">
        {/* Value for Price Slider */}
        <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Relación Calidad/Precio</h3>
              <p className="text-sm text-muted-foreground">
                ¿Cómo valorarías la relación general entre lo recibido y el precio pagado?
              </p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <Slider
              value={[formData.valuePrice]}
              onValueChange={(value) => updateFormData({ valuePrice: value[0] })}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pobre</span>
              <span className="font-medium text-primary">
                {getValueLabel(formData.valuePrice)} ({formData.valuePrice}%)
              </span>
              <span className="text-muted-foreground">Excelente</span>
            </div>
          </div>
        </div>

        {/* Price Paid */}
        <div className="space-y-2">
          <Label htmlFor="price" className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            Precio Pagado <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              placeholder="150"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
              className="bg-secondary/50 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              EUR
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Introduce la cantidad total pagada por el servicio
          </p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Duración <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="duration"
              type="number"
              placeholder="60"
              value={formData.duration}
              onChange={(e) => updateFormData({ duration: e.target.value })}
              className="bg-secondary/50 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              min
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            ¿Cuánto tiempo duró el encuentro?
          </p>
        </div>

        {/* Price per hour calculation */}
        {formData.price && formData.duration && (
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tarifa por hora calculada</span>
              <span className="font-semibold">
                {((Number(formData.price) / Number(formData.duration)) * 60).toFixed(0)} EUR/h
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}