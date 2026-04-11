import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Mail, Calendar, Settings } from "lucide-react"

interface DashboardProfileProps {
  user: {
    pseudonym: string
    email: string
    joinedDate: string
  }
}

export function DashboardProfile({ user }: DashboardProfileProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Profile</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pseudonym */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{user.pseudonym}</p>
          <p className="mt-1 text-sm text-muted-foreground">Your public pseudonym</p>
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Email (Private)</p>
              <p className="truncate font-medium">{user.email}</p>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">{formatDate(user.joinedDate)}</p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Your privacy is protected</p>
              <p className="mt-1 text-muted-foreground">
                Your email is never shared. All your reviews are published under your pseudonym.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
