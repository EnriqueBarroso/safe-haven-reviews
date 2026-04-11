import { Header } from "@/components/header"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { RecentProfilesSection } from "@/components/landing/recent-profiles-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <RecentProfilesSection />
      </main>
      <Footer />
    </div>
  )
}
