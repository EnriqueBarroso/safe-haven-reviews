"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProfileCard } from "@/components/profile-card"
import {
    Search, Loader2, ArrowLeft, Filter,
    Euro, Users, MapPin, Tag
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Estados para búsqueda y filtros
    const [searchQuery, setSearchQuery] = useState("")
    const [priceFilter, setPriceFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")

    useEffect(() => {
        async function fetchProfiles() {
            setIsLoading(true)

            // ── NUEVA CONSULTA: Trae también las reseñas y sus fotos ──
            let query = supabase
                .from('profiles')
                .select(`
                    *,
                    reviews (
                        review_images ( image_url )
                    )
                `)
                .order('created_at', { ascending: false })

            // Filtro de texto (nombre o ciudad)
            if (searchQuery.trim() !== "") {
                query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
            }

            // Filtro de Rango de Precio
            if (priceFilter !== "all") {
                query = query.eq('price_range', priceFilter)
            }

            // Filtro de Categoría
            if (categoryFilter !== "all") {
                query = query.eq('category', categoryFilter)
            }

            // Filtro de Tipo de Servicio
            if (typeFilter !== "all") {
                query = query.eq('service_type', typeFilter)
            }

            const { data, error } = await query

            if (!error && data) {
                setProfiles(data)
            }
            setIsLoading(false)
        }

        const timer = setTimeout(() => {
            fetchProfiles()
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, priceFilter, categoryFilter, typeFilter])

    return (
        <div className="container mx-auto py-10 px-4 min-h-[80vh]">
            <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
                <Link href="/">
                    <ArrowLeft className="h-4 w-4" /> Volver al Inicio
                </Link>
            </Button>

            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Explorar Directorio</h1>

                {/* BUSCADOR PRINCIPAL */}
                <div className="relative max-w-2xl mb-6">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre o ciudad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 pl-12 text-base rounded-xl bg-secondary/50 border-border/60 focus-visible:ring-primary"
                    />
                </div>

                {/* BARRA DE FILTROS AVANZADOS */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                        <Filter className="h-4 w-4" /> Filtros:
                    </div>

                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                        <SelectTrigger className="w-[140px] bg-background">
                            <Euro className="h-4 w-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Precio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Cualquier precio</SelectItem>
                            <SelectItem value="<150">Menos de 150€</SelectItem>
                            <SelectItem value=">150">Más de 150€</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[140px] bg-background">
                            <Users className="h-4 w-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="chica">Chicas</SelectItem>
                            <SelectItem value="trans">Trans</SelectItem>
                            <SelectItem value="asiatica">Asiáticas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[160px] bg-background">
                            <Tag className="h-4 w-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Cualquier tipo</SelectItem>
                            <SelectItem value="independiente">Independiente</SelectItem>
                            <SelectItem value="piso_chicas">Piso de chicas</SelectItem>
                            <SelectItem value="agencia">Agencia</SelectItem>
                            <SelectItem value="masajes">Masajista / Piso masajes</SelectItem>
                        </SelectContent>
                    </Select>

                    {(priceFilter !== "all" || categoryFilter !== "all" || typeFilter !== "all" || searchQuery !== "") && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setPriceFilter("all");
                                setCategoryFilter("all");
                                setTypeFilter("all");
                                setSearchQuery("");
                            }}
                            className="text-xs text-primary"
                        >
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : profiles.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {profiles.map((profile) => {
                        // ── LÓGICA DE PORTADA DINÁMICA ──
                        const coverImage = profile.image_url || 
                            profile.reviews?.flatMap((r: any) => r.review_images)?.find((img: any) => img?.image_url)?.image_url || 
                            null;

                        // Obtenemos el número real de reseñas ya que las tenemos en la consulta
                        const reviewCount = profile.reviews?.length || 0;

                        return (
                            <ProfileCard
                                key={profile.id}
                                id={profile.id}
                                name={profile.name}
                                city={profile.city}
                                category={profile.category}
                                priceRange={profile.price_range}
                                serviceType={profile.service_type}
                                platformUrl={profile.platform_url}
                                tags={profile.tags}
                                imageUrl={coverImage} // <--- Pasamos la imagen calculada
                                rating={5.0} // (Esto se puede calcular también luego)
                                reviewCount={reviewCount}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-secondary/30 rounded-xl border border-border border-dashed">
                    <p className="text-lg font-medium text-foreground">No hay resultados para esta búsqueda</p>
                    <p className="text-muted-foreground mt-1">
                        Intenta cambiar los filtros o el término de búsqueda.
                    </p>
                </div>
            )}
        </div>
    )
}