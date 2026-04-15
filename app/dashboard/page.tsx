"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ProfileTab } from "@/components/dashboard/ProfileTab"
import { ReviewsTab } from "@/components/dashboard/ReviewsTab"
import { EditReviewModal } from "@/components/dashboard/EditreviewModal"
import { DeleteReviewModal } from "@/components/dashboard/DeleteReviewModal"
import { Shield, MessageSquare, ArrowLeft, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"profile" | "reviews">("profile")

  // Perfil
  const [alias, setAlias] = useState("")
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Reseñas
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Modales
  const [editingReview, setEditingReview] = useState<any | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Carga inicial ──────────────────────────────────────
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setAlias(user.user_metadata?.alias || `Forero_${Math.floor(Math.random() * 9000 + 1000)}`)
        setCustomAvatarUrl(user.user_metadata?.custom_avatar_url || "")
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  useEffect(() => {
    if (activeTab === "reviews" && user) fetchMyReviews()
  }, [activeTab, user])

  const fetchMyReviews = async () => {
    setLoadingReviews(true)
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(name, city)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (!error && data) setMyReviews(data)
    else if (error) console.error("Error fetching reviews:", error.message)
    setLoadingReviews(false)
  }

  // ── Avatar upload ──────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setSaveMsg(null)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName)
      setCustomAvatarUrl(publicUrl)
      setSaveMsg({ type: "success", text: "Imagen cargada. Pulsa 'Guardar' para confirmar." })
    } catch (error: any) {
      setSaveMsg({ type: "error", text: "Error al subir imagen: " + error.message })
    } finally {
      setUploading(false)
    }
  }

  // ── Guardar perfil ─────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setSaveMsg(null)
    const { error } = await supabase.auth.updateUser({
      data: { alias, custom_avatar_url: customAvatarUrl },
    })
    setSaveMsg(
      error
        ? { type: "error", text: "Error al guardar: " + error.message }
        : { type: "success", text: "¡Identidad de foro actualizada correctamente!" }
    )
    setUpdating(false)
  }

  // ── Editar reseña ──────────────────────────────────────
  const handleSaveEdit = async (
    id: string,
    changes: { comment: string; price: number; duration: number }
  ) => {
    const { error } = await supabase
      .from("reviews")
      .update({ details: changes.comment, price: changes.price, duration: changes.duration })
      .eq("id", id)
      .eq("user_id", user.id)

    if (!error) {
      setMyReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, details: changes.comment, price: changes.price, duration: changes.duration }
            : r
        )
      )
      setEditingReview(null)
    } else {
      console.error("Error updating review:", error.message)
    }
  }

  // ── Borrar reseña ──────────────────────────────────────
  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true)
    const { error } = await supabase
      .from("reviews").delete()
      .eq("id", id).eq("user_id", user.id)

    if (!error) {
      setMyReviews((prev) => prev.filter((r) => r.id !== id))
      setDeletingReviewId(null)
    } else {
      console.error("Error deleting review:", error.message)
    }
    setIsDeleting(false)
  }

  // ── Guards ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Debes iniciar sesión para ver esta página.</p>
        <Button asChild><Link href="/auth/signin">Iniciar Sesión</Link></Button>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
          <Link href="/"><ArrowLeft className="h-4 w-4" /> Volver</Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Gestiona tu identidad y tus reseñas</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <nav className="flex flex-col gap-2">
            <Button
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className="justify-start gap-3"
              onClick={() => setActiveTab("profile")}
            >
              <Shield className="h-4 w-4" /> Tu Identidad
            </Button>
            <Button
              variant={activeTab === "reviews" ? "secondary" : "ghost"}
              className="justify-start gap-3"
              onClick={() => setActiveTab("reviews")}
            >
              <MessageSquare className="h-4 w-4" /> Mis Reseñas
            </Button>
          </nav>

          {/* Contenido */}
          <div>
            {activeTab === "profile" && (
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
            )}
            {activeTab === "reviews" && (
              <ReviewsTab
                reviews={myReviews}
                loading={loadingReviews}
                onEdit={setEditingReview}
                onDelete={setDeletingReviewId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <EditReviewModal
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onSave={handleSaveEdit}
      />
      <DeleteReviewModal
        reviewId={deletingReviewId}
        onClose={() => setDeletingReviewId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}