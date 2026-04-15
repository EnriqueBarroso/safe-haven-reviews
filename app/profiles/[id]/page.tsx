"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { StarIcon, MapPin, Calendar, ArrowLeft, X, Loader2, ShieldCheck, MessageCircle, Download, Link as LinkIcon, CheckCircle2 } from "lucide-react"
import { ReportDialog } from "@/components/review/report-dialog"
import { ShareBBCode } from "@/components/profile/share-bbcode"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

export default function ProfileDetailPage() {
  const params = useParams()
  const profileId = params.id as string

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados para feedback visual de los botones de imagen
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const [stats, setStats] = useState({
    totalReviews: 0,
    overallAverage: 0,
    veracityAvg: 0,
    punctualityAvg: 0,
    communicationAvg: 0,
    hygieneAvg: 0
  })

  const profileUrl = typeof window !== 'undefined' ? window.location.href : ""

  useEffect(() => {
    async function fetchProfileData() {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single()

      if (profileError) {
        console.error("Error cargando perfil:", profileError)
        setIsLoading(false)
        return
      }

      setProfile(profileData)

      // Cargar reseñas e imágenes
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, review_images(*)')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData)

        const actualReviews = reviewsData.filter(r => r.type !== 'question')

        if (actualReviews.length > 0) {
          const total = actualReviews.length
          const sumOverall = actualReviews.reduce((acc, curr) => acc + (curr.overall || 0), 0)
          const sumVeracity = actualReviews.reduce((acc, curr) => acc + (curr.veracity || 0), 0)
          const sumPunctuality = actualReviews.reduce((acc, curr) => acc + (curr.punctuality || 0), 0)
          const sumCommunication = actualReviews.reduce((acc, curr) => acc + (curr.communication || 0), 0)
          const sumHygiene = actualReviews.reduce((acc, curr) => acc + (curr.hygiene || 0), 0)

          setStats({
            totalReviews: reviewsData.length,
            overallAverage: Number((sumOverall / total).toFixed(1)),
            veracityAvg: Number((sumVeracity / total).toFixed(1)),
            punctualityAvg: Number((sumPunctuality / total).toFixed(1)),
            communicationAvg: Number((sumCommunication / total).toFixed(1)),
            hygieneAvg: Number((sumHygiene / total).toFixed(1))
          })
        }
      }
      setIsLoading(false)
    }

    if (profileId) fetchProfileData()
  }, [profileId])

  // ── LÓGICA DE PORTADA DINÁMICA ──
  // Busca la foto oficial. Si no hay, busca la primera foto de las reseñas.
  const getCoverImage = () => {
    if (profile?.image_url) return profile.image_url

    for (const review of reviews) {
      if (review.review_images && review.review_images.length > 0) {
        return review.review_images[0].image_url
      }
    }
    return null
  }

  const coverImage = getCoverImage()

  // ── LÓGICA PARA COMPARTIR/DESCARGAR IMAGEN ──
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

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${profile?.name.replace(/\s+/g, '-').toLowerCase()}-foro.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      window.open(coverImage, '_blank')
    }
    setIsDownloading(false)
  }

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>

  if (!profile) return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Perfil no encontrado</h1>
      <Button asChild><Link href="/profiles">Volver a Explorar</Link></Button>
    </div>
  )

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
    ))
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
        <Link href="/profiles"><ArrowLeft className="h-4 w-4" /> Volver a Explorar</Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        {/* COLUMNA PRINCIPAL */}
        <div className="space-y-8">

          {/* CABECERA DEL PERFIL CON IMAGEN */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">

              {/* BLOQUE DE IMAGEN DINÁMICA */}
              {coverImage && (
                <div className="shrink-0 flex flex-col gap-3">
                  <div
                    className="relative w-full md:w-56 h-64 md:h-72 rounded-2xl overflow-hidden border-4 border-secondary shadow-lg cursor-zoom-in"
                    onClick={() => setSelectedImage(coverImage)}
                  >
                    <img src={coverImage} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-xs gap-1.5"
                      onClick={handleDownloadImage}
                      disabled={isDownloading}
                    >
                      {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Guardar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-xs gap-1.5"
                      onClick={handleCopyImageUrl}
                    >
                      {isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <LinkIcon className="h-3.5 w-3.5" />}
                      {isCopied ? "Copiada" : "Enlace"}
                    </Button>
                  </div>
                </div>
              )}

              {/* BLOQUE DE INFORMACIÓN */}
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
                  {profile.service_type && <span className="capitalize">• {profile.service_type.replace('_', ' ')}</span>}
                </div>

                <ShareBBCode
                  name={profile.name}
                  city={profile.city}
                  category={profile.category || ""}
                  tags={profile.tags || []}
                  rating={stats.overallAverage}
                  profileUrl={profileUrl}
                />
              </div>
            </div>
          </div>

          {/* LISTA DE RESEÑAS / PREGUNTAS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-semibold">Actividad de la comunidad</h2>
              <span className="text-muted-foreground">{stats.totalReviews} aportaciones</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center bg-secondary/20 rounded-xl border border-dashed">Aún no hay reseñas ni preguntas para este perfil.</p>
            ) : (
              reviews.map((review) => {
                const isQuestion = review.type === 'question';

                return (
                  <Card key={review.id} className={`overflow-hidden transition-colors ${isQuestion ? 'border-amber-200/50 bg-amber-50/10' : 'bg-card/50'}`}>
                    <CardHeader className={`pb-3 ${isQuestion ? 'bg-amber-500/5' : 'bg-secondary/30'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden font-bold text-xs border-2 ${isQuestion ? 'border-amber-200 bg-amber-100 text-amber-700' : 'border-primary/20 bg-primary/10 text-primary'}`}>
                            {review.avatar_url ? (
                              <img src={review.avatar_url} alt={review.alias} className="h-full w-full object-cover" />
                            ) : (
                              review.alias.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {review.alias}
                              {isQuestion && <Badge variant="outline" className="text-amber-600 border-amber-200/50 bg-amber-50">Pregunta al Foro</Badge>}
                            </CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(review.created_at).toLocaleDateString()}</span>
                            </CardDescription>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {!isQuestion && review.overall && (
                            <div className="flex items-center gap-1 bg-background px-3 py-1 rounded-full shadow-sm border">
                              <span className="font-bold text-sm">{review.overall}/5</span>
                              <StarIcon className="h-3.5 w-3.5 fill-primary text-primary" />
                            </div>
                          )}
                          <ReportDialog reviewId={review.id} />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      {!isQuestion && (review.price || review.duration) && (
                        <div className="flex flex-wrap gap-4 text-sm bg-secondary/20 p-3 rounded-lg border border-border/50">
                          {review.price && <div><span className="text-muted-foreground">Pagado:</span> <span className="font-medium">{review.price}€</span></div>}
                          {review.duration && <div><span className="text-muted-foreground">Duración:</span> <span className="font-medium">{review.duration} min</span></div>}
                        </div>
                      )}

                      <div className="relative">
                        <MessageCircle className={`absolute -left-2 -top-2 h-8 w-8 ${isQuestion ? 'text-amber-500/10' : 'text-muted-foreground/10'}`} />
                        <p className={`text-foreground/90 leading-relaxed text-sm whitespace-pre-line relative z-10 pl-4 border-l-2 ${isQuestion ? 'border-amber-500/30' : 'border-primary/20'}`}>
                          {review.details || review.comment}
                        </p>
                      </div>

                      {/* RENDERIZAR FOTOS DE LA RESEÑA */}
                      {!isQuestion && review.review_images && review.review_images.length > 0 && (
                        <div className="pt-4 border-t mt-4">
                          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Fotos de la visita:</p>
                          <div className="flex flex-wrap gap-2">
                            {review.review_images.map((img: any) => (
                              <div
                                key={img.id}
                                onClick={() => setSelectedImage(img.image_url)}
                                className="relative h-20 w-20 rounded-md overflow-hidden border shadow-sm hover:opacity-80 transition-opacity cursor-zoom-in"
                              >
                                <img src={img.image_url} alt="Visita" className="h-full w-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* COLUMNA LATERAL (Estadística global) */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle>Valoración Global</CardTitle>
              <div className="flex flex-col items-center justify-center mt-4">
                <span className="text-5xl font-black tracking-tighter">{stats.overallAverage || "-"}</span>
                <div className="flex gap-1 mt-2 mb-1">{renderStars(stats.overallAverage || 0)}</div>
                <CardDescription>Basado en {stats.totalReviews} interacciones</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span>Veracidad de fotos</span><span className="font-medium">{stats.veracityAvg}/5</span></div>
                <Progress value={(stats.veracityAvg / 5) * 100} className="h-2" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span>Puntualidad</span><span className="font-medium">{stats.punctualityAvg}/5</span></div>
                <Progress value={(stats.punctualityAvg / 5) * 100} className="h-2" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span>Comunicación</span><span className="font-medium">{stats.communicationAvg}/5</span></div>
                <Progress value={(stats.communicationAvg / 5) * 100} className="h-2" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span>Higiene y limpieza</span><span className="font-medium">{stats.hygieneAvg}/5</span></div>
                <Progress value={(stats.hygieneAvg / 5) * 100} className="h-2" />
              </div>
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
      {/* ── VISUALIZADOR DE IMÁGENES (MODAL) ── */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          {selectedImage && (
            <div className="relative w-full flex items-center justify-center group">
              <img
                src={selectedImage}
                alt="Vista ampliada"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              />
              {/* Botón de cerrar flotante para mejor UX */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}