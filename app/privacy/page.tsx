import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Política de Privacidad | YaFui",
  description: "Nuestra política de privacidad y cómo protegemos tus datos.",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[70vh]">
      {/* BOTÓN VOLVER ATRÁS */}
      <Button variant="ghost" asChild className="mb-8 gap-2 -ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </Button>
      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidad</h1>
          <p className="text-muted-foreground">Última actualización: Abril de 2026</p>
        </div>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>En YaFui, tu privacidad no es solo una promesa, es la base de nuestra plataforma. Hemos diseñado nuestro sistema para garantizar que puedas compartir tus experiencias de forma totalmente anónima y segura.</p>
        
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Datos que recopilamos</h2>
        <p>Solo recopilamos la información estrictamente necesaria para el funcionamiento básico del servicio:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Datos de cuenta:</strong> Tu dirección de correo electrónico (para la autenticación segura).</li>
          <li><strong>Datos públicos:</strong> El alias que elijas y el contenido de las reseñas o foros que decidas publicar.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Anonimato garantizado</h2>
        <p>Tus reseñas y comentarios en el foro nunca se vinculan públicamente a tu correo electrónico. Tu identidad real se mantiene oculta tras el alias que configures en tu perfil, el cual puedes cambiar en cualquier momento.</p>

        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Eliminación de datos</h2>
        <p>Tienes el control total de tu información. Si decides borrar una reseña, un comentario o tu cuenta por completo, los datos se eliminan de forma permanente e irreversible de nuestros servidores mediante el sistema de borrado en cascada.</p>
      </div>
    </div>
  )
}