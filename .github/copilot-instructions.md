# Copilot Instructions for reddi-frontend

These instructions help AI coding agents work effectively in this Next.js + Supabase monorepo-style frontend. Focus on respecting existing auth, role, and component patterns.

## Stack & Architecture

- Framework: Next.js App Router (latest / React 19) with Turbopack dev (`pnpm run dev`).
- Auth: Supabase using cookie-based session via `@supabase/ssr` (`src/lib/supabase/{client,server}.ts`) + global `middleware.ts` and `src/lib/supabase/middleware.ts` for session refresh & gating.
- Styling: Tailwind CSS + some shadcn/ui primitives; custom icons under `src/components/icons`.
- Role-based layout segments: `(session)` vs `(auth)` folders under `src/app/*` (e.g. `aliado`, `repartidor`). Layouts perform server-side guards.
- Roles currently used in middleware: `admin`, `market` (aliado partner), `delivery` (repartidor), and implicit `user` fallback.

## Auth & Role Conventions

- Always use `createClient()` from `src/lib/supabase/server` inside Server Components, server actions, or layouts; use `src/lib/supabase/client` in Client Components.
- Primary source of truth for role: `profiles` table (`select role where id = user.id`). Fallback: `user.app_metadata` or `user.user_metadata`.
- Middleware (`src/lib/supabase/middleware.ts`) centralizes redirects. Mirror its role strings (`market`, `delivery`) when adding new protected sections.
- Avoid mixing previous synonyms (`aliado`, `repartidor`) for role comparisons—normalize to middleware naming.

## Protected Routes & Redirect Logic

- `middleware.ts` attaches session cookies and enforces:
  - Redirect authenticated users away from auth pages (`/login`, `/auth/*`, `/aliado/registro`, etc.).
  - Blocks unauthenticated access to `/protected`, `/admin`, `/aliado`, `/repartidor`, `/user` (unless whitelisted).
  - Performs role gate routing to role-specific homes.
- Layout-level guards (e.g. `src/app/repartidor/(session)/layout.tsx`) should defer to the same role mapping. Keep default redirect paths consistent.

## Component Patterns

- Server Components should NOT pass event handlers to children unless those children are Client Components. If interactivity needed, add `"use client"` at top or isolate an inner client component.
- Example fix: `QuickActions.tsx` converted from button with `onClick` to a `Link` to avoid runtime error.
- Display name derivation (e.g. `DeliveryHeader`): prefer user metadata fields `full_name | name | first_name | email prefix`.

## File Structure Highlights

- `src/app/*/(session)`: Authenticated areas per role (e.g. `aliado/(session)/dashboard/page.tsx`).
- `src/app/*/(auth)`: Public auth flows (`aliado/(auth)/registro`).
- `src/components/basics/dashboard/*`: Shared dashboard shell parts (`DashboardAside`, `DashboardHeader`).
- `src/components/features/*`: Domain feature groupings.
- `src/lib/finalUser|partner|...`: Data loaders and role-specific logic.
- Icons and SVG wrappers under `src/components/icons`.

## Supabase Usage

- Browser: `const supabase = createClient();` then `supabase.auth.getUser()` or `getSession()`.
- Server: `await createClient()` then auth calls. Don't cache client across requests.
- Always check for `user` before hitting tables; derive role once per request.
- Use async server functions (`"use server"`) for data-loading components that render serialized props into presentational client components.

## Adding New Role-Gated Routes

1. Create directory under `src/app/<segment>/(session)` with a layout performing guard similar to existing ones.
2. Add role mapping in middleware if new role.
3. Provide fallback redirect target for mismatched roles.
4. Keep naming consistent (lowercase, no accents).

## Common Pitfalls

- Mismatched role strings (`aliado` vs `market`, `repartidor` vs `delivery`) cause redirect loops—standardize.
- Event handlers inside Server Components trigger: `Event handlers cannot be passed...` error.
- Forgetting to include new auth pages in `authPaths` array inside `supabase/middleware.ts` means authenticated users won't be auto-redirected away.
- Using `/login` vs `/auth/login` inconsistently—pick one and align middleware + redirects.

## Typical Flows

- Login: `LoginForm` -> `supabase.auth.signInWithPassword` -> resolve role -> redirect to role home.
- Logout: call `supabase.auth.signOut()` (client) then route to login; no server action needed.
- Partner registration: `PartnerRegisterWizard` pushes to `/aliado/dashboard?registro=exitoso` on success.

## Adding Interactive Dashboard Feature

- If a dashboard component needs client interactivity (modals, mutations), wrap only the interactive part with a new client component file to minimize bundle size.
- Fetch data server-side (SSR) using a `*Server.tsx` component (pattern: `MainStatsServer`, `NotificationsServer`, `ActiveOrdersServer`).

## Tailwind & UI

- Use existing semantic colors (`bg-primary`, likely mapped in Tailwind config). Avoid hardcoding new hex values unless necessary.
- Reuse button styles seen in `LoginForm` or dashboard actions.

## What Not To Do

- Don't duplicate role logic—import helpers or mirror the middleware mapping.
- Don't store Supabase client globally.
- Don't add onClick handlers to Server Components.
- Avoid introducing new role names without updating middleware and layouts.

## Quick Reference Snippets

```ts
// Get role safely (server)
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
let role: string | null = null;
if (user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  role = (profile as any)?.role || (user.app_metadata as any)?.role || null;
}
```

```tsx
// Client logout pattern
const supabase = createClient();
await supabase.auth.signOut();
router.push("/auth/login");
```

## When Unsure

Search for similar patterns in `features/partner` or `supabase/middleware.ts` and copy structure; keep roles normalized.

---

If any area (roles, route naming, or data loading) is unclear, ask for clarification before generating large changes.
