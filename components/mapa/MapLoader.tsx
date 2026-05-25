"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import type { MapProfile } from "./MapView"

function MapSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-secondary/30 animate-pulse">
      <MapPin className="h-10 w-10 text-primary/30 animate-bounce" />
    </div>
  )
}

const MapView = dynamic(
  () => import("./MapView").then((m) => ({ default: m.MapView })),
  { ssr: false, loading: () => <MapSkeleton /> },
)

export function MapLoader({ profiles }: { profiles: MapProfile[] }) {
  return <MapView profiles={profiles} />
}
