import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfilesPageClient } from "@/components/profiles/ProfilesPageClient"

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

function computeStats(profile: any): ProfileWithStats {
  const reviews   = profile.reviews   ?? []
  const questions = profile.questions ?? []

  const realReviews = reviews.filter((r: any) => r.type !== "question")
  const overall     = realReviews.length > 0
    ? Number(
        (realReviews.reduce((acc: number, r: any) => acc + (r.overall || 0), 0) / realReviews.length).toFixed(1)
      )
    : 0

  const imageUrl =
    profile.image_url ??
    reviews
      .flatMap((r: any) => r.review_images ?? [])
      .find((img: any) => img?.image_url)?.image_url ??
    null

  return {
    id:           profile.id,
    name:         profile.name,
    city:         profile.city,
    slug:         profile.slug,
    category:     profile.category     ?? null,
    price_range:  profile.price_range  ?? null,
    service_type: profile.service_type ?? null,
    platform_url: profile.platform_url ?? null,
    tags:         profile.tags         ?? null,
    imageUrl,
    overall,
    reviewCount: reviews.length + questions.length,
  }
}

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{
    city?:        string
    category?:    string
    serviceType?: string
    search?:      string
  }>
}) {
  const { city, category, serviceType, search } = await searchParams
  const supabase = await createClient()

  // ── Query dinámica: filtros aplicados en BD, no en JS ────
  let profilesQuery = supabase
    .from("profiles")
    .select(`
      id, name, city, slug, category, price_range, service_type, platform_url, tags, image_url,
      reviews ( overall, type, review_images ( image_url ) ),
      questions ( id )
    `)
    .order("created_at", { ascending: false })

  if (city)        profilesQuery = profilesQuery.eq("city", city)
  if (category)    profilesQuery = profilesQuery.eq("category", category)
  if (serviceType) profilesQuery = profilesQuery.eq("service_type", serviceType)
  if (search)      profilesQuery = profilesQuery.or(
    `name.ilike.%${search}%,city.ilike.%${search}%`
  )

  // ── 4 queries en paralelo ────────────────────────────────
  const [profilesRes, reviewsRes, questionsRes, citiesRes] = await Promise.all([
    profilesQuery,

    supabase
      .from("reviews")
      .select("*, profiles ( name, slug, city )")
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("questions")
      .select("*, profiles ( name, slug, city )")
      .order("created_at", { ascending: false })
      .limit(20),

    // Cities sin filtros → el dropdown siempre muestra todas las ciudades
    supabase
      .from("profiles")
      .select("city")
      .not("city", "is", null),
  ])

  // Stats pre-computados en servidor → enviamos datos limpios al cliente
  const profiles = (profilesRes.data ?? []).map(computeStats)

  const allCities = [
    ...new Set(
      (citiesRes.data ?? []).map((p: any) => p.city as string).filter(Boolean)
    ),
  ].sort()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Comunidad YaFui
            </h1>
            <p className="text-muted-foreground">
              Explora perfiles, lee las últimas experiencias o únete a la conversación en el foro.
            </p>
          </div>

          <ProfilesPageClient
            profiles={profiles}
            latestReviews={reviewsRes.data   ?? []}
            latestQuestions={questionsRes.data ?? []}
            cities={allCities}
            currentCity={city        ?? ""}
            currentCategory={category    ?? ""}
            currentServiceType={serviceType ?? ""}
            currentSearch={search      ?? ""}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
