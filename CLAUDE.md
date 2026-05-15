# YaFui — Foro de Reseñas de la Comunidad

## Comandos
- Dev: `npm run dev` (Next.js con Turbopack, puerto 3000)
- Build: `npm run build`
- Start: `npm start`
- Test E2E: `npx playwright test`
- Test E2E con UI: `npx playwright test --ui`
- Test un archivo: `npx playwright test tests/e2e/02-review.spec.ts`

## Stack
- Framework: Next.js 16.2 (App Router, Turbopack)
- UI: React 19 · Tailwind CSS v4 · shadcn/ui (Radix UI)
- Backend / DB: Supabase (PostgreSQL + Auth + Storage + Realtime)
- Auth cookies: @supabase/ssr
- Lenguaje: TypeScript strict
- Tests: Playwright (E2E)
- Deploy: Vercel

## Arquitectura
- Patrón: Server Shell — los Server Components hacen el fetch y pasan props al cliente
- Las páginas son async Server Components
- Los Client Components solo reciben datos ya calculados; nunca consultan la BD directamente salvo excepciones documentadas
- Las mutaciones van por Server Actions con validación de ownership
- `revalidatePath()` invalida la caché tras cada mutación exitosa

```
app/[ruta]/page.tsx           ← Server Component: fetch, cómputo, props → cliente
components/[ruta]/XClient.tsx ← Client Component: useState, modales, eventos
app/[ruta]/actions.ts         ← Server Actions: mutaciones con validación de propiedad
```

## Estructura del proyecto
```
app/
├── layout.tsx              — Layout raíz, metadata global, force-dynamic
├── not-found.tsx           — Página 404 personalizada
├── page.tsx                — Landing page
├── admin/
│   ├── layout.tsx          — Layout del panel admin
│   ├── page.tsx            — Panel de moderación (protegido por middleware)
│   └── actions.ts          — Server Actions de admin (requireAdmin() al inicio)
├── auth/                   — Registro, login, callback OAuth
├── dashboard/
│   ├── page.tsx            — Panel del usuario autenticado
│   └── actions.ts          — Server Actions del dashboard
├── how-it-works/page.tsx   — Página informativa pública
├── profiles/
│   ├── layout.tsx          — Layout del explorador (shared)
│   ├── page.tsx            — Explorador de perfiles
│   └── [slug]/page.tsx     — Perfil público con pestañas + hilos
├── submit-review/
│   ├── page.tsx            — Landing: elegir Reseña o Pregunta
│   ├── review/page.tsx     — Formulario de reseña → tabla reviews
│   └── question/page.tsx   — Formulario de pregunta → tabla questions
└── (legal)/                — privacy, terms, rules, faq, contact

components/
├── HeaderServer.tsx        — Server Component: calcula isAdmin y pasa prop a Header
├── header.tsx              — Navbar responsive con logo YaFui (Client Component)
├── footer.tsx              — Footer con logo YaFui
├── profile-card.tsx        — Card del explorador (NO tocar sin tests)
├── AgeVerification.tsx     — Modal de verificación de edad (localStorage)
├── star-rating.tsx         — Componente de estrellas reutilizable
├── profile/
│   ├── ProfileDetailClient.tsx — Vista detalle de perfil con pestañas
│   ├── ThreadNode.tsx      — Renderizado recursivo de hilos
│   ├── ReplyForm.tsx       — Formulario inline de respuesta
│   ├── MiniStars.tsx       — Valoraciones compactas
│   ├── StatsPanel.tsx      — Panel de estadísticas del perfil
│   └── share-bbcode.tsx    — Botón compartir en formato BBCode
├── dashboard/              — Componentes del panel de usuario
├── landing/                — Secciones de la home
├── profiles/               — Componentes del explorador (filtros, etc.)
├── review/
│   ├── review-form.tsx     — Orquestador del formulario multistep
│   ├── Ratingsblock.tsx    — Bloque de valoraciones por categoría
│   ├── Starpicker.tsx      — Selector de estrellas interactivo
│   ├── Firmausuario.tsx    — Firma/alias del usuario en reseña
│   ├── imageuploader.tsx   — Subida de imágenes (5 MB max)
│   ├── Reportdialog.tsx    — Diálogo para denunciar contenido
│   └── steps/              — Pasos del formulario (step-1 a step-5)
└── ui/                     — Componentes shadcn/ui (NO modificar)

lib/
├── supabase/
│   ├── server.ts           — Cliente para Server Components y Server Actions
│   └── client.ts           — Cliente singleton para Client Components
├── build-tree.ts           — Tipos TreeNode + función buildTree para hilos
└── utils.ts                — Utilidades compartidas
```

## Base de datos (Supabase)

| Tabla | Propósito |
|---|---|
| `profiles` | Entidades reseñadas. Sin user_id. Se auto-elimina cuando no tiene contenido. |
| `reviews` | Reseñas y sus respuestas anidadas (parent_id auto-referencial). |
| `questions` | Hilos del foro y sus respuestas (parent_id auto-referencial). |
| `review_images` | Imágenes adjuntas a reseñas. Bucket: `review_images`. |
| `reports` | Denuncias. Solo legibles por admin (RLS restrictiva). |
| `notifications` | Notificaciones en tiempo real. SELECT filtrado por user_id. |

- Imágenes de perfil: bucket `profile_images` (público)
- Imágenes de reseña: `review_images/{user_id}/{review_id}-{index}.{ext}`
- Imágenes de pregunta: `review_images/forum/{timestamp}-{random}.{ext}`

## Clientes Supabase — regla crítica
- `lib/supabase/server.ts` → SOLO en Server Components, Server Actions, Route Handlers
- `lib/supabase/client.ts` → SOLO en Client Components (`"use client"`)
- NUNCA mezclar: el cliente de servidor en un Client Component rompe las cookies

## Auth y Seguridad

### Capas de defensa (en orden)
1. `middleware.ts` — en este orden: rate limiting → JWT check → redirect
   - `/dashboard` sin sesión → `/auth/signin?next=...`
   - `/admin` sin sesión o email incorrecto → `/`
   - Assets estáticos excluidos del matcher (no disparan llamadas a Supabase)
2. Server Components — revalidan con `getUser()` (nunca `getSession()`)
3. RLS en Supabase — última línea; rechaza si `auth.uid() ≠ user_id`

### Reglas de ownership en Server Actions
```ts
// SIEMPRE incluir .eq("user_id", user.id) en queries de escritura
await supabase.from("reviews")
  .update(changes)
  .eq("id", id)
  .eq("user_id", user.id)
```

### Admin
- Ruta `/admin` protegida en middleware con `process.env.ADMIN_EMAIL`
- Cada Server Action de admin llama a `requireAdmin()` al inicio
- NUNCA exponer `ADMIN_EMAIL` en Client Components (sin prefijo NEXT_PUBLIC_)
- `isAdmin` se calcula en `components/HeaderServer.tsx` (Server Component) y se pasa como prop al Header cliente

## Reglas de código
- SIEMPRE TypeScript strict, NUNCA usar `any` (usar `unknown` si es necesario)
- Usar `getUser()`, NUNCA `getSession()` en servidor
- Server Action devuelve `{ error: string | null }` — nunca lanzar al cliente
- Filtros de lista en SQL (`.eq()`, `.ilike()`) ANTES del `Promise.all`, nunca en JS
- `params` y `searchParams` siempre con `await` (son `Promise<...>` en Next.js 15+)
- Imágenes: validar tamaño máximo 5MB antes de subir a Storage
- Nombres de componentes: PascalCase
- Nombres de archivos: kebab-case (excepción: componentes shadcn en ui/)

## Convenciones de Server Actions
```ts
"use server"
export async function miAccion(id: string, data: MiTipo): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { error } = await supabase.from("mi_tabla")
      .update(data)
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/ruta-afectada")
    return { error: null }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Error desconocido" }
  }
}
```

## Excepciones documentadas
- `app/submit-review/review/page.tsx` es Client Component: el formulario multistep necesita uploads a Storage y lógica condicional compleja que sería muy verbosa en un Server Action.
- `app/submit-review/question/page.tsx` idem.

## Variables de entorno
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_EMAIL=                    ← Solo servidor, sin NEXT_PUBLIC_
UPSTASH_REDIS_REST_URL=         ← Rate limiting
UPSTASH_REDIS_REST_TOKEN=       ← Rate limiting
```

## Tests E2E (Playwright)
- Tests en `tests/e2e/`
- Corren contra `http://localhost:3000`
- Credenciales de test en variables de entorno, nunca hardcodeadas
- Cada test debe limpiar los datos que crea (afterEach/afterAll)
- Suite actual: registro, reseña, pregunta, hilo, dashboard, 404

## Git
- Branch principal: main
- Feature branches: feat/nombre-corto
- NUNCA commitear directamente a main
- Commits en español, en imperativo: "añade paginación al explorador"

## Deuda técnica conocida
- Email definitivo `contacto@yafui.es` pendiente de configurar