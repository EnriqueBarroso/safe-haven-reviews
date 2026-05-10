import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // supabaseResponse se reasigna dentro de setAll si Supabase necesita
  // escribir cookies de sesión renovada. Devolver ESTA variable (no una
  // nueva) garantiza que las cookies lleguen al navegador.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() verifica el JWT contra el servidor de Supabase.
  // Es más seguro que getSession(), que solo lee cookies locales.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Protección: /dashboard ────────────────────────────────
  // Sin sesión → login. Preservamos el destino en ?next= para
  // poder redirigir de vuelta tras autenticarse.
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/signin'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Protección: /admin ────────────────────────────────────
  // Sin sesión O email distinto al admin → portada.
  // ADMIN_EMAIL vive solo en el servidor (sin prefijo NEXT_PUBLIC_).
  if (pathname.startsWith('/admin')) {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!user || user.email !== adminEmail) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.search = ''
      return NextResponse.redirect(homeUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Ejecutar el middleware en todas las rutas EXCEPTO:
     * - _next/static  → archivos JS/CSS compilados por Next.js
     * - _next/image   → optimización de imágenes de Next.js
     * - favicon.ico   → icono del sitio
     * - Extensiones de imagen/fuente estáticas comunes
     * Sin este filtro, cada asset dispara una llamada a Supabase.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
