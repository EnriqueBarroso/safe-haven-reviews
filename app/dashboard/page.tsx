import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/DashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()

  // getUser() valida el JWT en el servidor (el middleware ya lo bloqueó,
  // esto es el segundo cinturón de seguridad)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin")

  // Fetch paralelo: reviews y questions del usuario — sin waterfalls
  const [reviewsRes, questionsRes] = await Promise.all([
    supabase
      .from("reviews")
      .select("*, profiles ( name, city )")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("questions")
      .select("*, profiles ( name, city )")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <DashboardClient
      // Solo exponemos al cliente lo estrictamente necesario del user object
      user={{ id: user.id, email: user.email ?? "" }}
      initialAlias={user.user_metadata?.alias ?? ""}
      initialAvatarUrl={user.user_metadata?.custom_avatar_url ?? ""}
      initialReviews={reviewsRes.data   ?? []}
      initialQuestions={questionsRes.data ?? []}
    />
  )
}
