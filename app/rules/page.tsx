import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
    title: "Reglas de la Comunidad | YaFui",
}

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
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <span className="font-bold text-primary">1.</span>
                            <div>
                                <strong className="text-foreground">Sinceridad ante todo.</strong>
                                <p className="mt-1 text-sm">Tus reseñas deben estar basadas en experiencias reales y de primera mano. No inventes historias ni infles valoraciones.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-primary">2.</span>
                            <div>
                                <strong className="text-foreground">Respeto y cero toxicidad.</strong>
                                <p className="mt-1 text-sm">Puedes ser crítico, pero no cruel. Están prohibidos los insultos personales, el discurso de odio, el racismo o las amenazas.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-primary">3.</span>
                            <div>
                                <strong className="text-foreground">No compartas datos privados.</strong>
                                <p className="mt-1 text-sm">No publiques números de teléfono personales, direcciones exactas de domicilios privados, ni nombres completos sin consentimiento.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-primary">4.</span>
                            <div>
                                <strong className="text-foreground">Usa el sistema de reportes.</strong>
                                <p className="mt-1 text-sm">Si ves algo que incumple estas normas, no entres en discusiones públicas. Usa el botón de reportar para que la administración tome medidas.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}