import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfileHeader } from "@/components/profile/profile-header"
import { RatingsBreakdown } from "@/components/profile/ratings-breakdown"
import { ReviewsFeed } from "@/components/profile/reviews-feed"
import { LocationPanel } from "@/components/profile/location-panel"

// Mock data for demonstration
const mockProfile = {
  id: "1",
  name: "Luna",
  city: "Barcelona",
  rating: 4.8,
  reviewCount: 24,
  ratings: {
    veracity: 4.9,
    punctuality: 4.7,
    communication: 4.8,
    hygiene: 4.9,
    overall: 4.8,
  },
}

const mockReviews = [
  {
    id: "r1",
    alias: "User4521",
    date: "2026-04-05",
    rating: 5,
    veracity: 5,
    punctuality: 5,
    communication: 5,
    hygiene: 5,
    overall: 5,
    price: 150,
    duration: 60,
    comment:
      "Excellent experience overall. Very professional and punctual. The photos were 100% accurate and the communication was great from start to finish. Highly recommend.",
  },
  {
    id: "r2",
    alias: "User8834",
    date: "2026-03-28",
    rating: 4,
    veracity: 4,
    punctuality: 5,
    communication: 4,
    hygiene: 5,
    overall: 4,
    price: 150,
    duration: 60,
    comment:
      "Good experience. Arrived on time and the environment was very clean. Communication could have been slightly better but overall satisfied with the encounter.",
  },
  {
    id: "r3",
    alias: "User2167",
    date: "2026-03-15",
    rating: 5,
    veracity: 5,
    punctuality: 4,
    communication: 5,
    hygiene: 5,
    overall: 5,
    price: 200,
    duration: 90,
    comment:
      "Outstanding service. Very friendly and professional. The extended session was worth every euro. Will definitely return.",
  },
  {
    id: "r4",
    alias: "User9453",
    date: "2026-03-02",
    rating: 5,
    veracity: 5,
    punctuality: 5,
    communication: 5,
    hygiene: 5,
    overall: 5,
    price: 150,
    duration: 60,
    comment:
      "Perfect in every way. Photos match reality, punctual, great communicator, and very hygienic environment. One of the best experiences I have had.",
  },
]

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  // In a real app, fetch profile data based on id
  console.log("Profile ID:", id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="space-y-8 lg:col-span-2">
              <ProfileHeader profile={mockProfile} />
              <RatingsBreakdown ratings={mockProfile.ratings} />
              <ReviewsFeed reviews={mockReviews} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <LocationPanel city={mockProfile.city} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
