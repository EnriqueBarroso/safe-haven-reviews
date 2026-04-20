import Link from "next/link"
import { HelpCircle, ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Centro de Ayuda | YaFui",
}

export default function FAQPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[70vh]">
      <Button variant="ghost" asChild className="mb-8 gap-2 -ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </Button>

      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Ayuda</h1>
          <p className="text-muted-foreground">Preguntas frecuentes y soporte</p>
        </div>
      </div>

      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>¿Es realmente anónimo?</AccordionTrigger>
            <AccordionContent>
              Sí. Nadie en la comunidad puede ver tu correo electrónico ni tu nombre real. Solo se muestra el alias que elijas. Además, no rastreamos tu actividad para fines publicitarios.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>¿Cómo publico una reseña?</AccordionTrigger>
            <AccordionContent>
              Es muy sencillo: busca el perfil de la persona o entidad, pulsa en "Publicar Reseña", elige una puntuación y escribe tu experiencia. Si el perfil no existe, puedes crearlo tú mismo desde la sección "Explorar".
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>¿Puedo borrar algo que he publicado?</AccordionTrigger>
            <AccordionContent>
              Por supuesto. En tu panel de control ("Mi Panel") tienes una lista de todas tus aportaciones. Desde allí puedes editar o borrar cualquier mensaje de forma inmediata.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>¿Qué hago si veo una reseña ofensiva o falsa?</AccordionTrigger>
            <AccordionContent>
              Cada reseña tiene un icono de alerta. Si pulsas en él, podrás enviar un reporte a los administradores indicando el motivo. Nosotros revisaremos el contenido y lo eliminaremos si incumple las reglas.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="bg-secondary/30 p-6 rounded-xl border mt-10 text-center">
          <h3 className="font-semibold mb-2">¿No encuentras lo que buscas?</h3>
          <p className="text-sm text-muted-foreground mb-4">Si tienes una duda técnica o un problema específico, escríbenos directamente.</p>
          <Button asChild variant="outline">
            <Link href="/contact">Ir a Contacto Seguro</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}