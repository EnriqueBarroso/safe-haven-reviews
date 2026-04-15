"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutDashboard, Search } from "lucide-react"

export function CtaSection() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {session ? "Sigue aportando a la comunidad" : "¿Listo para unirte a la comunidad?"}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          {session 
            ? "Tu panel de control te espera para gestionar tus reseñas y tu identidad anónima."
            : "Crear una cuenta es gratis, rápido y no te pediremos ningún dato personal más allá de tu correo electrónico."}
        </p>
        
        <div className="flex justify-center gap-4">
          {session ? (
            <Button size="lg" asChild className="h-14 px-8 text-lg">
              <Link href="/dashboard">
                Ir a mi Panel <LayoutDashboard className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild className="h-14 px-8 text-lg">
              <Link href="/auth/register">
                Crear mi cuenta anónima <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}