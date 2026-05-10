import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck } from "lucide-react"

// Nunca servir esta página desde caché: los datos de moderación deben ser frescos
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()

  // Segunda verificación servidor (el middleware ya lo bloqueó, esto es cinturón + tirantes)
  // getUser() valida el JWT contra Supabase; nunca confiar solo en cookies locales
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // Fetch paralelo de datos iniciales — sin waterfalls, sin useEffect, sin spinner
  const [reportsRes, questionsRes] = await Promise.all([
    supabase
      .from("reports")
      .select(`
        id, reason, details, created_at,
        reviews ( id, details, overall, profiles ( name, id ) )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    supabase
      .from("questions")
      .select(`*, profiles ( name, city )`)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Button
        variant="ghost"
        asChild
        className="mb-6 gap-2 -ml-3 text-muted-foreground hover:text-foreground"
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Volver al portal
        </Link>
      </Button>

      <header className="flex items-center gap-4 mb-10 pb-6 border-b">
        <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Moderación</h1>
          <p className="text-muted-foreground">Administración global de reseñas y foro.</p>
        </div>
      </header>

      {/* Toda la interactividad (tabs, botones, estado) vive en el Client Component */}
      <AdminDashboardClient
        initialReports={reportsRes.data ?? []}
        initialQuestions={questionsRes.data ?? []}
      />
    </div>
  )
}
