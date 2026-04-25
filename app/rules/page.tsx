import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Reglas de la Comunidad — YaFui",
  description: "Las normas básicas de convivencia para mantener YaFui seguro y útil para todos.",
}

const RULES = [
  {
    title: "Sinceridad ante todo",
    text: "Tus reseñas deben estar basadas en experiencias reales y de primera mano. No inventes historias, no infles valoraciones ni publiques por venganza o rencor personal.",
  },
  {
    title: "Respeto y cero toxicidad",
    text: "Puedes ser crítico, pero no cruel. Están prohibidos los insultos personales, el discurso de odio, el racismo, la homofobia, la transfobia, la misoginia, el clasismo, el edadismo y las amenazas de cualquier tipo.",
  },
  {
    title: "No compartas datos privados",
    text: "No publiques números de teléfono personales, direcciones exactas de domicilios privados, nombres completos reales ni cualquier dato que permita identificar a una persona sin su consentimiento. El anonimato protege a toda la comunidad.",
  },
  {
    title: "Prohibido cualquier contenido que involucre a menores",
    text: "Tolerancia cero. Cualquier mención, insinuación o contenido que sugiera la participación de menores de edad supondrá el baneo inmediato y permanente de la cuenta, y será reportado a las autoridades competentes.",
  },
  {
    title: "Nada de contenido sexual explícito ni pornográfico",
    text: "YaFui es un espacio para compartir experiencias y valoraciones, no para publicar material sexual explícito, fotografías íntimas sin consentimiento ni pornografía. Habla de tus experiencias con respeto y sin detalles gráficos innecesarios.",
  },
  {
    title: "No al spam ni a la autopromoción",
    text: "No publiques enlaces comerciales, anuncios, promociones de otros servicios ni reseñas artificiales para promocionarte a ti mismo o a terceros. YaFui no es una plataforma publicitaria.",
  },
  {
    title: "Un usuario, una voz",
    text: "No crees cuentas múltiples para inflar valoraciones, atacar a perfiles o eludir sanciones. Si un administrador detecta cuentas duplicadas, todas serán eliminadas.",
  },
  {
    title: "Usa el sistema de reportes",
    text: "Si ves algo que incumple estas normas, no entres en discusiones públicas. Usa el botón de reportar disponible en cada publicación para que la administración tome medidas.",
  },
]

export default function RulesPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[70vh]">
      <Button variant="ghost" asChild className="mb-8 gap-2 -ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </Button>

      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reglas de la Comunidad</h1>
          <p className="text-muted-foreground">Para mantener YaFui seguro y útil para todos.</p>
        </div>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Para garantizar que YaFui siga siendo una herramienta valiosa y un entorno seguro, pedimos a todos los usuarios que respeten estas reglas básicas de convivencia:</p>

        <div className="bg-secondary/30 p-6 rounded-xl border border-border mt-6">
          <ul className="space-y-5 list-none pl-0">
            {RULES.map((rule, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-bold text-primary shrink-0 w-6">{i + 1}.</span>
                <div>
                  <strong className="text-foreground">{rule.title}.</strong>
                  <p className="mt-1 text-sm">{rule.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-destructive/5 border-l-4 border-destructive/50 p-5 rounded-r-lg mt-8">
          <h3 className="text-base font-semibold text-foreground mb-2">Consecuencias del incumplimiento</h3>
          <p className="text-sm mb-0">
            Las infracciones pueden resultar en la eliminación del contenido, aviso formal, suspensión temporal o eliminación permanente de la cuenta. Las reglas 4 y 5 (contenido sobre menores o material sexual explícito) suponen baneo inmediato sin previo aviso.
          </p>
        </div>

        <p className="text-sm mt-6">
          Si tienes dudas sobre si algo cumple las reglas, pregunta antes de publicar escribiéndonos a <a href="mailto:contacto@yafui.es" className="text-primary hover:underline">contacto@yafui.es</a>.
        </p>
      </div>
    </div>
  )
}