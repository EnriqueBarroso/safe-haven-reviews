import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Términos de Servicio — YaFui",
  description: "Condiciones de uso de la plataforma YaFui. Lee las normas antes de usar el servicio.",
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
          <p className="text-muted-foreground">Última actualización: Abril de 2026</p>
        </div>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6 text-muted-foreground">

        <p>Al acceder y utilizar YaFui, aceptas estar sujeto a estos términos. Si no estás de acuerdo con alguna parte, no debes usar la plataforma.</p>

        {/* 1 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Restricción de edad</h2>
        <div className="bg-destructive/5 border-l-4 border-destructive/50 p-4 rounded-r-lg">
          <p className="mb-0"><strong className="text-foreground">YaFui es una plataforma exclusiva para mayores de 18 años.</strong> Al registrarte, confirmas bajo tu responsabilidad que tienes al menos 18 años cumplidos. Cualquier cuenta perteneciente a un menor será eliminada de forma inmediata junto con todo su contenido, y podrán aplicarse las medidas legales correspondientes.</p>
        </div>

        {/* 2 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Uso aceptable del servicio</h2>
        <p>Te comprometes a utilizar YaFui únicamente para fines legales. Está prohibido:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Acosar, difamar, amenazar o intimidar a otros usuarios o a terceros.</li>
          <li>Publicar información falsa, inventada o malintencionada sobre perfiles o establecimientos.</li>
          <li>Compartir datos personales de terceros sin su consentimiento (nombre real, teléfono, dirección, etc.).</li>
          <li>Suplantar la identidad de otra persona o entidad.</li>
          <li>Publicar contenido sexual explícito, pornografía, o cualquier material que involucre a menores.</li>
          <li>Utilizar la plataforma para actividades comerciales no autorizadas, spam o autopromoción.</li>
          <li>Intentar vulnerar la seguridad del sitio, realizar ingeniería inversa o automatizar el acceso mediante bots.</li>
        </ul>

        {/* 3 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Registro y cuenta</h2>
        <p>Para publicar contenido debes crear una cuenta mediante correo electrónico. Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada bajo tu cuenta. Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos sin previo aviso.</p>

        {/* 4 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Contenido generado por el usuario</h2>
        <p>Tú eres el único responsable del contenido que publicas (reseñas, preguntas, respuestas, imágenes). YaFui actúa como un intermediario pasivo conforme al artículo 16 de la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI) y no se hace responsable de las opiniones vertidas por la comunidad.</p>
        <p>Al publicar contenido en YaFui, concedes a la plataforma una licencia no exclusiva, gratuita y mundial para mostrar, almacenar y distribuir dicho contenido dentro del servicio, exclusivamente con el fin de hacerlo accesible a otros usuarios. Esta licencia termina cuando eliminas tu contenido.</p>

        {/* 5 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Propiedad intelectual</h2>
        <p>El diseño, código, logotipos, textos originales y demás elementos de la plataforma YaFui son propiedad de sus autores y están protegidos por las leyes de propiedad intelectual.</p>
        <p>Te comprometes a no publicar contenido del que no seas titular o para el que no tengas los derechos necesarios. En particular, no publiques imágenes tomadas por terceros sin su autorización, ni textos protegidos por derechos de autor.</p>
        <p>Si consideras que algún contenido publicado en YaFui infringe tus derechos de propiedad intelectual, contáctanos en <a href="mailto:contacto@yafui.es" className="text-primary hover:underline">contacto@yafui.es</a> y lo revisaremos de forma prioritaria.</p>

        {/* 6 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Moderación y reportes</h2>
        <p>Contamos con un sistema de moderación y reportes comunitarios. Cualquier usuario puede reportar contenido que considere inapropiado mediante el botón de alerta disponible en cada publicación.</p>
        <p>Los administradores tienen la autoridad final para eliminar contenido que infrinja estos términos o las reglas de la comunidad, así como para suspender o eliminar cuentas de forma permanente. Las decisiones de moderación no son negociables, aunque puedes apelar escribiendo a <a href="mailto:contacto@yafui.es" className="text-primary hover:underline">contacto@yafui.es</a>.</p>

        {/* 7 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Limitación de responsabilidad</h2>
        <p>YaFui se ofrece "tal cual" y "según disponibilidad". En la máxima medida permitida por la ley:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>No garantizamos que el servicio esté libre de errores, interrupciones o vulnerabilidades.</li>
          <li>No nos hacemos responsables de la veracidad, exactitud ni legalidad del contenido publicado por los usuarios.</li>
          <li>No somos responsables de decisiones tomadas por los usuarios basándose en el contenido de la plataforma.</li>
          <li>No asumimos responsabilidad por daños indirectos, lucro cesante o pérdida de datos derivados del uso del servicio.</li>
        </ul>
        <p>El contenido publicado en YaFui refleja las opiniones individuales de sus autores y no representa la postura oficial de la plataforma.</p>

        {/* 8 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Suspensión y cierre del servicio</h2>
        <p>Nos reservamos el derecho de suspender, modificar o interrumpir el servicio de forma total o parcial en cualquier momento, con o sin previo aviso, sin que ello genere derecho a compensación para los usuarios.</p>

        {/* 9 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Modificaciones de los términos</h2>
        <p>Podemos actualizar estos Términos en cualquier momento. Los cambios sustanciales se comunicarán a través de la plataforma. El uso continuado del servicio tras una modificación implica la aceptación de los nuevos términos. La fecha de última actualización figura al inicio de esta página.</p>

        {/* 10 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Legislación aplicable y jurisdicción</h2>
        <p>Estos términos se rigen por la legislación española. Para cualquier controversia derivada del uso de YaFui, las partes se someten a los juzgados y tribunales de España, salvo que la normativa de consumidores y usuarios establezca otro fuero.</p>

        {/* 11 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Contacto</h2>
        <p>Para cualquier consulta relacionada con estos términos, escríbenos a <a href="mailto:contacto@yafui.es" className="text-primary hover:underline">contacto@yafui.es</a>.</p>

      </div>
    </div>
  )
}