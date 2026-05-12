import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ── Rate limiters ─────────────────────────────────────────────
// Solo se instancian si las env vars están presentes; si no, se omite
// el check (útil en desarrollo local sin Redis configurado).
function getRatelimiters() {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const redis = new Redis({ url, token })

  return {
    // /auth/register → 5 intentos por IP en 10 minutos
    register: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'rl:register',
    }),
    // /submit-review/* → 10 por IP en 1 hora
    submitReview: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 m'),
      prefix: 'rl:submit',
    }),
  }
}

const limiters = getRatelimiters()

// ── Rutas POST protegidas con rate limit ──────────────────────
async function applyRateLimit(request: NextRequest): Promise<NextResponse | null> {
  if (!limiters) return null                          // sin Redis → sin límite
  if (request.method !== 'POST') return null          // solo POST

  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
             ?? request.headers.get('x-real-ip')
             ?? 'anonymous'

  let limiter: Ratelimit | null = null

  if (pathname === '/auth/register') {
    limiter = limiters.register
  } else if (
    pathname === '/submit-review/review' ||
    pathname === '/submit-review/question'
  ) {
    limiter = limiters.submitReview
  }

  if (!limiter) return null

  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return new NextResponse(
      JSON.stringify({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit':     String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset':     String(reset),
          'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}

export async function middleware(request: NextRequest) {
  // ── Rate limiting (se evalúa antes que auth) ──────────────
  const rateLimitResponse = await applyRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

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
