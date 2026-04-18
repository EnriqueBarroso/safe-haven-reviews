"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RatingsBlock, type Ratings } from "@/components/review/Ratingsblock"
import { ImageUploader, type ImagePreview } from "@/components/review/imageuploader"
import { FirmaUsuario } from "@/components/review/Firmausuario"
import { Loader2, Save, AlertCircle, ArrowLeft, Lock, ImageIcon } from "lucide-react"

const TRANS_TAGS = [
  "Activa", "Pasiva", "Versátil", "Grande", "Regular",
  "Pequeña", "CD", "Con pechos", "Operada",
]

const INITIAL_RATINGS: Ratings = {
  veracity: 0, punctuality: 0, communication: 0,
  hygiene: 0, overall: 0, value_price: 3,
}

function generateSlug(name: string, city: string): string {
  const str = `${name}-${city}`
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export default function SubmitReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState({ alias: "Usuario Anónimo", avatarUrl: "" })

  const [reviewImages, setReviewImages] = useState<ImagePreview[]>([])
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [ratings, setRatings] = useState<Ratings>(INITIAL_RATINGS)

  const [formData, setFormData] = useState({
    name: "", city: "", category: "", priceRange: "",
    serviceType: "", platformUrl: "", profileImageUrl: "",
    price: "", duration: "", details: "", tags: [] as string[],
  })

  useEffect(() => {
    async function init() {
      const { data: { session: s } } = await supabase.auth.getSession()
      setSession(s)
      if (s?.user) {
        setUserProfile({
          alias: s.user.user_metadata?.alias || "Forero_Anónimo",
          avatarUrl: s.user.user_metadata?.custom_avatar_url || "",
        })
      }
      const name = searchParams.get("name")
      const city = searchParams.get("city")
      if (name && city) setFormData((p) => ({ ...p, name, city }))
      setIsLoadingSession(false)
    }
    init()
  }, [searchParams])

  const toggleTag = (tag: string) => {
    setFormData((p) => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag],
    }))
  }

  const handleProfileImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      setProfileImagePreview(URL.createObjectURL(file))
      setFormData((p) => ({ ...p, profileImageUrl: "" }))
    }
  }

  const ratingsComplete =
    ratings.veracity > 0 && ratings.punctuality > 0 &&
    ratings.communication > 0 && ratings.hygiene > 0

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      if (!session) throw new Error("Debes iniciar sesión para publicar.")
      if (!ratingsComplete) {
        throw new Error("Por favor, completa todas las valoraciones.")
      }

      const slug = generateSlug(formData.name, formData.city)

      // Imagen del perfil
      let finalProfileImageUrl = formData.profileImageUrl.trim()
      if (profileImageFile) {
        const fileExt = profileImageFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const { error } = await supabase.storage
          .from("profile_images").upload(fileName, profileImageFile)
        if (error) throw new Error("Error al subir la foto: " + error.message)
        const { data: { publicUrl } } = supabase.storage
          .from("profile_images").getPublicUrl(fileName)
        finalProfileImageUrl = publicUrl
      }

      // Buscar o crear perfil
      const { data: existing } = await supabase
        .from("profiles").select("id, slug")
        .ilike("name", formData.name.trim())
        .ilike("city", formData.city.trim())
        .maybeSingle()

      let profileId: string

      if (existing) {
        profileId = existing.id
        if (finalProfileImageUrl) {
          await supabase.from("profiles")
            .update({ image_url: finalProfileImageUrl })
            .eq("id", profileId)
        }
      } else {
        if (!formData.category || !formData.priceRange || !formData.serviceType) {
          throw new Error("Completa la categoría, rango de precio y tipo de servicio.")
        }
        const { data: newProfile, error } = await supabase
          .from("profiles").insert({
            name: formData.name.trim(),
            city: formData.city.trim(),
            slug,
            category: formData.category || null,
            price_range: formData.priceRange || null,
            service_type: formData.serviceType || null,
            platform_url: formData.platformUrl.trim() || null,
            image_url: finalProfileImageUrl || null,
            tags: formData.tags,
            seller_id: "user_submission",
          }).select().single()
        if (error) throw error
        profileId = newProfile.id
      }

      // Insertar reseña
      const payload = {
        profile_id: profileId, user_id: session.user.id, type: "review",
        alias: userProfile.alias, avatar_url: userProfile.avatarUrl,
        ...ratings,
        price: Number(formData.price), duration: Number(formData.duration),
        details: formData.details,
      }

      const { data: newReview, error: reviewError } = await supabase
        .from("reviews").insert(payload).select().single()
      if (reviewError) throw reviewError

      // Imágenes de la reseña
      if (reviewImages.length > 0) {
        for (let i = 0; i < reviewImages.length; i++) {
          const { file } = reviewImages[i]
          const fileName = `${session.user.id}/${newReview.id}-${i}.${file.name.split(".").pop()}`
          const { error: imgErr } = await supabase.storage
            .from("review_images").upload(fileName, file)
          if (imgErr) { console.error(imgErr.message); continue }
          const { data: { publicUrl } } = supabase.storage
            .from("review_images").getPublicUrl(fileName)
          await supabase.from("review_images").insert({
            review_id: newReview.id, user_id: session.user.id,
            image_url: publicUrl, position: i,
          })
        }
      }

      router.push(`/profiles/${slug}?success=true`)

    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-md text-center">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Zona Restringida</h1>
        <p className="text-muted-foreground mb-8">Debes estar registrado para publicar reseñas.</p>
        <div className="flex flex-col gap-3">
          <Button size="lg" asChild><Link href="/auth/register">Crear cuenta anónima</Link></Button>
          <Button variant="outline" asChild><Link href="/auth/signin">Ya tengo cuenta</Link></Button>
          <Button variant="ghost" asChild className="mt-4"><Link href="/">Volver al inicio</Link></Button>
        </div>
      </div>
    )
  }

  const isReadOnly = !!searchParams.get("name")

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
        <Link href="/submit-review"><ArrowLeft className="h-4 w-4" /> Volver</Link>
      </Button>

      <Card className="border-primary/20 shadow-xl">
        <CardContent className="pt-8">
          <form onSubmit={handlePublish} className="space-y-8">

            {/* Info del perfil */}
            <div className="space-y-4 p-6 bg-secondary/20 rounded-2xl border border-border/50">
              <h3 className="font-semibold text-lg">Información del Perfil</h3>
              {!isReadOnly && (
                <p className="text-xs text-muted-foreground">
                  Si el perfil no existe, se creará automáticamente.
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre / Alias</Label>
                  <Input value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    readOnly={isReadOnly}
                    className={isReadOnly ? "bg-muted cursor-not-allowed" : ""}
                    required />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    readOnly={isReadOnly}
                    className={isReadOnly ? "bg-muted cursor-not-allowed" : ""}
                    required />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, category: v, tags: [] })} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chica">Chica</SelectItem>
                      <SelectItem value="trans">Trans</SelectItem>
                      <SelectItem value="asiatica">Asiática</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rango de Precio</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, priceRange: v })} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<150">Menos de 150€</SelectItem>
                      <SelectItem value=">150">Más de 150€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Servicio</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, serviceType: v })} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="independiente">Independiente</SelectItem>
                      <SelectItem value="piso_chicas">Piso de chicas / Agencia</SelectItem>
                      <SelectItem value="masajes">Masajista / Piso de Masajes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Enlace al anuncio</Label>
                  <Input type="url" value={formData.platformUrl}
                    onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
                    placeholder="https://..." />
                </div>
              </div>

              {/* Tags trans */}
              {formData.category === "trans" && (
                <div className="space-y-3 bg-background p-4 rounded-xl border">
                  <Label className="text-sm font-semibold text-primary">
                    Características{" "}
                    <span className="font-normal text-muted-foreground">(Opcional)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {TRANS_TAGS.map((tag) => (
                      <Badge key={tag}
                        variant={formData.tags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1.5 transition-all ${
                          formData.tags.includes(tag)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-secondary"
                        }`}
                        onClick={() => toggleTag(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Imagen del perfil */}
              <div className="p-4 bg-background border rounded-xl space-y-4">
                <Label className="font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Foto del perfil
                  <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
                </Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">URL de la imagen</Label>
                    <Input placeholder="https://ejemplo.com/foto.jpg"
                      value={formData.profileImageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, profileImageUrl: e.target.value })
                        setProfileImagePreview(e.target.value)
                      }}
                      disabled={!!profileImageFile}
                      className={profileImageFile ? "bg-muted cursor-not-allowed" : ""} />
                  </div>
                  <div className="flex items-center justify-center pt-6">
                    <span className="text-muted-foreground">O</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs text-muted-foreground">Subir archivo</Label>
                    <Input type="file" accept="image/*"
                      onChange={handleProfileImageFile}
                      className="cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:mr-4 file:px-4 file:py-1 file:rounded-full" />
                  </div>
                </div>
                {profileImagePreview && (
                  <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg border border-dashed">
                    <div className="h-20 w-20 rounded-md overflow-hidden border shadow-sm shrink-0">
                      <img src={profileImagePreview} alt="Preview"
                        className="h-full w-full object-cover"
                        onError={() => setProfileImagePreview(null)} />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Imagen del perfil</p>
                      <Button variant="link" size="sm" type="button"
                        className="h-auto p-0 text-destructive mt-1"
                        onClick={() => {
                          setProfileImageFile(null)
                          setProfileImagePreview(null)
                          setFormData({ ...formData, profileImageUrl: "" })
                        }}>
                        Quitar imagen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Valoraciones */}
            <div className="border-t pt-8">
              <RatingsBlock ratings={ratings} onChange={setRatings} />
            </div>

            {/* Detalles */}
            <div className="space-y-4 border-t pt-8">
              <h3 className="font-semibold text-lg">Detalles de la Experiencia</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio pagado (€)</Label>
                  <Input type="number" min="0" value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required />
                </div>
                <div className="space-y-2">
                  <Label>Duración (minutos)</Label>
                  <Input type="number" min="0" value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Narra tu experiencia</Label>
                <Textarea placeholder="Cuéntanos cómo fue todo..."
                  className="min-h-[180px]" value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  required />
              </div>
              <ImageUploader images={reviewImages} onChange={setReviewImages} />
            </div>

            <FirmaUsuario alias={userProfile.alias} avatarUrl={userProfile.avatarUrl} />

            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-14 text-lg"
              disabled={isSubmitting || !ratingsComplete}>
              {isSubmitting
                ? <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                : <Save className="mr-2 h-5 w-5" />}
              Publicar Reseña
            </Button>
            {!ratingsComplete && (
              <p className="text-center text-xs text-muted-foreground -mt-4">
                Completa todas las valoraciones para poder publicar.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}