"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Shield,
  Loader2,
  Save,
  ArrowLeft,
  Upload,
  MessageSquare,
  Trash2,
  Calendar,
  Star,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  FileEdit,
  PenLine,
  AlertTriangle,
  ImageIcon,
  X,
  Plus, // <-- Añadido
  Link as LinkIcon // <-- Añadido
} from "lucide-react"
import imageCompression from 'browser-image-compression'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"profile" | "reviews">("profile")
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  const [alias, setAlias] = useState("")
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── ESTADOS PARA EDITAR RESEÑA ──
  const [editingReview, setEditingReview] = useState<any | null>(null)
  const [editComment, setEditComment] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [reviewImages, setReviewImages] = useState<any[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // ── NUEVOS ESTADOS PARA AÑADIR IMAGEN POR URL ──
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isAddingUrl, setIsAddingUrl] = useState(false)

  // Estado para confirmar borrado
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        const savedAlias = user.user_metadata?.alias
        setAlias(savedAlias || `Forero_${Math.floor(Math.random() * 9000 + 1000)}`)
        const savedCustomAvatar = user.user_metadata?.custom_avatar_url || ""
        setCustomAvatarUrl(savedCustomAvatar)
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

    if (!error && data) {
      setMyReviews(data)
    } else if (error) {
      console.error("Error fetching reviews:", error.message)
    }
    setLoadingReviews(false)
  }

  // ── 1. SUBIDA DE AVATAR (COMPRIMIDO) ──
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setSaveMsg(null)
      const file = event.target.files?.[0]
      if (!file) return

      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, compressedFile, { upsert: true })

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setSaveMsg(null)

    const { error } = await supabase.auth.updateUser({
      data: {
        alias: alias,
        custom_avatar_url: customAvatarUrl,
      },
    })

    if (!error) {
      setSaveMsg({ type: "success", text: "¡Identidad de foro actualizada correctamente!" })
    } else {
      setSaveMsg({ type: "error", text: "Error al guardar: " + error.message })
    }

    setUpdating(false)
  }

  // ── ABRIR MODAL Y CARGAR DATOS COMPLETOS ──
  const handleOpenEdit = async (review: any) => {
    setEditingReview(review)
    setEditComment(review.comment || review.details || "")
    setEditPrice(review.price?.toString() || "")
    setEditDuration(review.duration?.toString() || "")
    setNewImageUrl("") // Limpiamos el input de la URL al abrir
    
    const { data: imgs } = await supabase
      .from('review_images')
      .select('*')
      .eq('review_id', review.id)
      .order('created_at', { ascending: true })
      
    setReviewImages(imgs || [])
  }

  // ── GESTIÓN DE IMÁGENES DE RESEÑA DENTRO DEL MODAL ──
  const handleDeleteReviewImage = async (imgId: string) => {
    const { error } = await supabase.from('review_images').delete().eq('id', imgId)
    if (!error) {
      setReviewImages(reviewImages.filter(i => i.id !== imgId))
    }
  }

  // ── NUEVA FUNCIÓN: AÑADIR IMAGEN POR URL ──
  const handleAddImageUrl = async () => {
    if (!newImageUrl.trim()) return
    if (reviewImages.length >= 5) {
      alert("Máximo 5 fotos por reseña.")
      return
    }

    setIsAddingUrl(true)
    
    // Insertamos directamente en la tabla con la URL externa
    const { data: newImg, error } = await supabase.from('review_images').insert({
      review_id: editingReview.id,
      user_id: user.id,
      image_url: newImageUrl.trim(),
      position: reviewImages.length // Mantenemos el orden
    }).select().single()

    if (!error && newImg) {
      setReviewImages([...reviewImages, newImg])
      setNewImageUrl("") // Limpiamos el input tras añadir
    } else if (error) {
      alert("Error al añadir URL: " + error.message)
    }
    
    setIsAddingUrl(false)
  }

  // ── 2. SUBIDA DE FOTOS DE LA VISITA (COMPRIMIDAS POR ARCHIVO) ──
  const handleAddReviewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (reviewImages.length >= 5) {
      alert("Máximo 5 fotos por reseña.")
      return
    }
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      const fileExt = file.name.split('.').pop()
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`
      const fileName = `${user.id}/${safeFileName}`
      
      const { error: upErr } = await supabase.storage
        .from('review_images')
        .upload(fileName, compressedFile, { upsert: true })

      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('review_images').getPublicUrl(fileName)
        const { data: newImg } = await supabase.from('review_images').insert({
          review_id: editingReview.id,
          user_id: user.id,
          image_url: publicUrl,
          position: reviewImages.length
        }).select().single()
        
        if (newImg) {
          setReviewImages([...reviewImages, newImg])
        }
      } else {
        alert("Error de Supabase: " + upErr.message)
      }
    } catch (error: any) {
      alert("Error al comprimir la imagen: " + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  // ── GUARDAR TODOS LOS DATOS EDITADOS ──
  const handleSaveEdit = async () => {
    if (!editingReview) return
    setIsSavingEdit(true)

    const payload = {
      details: editComment,
      price: editPrice ? Number(editPrice) : null,
      duration: editDuration ? Number(editDuration) : null
    }

    const { error } = await supabase
      .from("reviews")
      .update(payload)
      .eq("id", editingReview.id)
      .eq("user_id", user.id)

    if (!error) {
      setMyReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id ? { ...r, ...payload } : r
        )
      )
      setEditingReview(null)
    } else {
      console.error("Error updating review:", error.message)
    }

    setIsSavingEdit(false)
  }

  // ── BORRAR RESEÑA ──
  const handleConfirmDelete = async () => {
    if (!deletingReviewId) return
    setIsDeleting(true)

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", deletingReviewId)
      .eq("user_id", user.id)

    if (!error) {
      setMyReviews((prev) => prev.filter((r) => r.id !== deletingReviewId))
      setDeletingReviewId(null)
    } else {
      console.error("Error deleting review:", error.message)
    }

    setIsDeleting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="gap-1 bg-primary/20 text-primary hover:bg-primary/30">
            <CheckCircle2 className="h-3 w-3" /> Publicada
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Pendiente
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <FileEdit className="h-3 w-3" /> Borrador
          </Badge>
        )
    }
  }

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
        <Button asChild>
          <Link href="/auth/signin">Iniciar Sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
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

          <div className="space-y-6">
            {/* ── PESTAÑA PERFIL (IGUAL) ── */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Tu Identidad en la Comunidad</CardTitle>
                  <CardDescription>Esta es la imagen y el nombre que otros verán en tus reseñas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col items-start gap-4">
                    <Label>Foto de Perfil</Label>
                    <div className="relative h-32 w-32">
                      <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-background bg-secondary shadow-xl">
                        {customAvatarUrl ? (
                          <img src={customAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-10 w-10 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 rounded-full shadow-md"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        type="button"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="alias">Pseudónimo Público</Label>
                      <Input
                        id="alias"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        className="h-12 text-base"
                        placeholder="Ej: Lince Nocturno"
                        required
                      />
                    </div>

                    {saveMsg && (
                      <div className={`text-sm p-3 rounded-md ${saveMsg.type === "error" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                        {saveMsg.text}
                      </div>
                    )}

                    <Button type="submit" disabled={updating || uploading} className="w-full h-12">
                      {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Guardar Identidad Pública
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ── PESTAÑA RESEÑAS ── */}
            {activeTab === "reviews" && (
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Mis Reseñas</CardTitle>
                    <CardDescription className="mt-1">Puedes editar los detalles o gestionar las fotos de tus reseñas.</CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/submit-review">Nueva Reseña</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingReviews ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary h-6 w-6" /></div>
                  ) : myReviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Todavía no has publicado ninguna reseña.</p>
                      <Button size="sm" className="mt-4" asChild><Link href="/submit-review">Escribir primera reseña</Link></Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myReviews.map((review) => (
                        <div key={review.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <span className="text-lg font-semibold text-muted-foreground">
                                  {review.profiles?.name?.charAt(0).toUpperCase() ?? "?"}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{review.profiles?.name ?? "Perfil eliminado"}</h3>
                                  {getStatusBadge(review.status ?? "published")}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  {review.profiles?.city && (
                                    <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /><span>{review.profiles.city}</span></div>
                                  )}
                                  {review.price && (
                                    <div className="flex items-center gap-1"><span>{review.price}€</span></div>
                                  )}
                                  {review.duration && (
                                    <div className="flex items-center gap-1"><span>{review.duration} min</span></div>
                                  )}
                                  <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>{formatDate(review.created_at)}</span></div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleOpenEdit(review)}>
                                <PenLine className="h-3.5 w-3.5" /> Editar
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeletingReviewId(review.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {(review.comment || review.details) && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2 border-t border-border pt-3">
                              {review.comment || review.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL EDITAR COMPLETO ── */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-4 w-4" /> Editar reseña
            </DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu experiencia, el precio, la duración, o gestiona las fotos subidas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio Pagado (€)</Label>
                <Input id="edit-price" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duración (minutos)</Label>
                <Input id="edit-duration" type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="Opcional" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-comment">Texto de la reseña</Label>
              <Textarea
                id="edit-comment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="min-h-[120px] resize-none"
                placeholder="Describe tu experiencia..."
              />
              <p className="text-xs text-muted-foreground text-right">{editComment.length} caracteres</p>
            </div>

            {/* ── GESTIÓN DE FOTOS DE LA RESEÑA ── */}
            <div className="space-y-4 border-t pt-4">
              <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Fotos de la visita ({reviewImages.length}/5)</Label>
              
              {/* NUEVO: Campo para añadir por URL */}
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Pegar URL de la imagen (Ej: https://...)" 
                    className="pl-9 text-xs" 
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    disabled={reviewImages.length >= 5 || isAddingUrl}
                  />
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  type="button" 
                  onClick={handleAddImageUrl} 
                  disabled={!newImageUrl.trim() || isAddingUrl || reviewImages.length >= 5}
                >
                  {isAddingUrl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />} 
                  Añadir URL
                </Button>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {reviewImages.map(img => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border group bg-secondary/50">
                    <img src={img.image_url} alt="Review" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeleteReviewImage(img.id)} 
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Eliminar foto"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {reviewImages.length < 5 && (
                  <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    {uploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                    <span className="text-[10px] mt-1 font-medium">Subir foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAddReviewImage} disabled={uploadingImage} />
                  </label>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Las fotos son anónimas y no contienen metadatos de ubicación. Solo tú puedes gestionarlas.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setEditingReview(null)} disabled={isSavingEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit || editComment.trim().length < 10}>
              {isSavingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL CONFIRMAR BORRADO ── */}
      <Dialog open={!!deletingReviewId} onOpenChange={() => setDeletingReviewId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Borrar reseña
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La reseña será eliminada permanentemente y dejará de aparecer en el perfil público.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingReviewId(null)} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sí, borrar reseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}