"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, Lock, Eye } from "lucide-react"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-background py-24 md:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(64,180,166,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(64,180,166,0.05),transparent_50%)]" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Shield className="h-4 w-4" />
            <span>Privacy-First Community Platform</span>
          </div>
          
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Trusted Reviews,{" "}
            <span className="text-primary">Complete Privacy</span>
          </h1>
          
          <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
            A secure, community-driven platform for verified reviews. Browse anonymously, contribute safely, and make informed decisions with honest experiences from real users.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by Name, City, or Service Type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-xl border-border/60 bg-secondary/50 pl-12 pr-32 text-base placeholder:text-muted-foreground/60 focus-visible:ring-primary"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Anonymous Browsing</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Verified Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
