import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react"

export async function CtaSection() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <section aria-labelledby="heading-cta" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 id="heading-cta" className="text-3xl md:text-4xl font-bold mb-6">
          {user ? "Sigue aportando a la comunidad" : "¿Listo para unirte a la comunidad?"}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          {user
            ? "Tu panel de control te espera para gestionar tus reseñas y tu identidad anónima."
            : "Crear una cuenta es gratis, rápido y no te pediremos ningún dato personal más allá de tu correo electrónico."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Button size="lg" asChild className="h-14 px-8 text-lg">
              <Link href="/dashboard">
                Ir a mi Panel <LayoutDashboard className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="h-14 px-8 text-lg">
                <Link href="/auth/register">
                  Crear cuenta gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <LogIn className="h-4 w-4" /> Ya tengo cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
