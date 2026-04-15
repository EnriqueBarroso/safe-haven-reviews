"use client"

import { useState } from "react"
import { Star } from "lucide-react"

const LABELS: Record<number, string> = {
  1: "Muy malo",
  2: "Malo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
}

interface StarPickerProps {
  value: number
  onChange: (v: number) => void
  size?: "sm" | "md" | "lg"
  readonly?: boolean
}

const SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-7 w-7",
}

export function StarPicker({ value, onChange, size = "lg", readonly = false }: StarPickerProps) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform focus:outline-none ${
            !readonly ? "hover:scale-110" : "cursor-default"
          }`}
        >
          <Star
            className={`${SIZES[size]} transition-colors ${
              star <= active
                ? "fill-primary text-primary"
                : "fill-muted text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
      {!readonly && active > 0 && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {LABELS[active]}
        </span>
      )}
    </div>
  )
}