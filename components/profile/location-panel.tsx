import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Shield } from "lucide-react"

interface LocationPanelProps {
  city: string
}

export function LocationPanel({ city }: LocationPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            General Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder map */}
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <p className="font-semibold">{city}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                General area only
              </p>
              <p className="mt-2 text-xs text-muted-foreground/60">
                Exact location not disclosed for privacy
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Privacy Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            All reviews are verified and published anonymously to protect both
            reviewers and reviewed individuals. Location data is generalized to
            city-level only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
