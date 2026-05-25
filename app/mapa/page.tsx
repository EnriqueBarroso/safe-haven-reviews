import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { HeaderServer } from "@/components/HeaderServer"
import { Footer } from "@/components/footer"
import { MapLoader } from "@/components/mapa/MapLoader"
import { MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MapProfile } from "@/components/mapa/MapView"

export const dynamic = "force-dynamic"

export default async function MapaPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("profiles")
    .select("id, name, slug, city, lat, lng")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("name")

  const profiles: MapProfile[] = (data ?? []).map((p) => ({
    id:   p.id,
    name: p.name,
    slug: p.slug,
    city: p.city,
    lat:  p.lat as number,
    lng:  p.lng as number,
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />

      <main id="main-content" className="flex-1 flex flex-col">
        {/* Cabecera */}
        <div className="border-b bg-background px-4 py-4">
          <div className="container mx-auto max-w-7xl flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground">
              <Link href="/profiles"><ArrowLeft className="h-4 w-4" /> Explorar</Link>
            </Button>

            <div className="flex-1 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Mapa de la Comunidad</h1>
                <p className="text-xs text-muted-foreground">
                  {profiles.length} {profiles.length === 1 ? "perfil ubicado" : "perfiles ubicados"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa — altura explícita requerida por Leaflet (h-full no funciona sobre flex-1) */}
        <div style={{ height: "calc(100vh - 130px)" }} className="relative min-h-125">
          {profiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-4 py-20">
              <MapPin className="h-12 w-12 text-primary/20" />
              <div>
                <p className="font-semibold text-lg">Aún no hay perfiles en el mapa</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Cuando se publiquen reseñas con dirección, aparecerán aquí.
                </p>
              </div>
              <Button asChild>
                <Link href="/submit-review">Publicar reseña</Link>
              </Button>
            </div>
          ) : (
            <MapLoader profiles={profiles} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
