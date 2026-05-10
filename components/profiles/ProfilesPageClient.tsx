"use client"

import Link from "next/link"
import { ProfileCard } from "@/components/profile-card"
import { ProfileFiltersClient } from "@/components/profiles/ProfileFiltersClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users, StarIcon, MessageSquare, Clock, ArrowRight, Link as LinkIcon,
} from "lucide-react"

type ProfileWithStats = {
  id:           string
  name:         string
  city:         string
  slug:         string
  category:     string | null
  price_range:  string | null
  service_type: string | null
  platform_url: string | null
  tags:         string[] | null
  imageUrl:     string | null
  overall:      number
  reviewCount:  number
}

interface Props {
  profiles:           ProfileWithStats[]
  latestReviews:      any[]
  latestQuestions:    any[]
  cities:             string[]
  currentCity:        string
  currentCategory:    string
  currentServiceType: string
  currentSearch:      string
}

export function ProfilesPageClient({
  profiles,
  latestReviews,
  latestQuestions,
  cities,
  currentCity,
  currentCategory,
  currentServiceType,
  currentSearch,
}: Props) {

  const renderStars = (rating: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
        <span className="font-bold text-xs text-primary">{rating}/5</span>
        <StarIcon className="h-3 w-3 fill-primary text-primary" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="directory" className="w-full">
      <TabsList className="mb-8 grid w-full grid-cols-3 max-w-xl mx-auto md:mx-0">
        <TabsTrigger value="directory" className="gap-2">
          <Users className="h-4 w-4 hidden sm:block" /> Directorio
        </TabsTrigger>
        <TabsTrigger value="reviews" className="gap-2">
          <StarIcon className="h-4 w-4 hidden sm:block" /> Últimas Reseñas
        </TabsTrigger>
        <TabsTrigger
          value="forum"
          className="gap-2 text-amber-600 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700"
        >
          <MessageSquare className="h-4 w-4 hidden sm:block" /> Foro Activo
        </TabsTrigger>
      </TabsList>

      {/* ── PESTAÑA 1: DIRECTORIO ────────────────────────── */}
      <TabsContent value="directory" className="focus-visible:outline-none">
        {/* Filtros: solo actualiza la URL, nunca fetcha datos */}
        <ProfileFiltersClient
          cities={cities}
          currentCity={currentCity}
          currentCategory={currentCategory}
          currentServiceType={currentServiceType}
          currentSearch={currentSearch}
          totalCount={profiles.length}
        />

        {profiles.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed">
            <p className="text-muted-foreground mb-4">No hay perfiles que coincidan con los filtros.</p>
            <Button variant="outline" asChild>
              <Link href="/profiles">Limpiar filtros</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                city={p.city}
                category={p.category ?? undefined}
                priceRange={p.price_range ?? undefined}
                serviceType={p.service_type ?? undefined}
                platformUrl={p.platform_url ?? undefined}
                tags={p.tags ?? undefined}
                imageUrl={p.imageUrl ?? undefined}
                rating={p.overall || 5.0}
                reviewCount={p.reviewCount}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── PESTAÑA 2: ÚLTIMAS RESEÑAS ───────────────────── */}
      <TabsContent value="reviews" className="focus-visible:outline-none">
        {latestReviews.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
            No hay reseñas recientes.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {latestReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 bg-secondary/20">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                        {review.avatar_url
                          ? <img src={review.avatar_url} alt={review.alias} className="h-full w-full object-cover" />
                          : review.alias?.substring(0, 2).toUpperCase()
                        }
                      </div>
                      <div>
                        <CardTitle className="text-base">{review.alias}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    {renderStars(review.overall)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-foreground/80 line-clamp-3 mb-4">
                    &quot;{review.details}&quot;
                  </p>
                  <div className="flex items-center justify-between border-t pt-3 mt-auto">
                    <span className="text-xs font-medium text-muted-foreground">
                      Sobre:{" "}
                      <span className="text-foreground">{review.profiles?.name}</span>{" "}
                      ({review.profiles?.city})
                    </span>
                    <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" asChild>
                      <Link href={`/profiles/${review.profiles?.slug}`}>
                        Ver perfil <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── PESTAÑA 3: FORO ACTIVO ───────────────────────── */}
      <TabsContent value="forum" className="focus-visible:outline-none">
        {latestQuestions.length === 0 ? (
          <p className="text-center py-20 text-muted-foreground border border-dashed rounded-xl">
            No hay hilos recientes en el foro.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {latestQuestions.map((q) => (
              <Card
                key={q.id}
                className="overflow-hidden border-amber-200/50 hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3 bg-amber-50/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden font-bold text-xs bg-amber-100 text-amber-700 border border-amber-200">
                      {q.avatar_url
                        ? <img src={q.avatar_url} alt={q.alias} className="h-full w-full object-cover" />
                        : q.alias?.substring(0, 2).toUpperCase()
                      }
                    </div>
                    <div>
                      <CardTitle className="text-base text-amber-700">{q.alias}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(q.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm text-foreground/80 line-clamp-3">{q.details}</p>

                  {q.image_url && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden border bg-muted/30">
                      <img
                        src={q.image_url}
                        alt="Imagen adjunta al hilo"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {q.platform_url && (
                    <div className="bg-white/50 border border-amber-200 p-2 rounded-md flex items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 text-xs text-amber-800 font-medium truncate">
                        <LinkIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{q.platform_url}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
                        asChild
                      >
                        <a href={q.platform_url} target="_blank" rel="noopener noreferrer">
                          Visitar anuncio
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-amber-100 pt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Tema:{" "}
                      <span className="text-foreground font-medium">{q.profiles?.name}</span>{" "}
                      ({q.profiles?.city})
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      asChild
                    >
                      <Link href={`/profiles/${q.profiles?.slug}?tab=forum`}>
                        Unirse al hilo <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
