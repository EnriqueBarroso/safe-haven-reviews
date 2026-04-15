"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PenLine, Upload, AlertCircle } from "lucide-react"
import type { ReviewFormData } from "../review-form"

interface Step4Props {
  formData: ReviewFormData
  updateFormData: (updates: Partial<ReviewFormData>) => void
}

export function Step4Written({ formData, updateFormData }: Step4Props) {
  const charCount = formData.details.length
  const minChars = 100
  const isValid = charCount >= minChars

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Reseña Escrita</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparte los detalles de tu experiencia para ayudar a otros
        </p>
      </div>

      <div className="space-y-6">
        {/* Written Details */}
        <div className="space-y-2">
          <Label htmlFor="details" className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-muted-foreground" />
            Detalles de la Experiencia <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="details"
            placeholder="Describe el encuentro de manera profesional, enfocándote en la calidad del servicio, la comunicación y la experiencia general. Sé honesto y respetuoso en tu valoración..."
            value={formData.details}
            onChange={(e) => updateFormData({ details: e.target.value })}
            className="min-h-[200px] resize-none bg-secondary/50"
          />
          <div className="flex items-center justify-between text-xs">
            <span
              className={
                isValid ? "text-muted-foreground" : "text-destructive"
              }
            >
              {charCount}/{minChars} caracteres mínimo
            </span>
            {!isValid && charCount > 0 && (
              <span className="text-destructive">
                Faltan {minChars - charCount} caracteres
              </span>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Normas para Reseñas</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Usa un lenguaje profesional y respetuoso</li>
                <li>Céntrate en observaciones objetivas sobre el servicio</li>
                <li>No incluyas información personal identificable</li>
                <li>Evita descripciones explícitas o inapropiadas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Verification Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            Prueba de Veracidad (Opcional)
          </Label>
          <div className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50 hover:bg-secondary/50">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Sube una prueba para revisión interna (opcional)
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Esto nunca se publicará de forma pública
              </p>
            </div>
          </div>
        </div>

        {/* Verification Checkbox */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="genuine"
              checked={formData.genuineExperience}
              onCheckedChange={(checked) =>
                updateFormData({ genuineExperience: checked === true })
              }
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="genuine"
                className="cursor-pointer text-sm font-medium leading-relaxed"
              >
                Confirmo que es una experiencia genuina{" "}
                <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Juro que esta reseña se basa en una experiencia real y que no tengo ningún conflicto de intereses con la persona reseñada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}