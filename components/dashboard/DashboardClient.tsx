"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { editReview, editQuestion, deleteItem, updateProfile } from "@/app/dashboard/actions"
import { ProfileTab }          from "@/components/dashboard/ProfileTab"
import { ReviewsTab }          from "@/components/dashboard/ReviewsTab"
import { EditReviewModal }     from "@/components/dashboard/EditreviewModal"
import { EditQuestionModal }   from "@/components/dashboard/EditQuestionModal"
import { DeleteReviewModal }   from "@/components/dashboard/DeleteReviewModal"
import { Button } from "@/components/ui/button"
import { Shield, MessageSquare, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Props {
  user:              { id: string; email: string }
  initialAlias:      string
  initialAvatarUrl:  string
  initialReviews:    any[]
  initialQuestions:  any[]
}

export function DashboardClient({
  user,
  initialAlias,
  initialAvatarUrl,
  initialReviews,
  initialQuestions,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ── Perfil ────────────────────────────────────────────────────
  const [alias,           setAlias]           = useState(initialAlias)
  const [customAvatarUrl, setCustomAvatarUrl] = useState(initialAvatarUrl)
  const [uploading,       setUploading]       = useState(false)
  const [updating,        setUpdating]        = useState(false)
  const [saveMsg,         setSaveMsg]         = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Datos de actividad ───────────────────────────────────────
  const [reviews,   setReviews]   = useState(initialReviews)
  const [questions, setQuestions] = useState(initialQuestions)

  // ── Modales ───────────────────────────────────────────────────
  const [editingReview,   setEditingReview]   = useState<any | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null)
  const [deletingItem,    setDeletingItem]    = useState<{ id: string; table: "reviews" | "questions" } | null>(null)
  const [isDeleting,      setIsDeleting]      = useState(false)

  // ── Avatar upload ─────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setSaveMsg({ type: "error", text: "La imagen no puede superar 5MB." })
      return
    }
    setUploading(true)
    setSaveMsg(null)
    try {
      const ext      = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName)
      setCustomAvatarUrl(publicUrl)
      setSaveMsg({ type: "success", text: "Imagen cargada. Pulsa 'Guardar' para confirmar." })
    } catch (err: any) {
      setSaveMsg({ type: "error", text: "Error al subir imagen: " + err.message })
    } finally {
      setUploading(false)
    }
  }

  // ── Guardar perfil ────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setSaveMsg(null)
    const { error } = await updateProfile(alias, customAvatarUrl)
    setSaveMsg(
      error
        ? { type: "error",   text: "Error al guardar: " + error }
        : { type: "success", text: "¡Identidad actualizada correctamente!" }
    )
    setUpdating(false)
  }

  // ── Editar reseña ─────────────────────────────────────────────
  const handleSaveReviewEdit = async (
    id:      string,
    changes: { comment: string; price: number; duration: number; phone: string | null }
  ) => {
    const { error } = await editReview(id, changes)
    if (!error) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, details: changes.comment, price: changes.price, duration: changes.duration, phone: changes.phone }
            : r
        )
      )
      setEditingReview(null)
      router.refresh()
    } else {
      console.error("Error al editar reseña:", error)
    }
  }

  // ── Editar pregunta ───────────────────────────────────────────
  const handleSaveQuestionEdit = async (
    id:      string,
    changes: { details: string; phone: string | null }
  ) => {
    const { error } = await editQuestion(id, changes)
    if (!error) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, details: changes.details, phone: changes.phone } : q
        )
      )
      setEditingQuestion(null)
      router.refresh()
    } else {
      console.error("Error al editar pregunta:", error)
    }
  }

  // ── Borrar ────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (!deletingItem) return
    const { id, table } = deletingItem

    setIsDeleting(true)
    setDeletingItem(null)

    if (table === "reviews") {
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } else {
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    }

    startTransition(async () => {
      const { error } = await deleteItem(id, table)
      if (error) {
        router.refresh()
        alert("Error al borrar: " + error)
      }
      setIsDeleting(false)
    })
  }

  return (
    <>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Volver</Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Gestiona tu identidad y tus aportaciones</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="profile" className="gap-2">
              <Shield className="h-4 w-4" /> Tu Identidad
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Mi Actividad
            </TabsTrigger>
          </TabsList>

          {/* ── Identidad ─────────────────────────────────── */}
          <TabsContent value="profile">
            <ProfileTab
              user={user}
              alias={alias}
              customAvatarUrl={customAvatarUrl}
              uploading={uploading}
              updating={updating}
              saveMsg={saveMsg}
              onAliasChange={setAlias}
              onFileUpload={handleFileUpload}
              onSubmit={handleUpdateProfile}
            />
          </TabsContent>

          {/* ── Actividad ─────────────────────────────────── */}
          <TabsContent value="activity">
            <div className="space-y-8">
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2 max-w-100">
                  <TabsTrigger value="reviews">
                    Reseñas ({reviews.length})
                  </TabsTrigger>
                  <TabsTrigger value="questions">
                    Foro ({questions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="reviews">
                  <ReviewsTab
                    reviews={reviews}
                    loading={isPending}
                    onEdit={setEditingReview}
                    onDelete={(id) => setDeletingItem({ id, table: "reviews" })}
                  />
                </TabsContent>

                <TabsContent value="questions">
                  <ReviewsTab
                    reviews={questions}
                    loading={isPending}
                    onEdit={setEditingQuestion}
                    onDelete={(id) => setDeletingItem({ id, table: "questions" })}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modales ─────────────────────────────────────────────── */}
      <EditReviewModal
        review={editingReview}
        userId={user.id}
        onClose={() => setEditingReview(null)}
        onSave={handleSaveReviewEdit}
      />

      <EditQuestionModal
        question={editingQuestion}
        userId={user.id}
        onClose={() => setEditingQuestion(null)}
        onSave={handleSaveQuestionEdit}
      />

      <DeleteReviewModal
        reviewId={deletingItem?.id ?? null}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
