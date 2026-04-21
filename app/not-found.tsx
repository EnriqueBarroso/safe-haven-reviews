import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <img src="/yafui-logo-compact.png" alt="YaFui" className="h-12 w-auto mx-auto" />
      </div>
      <h1 className="text-7xl font-light tracking-tighter mb-2">
        <span className="text-[#00ff87]">4</span>
        <span className="text-muted-foreground">0</span>
        <span className="text-[#ff00e5]">4</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-2">Aquí no hay nadie</p>
      <p className="text-sm text-muted-foreground/60 mb-8">La página que buscas no existe o ha sido movida.</p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/profiles">Explorar perfiles</Link>
        </Button>
      </div>
    </div>
  )
}