import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tu-proyecto-falso.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "llave-falsa-para-engañar-a-vercel"

// Usamos createBrowserClient en lugar de createClient
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)