"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Plus, X, Upload, Link as LinkIcon } from "lucide-react"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export interface ImagePreview {
  file?: File
  previewUrl: string   // blob URL para archivos, URL directa para links
  sourceUrl?: string   // solo para imágenes por URL
}

interface ImageUploaderProps {
  images: ImagePreview[]
  onChange: (images: ImagePreview[]) => void
  maxImages?: number
  label?: string
  hint?: string
}

type InputMode = "file" | "url"

export function ImageUploader({
  images,
  onChange,
  maxImages = 10,
  label = "Fotos de tu visita",
  hint = `Hasta ${maxImages} imágenes — solo visibles en tu reseña`,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<InputMode>("file")
  const [urlInput, setUrlInput] = useState("")
  const [urlError, setUrlError] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)

  const canAddMore = images.length < maxImages

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      setSizeError(`${oversized.length > 1 ? "Algunas imágenes superan" : "La imagen supera"} el límite de 5MB y no se han añadido.`)
    } else {
      setSizeError(null)
    }

    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE)
    const remaining = maxImages - images.length
    const toAdd = valid.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    if (toAdd.length > 0) onChange([...images, ...toAdd])
    e.target.value = ""
  }

  const handleAddUrl = () => {
    const url = urlInput.trim()
    if (!url) return

    try {
      new URL(url)
    } catch {
      setUrlError("Introduce una URL válida (ej: https://ejemplo.com/foto.jpg)")
      return
    }

    if (images.length >= maxImages) {
      setUrlError(`Ya has añadido el máximo de ${maxImages} imágenes.`)
      return
    }

    setUrlError(null)
    onChange([...images, { previewUrl: url, sourceUrl: url }])
    setUrlInput("")
  }

  const handleRemove = (index: number) => {
    const updated = images.filter((img, i) => {
      if (i === index && img.file) URL.revokeObjectURL(img.previewUrl)
      return i !== index
    })
    onChange(updated)
  }

  return (
    <div className="space-y-3 p-4 bg-background border rounded-xl">
      <div className="flex items-center justify-between">
        <Label className="font-semibold flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          {label}
          <span className="text-xs font-normal text-muted-foreground">({hint})</span>
        </Label>
        <span className="text-xs text-muted-foreground">{images.length}/{maxImages}</span>
      </div>

      {/* Toggle modo */}
      {canAddMore && (
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => { setMode("file"); setSizeError(null) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "file"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3 w-3" /> Dispositivo
          </button>
          <button
            type="button"
            onClick={() => { setMode("url"); setSizeError(null) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "url"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="h-3 w-3" /> Desde URL
          </button>
        </div>
      )}

      {/* Input según modo */}
      {canAddMore && mode === "file" && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Selecciona fotos de tu dispositivo</span>
            </button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => inputRef.current?.click()}
            >
              <Plus className="h-3.5 w-3.5" /> Añadir desde dispositivo
            </Button>
          )}
        </>
      )}

      {canAddMore && mode === "url" && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setUrlError(null) }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddUrl() } }}
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="shrink-0 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir
          </Button>
        </div>
      )}

      {/* Grid de previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div className="h-24 w-24 rounded-lg overflow-hidden border shadow-sm bg-background">
                <img
                  src={img.previewUrl}
                  alt={`Imagen ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ""
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
              {img.sourceUrl && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 rounded-b-lg">
                  URL
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {canAddMore && mode === "file" && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {sizeError && <p className="text-sm text-destructive">{sizeError}</p>}
      {urlError  && <p className="text-sm text-destructive">{urlError}</p>}
    </div>
  )
}
