import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Política de Privacidad — YaFui",
  description: "Cómo protegemos tu privacidad y tus datos en YaFui. Anonimato, cookies, derechos GDPR y servicios de terceros.",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[70vh]">
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

        {/* 1 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Responsable del tratamiento</h2>
        <p>El responsable del tratamiento de tus datos es el equipo de YaFui. Para cualquier consulta relacionada con la privacidad, puedes escribirnos a <a href="mailto:contacto@yafui.es" className="text-primary hover:underline">contacto@yafui.es</a>.</p>

        {/* 2 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Datos que recopilamos</h2>
        <p>Solo recopilamos la información estrictamente necesaria para el funcionamiento del servicio:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Datos de cuenta:</strong> Tu dirección de correo electrónico, utilizada exclusivamente para la autenticación segura.</li>
          <li><strong>Datos de perfil:</strong> El alias y avatar que elijas. Son los únicos datos visibles para la comunidad.</li>
          <li><strong>Contenido publicado:</strong> Reseñas, preguntas del foro, respuestas e imágenes que decidas compartir voluntariamente.</li>
          <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador y sistema operativo, recopilados automáticamente por nuestros proveedores de infraestructura para garantizar la seguridad y el rendimiento del servicio.</li>
        </ul>
        <p>No recopilamos nombre real, dirección postal, teléfono ni datos de pago.</p>

        {/* 3 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Finalidad del tratamiento</h2>
        <p>Utilizamos tus datos exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Gestionar tu cuenta y autenticación.</li>
          <li>Publicar el contenido que generes bajo tu alias anónimo.</li>
          <li>Moderar la plataforma y prevenir abusos.</li>
          <li>Mejorar el rendimiento y la seguridad del servicio.</li>
        </ul>
        <p>No utilizamos tus datos con fines publicitarios, de marketing ni para elaborar perfiles comerciales.</p>

        {/* 4 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Anonimato garantizado</h2>
        <p>Tus reseñas y comentarios en el foro nunca se vinculan públicamente a tu correo electrónico. Tu identidad real se mantiene oculta tras el alias que configures en tu perfil, el cual puedes cambiar en cualquier momento desde tu panel de control.</p>

        {/* 5 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Servicios de terceros</h2>
        <p>Para el funcionamiento de YaFui utilizamos los siguientes proveedores externos, todos ellos con políticas de privacidad propias y conformes con estándares internacionales de protección de datos:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Supabase</strong> (base de datos y autenticación): Almacena los datos de cuentas, contenido y archivos. Servidores ubicados en la Unión Europea. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de privacidad de Supabase</a>.</li>
          <li><strong>Vercel</strong> (hosting y despliegue): Sirve la aplicación web. Puede procesar datos técnicos como la dirección IP para el funcionamiento del servicio. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de privacidad de Vercel</a>.</li>
          <li><strong>Vercel Analytics</strong> (analítica web): Recopila datos de uso anónimos y agregados (páginas visitadas, rendimiento) sin cookies ni identificación personal. <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Más información</a>.</li>
        </ul>

        {/* 6 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Cookies</h2>
        <p>YaFui utiliza únicamente cookies técnicas esenciales para el funcionamiento de la plataforma:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Cookies de sesión:</strong> Necesarias para mantener tu sesión activa tras iniciar sesión. Se eliminan al cerrar el navegador o al expirar la sesión.</li>
          <li><strong>Cookies de autenticación:</strong> Generadas por Supabase Auth para gestionar el acceso seguro a tu cuenta.</li>
        </ul>
        <p>No utilizamos cookies de publicidad, de seguimiento ni de terceros con fines comerciales. Por este motivo, no mostramos banner de cookies, ya que las cookies técnicas esenciales están exentas del requisito de consentimiento según la normativa europea.</p>

        {/* 7 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Retención de datos</h2>
        <p>Conservamos tus datos mientras mantengas una cuenta activa en la plataforma. Los plazos específicos son:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Datos de cuenta:</strong> Mientras la cuenta esté activa.</li>
          <li><strong>Contenido publicado:</strong> Mientras no lo elimines manualmente o solicites su borrado.</li>
          <li><strong>Datos técnicos (logs):</strong> Máximo 90 días, gestionados automáticamente por Vercel y Supabase.</li>
        </ul>

        {/* 8 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Tus derechos (RGPD)</h2>
        <p>De acuerdo con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea, tienes los siguientes derechos:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Acceso:</strong> Puedes consultar qué datos tenemos sobre ti desde tu panel de control.</li>
          <li><strong>Rectificación:</strong> Puedes modificar tu alias, avatar y contenido publicado en cualquier momento.</li>
          <li><strong>Supresión:</strong> Puedes eliminar reseñas, preguntas o tu cuenta completa. La eliminación es permanente e irreversible gracias al borrado en cascada.</li>
          <li><strong>Portabilidad:</strong> Puedes solicitar una copia de tus datos escribiéndonos a <a href="mailto:contacto@yafui.es" className="text-primary hover:underline">contacto@yafui.es</a>.</li>
          <li><strong>Oposición:</strong> Puedes oponerte al tratamiento de tus datos contactándonos por email.</li>
        </ul>
        <p>Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:contacto@yafui.es" className="text-primary hover:underline">contacto@yafui.es</a>. Responderemos en un plazo máximo de 30 días.</p>

        {/* 9 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Seguridad</h2>
        <p>Aplicamos medidas técnicas para proteger tus datos: comunicaciones cifradas mediante HTTPS/TLS, autenticación segura con tokens JWT gestionados por Supabase Auth, y políticas de acceso a nivel de base de datos (Row Level Security) que impiden que un usuario acceda a los datos de otro.</p>

        {/* 10 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Menores de edad</h2>
        <p>YaFui es una plataforma destinada exclusivamente a personas mayores de 18 años. No recopilamos conscientemente datos de menores de edad. Si detectamos que un menor ha creado una cuenta, la eliminaremos de forma inmediata junto con todo su contenido.</p>

        {/* 11 */}
        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Cambios en esta política</h2>
        <p>Nos reservamos el derecho de actualizar esta política de privacidad. En caso de cambios sustanciales, lo comunicaremos a través de la plataforma. La fecha de última actualización figura al inicio de esta página.</p>

      </div>
    </div>
  )
}