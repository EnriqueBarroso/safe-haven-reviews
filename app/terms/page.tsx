import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
    title: "Términos de Servicio | YaFui",
}

export default function TermsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[70vh]">
            <Button variant="ghost" asChild className="mb-8 gap-2 -ml-3 text-muted-foreground hover:text-foreground">
                <Link href="/">
                    <ArrowLeft className="h-4 w-4" /> Volver al inicio
                </Link>
            </Button>
            <div className="flex items-center gap-4 mb-8 border-b pb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Términos de Servicio</h1>
                    <p className="text-muted-foreground">Condiciones de uso de la plataforma</p>
                </div>
            </div>

            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>Al acceder y utilizar YaFui, aceptas estar sujeto a estos términos. Nuestra plataforma es un espacio libre para compartir opiniones, pero requiere responsabilidad por parte de sus usuarios.</p>

                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Uso del Servicio</h2>
                <p>Te comprometes a utilizar YaFui únicamente para fines legales y de acuerdo con estos Términos. No debes usar la plataforma para acosar, difamar o publicar información falsa y malintencionada sobre perfiles o establecimientos.</p>

                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Contenido generado por el usuario</h2>
                <p>Tú eres el único responsable del contenido que publicas. YaFui actúa como un intermediario pasivo y no se hace responsable de las opiniones vertidas por la comunidad, aunque nos reservamos el derecho de moderar o eliminar contenido que infrinja nuestras normas.</p>

                <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Moderación y Reportes</h2>
                <p>Contamos con un sistema de moderación activa y reportes comunitarios. Los administradores tienen la autoridad final para eliminar reseñas tóxicas, falsas o que vulneren la privacidad de terceros.</p>
            </div>
        </div>
    )
}