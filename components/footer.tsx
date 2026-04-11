import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">ReviewSphere</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A trusted, private community platform for verified reviews. Your privacy is our priority.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/profiles" className="text-muted-foreground transition-colors hover:text-foreground">
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link href="/submit-review" className="text-muted-foreground transition-colors hover:text-foreground">
                  Submit Review
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-muted-foreground transition-colors hover:text-foreground">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} ReviewSphere. All rights reserved.</p>
          <p>Your privacy is protected.</p>
        </div>
      </div>
    </footer>
  )
}
