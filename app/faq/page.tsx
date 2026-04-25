import Link from "next/link"
import { HelpCircle, ArrowLeft, Shield, MessageSquare, Star, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Centro de Ayuda — YaFui",
  description: "Resuelve tus dudas sobre cómo funciona YaFui: anonimato, reseñas, foro, cuenta y privacidad.",
}

const CATEGORIES = [
  {
    icon: Shield,
    title: "Privacidad y anonimato",
    items: [
      {
        q: "¿Es realmente anónimo?",
        a: "Sí. Nadie en la comunidad puede ver tu correo electrónico ni tu nombre real. Solo se muestra el alias que elijas. Además, no rastreamos tu actividad para fines publicitarios ni vendemos datos a terceros.",
      },
      {
        q: "¿Puedo cambiar mi alias?",
        a: "Sí. Desde tu panel de control (Mi Panel), en la sección de identidad, puedes modificar tu alias y avatar en cualquier momento. El cambio se aplicará retroactivamente a todas tus publicaciones.",
      },
      {
        q: "¿Usáis cookies o rastreo?",
        a: "Solo utilizamos cookies técnicas esenciales para mantener tu sesión iniciada. No usamos cookies de publicidad, analítica invasiva ni rastreo entre sitios. Puedes consultar los detalles en nuestra Política de Privacidad.",
      },
      {
        q: "¿Dónde se almacenan mis datos?",
        a: "En servidores de Supabase ubicados en la Unión Europea, bajo normativa RGPD. Las comunicaciones están cifradas con HTTPS/TLS y el acceso a la base de datos está restringido por políticas de seguridad a nivel de fila (RLS).",
      },
    ],
  },
  {
    icon: Star,
    title: "Publicar reseñas y preguntas",
    items: [
      {
        q: "¿Cómo publico una reseña?",
        a: "Busca el perfil de la persona en el explorador o créalo si no existe. Una vez en el perfil, pulsa \"Escribir reseña o preguntar\" y elige la opción \"Escribir Reseña\". Completa las valoraciones, cuenta tu experiencia y añade fotos si quieres.",
      },
      {
        q: "¿Cuál es la diferencia entre una reseña y una pregunta del foro?",
        a: "Una reseña es un testimonio de primera mano con valoraciones numéricas basadas en una experiencia real. Una pregunta del foro es una consulta a la comunidad: ideal para preguntar si alguien tiene referencias, si las fotos son reales, o para pedir información antes de tomar una decisión.",
      },
      {
        q: "¿Puedo responder a una reseña o pregunta de otro usuario?",
        a: "Sí. Cada publicación tiene un botón \"Responder\" inline que te permite añadir un comentario anidado. Las respuestas pueden incluir valoraciones opcionales y se muestran indentadas bajo el mensaje original.",
      },
      {
        q: "¿Qué pasa si el perfil sobre el que quiero escribir no existe?",
        a: "Puedes crearlo tú mismo desde el formulario de reseña o pregunta. Introduce el nombre, ciudad y algunos datos básicos, y el sistema generará automáticamente un perfil nuevo con su URL amigable.",
      },
      {
        q: "¿Puedo adjuntar imágenes?",
        a: "Sí. Las reseñas admiten hasta 5 imágenes. Las preguntas del foro admiten una imagen adjunta. Te recomendamos subir solo imágenes propias o de las que tengas derechos, y nunca fotos íntimas sin consentimiento.",
      },
    ],
  },
  {
    icon: UserCog,
    title: "Gestión de tu cuenta",
    items: [
      {
        q: "¿Puedo borrar algo que he publicado?",
        a: "Por supuesto. En tu panel de control (Mi Panel) tienes una lista de todas tus aportaciones. Desde allí puedes editar o borrar cualquier mensaje de forma inmediata. El borrado es permanente e irreversible.",
      },
      {
        q: "¿Puedo eliminar mi cuenta completa?",
        a: "Sí. Escríbenos a contacto@yafui.es solicitando la eliminación de tu cuenta. Borraremos tus datos y todo tu contenido de forma permanente en un plazo máximo de 30 días, conforme al RGPD.",
      },
      {
        q: "He olvidado mi contraseña, ¿qué hago?",
        a: "Usamos autenticación sin contraseña: al iniciar sesión recibirás un enlace mágico en tu correo. Solo necesitas tener acceso a tu email para entrar.",
      },
      {
        q: "¿Qué edad mínima hay que tener?",
        a: "YaFui es una plataforma para mayores de 18 años. Si detectamos que una cuenta pertenece a un menor, la eliminaremos de forma inmediata junto con todo su contenido.",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "Moderación y reportes",
    items: [
      {
        q: "¿Qué hago si veo una reseña ofensiva, falsa o abusiva?",
        a: "Cada publicación tiene un icono de alerta. Al pulsarlo, podrás enviar un reporte a los administradores indicando el motivo (contenido falso, acoso, datos personales, etc.). Revisaremos el contenido y lo eliminaremos si incumple las reglas.",
      },
      {
        q: "¿Cuánto tardáis en revisar un reporte?",
        a: "Revisamos los reportes en un plazo de 24-48 horas laborables. Los casos graves (contenido que involucra menores, amenazas, datos personales expuestos) se tratan con prioridad y pueden resolverse en horas.",
      },
      {
        q: "¿Puedo apelar una decisión de moderación?",
        a: "Sí. Si consideras que se ha eliminado contenido tuyo de forma injusta, escríbenos a contacto@yafui.es explicando el caso. Revisaremos la decisión.",
      },
      {
        q: "¿Alguien ha publicado datos míos sin permiso, qué puedo hacer?",
        a: "Reporta la publicación inmediatamente desde el botón de alerta. Si el caso es urgente o grave, escríbenos directamente a contacto@yafui.es y actuaremos con prioridad.",
      },
    ],
  },
]

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

      <div className="space-y-10">
        {CATEGORIES.map((cat, ci) => {
          const Icon = cat.icon
          return (
            <section key={ci}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{cat.title}</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`${ci}-${i}`}>
                    <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )
        })}

        <div className="bg-secondary/30 p-6 rounded-xl border text-center">
          <h3 className="font-semibold mb-2">¿No encuentras lo que buscas?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Si tienes una duda técnica o un problema específico, escríbenos directamente.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">Ir a Contacto Seguro</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}