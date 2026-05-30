"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUploader, type ImagePreview } from "@/components/review/imageuploader"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, PenLine, X } from "lucide-react"
import { MiniStars } from "@/components/profile/MiniStars"

const MAX_IMAGES = 10

interface RatingFields {
  veracity:    number
  punctuality: number
  hygiene:     number
  value:       number
  discretion:  number
  kindness:    number
}

interface EditReviewModalProps {
  review:  any | null
  userId:  string
  onClose: () => void
  onSave:  (id: string, changes: { comment: string; price: number; duration: number; phone: string | null } & RatingFields) => Promise<void>
}

export function EditReviewModal({ review, userId, onClose, onSave }: EditReviewModalProps) {
  const [comment,        setComment]        = useState("")
  const [price,          setPrice]          = useState("")
  const [duration,       setDuration]       = useState("")
  const [phone,          setPhone]          = useState("")
  const [ratings,        setRatings]        = useState<RatingFields>({
    veracity: 0, punctuality: 0, hygiene: 0, value: 0, discretion: 0, kindness: 0,
  })
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [newImages,      setNewImages]      = useState<ImagePreview[]>([])
  const [isSaving,       setIsSaving]       = useState(false)

  const setRating = (key: keyof RatingFields) => (v: number) =>
    setRatings((prev) => ({ ...prev, [key]: v }))

  // Sync state when a different review is selected
  useEffect(() => {
    if (!review) return
    setComment(review.details || "")
    setPrice(String(review.price || ""))
    setDuration(String(review.duration || ""))
    setPhone(review.phone || "")
    setRatings({
      veracity:    review.veracity    || 0,
      punctuality: review.punctuality || 0,
      hygiene:     review.hygiene     || 0,
      value:       review.value_price || 0,
      discretion:  review.discretion  || 0,
      kindness:    review.kindness    || 0,
    })
    setExistingImages(
      [...(review.review_images || [])].sort((a: any, b: any) => a.position - b.position)
    )
    setNewImages([])
  }, [review?.id])

  const handleRemoveExisting = async (imgId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imgId))
    await supabase.from("review_images").delete().eq("id", imgId)
  }

  const handleSave = async () => {
    if (!review) return
    setIsSaving(true)
    try {
      // Upload new images to Storage + insert DB rows
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i]
        if (!img.file) continue
        const ext      = img.file.name.split(".").pop()
        const fileName = `${userId}/${review.id}-edit-${Date.now()}-${i}.${ext}`
        const { error: upErr } = await supabase.storage
          .from("review_images").upload(fileName, img.file)
        if (upErr) continue
        const { data: { publicUrl } } = supabase.storage
          .from("review_images").getPublicUrl(fileName)
        await supabase.from("review_images").insert({
          review_id: review.id,
          user_id:   userId,
          image_url: publicUrl,
          position:  existingImages.length + i,
        })
      }
      // Server Action: update text fields + phone + ratings
      await onSave(review.id, {
        comment,
        price:    Number(price),
        duration: Number(duration),
        phone:    phone.trim() || null,
        ...ratings,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const remainingSlots = MAX_IMAGES - existingImages.length
  const isValid        = comment.trim().length >= 10 && Number(price) > 0 && Number(duration) > 0

  return (
    <Dialog open={!!review} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-4 w-4" /> Editar reseña
          </DialogTitle>
          <DialogDescription>Modifica los detalles de tu experiencia.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Precio y duración */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio pagado (€)</Label>
              <Input id="edit-price" type="number" min="0" value={price}
                onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duración (minutos)</Label>
              <Input id="edit-duration" type="number" min="0" value={duration}
                onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone">
              Teléfono{" "}
              <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              id="edit-phone"
              type="tel"
              placeholder="+34 600 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9 +]/g, ""))}
            />
          </div>

          {/* Valoraciones */}
          <div className="space-y-2">
            <Label>Valoraciones</Label>
            <div className="rounded-lg border bg-secondary/20 p-3 space-y-2">
              <MiniStars label="Veracidad de fotos"   value={ratings.veracity}    onChange={setRating("veracity")} />
              <MiniStars label="Puntualidad"          value={ratings.punctuality} onChange={setRating("punctuality")} />
              <MiniStars label="Higiene y limpieza"   value={ratings.hygiene}     onChange={setRating("hygiene")} />
              <MiniStars label="Calidad-precio"       value={ratings.value}       onChange={setRating("value")} />
              <MiniStars label="Discreción"           value={ratings.discretion}  onChange={setRating("discretion")} />
              <MiniStars label="Trato / Amabilidad"   value={ratings.kindness}    onChange={setRating("kindness")} />
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <Label htmlFor="edit-comment">Texto de la reseña</Label>
            <Textarea
              id="edit-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-35 resize-none"
              placeholder="Describe tu experiencia..."
            />
            <p className="text-xs text-muted-foreground">{comment.length} caracteres</p>
          </div>

          {/* Imágenes existentes */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Fotos actuales</Label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="h-20 w-20 rounded-lg overflow-hidden border shadow-sm">
                      <img src={img.image_url} alt="Foto" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(img.id)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subir nuevas fotos */}
          {remainingSlots > 0 && (
            <ImageUploader
              images={newImages}
              onChange={setNewImages}
              maxImages={remainingSlots}
              label="Añadir fotos"
              hint={`Puedes añadir hasta ${remainingSlots} foto${remainingSlots !== 1 ? "s" : ""} más`}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || !isValid}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
