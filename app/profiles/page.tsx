"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ProfileCard } from "@/components/profile-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Search, SlidersHorizontal, X, Users, StarIcon, MessageSquare, Clock, ArrowRight, Link as LinkIcon } from "lucide-react"

const ALL = "all"

export default function ProfilesPage() {
  // ── Estados de Datos ────────────────────────────────────
  const [profiles, setProfiles] = useState<any[]>([])
  const [latestReviews, setLatestReviews] = useState<any[]>([])
  const [latestQuestions, setLatestQuestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ── Estados de Filtros (Solo para Directorio) ──────────
  const [search, setSearch] = useState("")
  const [city, setCity] = useState(ALL)
  const [category, setCategory] = useState(ALL)
  const [serviceType, setServiceType] = useState(ALL)

  // ── Carga de Datos Global (Perfiles + Muros) ───────────
  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true)

      // Ejecutamos las 3 llamadas a la vez para que la web cargue rapidísimo
      const [profilesRes, reviewsRes, questionsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            *,
            reviews ( overall, type, review_images ( image_url ) ),
            questions ( id )
          `)
          .order("created_at", { ascending: false }),

        supabase
          .from("reviews")
          .select("*, profiles(name, slug, city)")
          .order("created_at", { ascending: false })
          .limit(20),

        supabase
          .from("questions")
          .select("*, profiles(name, slug, city)")
          .order("created_at", { ascending: false })
          .limit(20)
      ])

      if (!profilesRes.error && profilesRes.data) setProfiles(profilesRes.data)
      if (!reviewsRes.error && reviewsRes.data) setLatestReviews(reviewsRes.data)
      if (!questionsRes.error && questionsRes.data) setLatestQuestions(questionsRes.data)

      setIsLoading(false)
    }

    fetchAllData()
  }, [])

  // ── Opciones dinámicas de ciudad ───────────────────────
  const cityOptions = useMemo(() => {
    const cities = [...new Set(profiles.map((p) => p.city).filter(Boolean))]
    return cities.sort()
  }, [profiles])

  // ── Filtrado (Para el Directorio) ──────────────────────
  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !p.name?.toLowerCase().includes(q) &&
          !p.city?.toLowerCase().includes(q)
        ) return false
      }
      if (city !== ALL && p.city !== city) return false
      if (category !== ALL && p.category !== category) return false
      if (serviceType !== ALL && p.service_type !== serviceType) return false
      return true
    })
  }, [profiles, search, city, category, serviceType])

  const hasActiveFilters = search !== "" || city !== ALL || category !== ALL || serviceType !== ALL

  const resetFilters = () => {
    setSearch("")
    setCity(ALL)
    setCategory(ALL)
    setServiceType(ALL)
  }

  // ── Helpers ────────────────────────────────────────────
  const getProfileStats = (profile: any) => {
    const reviews = profile.reviews ?? []
    const questions = profile.questions ?? []

    const actualReviews = reviews.filter((r: any) => r.type !== "question")

    const overall = actualReviews.length > 0
      ? Number((actualReviews.reduce((acc: number, r: any) => acc + (r.overall || 0), 0) / actualReviews.length).toFixed(1))
      : 0

    const coverImage =
      profile.image_url ||
      reviews.flatMap((r: any) => r.review_images ?? []).find((img: any) => img?.image_url)?.image_url ||
      null

    const totalInteractions = reviews.length + questions.length

    return {
      overall,
      reviewCount: totalInteractions,
      coverImage
    }
  }

  // Helper para renderizar estrellas en el muro
  const renderStars = (rating: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
        <span className="font-bold text-xs text-primary">{rating}/5</span>
        <StarIcon className="h-3 w-3 fill-primary text-primary" />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-6xl">

          {/* Cabecera Principal */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Comunidad ReviewSphere</h1>
            <p className="text-muted-foreground">
              Explora perfiles, lee las últimas experiencias o únete a la conversación en el foro.
            </p>
          </div>

          <Tabs defaultValue="directory" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-3 max-w-xl mx-auto md:mx-0">
              <TabsTrigger value="directory" className="gap-2"><Users className="h-4 w-4 hidden sm:block" /> Directorio</TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2"><StarIcon className="h-4 w-4 hidden sm:block" /> Últimas Reseñas</TabsTrigger>
              <TabsTrigger value="forum" className="gap-2 text-amber-600 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700"><MessageSquare className="h-4 w-4 hidden sm:block" /> Foro Activo</TabsTrigger>
            </TabsList>

            {/* ==========================================
                PESTAÑA 1: DIRECTORIO (Tu código original)
                ========================================== */}
            <TabsContent value="directory" className="focus-visible:outline-none">
              {/* Filtros */}
              <div className="bg-card border rounded-2xl p-4 mb-8 space-y-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <SlidersHorizontal className="h-4 w-4" /> Filtros
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isLoading ? "Cargando..." : `${filtered.length} perfiles`}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Nombre o ciudad..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger><SelectValue placeholder="Todas las ciudades" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todas las ciudades</SelectItem>
                      {cityOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todas las categorías</SelectItem>
                      <SelectItem value="chica">Chica</SelectItem>
                      <SelectItem value="trans">Trans</SelectItem>
                      <SelectItem value="asiatica">Asiática</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger><SelectValue placeholder="Todos los tipos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todos los tipos</SelectItem>
                      <SelectItem value="independiente">Independiente</SelectItem>
                      <SelectItem value="piso_chicas">Piso / Agencia</SelectItem>
                      <SelectItem value="masajes">Masajes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground gap-1.5 h-8">
                    <X className="h-3.5 w-3.5" /> Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Grid de Perfiles */}
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed">
                  <p className="text-muted-foreground mb-4">No hay perfiles que coincidan con los filtros.</p>
                  {hasActiveFilters && <Button variant="outline" onClick={resetFilters}>Limpiar filtros</Button>}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((profile) => {
                    const { overall, reviewCount, coverImage } = getProfileStats(profile)
                    return (
                      <ProfileCard
                        key={profile.id}
                        id={profile.id}
                        slug={profile.slug}
                        name={profile.name}
                        city={profile.city}
                        category={profile.category}
                        priceRange={profile.price_range}
                        serviceType={profile.service_type}
                        platformUrl={profile.platform_url}
                        tags={profile.tags}
                        imageUrl={coverImage}
                        rating={overall || 5.0}
                        reviewCount={reviewCount}
                      />
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* ==========================================
                PESTAÑA 2: FEED DE ÚLTIMAS RESEÑAS
                ========================================== */}
            <TabsContent value="reviews" className="focus-visible:outline-none">
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : latestReviews.length === 0 ? (
                <p className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">No hay reseñas recientes.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {latestReviews.map((review) => (
                    <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 bg-secondary/20">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                              {review.avatar_url ? <img src={review.avatar_url} alt={review.alias} className="h-full w-full object-cover" /> : review.alias.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <CardTitle className="text-base">{review.alias}</CardTitle>
                              <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" /> {new Date(review.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          {renderStars(review.overall)}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-foreground/80 line-clamp-3 mb-4">"{review.details}"</p>
                        <div className="flex items-center justify-between border-t pt-3 mt-auto">
                          <span className="text-xs font-medium text-muted-foreground">
                            Sobre: <span className="text-foreground">{review.profiles?.name}</span> ({review.profiles?.city})
                          </span>
                          <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" asChild>
                            <Link href={`/profiles/${review.profiles?.slug}`}>Ver perfil <ArrowRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ==========================================
                PESTAÑA 3: FEED DEL FORO
                ========================================== */}
            <TabsContent value="forum" className="focus-visible:outline-none">
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
              ) : latestQuestions.length === 0 ? (
                <p className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">No hay hilos recientes en el foro.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {latestQuestions.map((question) => (
                    <Card key={question.id} className="overflow-hidden border-amber-200/50 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 bg-amber-50/50">
                        {/* ... (Cabecera del alias igual que antes) ... */}
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">

                        {/* 1. EL TEXTO DE LA PREGUNTA */}
                        <p className="text-sm text-foreground/80 line-clamp-3 mb-4">{question.details}</p>

                        {/* 2. LA IMAGEN (Asegúrate de que este bloque existe en tu código) */}
                        {question.image_url && (
                          <div className="relative h-48 w-full rounded-lg overflow-hidden border bg-muted/30">
                            <img
                              src={question.image_url}
                              alt="Imagen adjunta al hilo"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        {/* 3. EL ENLACE DEL ANUNCIO */}
                        {question.platform_url && (
                          <div className="bg-white/50 border border-amber-200 p-2 rounded-md flex items-center justify-between gap-2 overflow-hidden">
                            <div className="flex items-center gap-2 text-xs text-amber-800 font-medium truncate">
                              <LinkIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{question.platform_url}</span>
                            </div>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200" asChild>
                              <a href={question.platform_url} target="_blank" rel="noopener noreferrer">Visitar anuncio</a>
                            </Button>
                          </div>
                        )}

                        {/* 4. EL BOTÓN DE RESPONDER */}
                        <div className="flex items-center justify-between border-t border-amber-100 pt-3 mt-auto">
                          <span className="text-xs font-medium text-muted-foreground">
                            Tema: <span className="text-foreground">{question.profiles?.name}</span> ({question.profiles?.city})
                          </span>
                          <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50" asChild>
                            <Link href={`/profiles/${question.profiles?.slug}?tab=forum`}>Unirse al hilo <ArrowRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}