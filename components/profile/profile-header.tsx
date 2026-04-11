import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/star-rating"
import { MapPin, MessageSquare, PenLine, Share2 } from "lucide-react"
import Link from "next/link"

interface ProfileHeaderProps {
  profile: {
    id: string
    name: string
    city: string
    rating: number
    reviewCount: number
  }
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Profile Image */}
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-secondary md:h-40 md:w-40">
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-5xl font-semibold text-muted-foreground md:text-6xl">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.city}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button size="sm" className="gap-2" asChild>
                  <Link href="/submit-review">
                    <PenLine className="h-4 w-4" />
                    Write Review
                  </Link>
                </Button>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-primary">
                  {profile.rating.toFixed(1)}
                </div>
                <div>
                  <StarRating rating={Math.round(profile.rating)} size="md" />
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Average rating
                  </p>
                </div>
              </div>

              <div className="h-12 w-px bg-border" />

              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{profile.reviewCount}</p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
