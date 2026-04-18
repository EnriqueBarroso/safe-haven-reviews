"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Image as ImageIcon, Link as LinkIcon, Upload } from "lucide-react"

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

export default function QuestionFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)

  // Formulario
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [platformUrl, setPlatformUrl] = useState("")
  const [details, setDetails] = useState("")

  // Imagen
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState("")

  // Control
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const nameParam = searchParams.get("name")
    const cityParam = searchParams.get("city")
    if (nameParam) setName(nameParam)
    if (cityParam) setCity(cityParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("Debes iniciar sesión para publicar en el foro.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Procesar imagen PRIMERO (antes de crear perfil)
      let finalImageUrl: string | null = null

      if (imageTab === "url" && imageUrlInput.trim() !== "") {
        finalImageUrl = imageUrlInput.trim()
      } else if (imageTab === "upload" && imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `forum/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("review_images")
          .upload(fileName, imageFile)

        if (uploadError) throw new Error("Error al subir la imagen: " + uploadError.message)

        const { data: { publicUrl } } = supabase.storage
          .from("review_images")
          .getPublicUrl(fileName)

        finalImageUrl = publicUrl
      }

      // 2. Buscar o crear perfil
      const slug = generateSlug(name, city)

      const { data: existing } = await supabase
        .from("profiles")
        .select("id, image_url")
        .ilike("name", name.trim())
        .ilike("city", city.trim())
        .maybeSingle()

      let profileId: string

      if (existing) {
        profileId = existing.id
        // Si el perfil no tiene imagen y nosotros sí, se la ponemos
        if (finalImageUrl && !existing.image_url) {
          await supabase
            .from("profiles")
            .update({ image_url: finalImageUrl })
            .eq("id", profileId)
        }
      } else {
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            name: name.trim(),
            city: city.trim(),
            slug,
            platform_url: platformUrl.trim() || null,
            image_url: finalImageUrl,
            seller_id: "user_submission",
          })
          .select()
          .single()

        if (profileError) throw profileError
        profileId = newProfile.id
      }

      // 3. Insertar pregunta
      const alias = user.user_metadata?.alias || `Forero_${Math.floor(Math.random() * 9000 + 1000)}`
      const avatarUrl = user.user_metadata?.custom_avatar_url || null

      const { error: questionError } = await supabase
        .from("questions")
        .insert({
          profile_id: profileId,
          user_id: user.id,
          alias,
          avatar_url: avatarUrl,
          details,
          platform_url: platformUrl.trim() || null,
          image_url: finalImageUrl,
        })

      if (questionError) throw questionError

      // 4. Redirigir
      router.push(`/profiles/${slug}?tab=forum`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Ocurrió un error al procesar tu pregunta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/10">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
          <Link href="/submit-review"><ArrowLeft className="h-4 w-4" /> Volver</Link>
        </Button>

        <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-amber-600 mb-2">Abrir hilo en el foro</h1>
            <p className="text-muted-foreground">Pregunta a la comunidad por referencias, dudas o aporta información sobre un perfil.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos Básicos */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de la chica <span className="text-red-500">*</span></label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Luna" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ciudad <span className="text-red-500">*</span></label>
                <Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Barcelona" />
              </div>
            </div>

            {/* Enlace del anuncio */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-amber-600" /> Link del anuncio
              </label>
              <Input
                type="url"
                value={platformUrl}
                onChange={(e) => setPlatformUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">Opcional pero muy recomendado para que la comunidad sepa de quién hablas.</p>
            </div>

            {/* Texto de la Pregunta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">¿Qué quieres preguntar o comentar? <span className="text-red-500">*</span></label>
              <Textarea
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Escribe aquí tu duda, si alguien la ha visto últimamente, si las fotos son reales..."
                className="min-h-[120px]"
              />
            </div>

            {/* Sistema de Imagen */}
            <div className="space-y-3 pt-2 border-t">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-amber-600" /> Adjuntar una imagen (Opcional)
              </label>

              <Tabs value={imageTab} onValueChange={(val: any) => setImageTab(val)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="gap-2"><Upload className="h-4 w-4" /> Subir archivo</TabsTrigger>
                  <TabsTrigger value="url" className="gap-2"><LinkIcon className="h-4 w-4" /> Pegar enlace URL</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="pt-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-secondary/50 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {imageFile ? imageFile.name : "Haz clic para seleccionar una foto"}
                      </span>
                      <span className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max 5MB)</span>
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="pt-4 space-y-2">
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Pega el enlace directo a una imagen terminada en .jpg, .png, etc.</p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Botón Submit */}
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando hilo...</>
              ) : (
                "Publicar en el foro"
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}