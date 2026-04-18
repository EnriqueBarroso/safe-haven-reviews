"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2, Lock, Star, MessageSquare, ArrowLeft } from "lucide-react"

export default function SubmitReviewLanding() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function init() {
      const { data: { session: s } } = await supabase.auth.getSession()
      setSession(s)
      setIsLoadingSession(false)
    }
    init()
  }, [])

  if (isLoadingSession) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-md text-center">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Zona Restringida</h1>
        <p className="text-muted-foreground mb-8">Debes estar registrado para publicar.</p>
        <div className="flex flex-col gap-3">
          <Button size="lg" asChild><Link href="/auth/register">Crear cuenta anónima</Link></Button>
          <Button variant="outline" asChild><Link href="/auth/signin">Ya tengo cuenta</Link></Button>
          <Button variant="ghost" asChild className="mt-4"><Link href="/">Volver al inicio</Link></Button>
        </div>
      </div>
    )
  }

  // Propagar query params a las sub-rutas
  const params = searchParams.toString()
  const qs = params ? `?${params}` : ""

  const backPath = searchParams.get("profileId")
    ? `/profiles/${searchParams.get("profileId")}`
    : "/"

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6 gap-2 -ml-3">
        <Link href={backPath}><ArrowLeft className="h-4 w-4" /> Volver</Link>
      </Button>

      <h1 className="text-2xl font-bold mb-2">¿Qué quieres publicar?</h1>
      <p className="text-muted-foreground mb-8">Elige una opción para continuar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => router.push(`/submit-review/review${qs}`)}
          className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-border bg-card text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Star className="h-8 w-8" />
          </div>
          <span className="font-semibold text-lg">Escribir Reseña</span>
          <span className="text-sm text-center opacity-70">
            Comparte tu experiencia con valoraciones, fotos y detalles
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push(`/submit-review/question${qs}`)}
          className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-border bg-card text-muted-foreground hover:border-amber-500 hover:bg-amber-500/5 hover:text-amber-600 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <MessageSquare className="h-8 w-8" />
          </div>
          <span className="font-semibold text-lg">Abrir Hilo o Preguntar</span>
          <span className="text-sm text-center opacity-70">
            Consulta algo a la comunidad sobre un perfil
          </span>
        </button>
      </div>
    </div>
  )
}