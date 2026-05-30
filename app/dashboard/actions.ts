"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  return { supabase, user }
}

// ── Editar reseña ─────────────────────────────────────────────
export async function editReview(
  id: string,
  changes: {
    comment:     string
    price:       number
    duration:    number
    phone?:      string | null
    veracity?:   number
    punctuality?: number
    hygiene?:    number
    value?:      number
    discretion?: number
    kindness?:   number
  }
): Promise<{ error: string | null }> {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    const { error } = await supabase
      .from("reviews")
      .update({
        details:     changes.comment,
        price:       changes.price,
        duration:    changes.duration,
        phone:       changes.phone ?? null,
        veracity:    changes.veracity    ?? null,
        punctuality: changes.punctuality ?? null,
        hygiene:     changes.hygiene     ?? null,
        value_price: changes.value       ?? null,
        discretion:  changes.discretion  ?? null,
        kindness:    changes.kindness    ?? null,
      })
      .eq("id",      id)
      .eq("user_id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

// ── Editar pregunta del foro ───────────────────────────────────
export async function editQuestion(
  id: string,
  changes: { details: string; phone?: string | null }
): Promise<{ error: string | null }> {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    const { error } = await supabase
      .from("questions")
      .update({
        details: changes.details,
        phone:   changes.phone ?? null,
      })
      .eq("id",      id)
      .eq("user_id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

// ── Borrar reseña o pregunta con cascada ──────────────────────
// La cascada comprueba si el perfil queda huérfano para eliminarlo.
// La cláusula .eq("user_id") impide borrar contenido ajeno.
export async function deleteItem(
  id:    string,
  table: "reviews" | "questions"
): Promise<{ error: string | null }> {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    // 1. Leer profile_id y verificar propiedad en una sola query
    const { data: item, error: fetchError } = await supabase
      .from(table)
      .select("profile_id")
      .eq("id",      id)
      .eq("user_id", user.id) // si no es suyo, .single() devuelve error
      .single()

    if (fetchError || !item) {
      return { error: "Elemento no encontrado o no autorizado" }
    }

    // 2. Borrar (user_id garantiza propiedad a nivel SQL)
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("id",      id)
      .eq("user_id", user.id)

    if (deleteError) return { error: deleteError.message }

    // 3. Comprobar si el perfil queda huérfano
    if (item.profile_id) {
      const [revCount, quesCount] = await Promise.all([
        supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", item.profile_id),
        supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", item.profile_id),
      ])

      const total = (revCount.count ?? 0) + (quesCount.count ?? 0)
      if (total === 0) {
        await supabase.from("profiles").delete().eq("id", item.profile_id)
      }
    }

    revalidatePath("/dashboard")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}

// ── Actualizar alias y avatar del usuario ─────────────────────
// updateUser() opera sobre el JWT de la sesión actual (cookies del server client).
// También propaga el cambio a todas las filas de reviews y questions del usuario
// para que el alias/avatar nuevo se refleje en el historial publicado.
export async function updateProfile(
  alias:           string,
  customAvatarUrl: string
): Promise<{ error: string | null }> {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    const { error: authError } = await supabase.auth.updateUser({
      data: { alias, custom_avatar_url: customAvatarUrl },
    })
    if (authError) return { error: authError.message }

    // Propagar a reviews y questions en paralelo
    const [revRes, quesRes] = await Promise.all([
      supabase
        .from("reviews")
        .update({ alias, avatar_url: customAvatarUrl || null })
        .eq("user_id", user.id),
      supabase
        .from("questions")
        .update({ alias, avatar_url: customAvatarUrl || null })
        .eq("user_id", user.id),
    ])

    if (revRes.error)  return { error: revRes.error.message }
    if (quesRes.error) return { error: quesRes.error.message }

    revalidatePath("/dashboard")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}
