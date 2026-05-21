import { createClient } from "@supabase/supabase-js"

/**
 * Cliente Supabase con service role key.
 * - Bypassa RLS: úsalo SOLO en Server Actions/Server Components de admin.
 * - NUNCA importar en Client Components ni exponer al navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. " +
      "Añádela en las variables de entorno de Vercel (sin prefijo NEXT_PUBLIC_)."
    )
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}
