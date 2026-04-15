"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Flag, Loader2, CheckCircle2 } from "lucide-react"

const REASONS = [
  { value: "fake", label: "Reseña falsa o spam" },
  { value: "offensive", label: "Contenido ofensivo o inapropiado" },
  { value: "personal_info", label: "Expone información personal" },
  { value: "other", label: "Otro motivo" },
]

interface ReportDialogProps {
  reviewId: string
  // Permite usar el componente como botón inline o como icono pequeño
  variant?: "inline" | "icon"
}

export function ReportDialog({ reviewId, variant = "inline" }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    // Reseteamos con un pequeño delay para que la animación de cierre termine
    setTimeout(() => {
      setReason("")
      setDetails("")
      setSuccess(false)
    }, 300)
  }

  const handleSubmit = async () => {
    if (!reason) return
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from("reports").insert({
        review_id: reviewId,
        reporter_id: user?.id ?? null,
        reason,
        details: details.trim() || null,
        status: "pending",
      })

      if (error) throw error
      setSuccess(true)
    } catch (error: any) {
      console.error("Error al reportar:", error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-3 w-3" />
            Reportar
          </Button>
        ) : (
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
            <Flag className="h-3 w-3" />
            Reportar esta reseña
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <DialogHeader>
              <DialogTitle>Reporte enviado</DialogTitle>
              <DialogDescription>
                Gracias por ayudar a mantener la comunidad. Revisaremos tu reporte lo antes posible.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-2">
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-destructive" />
                Reportar reseña
              </DialogTitle>
              <DialogDescription>
                Tu reporte será revisado por el equipo de moderación de forma anónima.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Motivo del reporte</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Detalles adicionales{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Textarea
                  placeholder="Describe brevemente el problema..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar reporte
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}