"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea"
import { Flag, Loader2 } from "lucide-react"

export function ReportDialog({ reviewId }: { reviewId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")

  const handleReport = async () => {
    setIsSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert("Debes estar logueado para reportar.")
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from('reports').insert({
      review_id: reviewId,
      reporter_id: session.user.id,
      reason,
      details
    })

    if (!error) {
      alert("Reporte enviado. Gracias por ayudar a la comunidad.")
      setIsOpen(false)
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-2 text-muted-foreground hover:text-destructive">
          <Flag className="h-3 w-3" /> Reportar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar Reseña</DialogTitle>
          <DialogDescription>
            ¿Por qué quieres reportar esta opinión? Tu reporte será revisado por moderadores de forma anónima.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Select onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un motivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spam">Es Spam o publicidad</SelectItem>
              <SelectItem value="ofensivo">Lenguaje ofensivo o acoso</SelectItem>
              <SelectItem value="falso">Información falsa o engañosa</SelectItem>
              <SelectItem value="datos_privados">Publica datos privados</SelectItem>
            </SelectContent>
          </Select>
          <Textarea 
            placeholder="Danos más detalles (opcional)..." 
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <Button 
            className="w-full" 
            variant="destructive" 
            onClick={handleReport}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Enviar Reporte"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}