import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"

export async function HeaderServer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!(user && user.email === process.env.ADMIN_EMAIL)

  return <Header isAdmin={isAdmin} />
}
