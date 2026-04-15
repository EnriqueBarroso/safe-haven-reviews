"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsPanel } from "@/components/profile/StatsPanel"
import { ReviewCard } from "@/components/profile/ReviewCard"
import { QuestionCard } from "@/components/profile/QuestionCard"
import { ShareBBCode } from "@/components/profile/share-bbcode"
import { ArrowLeft, Loader2, MapPin, ShieldCheck } from "lucide-react"

interface Stats {
  totalReviews: number
  overallAverage: number
  veracityAvg: number
  punctualityAvg: number
  communicationAvg: number
  hygieneAvg: number
}

const EMPTY_STATS: Stats = {
  totalReviews: 0,
  overallAverage: 0,
  veracityAvg: 0,
  punctualityAvg: 0,
  communicationAvg: 0,
  hygieneAvg: 0,
}

function calcStats(reviews: any[]): Stats {
  const actual = reviews.filter((r) => r.type !== "question")
  const total = actual.length

  if (total === 0) return { ...EMPTY_STATS, totalReviews: reviews.length }

  const sum = (key: string) => actual.reduce((acc, r) => acc + (r[key] || 0), 0)

  return {
    totalReviews: reviews.length,
    overallAverage: Number((sum("overall") / total).toFixed(1)),
    veracityAvg: Number((sum("veracity") / total).toFixed(1)),
    punctualityAvg: Number((sum("punctuality") / total).toFixed(1)),
    communicationAvg: Number((sum("communication") / total).toFixed(1)),
    hygieneAvg: Number((sum("hygiene") / total).toFixed(1)),
  }
}

export default function ProfileDetailPage() {
  const params = useParams()
  const profileId = params.id as string

  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [isLoading, setIsLoading] = useState(true)

  const profileUrl = typeof window !== "undefined" ? window.location.href : ""

  useEffect(() => {
    if (!profileId) return

    async function fetchData() {
      const { data: profileData, error } = await supabase
        .from("profiles").select("*").eq("id", profileId).single()

      if (error) { setIsLoading(false); return }
      setProfile(profileData)

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })

      if (reviewsData) {
        setReviews(reviewsData)
        setStats(calcStats(reviewsData))
      }

      setIsLoading(false)
    }

    fetchData()
  }, [profileId])

  // ── Guards ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Perfil no encontrado</h1>
        <p className="text-muted-foreground mb-8">
          El perfil que buscas no existe o ha sido eliminado.
        </p>
        <Button asChild><Link href="/profiles">Volver a Explorar</Link></Button>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
        <Link href="/profiles"><ArrowLeft className="h-4 w-4" /> Volver a Explorar</Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        {/* Columna principal */}
        <div className="space-y-8">

          {/* Cabecera del perfil */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border shadow-sm">
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.category && (
                <Badge variant="outline" className="capitalize">{profile.category}</Badge>
              )}
              {profile.price_range && (
                <Badge className="bg-primary text-primary-foreground">{profile.price_range}€</Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
              {profile.name}
              {stats.totalReviews > 2 && (
                // DESPUÉS
                <span title="Perfil verificado por la comunidad">
                  <ShieldCheck className="h-6 w-6 text-green-500" />
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {profile.city}
              </span>
              {profile.service_type && (
                <span className="capitalize">• {profile.service_type.replace("_", " ")}</span>
              )}
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

          {/* Feed de reseñas y preguntas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-semibold">Actividad de la comunidad</h2>
              <span className="text-muted-foreground">{stats.totalReviews} aportaciones</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center bg-secondary/20 rounded-xl border border-dashed">
                Aún no hay reseñas ni preguntas para este perfil.
              </p>
            ) : (
              reviews.map((review) =>
                review.type === "question" ? (
                  <QuestionCard key={review.id} review={review} />
                ) : (
                  <ReviewCard key={review.id} review={review} />
                )
              )
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div>
          <StatsPanel profile={profile} stats={stats} />
        </div>
      </div>
    </div>
  )
}