"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Save,
  AlertCircle,
  MessageSquare,
  Star,
  ArrowLeft,
  Lock,
  User,
  ImageIcon,
  X,
  Plus,
  Camera,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react"

const TRANS_TAGS = [
  "Activa", "Pasiva", "Versátil", "Grande", "Regular",
  "Pequeña", "CD", "Con pechos", "Operada",
]

const RATING_CATEGORIES = [
  {
    key: "veracity" as const,
    label: "Veracidad de fotos",
    description: "¿Las fotos coinciden con la realidad?",
    icon: Camera,
  },
  {
    key: "punctuality" as const,
    label: "Puntualidad",
    description: "¿Fue puntual y respetó el horario?",
    icon: Clock,
  },
  {
    key: "communication" as const,
    label: "Comunicación",
    description: "¿Fue fácil contactar y comunicarse?",
    icon: MessageSquare,
  },
  {
    key: "hygiene" as const,
    label: "Higiene y limpieza",
    description: "¿El entorno y la persona estaban limpios?",
    icon: Sparkles,
  },
]

type PostType = "review" | "question"

interface ImagePreview {
  file: File
  previewUrl: string
}

interface Ratings {
  veracity: number
  punctuality: number
  communication: number
  hygiene: number
  overall: number
  value_price: number
}

// ─── Star picker interactivo ──────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  const labels: Record<number, string> = {
    1: "Muy malo",
    2: "Malo",
    3: "Regular",
    4: "Bueno",
    5: "Excelente",
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                filled
                  ? "fill-primary text-primary"
                  : "fill-muted text-muted-foreground/30"
              }`}
            />
          </button>
        )
      })}
      {(hovered || value) > 0 && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────
export default function SubmitReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [postType, setPostType] = useState<PostType>("review")

  const [userProfile, setUserProfile] = useState({ alias: "Usuario Anónimo", avatarUrl: "" })
  const [reviewImages, setReviewImages] = useState<ImagePreview[]>([])
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)

  const [ratings, setRatings] = useState<Ratings>({
    veracity: 0,
    punctuality: 0,
    communication: 0,
    hygiene: 0,
    overall: 0,
    value_price: 3,
  })

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    category: "",
    priceRange: "",
    serviceType: "",
    platformUrl: "",
    profileImageUrl: "",
    price: "",
    duration: "",
    details: "",
    tags: [] as string[],
  })

  // ─── Calcular overall automáticamente ────────────────
  useEffect(() => {
    const { veracity, punctuality, communication, hygiene } = ratings
    if (veracity && punctuality && communication && hygiene) {
      const avg = Math.round((veracity + punctuality + communication + hygiene) / 4)
      setRatings((prev) => ({ ...prev, overall: avg }))
    }
  }, [ratings.veracity, ratings.punctuality, ratings.communication, ratings.hygiene])

  const setRating = (key: keyof Ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }))
  }

  const valueLabel = (v: number) => {
    const labels: Record<number, string> = {
      1: "Muy caro para lo que es",
      2: "Algo caro",
      3: "Precio justo",
      4: "Buena relación calidad/precio",
      5: "Excelente valor",
    }
    return labels[v] || ""
  }

  // ─── Sesión ───────────────────────────────────────────
  useEffect(() => {
    async function getInitialSession() {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)

      if (currentSession?.user) {
        setUserProfile({
          alias: currentSession.user.user_metadata?.alias || "Forero_Anónimo",
          avatarUrl: currentSession.user.user_metadata?.custom_avatar_url || "",
        })
      }

      const pName = searchParams.get("name")
      const pCity = searchParams.get("city")
      if (pName && pCity) {
        setFormData((prev) => ({ ...prev, name: pName, city: pCity }))
      }
      setIsLoadingSession(false)
    }
    getInitialSession()
  }, [searchParams])

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  // ─── Imágenes de reseña ───────────────────────────────
  const handleReviewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const remaining = 5 - reviewImages.length
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setReviewImages((prev) => [...prev, ...toAdd])
    e.target.value = ""
  }

  const handleRemoveReviewImage = (index: number) => {
    setReviewImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleProfileImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      setProfileImagePreview(URL.createObjectURL(file))
      setFormData((prev) => ({ ...prev, profileImageUrl: "" }))
    }
  }

  // ─── Validación de ratings ────────────────────────────
  const ratingsComplete =
    ratings.veracity > 0 &&
    ratings.punctuality > 0 &&
    ratings.communication > 0 &&
    ratings.hygiene > 0

  // ─── Submit ───────────────────────────────────────────
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      if (!session) throw new Error("Debes iniciar sesión para publicar.")

      if (postType === "review" && !ratingsComplete) {
        throw new Error("Por favor, completa todas las valoraciones.")
      }

      // 1. Imagen del perfil
      let finalProfileImageUrl = formData.profileImageUrl.trim()
      if (postType === "review" && profileImageFile) {
        const fileExt = profileImageFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("profile_images")
          .upload(fileName, profileImageFile)
        if (uploadError) throw new Error("Error al subir la foto del perfil: " + uploadError.message)
        const { data: { publicUrl } } = supabase.storage.from("profile_images").getPublicUrl(fileName)
        finalProfileImageUrl = publicUrl
      }

      // 2. Buscar o crear perfil
      let profileId: string | null = null
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("name", formData.name.trim())
        .ilike("city", formData.city.trim())
        .maybeSingle()

      if (existingProfile) {
        profileId = existingProfile.id
        if (finalProfileImageUrl) {
          await supabase
            .from("profiles")
            .update({ image_url: finalProfileImageUrl })
            .eq("id", profileId)
        }
      } else {
        if (postType === "review" && (!formData.category || !formData.priceRange || !formData.serviceType)) {
          throw new Error("Por favor, completa la categoría, rango de precio y tipo de servicio.")
        }
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            name: formData.name.trim(),
            city: formData.city.trim(),
            category: formData.category || null,
            price_range: formData.priceRange || null,
            service_type: formData.serviceType || null,
            platform_url: formData.platformUrl.trim() || null,
            image_url: finalProfileImageUrl || null,
            tags: formData.tags,
            seller_id: "user_submission",
          })
          .select()
          .single()
        if (profileError) throw profileError
        profileId = newProfile.id
      }

      // 3. Insertar reseña
      const reviewPayload =
        postType === "review"
          ? {
              profile_id: profileId,
              user_id: session.user.id,
              type: "review",
              alias: userProfile.alias,
              avatar_url: userProfile.avatarUrl,
              veracity: ratings.veracity,
              punctuality: ratings.punctuality,
              communication: ratings.communication,
              hygiene: ratings.hygiene,
              overall: ratings.overall,
              value_price: ratings.value_price,
              price: Number(formData.price),
              duration: Number(formData.duration),
              details: formData.details,
            }
          : {
              profile_id: profileId,
              user_id: session.user.id,
              type: "question",
              alias: userProfile.alias,
              avatar_url: userProfile.avatarUrl,
              details: formData.details,
            }

      const { data: newReview, error: reviewError } = await supabase
        .from("reviews")
        .insert(reviewPayload)
        .select()
        .single()

      if (reviewError) throw reviewError

      // 4. Subir imágenes de la reseña
      if (postType === "review" && reviewImages.length > 0) {
        for (let i = 0; i < reviewImages.length; i++) {
          const { file } = reviewImages[i]
          const fileExt = file.name.split(".").pop()
          const fileName = `${session.user.id}/${newReview.id}-${i}.${fileExt}`
          const { error: imgUploadError } = await supabase.storage
            .from("review_images")
            .upload(fileName, file)
          if (imgUploadError) {
            console.error("Error subiendo imagen:", imgUploadError.message)
            continue
          }
          const { data: { publicUrl } } = supabase.storage
            .from("review_images")
            .getPublicUrl(fileName)
          await supabase.from("review_images").insert({
            review_id: newReview.id,
            user_id: session.user.id,
            image_url: publicUrl,
            position: i,
          })
        }
      }

      router.push(`/profiles/${profileId}?success=true`)
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Loading / No sesión ──────────────────────────────
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

  const backPath = searchParams.get("profileId")
    ? `/profiles/${searchParams.get("profileId")}`
    : "/"
  const isReadOnly = !!searchParams.get("name")

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
        <Link href={backPath}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      {/* Selector de tipo */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setPostType("review")}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            postType === "review"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/40"
          }`}
        >
          <Star className={`h-6 w-6 ${postType === "review" ? "fill-primary" : ""}`} />
          <span className="font-semibold text-sm">Publicar Reseña</span>
          <span className="text-xs text-center leading-relaxed opacity-70">
            Comparte tu experiencia con la comunidad
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPostType("question")}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            postType === "question"
              ? "border-amber-500 bg-amber-500/10 text-amber-600"
              : "border-border bg-card text-muted-foreground hover:border-amber-400/40"
          }`}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="font-semibold text-sm">Preguntar al Foro</span>
          <span className="text-xs text-center leading-relaxed opacity-70">
            Consulta algo a la comunidad sobre este perfil
          </span>
        </button>
      </div>

      {/* ── FORMULARIO RESEÑA ── */}
      {postType === "review" && (
        <Card className="border-primary/20 shadow-xl">
          <CardContent className="pt-8">
            <form onSubmit={handlePublish} className="space-y-8">

              {/* Bloque 1: Info del perfil */}
              <div className="space-y-4 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                <h3 className="font-semibold text-lg">Información del Perfil</h3>
                {!isReadOnly && (
                  <p className="text-xs text-muted-foreground">
                    Si el perfil no existe, se creará automáticamente.
                  </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre / Alias</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      readOnly={isReadOnly}
                      className={isReadOnly ? "bg-muted cursor-not-allowed" : ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      readOnly={isReadOnly}
                      className={isReadOnly ? "bg-muted cursor-not-allowed" : ""}
                      required
                    />
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
                    <Label htmlFor="platformUrl">Enlace al anuncio</Label>
                    <Input
                      id="platformUrl"
                      type="url"
                      value={formData.platformUrl}
                      onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Tags trans */}
                {formData.category === "trans" && (
                  <div className="mt-2 space-y-3 bg-background p-4 rounded-xl border">
                    <Label className="text-sm font-semibold text-primary">
                      Características Específicas{" "}
                      <span className="text-xs font-normal text-muted-foreground">(Opcional)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {TRANS_TAGS.map((tag) => {
                        const isSelected = formData.tags.includes(tag)
                        return (
                          <Badge
                            key={tag}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer px-3 py-1.5 transition-all ${
                              isSelected ? "bg-primary hover:bg-primary/90" : "hover:bg-secondary"
                            }`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Imagen del perfil */}
                <div className="mt-2 p-4 bg-background border rounded-xl space-y-4">
                  <Label className="font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Foto del perfil
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opcional — aparecerá en la tarjeta del directorio)
                    </span>
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs text-muted-foreground">URL de la imagen</Label>
                      <Input
                        placeholder="https://ejemplo.com/foto.jpg"
                        value={formData.profileImageUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, profileImageUrl: e.target.value })
                          setProfileImagePreview(e.target.value)
                        }}
                        disabled={!!profileImageFile}
                        className={profileImageFile ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </div>
                    <div className="flex items-center justify-center pt-6">
                      <span className="text-muted-foreground font-medium">O</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs text-muted-foreground">Subir archivo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageFileChange}
                        className="cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:mr-4 file:px-4 file:py-1 file:rounded-full hover:file:bg-primary/20"
                      />
                    </div>
                  </div>
                  {profileImagePreview && (
                    <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg border border-dashed">
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-background shrink-0 border shadow-sm">
                        <img
                          src={profileImagePreview}
                          alt="Vista previa"
                          className="h-full w-full object-cover"
                          onError={() => setProfileImagePreview(null)}
                        />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Imagen del perfil</p>
                        <p className="text-muted-foreground text-xs">Se mostrará en la tarjeta del directorio.</p>
                        <Button
                          variant="link" size="sm" type="button"
                          className="h-auto p-0 text-destructive mt-1"
                          onClick={() => {
                            setProfileImageFile(null)
                            setProfileImagePreview(null)
                            setFormData({ ...formData, profileImageUrl: "" })
                          }}
                        >
                          Quitar imagen
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque 2: Valoraciones */}
              <div className="space-y-6 border-t pt-8">
                <div>
                  <h3 className="font-semibold text-lg">Valoraciones</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    La puntuación global se calcula automáticamente.
                  </p>
                </div>

                <div className="space-y-5">
                  {RATING_CATEGORIES.map(({ key, label, description, icon: Icon }) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50"
                    >
                      <div className="flex items-start gap-3 sm:w-56 shrink-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </div>
                      <div className="sm:flex-1">
                        <StarPicker
                          value={ratings[key]}
                          onChange={(v) => setRating(key, v)}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Valor precio — slider */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Relación calidad/precio</p>
                        <p className="text-xs text-muted-foreground">
                          ¿El precio fue justo para lo que ofrecía?
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 px-1">
                      <Slider
                        value={[ratings.value_price]}
                        onValueChange={(v) => setRating("value_price", v[0])}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Muy caro</span>
                        <span className="font-medium text-primary">
                          {valueLabel(ratings.value_price)}
                        </span>
                        <span>Excelente valor</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen overall */}
                  {ratingsComplete && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <span className="font-medium text-sm">Puntuación global calculada</span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-5 w-5 ${
                              s <= ratings.overall
                                ? "fill-primary text-primary"
                                : "fill-muted text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="font-bold text-primary ml-1">{ratings.overall}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque 3: Detalles */}
              <div className="space-y-6 border-t pt-8">
                <h3 className="font-semibold text-lg">Detalles de la Experiencia</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio pagado (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Narra tu experiencia con detalle</Label>
                  <Textarea
                    id="details"
                    placeholder="Cuéntanos cómo fue todo..."
                    className="min-h-[180px]"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    required
                  />
                </div>

                {/* Imágenes de la reseña */}
                <div className="space-y-3 p-4 bg-background border rounded-xl">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Fotos de tu visita
                      <span className="text-xs font-normal text-muted-foreground">
                        (Hasta 5 — solo visibles en tu reseña)
                      </span>
                    </Label>
                    {reviewImages.length < 5 && (
                      <Button
                        type="button" variant="outline" size="sm" className="gap-1.5"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Plus className="h-3.5 w-3.5" /> Añadir foto
                      </Button>
                    )}
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleReviewImagesChange}
                  />

                  {reviewImages.length > 0 ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {reviewImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="h-24 w-24 rounded-lg overflow-hidden border shadow-sm bg-background">
                            <img src={img.previewUrl} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {reviewImages.length < 5 && (
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-sm">Añadir fotos de tu visita</span>
                    </button>
                  )}
                </div>
              </div>

              <FirmaUsuario userProfile={userProfile} />
              {errorMsg && <ErrorMsg msg={errorMsg} />}

              <Button
                type="submit"
                className="w-full h-14 text-lg"
                disabled={isSubmitting || !ratingsComplete}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
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
      )}

      {/* ── FORMULARIO PREGUNTA ── */}
      {postType === "question" && (
        <Card className="border-amber-500/30 shadow-xl bg-amber-50/5">
          <CardContent className="pt-8">
            <form onSubmit={handlePublish} className="space-y-8">
              <div className="space-y-4 p-6 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                <h3 className="font-semibold text-lg text-amber-700 dark:text-amber-400">
                  ¿Sobre quién es tu pregunta?
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="q-name">Nombre / Alias del perfil</Label>
                    <Input
                      id="q-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      readOnly={isReadOnly}
                      className={isReadOnly ? "bg-muted cursor-not-allowed" : ""}
                      placeholder="Ej: Luna"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q-city">Ciudad</Label>
                    <Input
                      id="q-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      readOnly={isReadOnly}
                      className={isReadOnly ? "bg-muted cursor-not-allowed" : ""}
                      placeholder="Ej: Barcelona"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-platformUrl">
                    Enlace al anuncio{" "}
                    <span className="text-xs font-normal text-muted-foreground">(muy recomendado)</span>
                  </Label>
                  <Input
                    id="q-platformUrl"
                    type="url"
                    value={formData.platformUrl}
                    onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Ayuda a la comunidad a identificar el perfil correctamente.
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t pt-8">
                <h3 className="font-semibold text-lg">Tu pregunta</h3>
                <div className="space-y-2">
                  <Label htmlFor="q-details">¿Qué quieres saber sobre este perfil?</Label>
                  <Textarea
                    id="q-details"
                    placeholder="Ej: ¿Las fotos son reales? ¿Alguien ha estado recientemente? ¿Cobra lo que dice en el anuncio?"
                    className="min-h-[160px] border-amber-200/50 focus-visible:ring-amber-400"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    required
                  />
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-200/50 text-xs text-amber-700 dark:text-amber-400">
                  💬 Tu pregunta será visible para toda la comunidad. Otros usuarios podrán responder en los comentarios del perfil.
                </div>
              </div>

              <FirmaUsuario userProfile={userProfile} variant="question" />
              {errorMsg && <ErrorMsg msg={errorMsg} />}

              <Button
                type="submit"
                className="w-full h-14 text-lg bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-5 w-5" />
                )}
                Lanzar Pregunta al Foro
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────

function FirmaUsuario({
  userProfile,
  variant = "review",
}: {
  userProfile: { alias: string; avatarUrl: string }
  variant?: "review" | "question"
}) {
  return (
    <div className={`p-4 rounded-xl border flex items-center gap-4 ${
      variant === "question"
        ? "bg-amber-500/5 border-amber-200/50"
        : "bg-secondary/40 border-border"
    }`}>
      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-background bg-secondary shadow-sm shrink-0">
        {userProfile.avatarUrl ? (
          <img src={userProfile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Firmando como:</p>
        <p className="text-lg font-bold text-foreground">{userProfile.alias}</p>
      </div>
      <Button variant="outline" size="sm" asChild className="shrink-0 text-xs">
        <Link href="/dashboard">Cambiar firma</Link>
      </Button>
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">{msg}</p>
    </div>
  )
}