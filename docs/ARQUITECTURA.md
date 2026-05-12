# Arquitectura Técnica — YaFui

> Documento de referencia para mantenimiento y onboarding. Refleja el estado real del código tras la migración RSC (mayo 2026).

---

## 1. Arquitectura General

### Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19 · Tailwind CSS v4 · shadcn/ui (Radix UI) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Auth cookies | `@supabase/ssr` |
| Lenguaje | TypeScript |

### Patrón: Server Shell con datos en servidor

El principio rector es **"bajar la lógica al servidor, subir solo el estado interactivo al cliente"**.

```
app/[ruta]/page.tsx           ← Server Component: fetch, cómputo, props → cliente
components/[ruta]/XClient.tsx ← Client Component: useState, modales, eventos
app/[ruta]/actions.ts         ← Server Actions: mutaciones con validación de propiedad
```

- Las páginas son async Server Components que reciben `params` y `searchParams` como `Promise<...>` (Next.js 15+).
- Los Client Components solo reciben datos ya calculados; nunca vuelven a consultar la BD directamente excepto en el flujo de submit-review (excepción documentada en §4).
- `revalidatePath()` invalida la caché de la ruta afectada tras cada mutación exitosa.

---

## 2. Autenticación y Seguridad

### 2.1 `middleware.ts` — primera línea de defensa

El middleware intercepta **todas las peticiones** excepto assets estáticos (`_next/static`, `_next/image`, imágenes, fuentes).

```ts
// Verifica el JWT contra los servidores de Supabase (no solo lee cookies locales)
const { data: { user } } = await supabase.auth.getUser()

// /dashboard → sin sesión → /auth/signin?next=<ruta>
if (pathname.startsWith('/dashboard') && !user) { ... }

// /admin → sin sesión O email ≠ ADMIN_EMAIL → /
if (pathname.startsWith('/admin') && (!user || user.email !== process.env.ADMIN_EMAIL)) { ... }
```

**Mecanismo de cookies:** `supabaseResponse` se reasigna dentro de `setAll` cuando Supabase necesita renovar la sesión. Es imprescindible devolver **esa misma variable** (no crear un `NextResponse` nuevo), o las cookies renovadas no llegan al navegador.

### 2.2 Doble verificación en Server Components

El middleware es la primera capa; las páginas protegidas añaden una segunda:

```ts
// app/dashboard/page.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect("/auth/signin")
```

Esto protege contra peticiones directas que saltasen el middleware. Se usa `getUser()` (valida contra el servidor), nunca `getSession()` (solo lee cookies sin verificar).

### 2.3 Tres clientes Supabase — cuándo usar cada uno

| Archivo | Contexto | Cómo se instancia |
|---|---|---|
| `lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers | `await createClient()` — lee cookies del servidor |
| `lib/supabase/client.ts` | Client Components que necesitan auth en el browser | `supabase` — singleton `createBrowserClient` |
| `lib/supabase.ts` | Alias legacy de `client.ts` | `supabase` — mismo singleton |

> **Regla:** el cliente de servidor nunca va a un Client Component. El cliente de browser nunca lanza mutaciones críticas de seguridad (las mutaciones van por Server Actions).

### 2.4 RLS en Supabase

Las políticas Row Level Security son la última línea de defensa. Aunque un atacante omitiese el middleware y los Server Actions, la BD rechaza la operación si `auth.uid() ≠ user_id`.

Las Server Actions refuerzan esto con `.eq("user_id", user.id)` en **todas** las queries de escritura y lectura previa:

```ts
// app/dashboard/actions.ts — editReview
await supabase.from("reviews")
  .update({ details, price, duration })
  .eq("id", id)
  .eq("user_id", user.id)  // ownership explícito en la query
```

La tabla `reports` solo es legible por el admin (política RLS restrictiva). Las acciones de admin verifican el email antes de operar:

```ts
// app/admin/actions.ts
async function requireAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error("No autorizado")
  return supabase
}
```

### 2.5 Flujo OAuth Google

```
/auth/signin → signInWithOAuth (provider: google)
    → Supabase → Google → callback con ?code=
/auth/callback/route.ts → exchangeCodeForSession(code) → cookies → redirect
```

El Route Handler (`app/auth/callback/route.ts`) intercambia el código temporal por una sesión persistente en cookies. Si falla, redirige a `/auth/signin?error=...`.

---

## 3. Flujo de Datos

### 3.1 Lectura en paralelo — `/profiles/[slug]`

El perfil necesita su `id` antes de poder paralelizar, por lo que la secuencia es **1 query secuencial → 2 queries en paralelo**:

```ts
// app/profiles/[slug]/page.tsx

// Paso 1 — necesitamos el ID del perfil
const { data: profile } = await supabase.from("profiles")
  .select("*").eq("slug", slug).single()

if (!profile) notFound()

// Paso 2 — reviews y questions en paralelo
const [reviewsRes, questionsRes] = await Promise.all([
  supabase.from("reviews")
    .select("*, review_images(*)")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false }),

  supabase.from("questions")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false }),
])
```

Las estadísticas (medias, total de reseñas) se calculan en el servidor con funciones puras antes de pasarlas como props, evitando `useEffect` en el cliente.

### 3.2 Lectura en paralelo — `/profiles` (directorio)

Cuatro queries simultáneas: perfiles filtrados, últimas reseñas, últimas preguntas, lista de ciudades.

```ts
const [profilesRes, reviewsRes, questionsRes, citiesRes] = await Promise.all([
  profilesQuery,          // ya tiene los filtros SQL aplicados
  supabase.from("reviews").select("*, profiles(name,slug,city)").limit(20),
  supabase.from("questions").select("*, profiles(name,slug,city)").limit(20),
  supabase.from("profiles").select("city").not("city", "is", null),
])
```

**Los filtros van en SQL, nunca en JS.** La query `profilesQuery` se construye condicionalmente antes del `Promise.all`:

```ts
if (city)     profilesQuery = profilesQuery.eq("city", city)
if (search)   profilesQuery = profilesQuery.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
```

### 3.3 Mutaciones — validación de ownership

Todas las Server Actions siguen el mismo contrato:

1. Verificar sesión con `getAuthenticatedUser()` (lanza si no hay usuario).
2. Incluir `.eq("user_id", user.id)` en la query de escritura.
3. Si necesitan leer antes de escribir, también filtran por `user_id` para impedir lectura de datos ajenos.
4. Llamar `revalidatePath()` para invalidar la caché de la vista afectada.
5. Devolver `{ error: string | null }` — nunca lanzar hacia el cliente.

```ts
// Patrón estándar de Server Action
export async function editReview(id, changes): Promise<{ error: string | null }> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase.from("reviews")
      .update(changes)
      .eq("id", id)
      .eq("user_id", user.id)
    if (error) return { error: error.message }
    revalidatePath("/dashboard")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}
```

### 3.4 Sistema de hilos (reviews y preguntas anidadas)

Las respuestas se modelan con `parent_id` auto-referencial. `lib/build-tree.ts` convierte el array plano en árboles `TreeNode[]`:

```
buildTree(items[]) → TreeNode[]  (O(n) con Map, children ordenados por created_at)
```

`components/profile/Threadnode.tsx` renderiza el árbol de forma recursiva. `components/profile/ReplyForm.tsx` gestiona el envío de respuestas y la creación de notificaciones en `notifications`.

### 3.5 Excepción: submit-review es Client Component

`app/submit-review/review/page.tsx` es un Client Component (`"use client"`) que opera directamente con el cliente de browser. Razón: el formulario multistep necesita uploads a Supabase Storage, lógica de "buscar o crear perfil", y un flujo secuencial de inserciones que sería muy verboso en un Server Action. Es la única ruta que no sigue el patrón RSC estándar.

---

## 4. Guía de Desarrollo

### Crear una nueva ruta con datos

```ts
// app/nueva-ruta/page.tsx
import { createClient } from "@/lib/supabase/server"

export default async function NuevaRutaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id }  = await params         // siempre await en Next.js 15+
  const { tab } = await searchParams
  const supabase = await createClient()

  const [aRes, bRes] = await Promise.all([
    supabase.from("tabla_a").select("*").eq("id", id),
    supabase.from("tabla_b").select("*").eq("ref_id", id),
  ])

  return <NuevaRutaClient data={aRes.data ?? []} extra={bRes.data ?? []} />
}
```

### Crear un nuevo Server Action con ownership

```ts
// app/nueva-ruta/actions.ts
"use server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function miAccion(id: string, data: MiTipo): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { error } = await supabase.from("mi_tabla")
      .update(data)
      .eq("id", id)
      .eq("user_id", user.id)   // ownership siempre

    if (error) return { error: error.message }
    revalidatePath("/nueva-ruta")
    return { error: null }
  } catch (e: any) {
    return { error: e.message }
  }
}
```

### Crear un componente interactivo

```ts
// components/nueva-ruta/NuevaRutaClient.tsx
"use client"

import { useState } from "react"
import { miAccion } from "@/app/nueva-ruta/actions"

export function NuevaRutaClient({ data }: { data: MiTipo[] }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const { error } = await miAccion(id, payload)
    if (error) { /* mostrar error */ }
    setLoading(false)
    // revalidatePath() en el action ya actualiza el Server Component padre
  }

  return <button onClick={handleClick} disabled={loading}>Acción</button>
}
```

### Proteger una nueva ruta de admin

1. El middleware ya cubre cualquier path que empiece por `/admin`.
2. Añadir `requireAdmin()` al inicio de cada Server Action que use esa ruta.
3. Opcional: añadir `getUser()` + redirect en el `layout.tsx` de admin como segundo cinturón (ver `app/admin/layout.tsx`).

### Convenciones críticas

| Regla | Motivo |
|---|---|
| Usar `getUser()`, nunca `getSession()` en servidor | `getSession()` solo lee cookies sin verificar con Supabase |
| `export const dynamic = "force-dynamic"` en layouts/páginas con auth | Evita que Next.js cachee estáticamente páginas que dependen de sesión |
| Filtros de lista en SQL (`.eq()`, `.or()`) antes del `Promise.all` | Nunca filtrar un result set completo en JavaScript |
| `params` y `searchParams` con `await` | Son `Promise<...>` en Next.js 15+ |
| Server Action devuelve `{ error: string \| null }` | Tipo predecible para el cliente; nunca lanzar hacia el cliente |
| `lib/supabase/server.ts` en Server Components, `lib/supabase/client.ts` en Client Components | Mezclar clientes rompe el manejo de cookies |

### Variable de entorno `ADMIN_EMAIL`

Sin prefijo `NEXT_PUBLIC_` — solo disponible en servidor. El middleware y los Server Actions de admin la leen de `process.env.ADMIN_EMAIL`. **No usar en Client Components** (el valor no estaría disponible).

> **Deuda técnica conocida:** `components/header.tsx` tiene `ADMIN_EMAIL` hardcodeada como constante de módulo. Esto es solo para mostrar u ocultar el enlace admin en la UI (no es una verificación de seguridad real). La protección efectiva está en el middleware.

---

## 5. Tablas de base de datos (resumen)

| Tabla | Propósito clave |
|---|---|
| `profiles` | Entidades reseñadas. Sin `user_id`. Se auto-elimina cuando no tiene reviews ni questions. |
| `reviews` | Reseñas y sus respuestas (`parent_id`). Campo `type = "review"`. |
| `questions` | Hilos del foro y sus respuestas (`parent_id`). |
| `review_images` | Imágenes de reseñas. `user_id` + `review_id`. Storage bucket `review_images`. |
| `reports` | Denuncias de contenido. Solo legibles por admin (RLS). |
| `notifications` | Notificaciones de respuestas en tiempo real. Leídas vía Supabase Realtime en `Header`. |

Las imágenes de perfil van al bucket `profile_images` (public). Las de reseña van a `review_images` con la ruta `{user_id}/{review_id}-{index}.{ext}`.
