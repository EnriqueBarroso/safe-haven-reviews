import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StarIcon } from "lucide-react"

interface Stats {
  totalReviews: number
  overallAverage: number
  veracityAvg: number
  punctualityAvg: number
  communicationAvg: number
  hygieneAvg: number
}

interface StatsPanelProps {
  profile: { id: string; name: string }
  stats: Stats
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array(5).fill(0).map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(rating)
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  )
}

const STATS_ROWS = [
  { key: "veracityAvg" as const, label: "Veracidad de fotos" },
  { key: "punctualityAvg" as const, label: "Puntualidad" },
  { key: "communicationAvg" as const, label: "Comunicación" },
  { key: "hygieneAvg" as const, label: "Higiene y limpieza" },
]

export function StatsPanel({ profile, stats }: StatsPanelProps) {
  return (
    <Card className="sticky top-24 border-primary/20 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle>Valoración Global</CardTitle>
        <div className="flex flex-col items-center justify-center mt-4">
          <span className="text-5xl font-black tracking-tighter">
            {stats.overallAverage || "-"}
          </span>
          <div className="mt-2 mb-1">
            <Stars rating={stats.overallAverage || 0} />
          </div>
          <CardDescription>
            Basado en {stats.totalReviews} interacciones
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        {STATS_ROWS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span className="font-medium">{stats[key]}/5</span>
            </div>
            <Progress value={(stats[key] / 5) * 100} className="h-2" />
          </div>
        ))}

        <div className="pt-6 border-t">
          <Button className="w-full h-12 text-base font-bold" size="lg" asChild>
            <Link
              href={`/submit-review?profileId=${profile.id}&name=${encodeURIComponent(profile.name)}`}
            >
              Escribir reseña o Preguntar
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3 italic">
            ¿Conoces a {profile.name}? Comparte tu experiencia para ayudar a otros.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}