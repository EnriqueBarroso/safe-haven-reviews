import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-background mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-16">
          
          {/* Columna 1: Marca y Descripción */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">ReviewSphere</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La comunidad segura y anónima para descubrir y compartir experiencias reales. Tu privacidad es nuestra prioridad.
            </p>
          </div>

          {/* Columna 2: Plataforma */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Plataforma</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/profiles" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Explorar Reseñas
                </Link>
              </li>
              <li>
                <Link href="/submit-review" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Publicar una Opinión
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal y Privacidad */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Privacidad y Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Reglas de la Comunidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Soporte */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Ayuda</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Centro de Ayuda (FAQ)
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contacto Seguro
                </Link>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Separador y Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ReviewSphere. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Hecho con discreción para la comunidad.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}