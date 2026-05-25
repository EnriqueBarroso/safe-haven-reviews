"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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

// ── Gestión de usuarios ───────────────────────────────────────
// Todas usan createAdminClient() que requiere SUPABASE_SERVICE_ROLE_KEY.
// requireAdmin() valida previamente que el caller es el admin del sitio.

export async function suspendUser(userId: string): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: "876600h", // ~100 años = suspensión permanente
    })
    if (error) return { error: error.message }
    revalidatePath("/admin")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function unsuspendUser(userId: string): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    })
    if (error) return { error: error.message }
    revalidatePath("/admin")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function deleteUserAndContent(userId: string): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    // Borrar contenido primero (reviews cascade a review_images por FK)
    await Promise.all([
      admin.from("reviews").delete().eq("user_id", userId),
      admin.from("questions").delete().eq("user_id", userId),
    ])

    // Borrar cuenta de Auth
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

// ── Gestión de perfiles ───────────────────────────────────────

export async function updateProfileAddress(
  profileId: string,
  address: string,
): Promise<{ error: string | null; lat: number | null; lng: number | null }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    let lat: number | null = null
    let lng: number | null = null

    const trimmed = address.trim()
    if (trimmed) {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`,
          { headers: { "User-Agent": "YaFui/1.0" } },
        )
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          lat = parseFloat(data[0].lat)
          lng = parseFloat(data[0].lon)
        }
      } catch {
        // Geocodificación opcional — guardamos address sin coordenadas
      }
    }

    const { error } = await admin
      .from("profiles")
      .update({ address: trimmed || null, lat, lng })
      .eq("id", profileId)

    if (error) return { error: error.message, lat: null, lng: null }
    revalidatePath("/admin")
    revalidatePath("/mapa")
    return { error: null, lat, lng }
  } catch (e: any) {
    return { error: e.message, lat: null, lng: null }
  }
}

export async function deleteProfile(profileId: string): Promise<{ error: string | null }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()

    // 1. Recoger IDs de todas las reseñas del perfil
    const { data: reviews } = await admin
      .from("reviews")
      .select("id")
      .eq("profile_id", profileId)

    const reviewIds = (reviews ?? []).map((r: any) => r.id)

    // 2. Borrar en orden para respetar FK:
    //    reports → review_images → reviews → questions → profiles
    if (reviewIds.length > 0) {
      await admin.from("reports").delete().in("review_id", reviewIds)
      await admin.from("review_images").delete().in("review_id", reviewIds)
    }

    await Promise.all([
      admin.from("reviews").delete().eq("profile_id", profileId),
      admin.from("questions").delete().eq("profile_id", profileId),
    ])

    const { error } = await admin.from("profiles").delete().eq("id", profileId)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/profiles")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}
