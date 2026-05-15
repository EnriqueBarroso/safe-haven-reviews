import { createClient } from '@supabase/supabase-js'

// Prefijos que identifican perfiles creados por tests E2E
const TEST_PREFIXES = ['Test E2E', 'ForoTest', 'Borrar E2E']

function buildTestFilter(column: string) {
  return TEST_PREFIXES.map((p) => `${column}.ilike.${p}%`).join(',')
}

/**
 * Elimina todos los perfiles de prueba y su contenido asociado.
 *
 * - Con TEST_SUPABASE_SERVICE_ROLE_KEY: borra directamente sin restricciones RLS.
 * - Sin ella: inicia sesión como usuario de test y borra solo su contenido.
 *   Los perfiles quedarán huérfanos; ejecuta la query SQL manual periódicamente
 *   para limpiarlos definitivamente.
 */
export async function cleanupTestData() {
  const url      = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const svcKey   = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey) {
    console.warn('[cleanup] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no disponibles — limpieza omitida')
    return
  }

  if (svcKey) {
    await cleanupWithServiceRole(url, svcKey)
  } else {
    await cleanupAsTestUser(url, anonKey)
  }
}

async function cleanupWithServiceRole(url: string, serviceKey: string) {
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  // 1. Buscar perfiles de prueba
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .or(buildTestFilter('name'))

  if (!profiles?.length) return

  const ids = profiles.map((p: any) => p.id)

  // 2. Borrar imágenes de reseña, reseñas, preguntas y perfiles
  await supabase.from('review_images').delete().in('review_id',
    (await supabase.from('reviews').select('id').in('profile_id', ids)).data?.map((r: any) => r.id) ?? []
  )
  await supabase.from('reviews').delete().in('profile_id', ids)
  await supabase.from('questions').delete().in('profile_id', ids)
  await supabase.from('profiles').delete().in('id', ids)

  console.log(`[cleanup] Eliminados ${ids.length} perfiles de prueba (service role)`)
}

async function cleanupAsTestUser(url: string, anonKey: string) {
  const email    = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (!email || !password) return

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
  })

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    console.warn('[cleanup] No se pudo iniciar sesión para limpiar:', signInError.message)
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Borrar solo el contenido del usuario de test en perfiles de prueba
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .or(buildTestFilter('name'))

  if (profiles?.length) {
    const ids = profiles.map((p: any) => p.id)
    await supabase.from('reviews').delete().in('profile_id', ids).eq('user_id', user.id)
    await supabase.from('questions').delete().in('profile_id', ids).eq('user_id', user.id)
  }

  await supabase.auth.signOut()
  console.log('[cleanup] Reseñas y preguntas de prueba eliminadas (usuario de test). Los perfiles huérfanos requieren limpieza manual con SQL.')
}
