# Módulo Auth — Registro, Login y Middleware JWT

## Estructura
```
app/auth/
├── register/page.tsx       — Formulario de registro (email + alias)
├── signin/page.tsx         — Formulario de login (email)
├── callback/route.ts       — Route Handler OAuth: intercambia code → sesión

middleware.ts               — Primera línea de defensa: JWT → redirect

lib/supabase/
├── server.ts               — createClient() para Server Components y Actions
└── client.ts               — createBrowserClient() singleton para Client Components
```

## Proveedor
- Auth gestionado por **Supabase Auth** (no JWT custom)
- Las contraseñas las hashea Supabase internamente — nunca accedemos a password_hash
- Las sesiones se almacenan en cookies HttpOnly gestionadas por `@supabase/ssr`
- IMPORTANT: Usar siempre `getUser()`, nunca `getSession()` en servidor — `getSession()` solo lee cookies sin verificar con Supabase

## Flujo de registro
```
/auth/register → supabase.auth.signUp({ email, password })
    → Supabase envía email de confirmación
    → Usuario confirma → sesión activa en cookies
    → metadata: { alias, custom_avatar_url }
```

## Flujo de login (email/password)
```
/auth/signin → supabase.auth.signInWithPassword({ email, password })
    → Supabase valida → sesión en cookies → redirect a /
```

## Flujo OAuth Google
```
/auth/signin → supabase.auth.signInWithOAuth({ provider: 'google' })
    → Google → callback con ?code=
/auth/callback/route.ts → exchangeCodeForSession(code) → cookies → redirect
    → Si falla → redirect a /auth/signin?error=...
```

## Middleware — orden de ejecución
```
Rate limiting (Upstash) → verificación JWT (Supabase) → redirect si no hay sesión
```

```ts
// Rutas protegidas
/dashboard → sin sesión → /auth/signin?next=/dashboard
/admin     → sin sesión O email ≠ ADMIN_EMAIL → /

// Rutas excluidas del middleware
_next/static, _next/image, imágenes, fuentes
```

## Doble verificación en páginas protegidas
El middleware es la primera capa. Las páginas añaden una segunda:
```ts
// app/dashboard/page.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect("/auth/signin")
```

## Admin
```ts
// app/admin/actions.ts
async function requireAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL)
    throw new Error("No autorizado")
  return supabase
}
```
- `ADMIN_EMAIL` solo disponible en servidor (sin prefijo `NEXT_PUBLIC_`)
- `HeaderServer.tsx` calcula `isAdmin` y lo pasa como prop — el cliente nunca accede a `ADMIN_EMAIL`

## Datos del usuario disponibles en cliente
```ts
// Tras autenticación, accesibles vía user.user_metadata
{
  alias: string           // nombre visible en la comunidad
  custom_avatar_url: string | null
}
```

## Rutas de auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET/POST | /auth/register | No | Crear cuenta nueva |
| GET/POST | /auth/signin | No | Login email/password u OAuth |
| GET | /auth/callback | No | Callback OAuth Google |
| POST | — | Sí | signOut() desde Header (Server Action) |

## Validaciones requeridas
- Registro: email válido, password ≥ 6 caracteres, alias no vacío
- Login: email y password obligatorios
- Supabase devuelve error si el email ya existe al registrar

## Variables de entorno necesarias
```
NEXT_PUBLIC_SUPABASE_URL=        — URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=   — Clave anon pública
ADMIN_EMAIL=                     — Email del administrador (solo servidor)
```

## Tests E2E (Playwright)
```
tests/e2e/01-register.spec.ts
```
| Test | Resultado esperado |
|---|---|
| Registro con email nuevo | 200 + mensaje de éxito |
| Registro con contraseñas que no coinciden | Error visible en UI |
| Acceso a /dashboard sin sesión | Redirect a /auth/signin |
| Acceso a /admin sin ser admin | Redirect a / |

## IMPORTANT: Reglas críticas
- NUNCA usar `getSession()` en servidor — solo `getUser()`
- NUNCA exponer `ADMIN_EMAIL` en Client Components
- NUNCA crear un `NextResponse` nuevo dentro del middleware — reasignar `supabaseResponse` para que las cookies renovadas lleguen al navegador
- El cliente de servidor (`lib/supabase/server.ts`) NUNCA va a un Client Component