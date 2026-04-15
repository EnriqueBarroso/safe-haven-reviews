"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageIcon, Plus, X } from "lucide-react"

export interface ImagePreview {
  file: File
  previewUrl: string
}

interface ImageUploaderProps {
  images: ImagePreview[]
  onChange: (images: ImagePreview[]) => void
  maxImages?: number
  label?: string
  hint?: string
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  label = "Fotos de tu visita",
  hint = `Hasta ${maxImages} imágenes — solo visibles en tu reseña`,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = maxImages - images.length
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    onChange([...images, ...toAdd])
    e.target.value = ""
  }

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => {
      if (i === index) URL.revokeObjectURL(images[i].previewUrl)
      return i !== index
    })
    onChange(updated)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-3 p-4 bg-background border rounded-xl">
      <div className="flex items-center justify-between">
        <Label className="font-semibold flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          {label}
          <span className="text-xs font-normal text-muted-foreground">({hint})</span>
        </Label>
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => inputRef.current?.click()}
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir foto
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {images.length > 0 ? (
        <div className="flex flex-wrap gap-3 pt-1">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div className="h-24 w-24 rounded-lg overflow-hidden border shadow-sm bg-background">
                <img
                  src={img.previewUrl}
                  alt={`Imagen ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ImageIcon className="h-6 w-6" />
          <span className="text-sm">Añadir fotos de tu visita</span>
        </button>
      )}
    </div>
  )
}