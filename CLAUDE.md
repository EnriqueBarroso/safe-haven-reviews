# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack). Runs on :3000 or next available port.
npm run build    # Production build. Always run this to verify no compile errors before finishing.
npm run lint     # ESLint check
```

TypeScript errors are intentionally suppressed in the build (`ignoreBuildErrors: true` in `next.config.mjs`). The linter is the real type gate — run it when making type-sensitive changes.

## Environment Variables

Two required env vars in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public)
- `ADMIN_EMAIL` — Admin email address (server-only, no `NEXT_PUBLIC_` prefix). Required for `/admin` access via middleware.

## Architecture

### Stack
Next.js 16.2 (App Router, Turbopack) · React 19 · TypeScript · Supabase (PostgreSQL + Auth + Storage + Realtime) · Tailwind CSS v4 · shadcn/ui (Radix UI primitives) · `@supabase/ssr` for cookie-based session handling.

### Supabase Client Split
There are three clients — use the right one for each context:

| File | Use when |
|---|---|
| `lib/supabase/client.ts` | Browser-only code (Client Components) |
| `lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers — exports `createClient()` (async, reads cookies) |
| `lib/supabase.ts` | Legacy proxy re-export of `client.ts`. Existing Client Components import from here; new code should import directly. |

### Route Protection
`middleware.ts` intercepts all non-static requests:
- `/dashboard` → redirects to `/auth/signin?next=...` if no session
- `/admin` → redirects to `/` if no session OR `user.email !== process.env.ADMIN_EMAIL`

Both protected pages also call `getUser()` server-side as a second verification layer (not `getSession()` — the latter only reads cookies without server validation).

### Data Flow Pattern (RSC-first)
All pages that fetch data are Server Components. The pattern:

```
app/[route]/page.tsx          ← Server Component: fetch + compute → pass as props
components/[route]/XClient.tsx ← Client Component: UI state, modals, interactions
app/[route]/actions.ts         ← Server Actions: mutations with ownership validation
```

Mutations always verify `auth.uid() = user_id` before writing. Never trust client-supplied IDs alone.

### Database Tables

| Table | Purpose |
|---|---|
| `profiles` | The entities being reviewed (name, city, slug, category, service_type, tags). No `user_id` — created implicitly when a review/question is submitted. Deleted when orphaned (zero reviews + questions). |
| `reviews` | User reviews. Has `user_id`, `profile_id`, `parent_id` (for threaded replies), `type` ("review"). |
| `questions` | Forum threads. Has `user_id`, `profile_id`, `parent_id`. |
| `reports` | Content reports. Readable only by admin (RLS). |
| `review_images` | Images attached to reviews. Has `user_id` and `review_id`. |
| `notifications` | Real-time reply notifications. Read via Supabase Realtime in `Header`. |

### Thread / Reply System
Reviews and questions support nested replies via `parent_id`. `lib/build-tree.ts` converts flat arrays into `TreeNode[]` trees. `components/profile/Threadnode.tsx` renders them recursively. `components/profile/ReplyForm.tsx` handles reply submission and notification creation.

### Auth Flow
- Google OAuth: `/auth/signin` → Supabase → `/auth/callback` (route handler exchanges code for session)
- Email/password: standard Supabase `signInWithPassword`
- Session stored in cookies via `@supabase/ssr`
- User metadata (`alias`, `custom_avatar_url`) lives in `auth.users.user_metadata`

### Key Conventions
- `export const dynamic = "force-dynamic"` is required on pages that depend on session/auth to prevent static caching (set globally in root layout; repeat in `app/admin/layout.tsx`).
- Server Component pages read `params` and `searchParams` with `await` (they are Promises in Next.js 15+).
- Filter logic for the profiles directory (`/profiles`) is applied as SQL clauses (`.eq()`, `.or()`) before executing the query — never filter a full result set in JavaScript.
- The age verification gate (`components/AgeVerification.tsx`) is a client modal that persists consent in `localStorage` under the key `yafui-age-verified`.
- Admin email is hardcoded in `components/header.tsx` (`ADMIN_EMAIL` constant) — this is a known issue; the middleware uses the env var correctly.
