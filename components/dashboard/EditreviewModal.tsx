"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, PenLine } from "lucide-react"

interface EditReviewModalProps {
  review: any | null
  onClose: () => void
  onSave: (id: string, changes: { comment: string; price: number; duration: number }) => Promise<void>
}

export function EditReviewModal({ review, onClose, onSave }: EditReviewModalProps) {
  const [comment, setComment] = useState(review?.details || "")
  const [price, setPrice] = useState(String(review?.price || ""))
  const [duration, setDuration] = useState(String(review?.duration || ""))
  const [isSaving, setIsSaving] = useState(false)

  // Sincronizamos el estado cuando cambia la reseña seleccionada
  // (necesario porque el modal se monta una vez y reutiliza el estado)
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const handleSave = async () => {
    if (!review) return
    setIsSaving(true)
    await onSave(review.id, {
      comment,
      price: Number(price),
      duration: Number(duration),
    })
    setIsSaving(false)
  }

  const isValid = comment.trim().length >= 10 && Number(price) > 0 && Number(duration) > 0

  return (
    <Dialog open={!!review} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            Editar reseña
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu experiencia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Precio y duración */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio pagado (€)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duración (minutos)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <Label htmlFor="edit-comment">Texto de la reseña</Label>
            <Textarea
              id="edit-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[150px] resize-none"
              placeholder="Describe tu experiencia..."
            />
            <p className="text-xs text-muted-foreground">{comment.length} caracteres</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !isValid}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}