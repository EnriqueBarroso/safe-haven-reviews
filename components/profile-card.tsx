"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon, MapPin, Tag, ExternalLink } from "lucide-react"

interface ProfileCardProps {
  id: string
  name: string
  city: string
  slug: string
  rating: number
  reviewCount: number
  category?: string      
  priceRange?: string   
  serviceType?: string  
  platformUrl?: string
  tags?: string[]       
  imageUrl?: string     // <--- AÑADIDO: Recibe la imagen de la portada dinámica
}

export function ProfileCard({ 
  id, name, city, slug, rating, reviewCount, category, priceRange, serviceType, platformUrl, tags, imageUrl 
}: ProfileCardProps) {
  
  const formatServiceType = (type?: string) => {
    const types: Record<string, string> = {
      'independiente': 'Independiente',
      'piso_chicas': 'Piso / Agencia',
      'masajes': 'Masajes',
      'agencia': 'Agencia'
    }
    return type ? types[type] || type : null
  }

  return (
    <Link href={`/profiles/${slug}`} className="group block h-full">
      <Card className="overflow-hidden border-border/50 bg-card/50 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
        
        {/* CABECERA: Imagen/Avatar con Badges */}
        <div className="relative aspect-[4/3] bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
          
          {/* ── LÓGICA DE IMAGEN RESPETANDO TU DISEÑO ── */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          ) : (
            <div className="text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500">
              <Tag className="h-16 w-16" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {category && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm capitalize border-none shadow-sm text-xs">
                {category}
              </Badge>
            )}
            {priceRange && (
              <Badge className="bg-primary/90 text-primary-foreground border-none shadow-sm text-xs">
                {priceRange}€
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
              {platformUrl && (
                <a 
                  href={platformUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()} 
                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                  title="Ver anuncio original"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded text-xs font-bold text-primary shrink-0 ml-2">
              {rating.toFixed(1)} <StarIcon className="h-3 w-3 fill-primary" />
            </div>
          </div>
          
          <div className="space-y-3 mt-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{city}</span>
            </div>
            
            {serviceType && (
              <div className="flex items-center text-xs font-medium text-muted-foreground/80 bg-secondary/50 w-fit px-2 py-1 rounded-md">
                {formatServiceType(serviceType)}
              </div>
            )}

            {/* ETIQUETAS ESPECÍFICAS (Físico, Rol, etc.) */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {/* Mostramos máximo 4 etiquetas para no saturar la tarjeta */}
                {tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-background text-muted-foreground/90 font-medium">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 4 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-secondary/50 text-muted-foreground border-dashed">
                    +{tags.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-5 py-3 border-t border-border/40 bg-secondary/10 flex justify-between items-center mt-auto shrink-0">
          <span className="text-xs text-muted-foreground">
            {reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}
          </span>
          <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Ver detalle
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}