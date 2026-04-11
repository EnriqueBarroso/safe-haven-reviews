import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProfileCard } from "@/components/profile-card"
import { ArrowRight } from "lucide-react"

// Mock data for demonstration
const recentProfiles = [
  {
    id: "1",
    name: "Luna",
    city: "Barcelona",
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: "2",
    name: "Sofia",
    city: "Madrid",
    rating: 4.5,
    reviewCount: 18,
  },
  {
    id: "3",
    name: "Elena",
    city: "Valencia",
    rating: 4.9,
    reviewCount: 31,
  },
  {
    id: "4",
    name: "Isabella",
    city: "Seville",
    rating: 4.6,
    reviewCount: 15,
  },
  {
    id: "5",
    name: "Carmen",
    city: "Malaga",
    rating: 4.7,
    reviewCount: 22,
  },
  {
    id: "6",
    name: "Ana",
    city: "Bilbao",
    rating: 4.4,
    reviewCount: 12,
  },
]

export function RecentProfilesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Recently Reviewed
            </h2>
            <p className="mt-4 text-muted-foreground">
              Profiles with recent verified reviews from the community
            </p>
          </div>
          <Button variant="ghost" className="hidden gap-2 md:inline-flex" asChild>
            <Link href="/profiles">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentProfiles.map((profile) => (
            <ProfileCard key={profile.id} {...profile} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/profiles">
              View All Profiles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
