"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Search, Lock, PlusSquare } from "lucide-react"

export function HeroSection() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Obtenemos la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchamos cambios reales (login/logout) para que el botón reaccione al instante
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Lock className="h-4 w-4" /> Comunidad 100% Anónima
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          La base de datos de confianza para <span className="text-primary">tus consultas</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Comparte experiencias, pregunta a otros usuarios y verifica perfiles antes de tu próximo encuentro.
        </p>
        
        {/* BOTONES PRINCIPALES: Siempre visibles para fomentar la participación */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/20">
            <Link href="/profiles">
              <Search className="mr-2 h-5 w-5" /> Explorar Reseñas
            </Link>
          </Button>
          
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 text-lg bg-background/50 backdrop-blur border-primary/50 hover:bg-primary/10 transition-all">
            <Link href="/submit-review">
              <PlusSquare className="mr-2 h-5 w-5 text-primary" /> 
              {session ? "Publicar Experiencia" : "Unirse y Publicar"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}