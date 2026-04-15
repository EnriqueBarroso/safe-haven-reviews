"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteReviewModalProps {
  reviewId: string | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
  isDeleting: boolean
}

export function DeleteReviewModal({
  reviewId,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteReviewModalProps) {
  return (
    <Dialog open={!!reviewId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Borrar reseña
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. La reseña será eliminada permanentemente
            y dejará de aparecer en el perfil público.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => reviewId && onConfirm(reviewId)}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sí, borrar reseña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}