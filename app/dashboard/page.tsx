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
import { useRouter } from "next/navigation"
// Añadimos los imports de Tabs para organizar la vista de actividad
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // Cambiamos "reviews" a "activity" para que englobe todo
  const [activeTab, setActiveTab] = useState<"profile" | "activity">("profile")

  // Perfil
  const [alias, setAlias] = useState("")
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Datos de Actividad
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [myQuestions, setMyQuestions] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)

  // Modales (Ahora deletingItem guarda el ID y la tabla)
  const [editingReview, setEditingReview] = useState<any | null>(null)
  const [deletingItem, setDeletingItem] = useState<{id: string, table: 'reviews' | 'questions'} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Carga inicial de Perfil ────────────────────────────
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

  // ── Carga de Datos (Reseñas y Foro unificados) ─────────
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return
      setLoadingActivity(true)

      const { data: revs } = await supabase
        .from("reviews")
        .select("*, profiles(name, city)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      const { data: ques } = await supabase
        .from("questions")
        .select("*, profiles(name, city)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (revs) setMyReviews(revs)
      if (ques) setMyQuestions(ques)
      setLoadingActivity(false)
    }

    if (activeTab === "activity" && user) {
      fetchUserData()
    }
  }, [activeTab, user])

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

  // ── Borrar reseña o pregunta ───────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    const { id, table } = deletingItem;

    // 1. Obtenemos el profile_id antes de borrar
    const { data: itemData } = await supabase
      .from(table)
      .select("profile_id")
      .eq("id", id)
      .single();

    // 2. Borramos el contenido (reseña o pregunta)
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // <-- Añadido por seguridad

    if (!deleteError) {
      if (itemData?.profile_id) {
        // 3. COMPROBACIÓN DOBLE: ¿Queda algo en este perfil?
        const [revCount, quesCount] = await Promise.all([
          supabase.from("reviews").select("id", { count: 'exact', head: true }).eq("profile_id", itemData.profile_id),
          supabase.from("questions").select("id", { count: 'exact', head: true }).eq("profile_id", itemData.profile_id)
        ]);

        const totalActivity = (revCount.count || 0) + (quesCount.count || 0);
        
        if (totalActivity === 0) {
          await supabase.from("profiles").delete().eq("id", itemData.profile_id);
        }
      }

      // 4. Actualizamos UI
      if (table === 'reviews') {
        setMyReviews(prev => prev.filter(r => r.id !== id));
      } else {
        setMyQuestions(prev => prev.filter(q => q.id !== id));
      }
      
      setDeletingItem(null);
      router.refresh();
    } else {
      console.error("Error al borrar:", deleteError.message);
    }
    
    setIsDeleting(false);
  };

  // ── Guards ─────────────────────────────────────────────
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
  if (!user) return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p className="text-muted-foreground">Debes iniciar sesión para ver esta página.</p>
      <Button asChild><Link href="/auth/signin">Iniciar Sesión</Link></Button>
    </div>
  )

  // ── Render ─────────────────────────────────────────────
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
              variant={activeTab === "activity" ? "secondary" : "ghost"}
              className="justify-start gap-3"
              onClick={() => setActiveTab("activity")}
            >
              <MessageSquare className="h-4 w-4" /> Mi Actividad
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
            
            {activeTab === "activity" && (
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2 max-w-[400px]">
                  <TabsTrigger value="reviews">Reseñas ({myReviews.length})</TabsTrigger>
                  <TabsTrigger value="questions">Foro ({myQuestions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="reviews">
                  <ReviewsTab
                    reviews={myReviews}
                    loading={loadingActivity}
                    onEdit={setEditingReview}
                    onDelete={(id) => setDeletingItem({ id, table: 'reviews' })} // <-- PASAMOS LA TABLA AQUÍ
                  />
                </TabsContent>

                <TabsContent value="questions">
                  {/* Si no tienes QuestionsTab, reutilizamos ReviewsTab si la estructura es compatible */}
                  <ReviewsTab
                    reviews={myQuestions}
                    loading={loadingActivity}
                    onEdit={setEditingReview} // Asumiendo que pueden editar igual
                    onDelete={(id) => setDeletingItem({ id, table: 'questions' })} // <-- PASAMOS LA TABLA AQUÍ
                  />
                </TabsContent>
              </Tabs>
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
      
      {/* Asegúrate de que DeleteReviewModal llama a onConfirm() SIN ARGUMENTOS 
        ya que el estado deletingItem ya tiene toda la info necesaria 
      */}
      <DeleteReviewModal
        reviewId={deletingItem?.id || null}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => handleConfirmDelete()}
        isDeleting={isDeleting}
      />
    </>
  )
}