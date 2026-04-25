import Link from "next/link"
import { Mail, ArrowLeft, MessageSquare, ShieldCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const metadata = {
  title: "Contacto Seguro — YaFui",
  description: "Contacta con el equipo de YaFui de forma segura y privada.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[70vh]">
      <Button variant="ghost" asChild className="mb-8 gap-2 -ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </Button>

      <div className="flex items-center gap-4 mb-10 border-b pb-6">
        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacto Seguro</h1>
          <p className="text-muted-foreground">Estamos aquí para escucharte</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            ¿Tienes alguna sugerencia, has encontrado un error o necesitas ayuda con tu cuenta?
            Utilizamos canales seguros para garantizar que tu comunicación sea privada.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Privacidad Total</p>
                <p className="text-xs text-muted-foreground">Nunca compartiremos tu dirección de correo con terceros ni la vincularemos a tus reseñas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Soporte Directo</p>
                <p className="text-xs text-muted-foreground">Respondemos a todas las consultas en un plazo de 24-48 horas laborables.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Motivos de contacto</p>
                <p className="text-xs text-muted-foreground">Problemas con tu cuenta, reportar contenido, sugerencias, errores técnicos o solicitudes de eliminación de datos.</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Canal Oficial</CardTitle>
            <CardDescription>Escríbenos por correo electrónico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg border border-dashed text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Email de soporte</p>
              {/* TODO: Cambiar por el email definitivo (contacto@yafui.es) */}
              <a
                href="mailto:contacto@yafui.es"
                className="text-lg font-bold text-primary hover:underline"
              >
                contacto@yafui.es
              </a>
            </div>
            <p className="text-[11px] text-center text-muted-foreground">
              Incluye tu <span className="font-semibold">alias de usuario</span> si el problema está relacionado con tu cuenta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}