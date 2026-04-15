"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, MapPin, Globe } from "lucide-react"
import type { ReviewFormData } from "../review-form"

interface Step1Props {
  formData: ReviewFormData
  updateFormData: (updates: Partial<ReviewFormData>) => void
}

export function Step1ProfileInfo({ formData, updateFormData }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Información del Perfil</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Introduce los detalles básicos del perfil que estás reseñando
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Nombre o Pseudónimo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="ej., Luna"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground">
            Introduce el nombre o pseudónimo tal y como aparece en su perfil
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Ciudad / Ubicación <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            placeholder="ej., Barcelona"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            className="bg-secondary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Plataforma / Sitio web (Opcional)
          </Label>
          <Input
            id="platform"
            placeholder="ej., Nombre de la web donde lo encontraste"
            value={formData.platform}
            onChange={(e) => updateFormData({ platform: e.target.value })}
            className="bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground">
            ¿Dónde encontraste este perfil? Esto ayuda a verificar la autenticidad.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">Foto de Perfil (Opcional)</Label>
          <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50 hover:bg-secondary/50">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Arrastra y suelta o haz clic para subir
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                PNG, JPG hasta 5MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}