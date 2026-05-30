import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { buildTree } from "@/lib/build-tree"
import { ProfileDetailClient } from "@/components/profile/ProfileDetailClient"

export default async function ProfileDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug }  = await params
  const { tab }   = await searchParams
  const supabase  = await createClient()

  // Paso 1 — perfil: necesitamos su ID antes de poder paralelizar
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!profile) notFound()

  // Paso 2 — reviews y questions en PARALELO (no secuencial)
  const [reviewsRes, questionsRes] = await Promise.all([
    supabase
      .from("reviews")
      .select("*, review_images(*)")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("questions")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
  ])

  const reviews   = reviewsRes.data   ?? []
  const questions = questionsRes.data ?? []

  // Stats (antes vivían en un useEffect del cliente)
  const rootReviews = reviews.filter(
    (r) => !r.parent_id && (r.type === "review" || !r.type)
  )
  const total = rootReviews.length
  const avg = (field: string) =>
    total > 0
      ? Number(
          (rootReviews.reduce((a, c) => a + (c[field] || 0), 0) / total).toFixed(1)
        )
      : 0

  const stats = {
    totalReviews:     total,
    overallAverage:   avg("overall"),
    veracityAvg:      avg("veracity"),
    punctualityAvg:   avg("punctuality"),
    communicationAvg: avg("communication"),
    hygieneAvg:       avg("hygiene"),
    discretionAvg:    avg("discretion"),
    kindnessAvg:      avg("kindness"),
  }

  // Cover image (antes era una IIFE dentro del render)
  const coverImage =
    profile.image_url ??
    reviews.find((r) => r.review_images?.length > 0)?.review_images[0]?.image_url ??
    null

  // Teléfono de la primera reseña raíz que lo tenga (ordenadas ASC por fecha)
  const whatsappPhone =
    reviews
      .filter((r) => r.phone && !r.parent_id && (r.type === "review" || !r.type))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .at(0)?.phone ?? null

  // Árboles (buildTree es función pura, no necesita cliente)
  const reviewTree   = buildTree(reviews.filter((r) => r.type === "review" || !r.type))
  const questionTree = buildTree(questions)

  // Tab activa leída en servidor para evitar useSearchParams en cliente
  const defaultTab = tab === "forum" ? "forum" : "reviews"

  return (
    <ProfileDetailClient
      profile={profile}
      stats={stats}
      coverImage={coverImage}
      reviewTree={reviewTree}
      questionTree={questionTree}
      profileId={profile.id}
      defaultTab={defaultTab}
      whatsappPhone={whatsappPhone}
    />
  )
}
