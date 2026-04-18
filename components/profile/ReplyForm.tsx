"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, ChevronDown } from "lucide-react"
import { MiniStars } from "./MiniStars"
import type { TableType } from "@/lib/build-tree"

interface ReplyFormProps {
  parentId: string
  table: TableType
  profileId: string
  session: any
  onSuccess: () => void
  onCancel: () => void
}

const EMPTY_RATINGS = {
  veracity: 0, punctuality: 0, communication: 0, hygiene: 0, overall: 0,
}

export function ReplyForm({
  parentId, table, profileId, session, onSuccess, onCancel,
}: ReplyFormProps) {
  const [text, setText] = useState("")
  const [showRatings, setShowRatings] = useState(false)
  const [ratings, setRatings] = useState(EMPTY_RATINGS)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setIsSubmitting(true)

    try {
      const alias = session.user.user_metadata?.alias || "Forero_Anónimo"
      const avatar_url = session.user.user_metadata?.custom_avatar_url || null
      const hasRatings = Object.values(ratings).some((v) => v > 0)

      const payload: any = {
        profile_id: profileId,
        user_id: session.user.id,
        parent_id: parentId,
        alias,
        avatar_url,
        details: text.trim(),
        ...(hasRatings ? ratings : {}),
      }

      if (table === "reviews") payload.type = "review"

      const { error } = await supabase.from(table).insert(payload)
      if (error) throw error

      onSuccess()
    } catch (err: any) {
      console.error("Error al responder:", err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-3 p-4 rounded-xl border border-primary/20 bg-secondary/10 space-y-3">
      <Textarea
        placeholder="Escribe tu respuesta..."
        className="min-h-[80px] text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />

      <button
        type="button"
        onClick={() => setShowRatings(!showRatings)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${showRatings ? "rotate-180" : ""}`} />
        Añadir valoración (opcional)
      </button>

      {showRatings && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 bg-background rounded-lg border">
          <MiniStars label="Veracidad" value={ratings.veracity}
            onChange={(v) => setRatings((p) => ({ ...p, veracity: v }))} />
          <MiniStars label="Puntualidad" value={ratings.punctuality}
            onChange={(v) => setRatings((p) => ({ ...p, punctuality: v }))} />
          <MiniStars label="Comunicación" value={ratings.communication}
            onChange={(v) => setRatings((p) => ({ ...p, communication: v }))} />
          <MiniStars label="Higiene" value={ratings.hygiene}
            onChange={(v) => setRatings((p) => ({ ...p, hygiene: v }))} />
          <MiniStars label="Valoración global" value={ratings.overall}
            onChange={(v) => setRatings((p) => ({ ...p, overall: v }))} />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !text.trim()} className="gap-1">
          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          Responder
        </Button>
      </div>
    </div>
  )
}