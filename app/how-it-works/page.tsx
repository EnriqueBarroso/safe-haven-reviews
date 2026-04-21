import Link from "next/link"

export const metadata = {
  title: "Cómo Funciona — YaFui",
  description: "Descubre cómo funciona YaFui: publica reseñas anónimas, pregunta en el foro y consulta experiencias verificadas.",
}

import { Button } from "@/components/ui/button"
import { ShieldCheck, Search, MessageSquare, ExternalLink, UserCheck, AlertTriangle } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      
      {/* Cabecera */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Complicidad entre clientes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          YaFui no es una página de anuncios. Somos una comunidad anónima y segura donde los usuarios comparten experiencias reales para evitar sorpresas y estafas.
        </p>
      </div>

      {/* Sección Paso a Paso */}
      <div className="space-y-12 mb-20">
        <h2 className="text-2xl font-bold text-center mb-8">¿Cómo utilizamos la plataforma?</h2>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-secondary/30 p-6 rounded-2xl border border-border/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-primary/5 text-9xl font-black">1</div>
            <Search className="h-10 w-10 text-primary mb-4 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Busca y Compara</h3>
            <p className="text-muted-foreground text-sm relative z-10">
              Filtra por ciudad, categoría (independientes, agencias, masajes) o rango de precio. Antes de contactar con un anuncio, busca aquí si alguien más ya ha tenido una experiencia.
            </p>
          </div>

          <div className="bg-secondary/30 p-6 rounded-2xl border border-border/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-primary/5 text-9xl font-black">2</div>
            <ExternalLink className="h-10 w-10 text-primary mb-4 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Verifica el Anuncio</h3>
            <p className="text-muted-foreground text-sm relative z-10">
              Nuestras reseñas incluyen (siempre que es posible) un enlace directo al anuncio original en plataformas externas. Así te aseguras de que estás leyendo sobre la persona correcta.
            </p>
          </div>

          <div className="bg-secondary/30 p-6 rounded-2xl border border-border/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-primary/5 text-9xl font-black">3</div>
            <MessageSquare className="h-10 w-10 text-primary mb-4 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Aporta tu Experiencia</h3>
            <p className="text-muted-foreground text-sm relative z-10">
              ¿Tuviste una cita? Vuelve y deja tu reseña. Valora la veracidad de las fotos, la higiene y el trato. Tu aportación anónima es lo que mantiene viva a la comunidad.
            </p>
          </div>
        </div>
      </div>

      {/* Reglas de Oro */}
      <div className="bg-card border shadow-lg rounded-3xl p-8 md:p-12 mb-20">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <h2 className="text-3xl font-bold">Las Reglas de Oro</h2>
        </div>
        <p className="text-muted-foreground mb-8 text-lg">
          Para que esta plataforma funcione y sea un lugar útil para todos, somos muy estrictos con la calidad de la información.
        </p>
        
        <ul className="space-y-6">
          <li className="flex items-start gap-4">
            <div className="bg-green-500/10 p-2 rounded-full text-green-500 shrink-0 mt-1">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg">100% Anonimato Garantizado</h4>
              <p className="text-muted-foreground">Nunca compartiremos tu correo electrónico ni tu IP. Usa tu pseudónimo generado para publicar. Lo que pasa en YaFui, se queda en YaFui.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-green-500/10 p-2 rounded-full text-green-500 shrink-0 mt-1">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Respeto por encima de todo</h4>
              <p className="text-muted-foreground">Valoramos servicios, no atacamos personas. Está estrictamente prohibido el uso de insultos, publicar datos personales privados (DNI, direcciones exactas de domicilios no comerciales) o contenido difamatorio sin base.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="bg-green-500/10 p-2 rounded-full text-green-500 shrink-0 mt-1">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Exige Pruebas (Enlaces)</h4>
              <p className="text-muted-foreground">Si vas a reseñar un perfil nuevo, te pedimos encarecidamente que adjuntes el enlace a su anuncio original. Las reseñas sin enlace son menos fiables para el resto de la comunidad.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Llamada a la acción */}
      <div className="text-center bg-primary/5 rounded-3xl p-10 border border-primary/20">
        <h2 className="text-2xl font-bold mb-4">¿Preparado para empezar?</h2>
        <p className="text-muted-foreground mb-8">Únete a cientos de usuarios que ya están compartiendo la realidad detrás de los anuncios.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild className="h-14 px-8">
            <Link href="/auth/register">Crear Cuenta Gratuita</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-14 px-8">
            <Link href="/profiles">Solo quiero explorar</Link>
          </Button>
        </div>
      </div>

    </div>
  )
}