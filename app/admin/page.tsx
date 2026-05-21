import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // ── Datos de moderación + perfiles (anon client — RLS aplica) ─
  const [reportsRes, questionsRes, profilesRes] = await Promise.all([
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

    // Perfiles con conteo de reviews y questions embebidos
    supabase
      .from("profiles")
      .select(`
        id, name, city, slug, category, image_url, created_at,
        reviews ( id ),
        questions ( id )
      `)
      .order("created_at", { ascending: false }),
  ])

  const enrichedProfiles = (profilesRes.data ?? []).map((p: any) => ({
    id:            p.id,
    name:          p.name,
    city:          p.city,
    slug:          p.slug,
    category:      p.category ?? null,
    image_url:     p.image_url ?? null,
    created_at:    p.created_at,
    reviewCount:   (p.reviews   ?? []).length,
    questionCount: (p.questions ?? []).length,
  }))

  // ── Usuarios (service role — bypass RLS) ─────────────────────
  // Fallback graceful si SUPABASE_SERVICE_ROLE_KEY no está configurada.
  let enrichedUsers: any[]  = []
  let usersError:   string | null = null

  try {
    const admin = createAdminClient()

    const [usersRes, reviewsRes, questionsCountRes] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from("reviews").select("user_id").is("parent_id", null),
      supabase.from("questions").select("user_id").is("parent_id", null),
    ])

    // Conteos por user_id calculados en servidor para no enviar todo al cliente
    const reviewCount   = new Map<string, number>()
    const questionCount = new Map<string, number>()
    reviewsRes.data?.forEach((r) => reviewCount.set(r.user_id, (reviewCount.get(r.user_id) ?? 0) + 1))
    questionsCountRes.data?.forEach((q) => questionCount.set(q.user_id, (questionCount.get(q.user_id) ?? 0) + 1))

    enrichedUsers = (usersRes.data?.users ?? [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((u) => ({
        id:            u.id,
        email:         u.email ?? "",
        alias:         u.user_metadata?.alias ?? null,
        created_at:    u.created_at,
        banned_until:  (u as any).banned_until ?? null,
        reviewCount:   reviewCount.get(u.id) ?? 0,
        questionCount: questionCount.get(u.id) ?? 0,
      }))
  } catch (err: unknown) {
    usersError = err instanceof Error ? err.message : "Error al cargar usuarios."
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Button
        variant="ghost"
        asChild
        className="mb-6 gap-2 -ml-3 text-muted-foreground hover:text-foreground"
      >
        <Link href="/"><ArrowLeft className="h-4 w-4" /> Volver al portal</Link>
      </Button>

      <header className="flex items-center gap-4 mb-10 pb-6 border-b">
        <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Moderación</h1>
          <p className="text-muted-foreground">Administración global de reseñas, foro y usuarios.</p>
        </div>
      </header>

      <AdminDashboardClient
        initialReports={reportsRes.data   ?? []}
        initialQuestions={questionsRes.data ?? []}
        initialUsers={enrichedUsers}
        usersError={usersError}
        initialProfiles={enrichedProfiles}
      />
    </div>
  )
}
