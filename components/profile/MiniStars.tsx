"use client"

import { StarIcon } from "lucide-react"

interface MiniStarsProps {
  label: string
  value: number
  onChange: (v: number) => void
}

export function MiniStars({ label, value, onChange }: MiniStarsProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(value === star ? 0 : star)}
            className="p-0.5"
          >
            <StarIcon
              className={`h-3.5 w-3.5 transition-colors ${
                star <= value
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30 hover:text-muted-foreground/60"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}