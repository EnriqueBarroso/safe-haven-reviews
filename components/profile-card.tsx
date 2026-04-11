import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/star-rating"
import { MapPin, MessageSquare } from "lucide-react"

interface ProfileCardProps {
  id: string
  name: string
  city: string
  rating: number
  reviewCount: number
  imageUrl?: string
}

export function ProfileCard({
  id,
  name,
  city,
  rating,
  reviewCount,
  imageUrl,
}: ProfileCardProps) {
  return (
    <Link href={`/profile/${id}`}>
      <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <span className="text-4xl font-semibold text-muted-foreground">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{city}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <StarRating rating={Math.round(rating)} size="sm" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{reviewCount} reviews</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
