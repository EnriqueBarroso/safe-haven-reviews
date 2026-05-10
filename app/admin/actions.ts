"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

// Valida sesión + email admin en cada acción. Si falla lanza excepción
// para que el catch del caller devuelva { error } sin llegar a la BD.
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("No autorizado")
  }

  return supabase
}

export async function dismissReport(reportId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from("reports")
      .update({ status: "dismissed" })
      .eq("id", reportId)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function deleteReview(reportId: string, reviewId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function deleteQuestion(questionId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await requireAdmin()
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId)

    if (error) return { error: error.message }
    revalidatePath("/admin")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}
