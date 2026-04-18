"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  StarIcon, MapPin, ArrowLeft, X, Loader2,
  ShieldCheck, Download, Link as LinkIcon,
  CheckCircle2, MessageSquare,
} from "lucide-react"
import { ShareBBCode } from "@/components/profile/share-bbcode"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buildTree } from "@/lib/build-tree"
import { ThreadNode } from "@/components/profile/Threadnode"

export default function ProfileDetailPage() {
  const params = useParams()
  const profileSlug = params.slug as string

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const [stats, setStats] = useState({
    totalReviews: 0,
    overallAverage: 0,
    veracityAvg: 0,
    punctualityAvg: 0,
    communicationAvg: 0,
    hygieneAvg: 0,
  })

  const profileUrl = typeof window !== "undefined" ? window.location.href : ""

  // ── Data fetching ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession()
    setSession(s)

    const { data: profileData, error: profileError } = await supabase
      .from("profiles").select("*").eq("slug", profileSlug).single()

    if (profileError || !profileData) {
      setIsLoading(false)
      return
    }
    setProfile(profileData)

    // Reviews
    const { data: reviewsData } = await supabase
      .from("reviews").select("*, review_images(*)")
      .eq("profile_id", profileData.id)
      .order("created_at", { ascending: false })

    if (reviewsData) {
      setReviews(reviewsData)

      const rootReviews = reviewsData.filter(
        (r) => !r.parent_id && (r.type === "review" || !r.type)
      )
      if (rootReviews.length > 0) {
        const t = rootReviews.length
        const avg = (field: string) =>
          Number((rootReviews.reduce((a, c) => a + (c[field] || 0), 0) / t).toFixed(1))

        setStats({
          totalReviews: t,
          overallAverage: avg("overall"),
          veracityAvg: avg("veracity"),
          punctualityAvg: avg("punctuality"),
          communicationAvg: avg("communication"),
          hygieneAvg: avg("hygiene"),
        })
      }
    }

    // Questions
    const { data: questionsData } = await supabase
      .from("questions").select("*")
      .eq("profile_id", profileData.id)
      .order("created_at", { ascending: false })

    if (questionsData) setQuestions(questionsData)
    setIsLoading(false)
  }, [profileSlug])

  useEffect(() => {
    if (profileSlug) fetchData()
  }, [profileSlug, fetchData])

  // ── Cover image ───────────────────────────────────────────
  const coverImage = (() => {
    if (profile?.image_url) return profile.image_url
    for (const review of reviews) {
      if (review.review_images?.length > 0) return review.review_images[0].image_url
    }
    return null
  })()

  const handleCopyImageUrl = () => {
    if (!coverImage) return
    navigator.clipboard.writeText(coverImage)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownloadImage = async () => {
    if (!coverImage) return
    setIsDownloading(true)
    try {
      const response = await fetch(coverImage)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${profile?.name.replace(/\s+/g, "-").toLowerCase()}-foro.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(coverImage, "_blank")
    }
    setIsDownloading(false)
  }

  // ── Stars ─────────────────────────────────────────────────
  const renderStars = (rating: number) =>
    Array(5).fill(0).map((_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
      />
    ))

  // ── Árboles ───────────────────────────────────────────────
  const reviewTree = buildTree(reviews.filter((r) => r.type === "review" || !r.type))
  const questionTree = buildTree(questions)

  // ── Guards ────────────────────────────────────────────────
  if (isLoading)
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>

  if (!profile)
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Perfil no encontrado</h1>
        <Button asChild><Link href="/profiles">Volver a Explorar</Link></Button>
      </div>
    )

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
        <Link href="/profiles"><ArrowLeft className="h-4 w-4" /> Volver a Explorar</Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        {/* COLUMNA PRINCIPAL */}
        <div className="space-y-8">

          {/* CABECERA */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {coverImage && (
                <div className="shrink-0 flex flex-col gap-3">
                  <div
                    className="relative w-full md:w-56 h-64 md:h-72 rounded-2xl overflow-hidden border-4 border-secondary shadow-lg cursor-zoom-in"
                    onClick={() => setSelectedImage(coverImage)}
                  >
                    <img src={coverImage} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1 text-xs gap-1.5" onClick={handleDownloadImage} disabled={isDownloading}>
                      {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Guardar
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 text-xs gap-1.5" onClick={handleCopyImageUrl}>
                      {isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <LinkIcon className="h-3.5 w-3.5" />}
                      {isCopied ? "Copiada" : "Enlace"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.category && <Badge variant="outline" className="capitalize">{profile.category}</Badge>}
                  {profile.price_range && <Badge className="bg-primary text-primary-foreground">{profile.price_range}</Badge>}
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                  {profile.name}
                  {stats.totalReviews > 2 && (
                    <span title="Perfil Verificado por la comunidad"><ShieldCheck className="h-6 w-6 text-green-500" /></span>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.city}</span>
                  {profile.service_type && <span className="capitalize">• {profile.service_type.replace("_", " ")}</span>}
                </div>
                <ShareBBCode
                  name={profile.name} city={profile.city}
                  category={profile.category || ""} tags={profile.tags || []}
                  rating={stats.overallAverage} profileUrl={profileUrl}
                />
              </div>
            </div>
          </div>

          {/* PESTAÑAS */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-semibold">Actividad de la comunidad</h2>
              <span className="text-muted-foreground">{reviewTree.length + questionTree.length} aportaciones</span>
            </div>

            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mb-8 bg-secondary/50">
                <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <StarIcon className="h-4 w-4" />
                  Reseñas ({reviewTree.length})
                </TabsTrigger>
                <TabsTrigger value="forum" className="flex items-center gap-2 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
                  <MessageSquare className="h-4 w-4" />
                  Foro ({questionTree.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                {reviewTree.length === 0 ? (
                  <p className="text-muted-foreground py-10 text-center bg-secondary/20 rounded-xl border border-dashed">
                    Aún no hay reseñas para este perfil.
                  </p>
                ) : (
                  reviewTree.map((node) => (
                    <ThreadNode key={node.id} node={node} table="reviews"
                      profileId={profile.id} session={session}
                      onDataRefresh={fetchData} onImageClick={setSelectedImage} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="forum" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                {questionTree.length === 0 ? (
                  <p className="text-amber-700/70 dark:text-amber-400/70 py-10 text-center bg-amber-500/5 rounded-xl border border-amber-200/50 border-dashed">
                    No hay preguntas en el foro para este perfil.
                  </p>
                ) : (
                  questionTree.map((node) => (
                    <ThreadNode key={node.id} node={node} table="questions"
                      profileId={profile.id} session={session}
                      onDataRefresh={fetchData} onImageClick={setSelectedImage} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* COLUMNA LATERAL */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle>Valoración Global</CardTitle>
              <div className="flex flex-col items-center justify-center mt-4">
                <span className="text-5xl font-black tracking-tighter">{stats.overallAverage || "-"}</span>
                <div className="flex gap-1 mt-2 mb-1">{renderStars(stats.overallAverage || 0)}</div>
                <CardDescription>Basado en {stats.totalReviews} reseñas</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {[
                { label: "Veracidad de fotos", value: stats.veracityAvg },
                { label: "Puntualidad", value: stats.punctualityAvg },
                { label: "Comunicación", value: stats.communicationAvg },
                { label: "Higiene y limpieza", value: stats.hygieneAvg },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{value}/5</span>
                  </div>
                  <Progress value={(value / 5) * 100} className="h-2" />
                </div>
              ))}
              <div className="pt-6 border-t">
                <Button className="w-full h-12 text-base font-bold" size="lg" asChild>
                  <Link href={`/submit-review?profileId=${profile.id}&name=${encodeURIComponent(profile.name)}&city=${encodeURIComponent(profile.city)}`}>
                    Escribir reseña o Preguntar
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3 italic">
                  ¿Conoces a {profile.name}? Comparte tu experiencia.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DE IMAGEN */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          {selectedImage && (
            <div className="relative w-full flex items-center justify-center group">
              <img src={selectedImage} alt="Vista ampliada"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" />
              <Button variant="secondary" size="icon"
                className="absolute top-4 right-4 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setSelectedImage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}