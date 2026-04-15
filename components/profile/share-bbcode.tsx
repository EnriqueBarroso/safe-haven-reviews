"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Share2 } from "lucide-react"

interface ShareBBCodeProps {
  name: string
  city: string
  category: string
  tags: string[]
  rating: number
  profileUrl: string
}

export function ShareBBCode({ name, city, category, tags, rating, profileUrl }: ShareBBCodeProps) {
  const [copied, setCopied] = useState(false)

  const generateBBCode = () => {
    const tagsText = tags && tags.length > 0 ? ` (${tags.join(", ")})` : ""
    const stars = "⭐".repeat(Math.round(rating))
    
    return [
      `[b]Reseñas de ${name} (${city})[/b]`,
      `[i]Categoría: ${category}${tagsText}[/i]`,
      `Puntuación: ${rating.toFixed(1)}/5 ${stars}`,
      `[url=${profileUrl}]Leer experiencias detalladas y opiniones aquí[/url]`
    ].join("\n")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateBBCode())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar: ", err)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleCopy}
      className={`gap-2 transition-all ${copied ? 'border-green-500 text-green-500' : 'hover:border-primary hover:text-primary'}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>¡Código Copiado!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Compartir en Foro (BBCode)</span>
        </>
      )}
    </Button>
  )
}