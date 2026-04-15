import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

interface FirmaUsuarioProps {
  alias: string
  avatarUrl: string
  variant?: "review" | "question"
}

export function FirmaUsuario({ alias, avatarUrl, variant = "review" }: FirmaUsuarioProps) {
  return (
    <div
      className={`p-4 rounded-xl border flex items-center gap-4 ${
        variant === "question"
          ? "bg-amber-500/5 border-amber-200/50"
          : "bg-secondary/40 border-border"
      }`}
    >
      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-background bg-secondary shadow-sm shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Firmando como:
        </p>
        <p className="text-lg font-bold text-foreground">{alias}</p>
      </div>
      <Button variant="outline" size="sm" asChild className="shrink-0 text-xs">
        <Link href="/dashboard">Cambiar firma</Link>
      </Button>
    </div>
  )
}