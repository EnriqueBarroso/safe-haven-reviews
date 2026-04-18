"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ProfileCard } from "@/components/profile-card"
import { Loader2, ArrowRight } from "lucide-react"

export function RecentProfilesSection() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentProfiles() {
      // ── NUEVA CONSULTA: Trae las reseñas y fotos anidadas ──
      const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            reviews (
                review_images ( image_url )
            )
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      if (!error && data) {
        setProfiles(data)
      }
      setIsLoading(false)
    }

    fetchRecentProfiles()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (profiles.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Añadidos recientemente</h2>
            <p className="text-muted-foreground">Descubre los perfiles más recientes reseñados por la comunidad.</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex hover:text-primary">
            <Link href="/profiles">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            // ── LÓGICA DE PORTADA DINÁMICA ──
            const coverImage = profile.image_url || 
                profile.reviews?.flatMap((r: any) => r.review_images)?.find((img: any) => img?.image_url)?.image_url || 
                null;
            
            const reviewCount = profile.reviews?.length || 0;

            return (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                city={profile.city}
                slug={profile.slug} 
                category={profile.category}
                priceRange={profile.price_range}
                serviceType={profile.service_type}
                imageUrl={coverImage} // <--- Pasamos la imagen
                rating={5.0}
                reviewCount={reviewCount}
              />
            )
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild className="w-full h-12">
            <Link href="/profiles">Explorar todos los perfiles</Link>
          </Button>
        </div>

      </div>
    </section>
  )
}