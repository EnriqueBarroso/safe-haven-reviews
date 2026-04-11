import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardProfile } from "@/components/dashboard/dashboard-profile"
import { MyReviews } from "@/components/dashboard/my-reviews"

// Mock user data
const mockUser = {
  pseudonym: "User4521",
  email: "user@example.com",
  joinedDate: "2025-11-15",
}

// Mock reviews data
const mockMyReviews = [
  {
    id: "1",
    profileName: "Luna",
    profileCity: "Barcelona",
    status: "published" as const,
    rating: 5,
    date: "2026-04-05",
  },
  {
    id: "2",
    profileName: "Sofia",
    profileCity: "Madrid",
    status: "published" as const,
    rating: 4,
    date: "2026-03-20",
  },
  {
    id: "3",
    profileName: "Elena",
    profileCity: "Valencia",
    status: "draft" as const,
    rating: 0,
    date: "2026-04-08",
  },
  {
    id: "4",
    profileName: "Carmen",
    profileCity: "Malaga",
    status: "pending" as const,
    rating: 4,
    date: "2026-04-09",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your profile and reviews
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <DashboardProfile user={mockUser} />
            </div>

            {/* Reviews Section */}
            <div className="lg:col-span-2">
              <MyReviews reviews={mockMyReviews} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
