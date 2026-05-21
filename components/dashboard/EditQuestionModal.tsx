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

const MAX_IMAGES = 10

interface EditQuestionModalProps {
  question: any | null
  userId:   string
  onClose:  () => void
  onSave:   (id: string, changes: { details: string; phone: string | null }) => Promise<void>
}

export function EditQuestionModal({ question, userId, onClose, onSave }: EditQuestionModalProps) {
  const [details,         setDetails]         = useState("")
  const [phone,           setPhone]           = useState("")
  const [existingImages,  setExistingImages]  = useState<any[]>([])
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [newImages,       setNewImages]       = useState<ImagePreview[]>([])
  const [isSaving,        setIsSaving]        = useState(false)

  useEffect(() => {
    if (!question) return
    setDetails(question.details || "")
    setPhone(question.phone || "")
    setCurrentImageUrl(question.image_url || null)
    setNewImages([])

    // Imágenes en review_images con question_id (requiere migración DB)
    supabase
      .from("review_images")
      .select("id, image_url, position")
      .eq("question_id", question.id)
      .order("position")
      .then(({ data }) => setExistingImages(data ?? []))
  }, [question?.id])

  const handleRemoveExisting = async (imgId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imgId))
    await supabase.from("review_images").delete().eq("id", imgId)
  }

  const handleClearLegacyImage = async () => {
    setCurrentImageUrl(null)
    await supabase
      .from("questions")
      .update({ image_url: null })
      .eq("id", question.id)
      .eq("user_id", userId)
  }

  const handleSave = async () => {
    if (!question) return
    setIsSaving(true)
    try {
      // Subir nuevas imágenes → review_images.question_id
      for (let i = 0; i < newImages.length; i++) {
        const { file } = newImages[i]
        const ext      = file.name.split(".").pop()
        const fileName = `forum/${userId}/${question.id}-${Date.now()}-${i}.${ext}`
        const { error: upErr } = await supabase.storage
          .from("review_images").upload(fileName, file)
        if (upErr) continue
        const { data: { publicUrl } } = supabase.storage
          .from("review_images").getPublicUrl(fileName)
        await supabase.from("review_images").insert({
          question_id: question.id,
          user_id:     userId,
          image_url:   publicUrl,
          position:    allExisting.length + i,
        })
        // Rellenar image_url si estaba vacío (compatibilidad con la columna legacy)
        if (i === 0 && !currentImageUrl) {
          await supabase
            .from("questions")
            .update({ image_url: publicUrl })
            .eq("id", question.id)
            .eq("user_id", userId)
        }
      }

      await onSave(question.id, {
        details,
        phone: phone.trim() || null,
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Mostrar image_url legacy si no está ya en review_images
  const legacyAsList =
    currentImageUrl && existingImages.every((img) => img.image_url !== currentImageUrl)
      ? [{ id: "legacy", image_url: currentImageUrl }]
      : []

  const allExisting    = [...legacyAsList, ...existingImages]
  const remainingSlots = MAX_IMAGES - allExisting.length
  const isValid        = details.trim().length >= 5

  return (
    <Dialog open={!!question} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-4 w-4" /> Editar hilo del foro
          </DialogTitle>
          <DialogDescription>Modifica tu pregunta o comentario.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="edit-q-phone">
              Teléfono{" "}
              <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              id="edit-q-phone"
              type="tel"
              placeholder="+34 600 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9 +]/g, ""))}
            />
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <Label htmlFor="edit-q-details">Tu pregunta o comentario</Label>
            <Textarea
              id="edit-q-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-35 resize-none"
              placeholder="Escribe aquí..."
            />
            <p className="text-xs text-muted-foreground">{details.length} caracteres</p>
          </div>

          {/* Imágenes existentes */}
          {allExisting.length > 0 && (
            <div className="space-y-2">
              <Label>Imágenes actuales</Label>
              <div className="flex flex-wrap gap-2">
                {allExisting.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="h-20 w-20 rounded-lg overflow-hidden border shadow-sm">
                      <img src={img.image_url} alt="Imagen" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        img.id === "legacy"
                          ? handleClearLegacyImage()
                          : handleRemoveExisting(img.id)
                      }
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subir nuevas imágenes */}
          {remainingSlots > 0 && (
            <ImageUploader
              images={newImages}
              onChange={setNewImages}
              maxImages={remainingSlots}
              label="Añadir imágenes"
              hint={`Puedes añadir hasta ${remainingSlots} imagen${remainingSlots !== 1 ? "es" : ""} más`}
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
