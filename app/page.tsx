import { Header } from "@/components/header"

export const metadata = {
  title: "YaFui — Reseñas sinceras de la comunidad",
  description: "Foro de reseñas y preguntas sobre experiencias reales. Anónimo, seguro y verificado por la comunidad.",
}

import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { RecentProfilesSection } from "@/components/landing/recent-profiles-section"
import { Footer } from "@/components/footer"
import { CtaSection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <RecentProfilesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
