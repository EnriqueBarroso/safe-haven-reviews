"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal, X } from "lucide-react"

interface Props {
  cities:             string[]
  currentCity:        string
  currentCategory:    string
  currentServiceType: string
  currentSearch:      string
  totalCount:         number
}

export function ProfileFiltersClient({
  cities,
  currentCity,
  currentCategory,
  currentServiceType,
  currentSearch,
  totalCount,
}: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // Estado local solo para el input de texto (necesario para el debounce)
  const [search, setSearch] = useState(currentSearch)

  // Sincronizar si el usuario navega con el botón Atrás/Adelante del browser
  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  // Debounce: esperar 400ms después del último keystroke antes de navegar
  useEffect(() => {
    if (search === currentSearch) return
    const timer = setTimeout(() => navigate({ search }), 400)
    return () => clearTimeout(timer)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  function navigate(
    overrides: Partial<{
      city: string
      category: string
      serviceType: string
      search: string
    }>
  ) {
    const next = {
      city:        currentCity,
      category:    currentCategory,
      serviceType: currentServiceType,
      search:      currentSearch,
      ...overrides,
    }

    const params = new URLSearchParams()
    if (next.city        && next.city        !== "all") params.set("city",        next.city)
    if (next.category    && next.category    !== "all") params.set("category",    next.category)
    if (next.serviceType && next.serviceType !== "all") params.set("serviceType", next.serviceType)
    if (next.search.trim())                             params.set("search",      next.search.trim())

    const qs = params.toString()
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`)
    })
  }

  const hasActiveFilters =
    currentCity || currentCategory || currentServiceType || currentSearch

  return (
    <div
      className={`bg-card border rounded-2xl p-4 mb-8 space-y-3 shadow-sm transition-opacity duration-150 ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </div>
        <div className="text-xs text-muted-foreground">
          {isPending ? "Cargando..." : `${totalCount} perfiles`}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Búsqueda de texto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nombre o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Ciudad */}
        <Select
          value={currentCity || "all"}
          onValueChange={(v) => navigate({ city: v })}
        >
          <SelectTrigger><SelectValue placeholder="Todas las ciudades" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Categoría */}
        <Select
          value={currentCategory || "all"}
          onValueChange={(v) => navigate({ category: v })}
        >
          <SelectTrigger><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="chica">Chica</SelectItem>
            <SelectItem value="trans">Trans</SelectItem>
            <SelectItem value="asiatica">Asiática</SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo de servicio */}
        <Select
          value={currentServiceType || "all"}
          onValueChange={(v) => navigate({ serviceType: v })}
        >
          <SelectTrigger><SelectValue placeholder="Todos los tipos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="independiente">Independiente</SelectItem>
            <SelectItem value="piso_chicas">Piso / Agencia</SelectItem>
            <SelectItem value="masajes">Masajes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("")
            navigate({ city: "all", category: "all", serviceType: "all", search: "" })
          }}
          className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
        >
          <X className="h-3.5 w-3.5" /> Limpiar filtros
        </Button>
      )}
    </div>
  )
}
