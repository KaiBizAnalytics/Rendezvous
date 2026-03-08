# Rendezvous — Project Management Plan
**Format:** Linear-compatible issues
**Date:** March 2026
**Source:** `implementation_plan.md`

---

## Project Overview

| Field | Value |
|---|---|
| Team size assumed | 2 engineers |
| Estimated duration | 8 weeks (parallelised) / 11 weeks (sequential) |
| Issue prefix | RDV |
| Total issues | 39 |
| Milestones | 7 (M0–M6) |

---

## Labels

| Label | Meaning |
|---|---|
| `backend` | API route, server-side logic, database |
| `frontend` | React component, UI, client-side state |
| `data` | Seed data, migrations, schema |
| `devops` | Deployment, environment, configuration |
| `ai` | Claude API integration, prompt engineering |
| `chore` | Setup, config, tooling — no user-facing output |
| `feature` | User-facing capability |

---

## Size Estimates

| Size | Rough hours |
|---|---|
| XS | < 2 hrs |
| S | 2–4 hrs |
| M | 4–8 hrs |
| L | 8–16 hrs |

---

## Milestones

| ID | Name | Goal | Phase |
|---|---|---|---|
| M0 | Foundation | Repo, schema, seed data, deployed shell | Phase 0 |
| M1 | Intake | Couple completes onboarding, profile created | Phase 1 |
| M2 | Vendor Matching | Dashboard shows scored vendor results | Phase 2 |
| M3 | Shortlist | Vendors saved and persisted | Phase 3 |
| M4 | AI Chat | Streaming concierge live | Phase 4 |
| M5 | Compare | Side-by-side vendor comparison | Phase 5 |
| M6 | Checklist + Polish | Full MVP, production ready | Phase 6 |

---

## Issues

---

### M0 — Foundation

---

#### RDV-001
**Title:** Initialize Next.js project and install all dependencies
**Type:** Chore
**Labels:** `devops`
**Size:** XS
**Milestone:** M0
**Blocked by:** —

**Description:**
Scaffold the Next.js 15 application with TypeScript, Tailwind, ESLint, App Router, and `src/` directory. Install all project dependencies in a single pass to avoid version conflicts later.

**Acceptance criteria:**
- [ ] `npx create-next-app` runs with flags: `--typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] All packages installed: `@prisma/client prisma @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk zustand @tanstack/react-query zod clsx tailwind-merge`
- [ ] `npm run dev` serves `localhost:3000` with no errors
- [ ] `npm run build` completes without TypeScript errors

---

#### RDV-002
**Title:** Define Prisma schema (all 5 tables)
**Type:** Chore
**Labels:** `backend` `data`
**Size:** S
**Milestone:** M0
**Blocked by:** RDV-001

**Description:**
Write the complete `prisma/schema.prisma` covering `WeddingProfile`, `Vendor`, `ShortlistItem`, `ChecklistItem`, and `ChatMessage` with all fields, relations, and constraints as specified in the architecture plan.

**Acceptance criteria:**
- [ ] All 5 models defined with correct field types and nullability
- [ ] Foreign key relations correct (`ShortlistItem` → `WeddingProfile` + `Vendor` with cascade delete)
- [ ] `UNIQUE` constraint on `ShortlistItem(profileId, vendorId)`
- [ ] `npx prisma validate` passes with no errors
- [ ] Snake-case column names mapped via `@map` decorators

---

#### RDV-003
**Title:** Create Supabase project and configure environment
**Type:** Chore
**Labels:** `devops`
**Size:** S
**Milestone:** M0
**Blocked by:** RDV-001

**Description:**
Provision a new Supabase project, retrieve connection strings and API keys, and populate `.env.local`. Enable magic link auth in the Supabase dashboard.

**Acceptance criteria:**
- [ ] Supabase project created in `ca-central-1` region
- [ ] `.env.local` contains all 5 required variables: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ANTHROPIC_API_KEY` added to `.env.local`
- [ ] `NEXT_PUBLIC_SKIP_AUTH=true` set for local development
- [ ] `.env.local` added to `.gitignore`
- [ ] Magic link auth enabled in Supabase dashboard under Authentication → Providers

---

#### RDV-004
**Title:** Run database migration and generate Prisma client
**Type:** Chore
**Labels:** `backend` `data`
**Size:** XS
**Milestone:** M0
**Blocked by:** RDV-002, RDV-003

**Description:**
Apply the Prisma schema to the Supabase Postgres instance via `prisma migrate dev`, then generate the typed client.

**Acceptance criteria:**
- [ ] `npx prisma migrate dev --name init` completes without error
- [ ] `npx prisma generate` produces a typed client
- [ ] `npx prisma studio` opens and shows all 5 empty tables
- [ ] Running migration a second time is idempotent (no duplicate migrations)

---

#### RDV-005
**Title:** Define shared TypeScript types
**Type:** Chore
**Labels:** `backend` `frontend`
**Size:** S
**Milestone:** M0
**Blocked by:** RDV-001

**Description:**
Create `src/types/index.ts` as the single source of truth for types shared across API routes and client components: `WeddingProfile`, `Vendor`, `ShortlistItem`, `ChecklistItem`, `ChatMessage`, and the associated union types (`VendorCategory`, `WeddingStyle`, `CeremonyType`).

**Acceptance criteria:**
- [ ] All interfaces and type aliases defined in `src/types/index.ts`
- [ ] `Vendor` type includes computed `matchScore: number` field
- [ ] `ChecklistItem` includes computed `dueDate: string` (not `dueOffsetDays`)
- [ ] No `any` types in the file
- [ ] File imports cleanly from both `src/app/` and `src/lib/` without circular dependencies

---

#### RDV-006
**Title:** Create utility helpers and service clients
**Type:** Chore
**Labels:** `backend` `frontend`
**Size:** XS
**Milestone:** M0
**Blocked by:** RDV-003, RDV-004

**Description:**
Implement four utility modules: `src/lib/utils.ts` (cn, formatPrice, formatPriceRange), `src/lib/prisma.ts` (singleton PrismaClient), `src/lib/supabase/server.ts` (SSR client), `src/lib/supabase/client.ts` (browser client).

**Acceptance criteria:**
- [ ] `cn()` correctly merges Tailwind classes using clsx + tailwind-merge
- [ ] `formatPrice(800000)` returns `"$8,000"` in CAD
- [ ] `prisma.ts` uses the global singleton pattern to avoid connection pool exhaustion in dev
- [ ] Supabase server and browser clients instantiate without errors in their respective contexts

---

#### RDV-007
**Title:** Configure Tailwind design tokens and global CSS
**Type:** Chore
**Labels:** `frontend`
**Size:** S
**Milestone:** M0
**Blocked by:** RDV-001

**Description:**
Extend `tailwind.config.ts` to map color tokens (`bg`, `surface`, `rose`, `sage`, etc.) to CSS variables. Write `src/app/globals.css` with the full `:root` variable block, dark mode overrides, and Google Fonts import (Fraunces + DM Sans).

**Acceptance criteria:**
- [ ] All 9 color tokens from the style guide are available as Tailwind classes (e.g. `text-rose`, `bg-surface`)
- [ ] `font-serif` and `font-sans` utility classes apply Fraunces and DM Sans respectively
- [ ] Dark mode variables are defined under `@media (prefers-color-scheme: dark)`
- [ ] A test element using `className="bg-surface text-rose font-serif"` renders visibly correct in browser

---

#### RDV-008
**Title:** Implement Zustand app store
**Type:** Chore
**Labels:** `frontend`
**Size:** XS
**Milestone:** M0
**Blocked by:** RDV-005

**Description:**
Create `src/store/index.ts` with the `useAppStore` hook. Store persists `profile` and `shortlist` to `localStorage` via Zustand's `persist` middleware. Exposes `setProfile`, `setShortlist`, `addToShortlist`, `removeFromShortlist`, and `toggleChat`.

**Acceptance criteria:**
- [ ] Store initialises without errors in a Client Component
- [ ] `profile` and `shortlist` survive a page refresh (persisted to localStorage)
- [ ] `chatOpen` is session-only (not persisted)
- [ ] All actions update state immutably (no direct mutation)

---

#### RDV-009
**Title:** Create TanStack Query provider
**Type:** Chore
**Labels:** `frontend`
**Size:** XS
**Milestone:** M0
**Blocked by:** RDV-001

**Description:**
Create `src/app/providers.tsx` with a `QueryClient` configured at `staleTime: 60_000`. Wrap `src/app/layout.tsx` with `<Providers>`.

**Acceptance criteria:**
- [ ] `useQuery` and `useMutation` hooks are available in any Client Component
- [ ] `QueryClient` is created with `useState` to avoid shared state across requests in SSR
- [ ] Layout renders without hydration warnings

---

#### RDV-010
**Title:** Write vendor seed data (60 records, 4 categories)
**Type:** Chore
**Labels:** `data`
**Size:** L
**Milestone:** M0
**Blocked by:** RDV-004

**Description:**
Write `prisma/seed.ts` with a minimum of 15 vendors per category (venue, caterer, photographer, planner) for Vancouver, BC. Each record must include realistic price ranges (in cents), capacity where applicable, at least 3 tags, and cultural tags where relevant. Data sourced from public vendor websites and the Tulle Together pricing database.

**Acceptance criteria:**
- [ ] ≥ 15 venues — price range spans $1,500 – $25,000; capacity range spans 20 – 500
- [ ] ≥ 15 caterers — price range spans $35 – $150 per person; at least 3 vendors with `culturalTags` populated
- [ ] ≥ 15 photographers — price range spans $2,000 – $10,000 full day
- [ ] ≥ 15 planners — price range spans $1,500 – $8,000
- [ ] All records have `name`, `description` (> 50 chars), `city: "Vancouver, BC"`, `active: true`
- [ ] Seed script is idempotent (runs `deleteMany` before `createMany`)

---

#### RDV-011
**Title:** Run seed script and verify data integrity
**Type:** Chore
**Labels:** `data`
**Size:** XS
**Milestone:** M0
**Blocked by:** RDV-010

**Description:**
Execute `npx prisma db seed`, then verify all records are correct and the matching algorithm will behave as expected across the budget spectrum.

**Acceptance criteria:**
- [ ] `npx prisma db seed` exits 0
- [ ] Prisma Studio shows ≥ 60 vendor rows
- [ ] At least one venue has `priceMax < 500000` (for sub-$5k profiles)
- [ ] At least one venue has `priceMin > 1000000` (for $75k+ profiles)
- [ ] At least 3 vendors have non-empty `culturalTags`
- [ ] No vendor has `null` for `name`, `description`, or `city`

---

#### RDV-012
**Title:** Deploy shell to Vercel and configure production environment
**Type:** Chore
**Labels:** `devops`
**Size:** S
**Milestone:** M0
**Blocked by:** RDV-001, RDV-003

**Description:**
Connect the repository to Vercel, configure all production environment variables in the Vercel dashboard, and confirm a successful production build and deployment.

**Acceptance criteria:**
- [ ] Repository linked to Vercel project
- [ ] All 5 env vars (+ `ANTHROPIC_API_KEY`) set in Vercel production environment
- [ ] `vercel --prod` produces a live HTTPS URL
- [ ] Production build completes without TypeScript or lint errors
- [ ] Visiting the production URL returns a 200 (even if the page is placeholder)

---

### M1 — Intake

---

#### RDV-013
**Title:** Implement auth middleware with SKIP_AUTH bypass
**Type:** Feature
**Labels:** `backend`
**Size:** S
**Milestone:** M1
**Blocked by:** RDV-006

**Description:**
Create `src/middleware.ts` that protects `/dashboard` and `/onboarding` routes. When `NEXT_PUBLIC_SKIP_AUTH=true`, middleware passes all requests through. When false, unauthenticated users are redirected to `/`.

**Acceptance criteria:**
- [ ] Navigating to `/dashboard` without a session redirects to `/` (when auth enabled)
- [ ] With `SKIP_AUTH=true`, `/dashboard` is accessible without a session
- [ ] Middleware only runs on `/dashboard/:path*` and `/onboarding/:path*` — not on `/api/*`
- [ ] Auth session is read via Supabase SSR client (not the deprecated `auth-helpers` pattern)

---

#### RDV-014
**Title:** Build landing page
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M1
**Blocked by:** RDV-007

**Description:**
Implement `src/app/page.tsx` as a Server Component. Port the landing design from the HTML prototype: navigation bar with logo + sign-in button, hero with display headline and sub-copy, "Start planning" CTA, stats bar. Apply staggered entrance animations via CSS keyframes and `animation-delay`.

**Acceptance criteria:**
- [ ] Page renders without any client-side JavaScript (pure Server Component)
- [ ] Fraunces serif used for headline; DM Sans for body and navigation
- [ ] Decorative watermark "R" is present (CSS `text-stroke`, non-interactive)
- [ ] "Start planning" button routes to `/onboarding`
- [ ] Stats bar shows 3 figures (vendors count, success rate, time saved)
- [ ] Entrance animations play on first load (fadeUp with staggered delays)
- [ ] Page is visually correct in both light and dark mode

---

#### RDV-015
**Title:** Implement POST /api/intake route
**Type:** Feature
**Labels:** `backend`
**Size:** M
**Milestone:** M1
**Blocked by:** RDV-006, RDV-011

**Description:**
Create `src/app/api/intake/route.ts`. Accepts the wedding profile fields, validates with Zod, upserts the `WeddingProfile` record, and seeds 15 `ChecklistItem` rows on first creation only.

**Acceptance criteria:**
- [ ] Zod validation rejects malformed bodies (missing city, invalid date format, negative guest count)
- [ ] Valid submission creates a `WeddingProfile` row in the database
- [ ] Submitting a second time updates the existing profile (upsert, not duplicate)
- [ ] 15 checklist items are created on first submission (not on subsequent updates)
- [ ] Budget values are stored in cents (e.g., `$30,000` → `3000000`)
- [ ] Returns `{ profileId: string }` on success
- [ ] Returns `400` with field name on validation failure

---

#### RDV-016
**Title:** Build onboarding page shell and step state management
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M1
**Blocked by:** RDV-007, RDV-013

**Description:**
Create `src/app/onboarding/page.tsx` as a Client Component. Manages `step` (1 | 2 | 3) and `form` state. Renders the two-column layout: animated left panel (copy changes per step) and right panel (form steps). Includes progress dot indicators.

**Acceptance criteria:**
- [ ] Two-column layout renders correctly at desktop width (≥ 1024px)
- [ ] Progress dots update correctly: active = rose pill, done = sage circle, upcoming = border circle
- [ ] Left panel copy (eyebrow + headline + description) transitions when step changes
- [ ] Step number in nav bar ("Step 2 of 3") updates correctly
- [ ] Back navigation preserves previously entered form values

---

#### RDV-017
**Title:** Build StepWhereWhen component
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M1
**Blocked by:** RDV-016

**Description:**
Implement the first intake step: city text input, wedding date date picker, and ceremony type select. All inputs styled per the style guide (champagne background, rose focus ring, DM Sans labels).

**Acceptance criteria:**
- [ ] City input is a free text field with placeholder "e.g. Vancouver, BC"
- [ ] Date input uses `type="date"` (native picker, no custom library for MVP)
- [ ] Ceremony type select has 5 options: Indoor, Outdoor, Beach, Destination, Not sure yet
- [ ] "Continue →" button advances to step 2
- [ ] All inputs bind bidirectionally to the parent `form` state

---

#### RDV-018
**Title:** Build StepSizeBudget component
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M1
**Blocked by:** RDV-016

**Description:**
Implement the second intake step: guest count number input, budget range select (5 preset ranges), and priority category select. Budget select maps to `budgetMin`/`budgetMax` in cents.

**Acceptance criteria:**
- [ ] Guest count input is `type="number"` with `min=1` and `max=1000`
- [ ] Budget select options: Under $15k / $15–30k / $30–50k / $50–75k / $75k+
- [ ] Selecting a budget range correctly populates `budgetMin` and `budgetMax` in cents
- [ ] Priority select has 4 options (venue, photographer, caterer, all equally)
- [ ] "← Back" returns to step 1 with form values preserved

---

#### RDV-019
**Title:** Build StepVision component
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M1
**Blocked by:** RDV-016

**Description:**
Implement the third intake step: 6 clickable style option cards (Classic, Bohemian, Modern, Intimate, Cultural, Garden Party) and an optional cultural requirements text input.

**Acceptance criteria:**
- [ ] Style cards display in a 2-column grid
- [ ] Clicking a style card selects it (rose border, tinted background) and deselects any previous selection
- [ ] Only one style card can be selected at a time
- [ ] Cultural requirements input is labelled as optional
- [ ] "Find my vendors" button is the primary CTA on this step (not "Continue →")
- [ ] Selected style and cultural input bind to parent `form` state

---

#### RDV-020
**Title:** Wire intake form submission to API and redirect to dashboard
**Type:** Feature
**Labels:** `frontend` `backend`
**Size:** S
**Milestone:** M1
**Blocked by:** RDV-015, RDV-017, RDV-018, RDV-019

**Description:**
Connect the StepVision "Find my vendors" button to `POST /api/intake`. On success, write the returned profile to the Zustand store and navigate to `/dashboard`. Show a loading state during the API call.

**Acceptance criteria:**
- [ ] Clicking "Find my vendors" calls `POST /api/intake` with all form values
- [ ] During the API call, the button shows a loading spinner and is disabled
- [ ] On success, `useAppStore.setProfile()` is called with the profile data
- [ ] User is redirected to `/dashboard` via `router.push()`
- [ ] On API error, an error message is shown (no silent failure)
- [ ] Visiting `/onboarding` with an existing profile in the store redirects directly to `/dashboard`

---

### M2 — Vendor Matching

---

#### RDV-021
**Title:** Implement vendor matching and scoring algorithm
**Type:** Feature
**Labels:** `backend`
**Size:** M
**Milestone:** M2
**Blocked by:** RDV-011

**Description:**
Create `src/lib/matching.ts` with `scoreVendor()` and `filterVendors()` pure functions. Scoring weights: budget fit 40pts, capacity fit 30pts, cultural fit 20pts, profile completeness 10pts. Budget fit uses per-category allocation percentages from the architecture plan.

**Acceptance criteria:**
- [ ] `scoreVendor()` returns a number 0–100 for any vendor + profile combination
- [ ] A venue within the allocated budget range scores ≥ 70
- [ ] A venue double the budget scores ≤ 30
- [ ] A caterer with matching `culturalTags` scores higher than an identical caterer without them (given a profile with cultural requirements)
- [ ] `filterVendors()` excludes vendors where `v.city !== profile.city`
- [ ] `filterVendors()` excludes vendors where `active = false`
- [ ] Both functions are pure (no database calls, no side effects) — testable in isolation

---

#### RDV-022
**Title:** Implement GET /api/vendors route
**Type:** Feature
**Labels:** `backend`
**Size:** S
**Milestone:** M2
**Blocked by:** RDV-021, RDV-015

**Description:**
Create `src/app/api/vendors/route.ts`. Reads the user's profile from the database, fetches all active vendors, runs `filterVendors()` with optional category filter, and returns the top results with match scores.

**Acceptance criteria:**
- [ ] Returns `{ vendors: Vendor[], total: number }`
- [ ] `?category=venue` returns only venue vendors
- [ ] `?category=all` (or no param) returns top 12 across all categories
- [ ] Each returned vendor includes `matchScore` field
- [ ] Returns `404` if no profile exists for the user
- [ ] Results are sorted by `matchScore DESC`

---

#### RDV-023
**Title:** Build dashboard layout (sidebar shell and topbar)
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M2
**Blocked by:** RDV-008, RDV-009, RDV-020

**Description:**
Implement `src/app/dashboard/layout.tsx`. Sticky left sidebar (`ShortlistSidebar` placeholder), fixed topbar with greeting and "Ask your concierge" button, scrollable main content area. Both sidebar and topbar are Client Components reading from Zustand.

**Acceptance criteria:**
- [ ] Three-column layout: sidebar (272px fixed) | main (flex-1) | chat panel (overlay)
- [ ] Sidebar scrolls independently from main content
- [ ] Topbar stays fixed at top of main content area on scroll
- [ ] "Ask your concierge ✦" button is present in topbar (wired in RDV-032)
- [ ] Wedding greeting uses italic Fraunces for the personalised portion
- [ ] Layout does not break if `profile` is null (guard against store hydration delay)

---

#### RDV-024
**Title:** Build VendorCard component
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M2
**Blocked by:** RDV-007

**Description:**
Create `src/components/VendorCard.tsx`. Displays vendor image/emoji placeholder, match score badge, category label, name (Fraunces), location, tags, price range, capacity, and a save/unsave heart button.

**Acceptance criteria:**
- [ ] Card has border-radius 12px, champagne background, 1px border
- [ ] Match score badge uses sage tag style
- [ ] Vendor name uses `font-serif` at ~19px
- [ ] Price range displayed as formatted CAD (e.g. "$3,500 – $8,000")
- [ ] Price unit label displayed below price (e.g. "venue rental")
- [ ] Tags rendered as rose-tinted tag chips
- [ ] Heart button: `♡` when unsaved, `♥` (rose) when saved
- [ ] Card lifts `translateY(-3px)` on hover with smooth transition
- [ ] Component accepts `isSaved: boolean` and `onSave: () => void` as props

---

#### RDV-025
**Title:** Build VendorGrid with category filter and loading state
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M2
**Blocked by:** RDV-022, RDV-024

**Description:**
Create `src/components/VendorGrid.tsx`. Uses TanStack Query to fetch from `/api/vendors?category={cat}`. Renders category filter buttons (All / Venues / Caterers / Photographers / Planners) that update the query key. Shows skeleton cards during loading.

**Acceptance criteria:**
- [ ] Category filter buttons update displayed vendors without a page reload
- [ ] Active category button has surface background + border styling
- [ ] Vendor count ("12 vendors found") updates when category changes
- [ ] While loading, 6 skeleton placeholder cards are shown (pulsing animation)
- [ ] On error, a non-crashing message is displayed ("Unable to load vendors. Try again.")
- [ ] Cards stagger in using `animation-delay` increments of 60ms

---

#### RDV-026
**Title:** Wire VendorGrid into dashboard page
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M2
**Blocked by:** RDV-023, RDV-025

**Description:**
Implement `src/app/dashboard/page.tsx`. Renders a section header ("Recommended for you") and `<VendorGrid>` inside the dashboard layout. This is the page a user lands on after completing intake.

**Acceptance criteria:**
- [ ] Page renders at `/dashboard` after intake is complete
- [ ] VendorGrid is present and fetches real vendor data
- [ ] Section heading uses `font-serif` H2 styling
- [ ] Page does not error if navigated to directly (without completing intake first) — shows empty state instead

---

### M3 — Shortlist

---

#### RDV-027
**Title:** Implement POST /api/shortlist route
**Type:** Feature
**Labels:** `backend`
**Size:** S
**Milestone:** M3
**Blocked by:** RDV-015

**Description:**
Create `src/app/api/shortlist/route.ts`. Accepts `{ vendorId, action: "add" | "remove", notes? }`. Upserts or deletes the `ShortlistItem` record. Returns the full updated shortlist with vendor details included.

**Acceptance criteria:**
- [ ] `action: "add"` creates a `ShortlistItem` record
- [ ] `action: "add"` on an already-saved vendor does not create a duplicate (upsert)
- [ ] `action: "remove"` deletes the record
- [ ] Returns the full shortlist: `{ shortlist: ShortlistItem[] }` with `vendor` relation included
- [ ] Returns `404` if no profile exists
- [ ] Returns `400` if `vendorId` is not a valid UUID

---

#### RDV-028
**Title:** Build ShortlistSidebar component
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M3
**Blocked by:** RDV-008, RDV-023

**Description:**
Implement `src/components/ShortlistSidebar.tsx`. Reads shortlist from Zustand. Displays the logo, wedding profile summary (city, date, guests, budget), a shortlist count badge, and scrollable list of saved vendors with remove buttons.

**Acceptance criteria:**
- [ ] Logo `Rendez<rose>vous</rose>` is present at top of sidebar
- [ ] Wedding profile displays all 4 details (city, date, guest count, budget)
- [ ] Profile icons are consistent (location pin, calendar, people, money)
- [ ] Empty state reads "Your shortlist is waiting." (no exclamation mark, per style guide)
- [ ] Each saved vendor shows name, category, and a `×` remove button
- [ ] Clicking `×` calls `removeFromShortlist()` immediately (Zustand) and triggers API call
- [ ] "Compare" link appears when ≥ 2 vendors are shortlisted
- [ ] Shortlist count badge (`0 saved`, `3 saved`) updates reactively

---

#### RDV-029
**Title:** Implement optimistic shortlist mutation in VendorGrid
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M3
**Blocked by:** RDV-027, RDV-028, RDV-025

**Description:**
Wire the `VendorCard` save button to a TanStack Query `useMutation` with optimistic updates. The Zustand store updates immediately on click; the API call happens in the background. On API failure, the store is rolled back.

**Acceptance criteria:**
- [ ] Clicking the heart button updates the sidebar instantly (no perceptible delay)
- [ ] API call is made in the background after the optimistic update
- [ ] If the API call fails, the heart button reverts to its previous state
- [ ] The heart button is not disabled during the API call (optimistic UX)
- [ ] Saving a vendor increments the shortlist count badge in the sidebar immediately
- [ ] Refreshing the page retains the shortlist (fetched from DB on mount)

---

### M4 — AI Chat

---

#### RDV-030
**Title:** Implement POST /api/chat streaming route
**Type:** Feature
**Labels:** `backend` `ai`
**Size:** L
**Milestone:** M4
**Blocked by:** RDV-021, RDV-015

**Description:**
Create `src/app/api/chat/route.ts` with `export const runtime = 'edge'`. Fetches the user's profile, top 10 matched vendors, and last 6 chat messages. Constructs the system prompt from the architecture plan, calls Claude via streaming, pipes SSE to the client, and persists both messages after the stream completes.

**Acceptance criteria:**
- [ ] Route is on Edge runtime (required for SSE streaming in Vercel)
- [ ] Response is `text/event-stream` with `Cache-Control: no-cache`
- [ ] Each token is emitted as `data: {"chunk": "..."}\n\n`
- [ ] Stream terminates with `data: [DONE]\n\n`
- [ ] System prompt includes: profile city, date, guests, budget (formatted CAD), style, cultural reqs
- [ ] System prompt includes top 10 vendors as JSON (id, category, name, priceMin, priceMax, priceUnit, culturalTags)
- [ ] Last 6 chat messages are passed as `messages` history to Claude
- [ ] Both user message and complete assistant response are persisted to `chat_messages` after stream ends
- [ ] If profile does not exist, returns `404` (not a stream)
- [ ] Prompt instructs Claude to keep responses ≤ 120 words unless asked to elaborate
- [ ] Prompt instructs Claude not to fabricate vendors outside the provided list

---

#### RDV-031
**Title:** Implement useChat hook
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M4
**Blocked by:** RDV-030

**Description:**
Create `src/hooks/useChat.ts`. Manages local message array state, sends user messages to `/api/chat`, reads the SSE stream token-by-token, and appends tokens to the last (assistant) message in real time.

**Acceptance criteria:**
- [ ] `sendMessage(content)` appends the user message immediately
- [ ] An empty assistant message is appended before the stream starts
- [ ] Each received chunk is appended to the assistant message in state
- [ ] `isStreaming` is `true` during the stream, `false` after `[DONE]`
- [ ] The hook handles stream errors gracefully (sets `isStreaming = false`, shows error bubble)
- [ ] Initial messages can be seeded (for loading chat history from DB on mount)

---

#### RDV-032
**Title:** Build ChatPanel component
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M4
**Blocked by:** RDV-031, RDV-023

**Description:**
Create `src/components/ChatPanel.tsx`. Slides in from the right when `chatOpen` is true in Zustand. Renders conversation as message bubbles (user right-aligned, AI left). Shows typing indicator dots while streaming. Includes quick suggestion chips and a text input with send button.

**Acceptance criteria:**
- [ ] Panel slides in/out via CSS `transform: translateX(100%)` → `0` at `0.45s` transition
- [ ] "Ask your concierge ✦" button in topbar toggles the panel
- [ ] `×` button in panel header closes it
- [ ] AI messages appear on the left with a `✦` avatar; user messages on the right
- [ ] Three animated dots appear while `isStreaming` is true
- [ ] Dots disappear and final text appears when stream completes
- [ ] Message container auto-scrolls to the latest message
- [ ] Suggestion chips pre-fill the input and trigger send: "Venue under $10k?", "Budget breakdown", "Best photographers", "When to book?"
- [ ] Input submits on Enter key press
- [ ] Panel is full-width on screens < 768px

---

### M5 — Compare

---

#### RDV-033
**Title:** Build CompareTable component
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M5
**Blocked by:** RDV-029

**Description:**
Create `src/components/CompareTable.tsx`. Renders shortlisted vendors in a side-by-side attribute table: category, price range, capacity, match score, tags, cultural fit, and an editable notes field. Max 4 vendors.

**Acceptance criteria:**
- [ ] Attribute labels in the left column; vendor values fill subsequent columns
- [ ] Price range formatted as CAD (e.g. "$3,500 – $8,000")
- [ ] Tags rendered as chips within the table cell
- [ ] Match score shown as a percentage
- [ ] Notes field is a `<textarea>` that auto-resizes; saves on blur
- [ ] Remove button at the bottom of each vendor column triggers `removeFromShortlist()`
- [ ] Table scrolls horizontally on smaller screens

---

#### RDV-034
**Title:** Build /dashboard/compare page and notes persistence
**Type:** Feature
**Labels:** `frontend` `backend`
**Size:** S
**Milestone:** M5
**Blocked by:** RDV-033

**Description:**
Implement `src/app/dashboard/compare/page.tsx`. Renders `CompareTable` when ≥ 2 vendors are shortlisted; shows an empty state otherwise. Add `PATCH /api/shortlist/[id]` to persist notes edits.

**Acceptance criteria:**
- [ ] Page is accessible at `/dashboard/compare`
- [ ] With ≥ 2 vendors shortlisted, `CompareTable` renders correctly
- [ ] With < 2 vendors, shows: "Add at least two vendors to compare." with a link to `/dashboard`
- [ ] Editing a vendor's notes field and blurring saves to the database
- [ ] Notes persist after page refresh
- [ ] `PATCH /api/shortlist/[id]` accepts `{ notes: string }` and returns updated item

---

### M6 — Checklist and Polish

---

#### RDV-035
**Title:** Implement checklist API routes
**Type:** Feature
**Labels:** `backend`
**Size:** S
**Milestone:** M6
**Blocked by:** RDV-015

**Description:**
Create `src/app/api/checklist/route.ts` (GET) and `src/app/api/checklist/[id]/route.ts` (PATCH). GET returns checklist items with computed `dueDate` strings. PATCH toggles `completed` and sets/clears `completedAt`.

**Acceptance criteria:**
- [ ] GET returns all checklist items for the user's profile, ordered by `dueOffsetDays ASC`
- [ ] Each item includes a computed `dueDate` string (wedding date + offset)
- [ ] `dueDate` is formatted `YYYY-MM-DD`
- [ ] PATCH with `{ completed: true }` sets `completedAt` to current timestamp
- [ ] PATCH with `{ completed: false }` clears `completedAt` to null
- [ ] Both routes return 404 if no profile exists

---

#### RDV-036
**Title:** Build checklist UI page
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M6
**Blocked by:** RDV-035, RDV-023

**Description:**
Implement `src/app/dashboard/checklist/page.tsx`. Groups tasks into timeframe buckets relative to today's date. Each row has a checkbox, title, due date, and category badge. Completed tasks show strikethrough. Completion updates optimistically.

**Acceptance criteria:**
- [ ] Tasks grouped into: "12+ months out", "6–12 months", "3–6 months", "Under 3 months", "Overdue"
- [ ] Groups with no tasks are not rendered
- [ ] "Overdue" group uses rose-tinted styling to indicate urgency
- [ ] Checking a box updates the UI immediately (optimistic) and sends PATCH
- [ ] Completed task text has CSS `line-through` and muted colour
- [ ] Unchecking a completed task reverts it
- [ ] Page shows a skeleton loader while fetching

---

#### RDV-037
**Title:** Implement error handling conventions and Toast component
**Type:** Chore
**Labels:** `frontend` `backend`
**Size:** S
**Milestone:** M6
**Blocked by:** RDV-023

**Description:**
Create `src/components/ui/Toast.tsx` and `src/hooks/useToast.ts`. Toast renders in a fixed bottom-right portal. All API routes are audited to return consistent error shapes `{ error: string, field?: string }`. Client-side API calls are audited to display toast on failure.

**Acceptance criteria:**
- [ ] Toast appears in bottom-right corner, auto-dismisses after 4 seconds
- [ ] Toast has error (rose) and success (sage) variants
- [ ] Every `useMutation` `onError` handler calls `showToast({ type: 'error', message: '...' })`
- [ ] All API routes return `{ error: string }` on failure (no unstructured error objects)
- [ ] No unhandled Promise rejections in the browser console during normal use

---

#### RDV-038
**Title:** Mobile responsive adjustments
**Type:** Chore
**Labels:** `frontend`
**Size:** M
**Milestone:** M6
**Blocked by:** RDV-026, RDV-032, RDV-036

**Description:**
Audit all views at 375px (iPhone SE) and 768px (iPad). Apply responsive adjustments: sidebar collapses to a drawer on mobile, chat panel is full-screen, vendor grid is single-column, onboarding stacks to single column.

**Acceptance criteria:**
- [ ] Onboarding form renders correctly at 375px (single column, no horizontal scroll)
- [ ] Dashboard sidebar is hidden by default on < 768px; accessible via a hamburger toggle
- [ ] Vendor grid is 1-column at 375px, 2-column at 768px, 3+ columns at 1024px+
- [ ] Chat panel is full-width and full-height on mobile
- [ ] No horizontal scrollbar appears on any page at 375px

---

#### RDV-039
**Title:** Production smoke test and Definition of Done verification
**Type:** Chore
**Labels:** `devops`
**Size:** S
**Milestone:** M6
**Blocked by:** RDV-001 through RDV-038

**Description:**
Run the complete user journey end-to-end on the production Vercel URL. Verify all 6 Definition of Done criteria from the implementation plan. Confirm no console errors, no broken API calls, and streaming chat works on production Edge runtime.

**Acceptance criteria:**
- [ ] A new visitor can reach landing → complete intake → reach dashboard in < 3 minutes
- [ ] Dashboard displays ≥ 10 vendors from the database, with visible match scores
- [ ] AI concierge answers the 5 test queries from PRD §2 with grounded responses
- [ ] 2+ vendors can be shortlisted and the compare view renders correctly
- [ ] Checklist shows 15 tasks with accurate due dates relative to the profile's wedding date
- [ ] All of the above works at the production Vercel URL (not localhost)
- [ ] No unhandled errors in Vercel function logs during the smoke test

---

## Dependency Graph

```
RDV-001
├── RDV-002 → RDV-004 → RDV-006, RDV-010 → RDV-011
├── RDV-003 → RDV-004, RDV-006, RDV-012
├── RDV-005 → RDV-006, RDV-008
├── RDV-007 → RDV-014, RDV-024
├── RDV-008 → RDV-028
├── RDV-009
└── RDV-012

RDV-011 → RDV-010 → RDV-021
RDV-006, RDV-011 → RDV-015
RDV-006 → RDV-013 → RDV-016 → RDV-017, RDV-018, RDV-019

RDV-015 + RDV-017 + RDV-018 + RDV-019 → RDV-020
RDV-008 + RDV-009 + RDV-020 → RDV-023

RDV-021 → RDV-022
RDV-021 + RDV-015 → RDV-030

RDV-022 + RDV-024 → RDV-025 → RDV-026
RDV-008 + RDV-023 → RDV-028
RDV-027 + RDV-028 + RDV-025 → RDV-029

RDV-030 → RDV-031 → RDV-032
RDV-029 → RDV-033 → RDV-034

RDV-015 → RDV-035 → RDV-036
RDV-023 → RDV-037

RDV-026 + RDV-032 + RDV-036 → RDV-038
[all] → RDV-039
```

---

## Sprint Plan (2-Engineer Team)

Assumes Eng A owns backend/data, Eng B owns frontend/components. Work is parallelised where dependencies allow.

---

### Sprint 1 — Weeks 1–2 | Milestone M0: Foundation

| Issue | Owner | Size |
|---|---|---|
| RDV-001 Init repo + install deps | A or B | XS |
| RDV-002 Prisma schema | A | S |
| RDV-003 Supabase setup + env | A | S |
| RDV-004 Migration + generate | A | XS |
| RDV-005 Shared TypeScript types | A | S |
| RDV-006 Utility helpers + clients | A | XS |
| RDV-007 Tailwind tokens + globals | B | S |
| RDV-008 Zustand store | B | XS |
| RDV-009 TanStack Query provider | B | XS |
| RDV-010 Vendor seed data | A | L |
| RDV-011 Run seed + verify | A | XS |
| RDV-012 Vercel deploy | A | S |

**Sprint goal:** `npm run dev` shows the app; `npx prisma studio` shows 60+ vendors; production URL is live.

---

### Sprint 2 — Weeks 3–4 | Milestone M1: Intake

| Issue | Owner | Size |
|---|---|---|
| RDV-013 Auth middleware | A | S |
| RDV-015 POST /api/intake | A | M |
| RDV-014 Landing page | B | M |
| RDV-016 Onboarding page shell | B | S |
| RDV-017 StepWhereWhen | B | S |
| RDV-018 StepSizeBudget | B | S |
| RDV-019 StepVision | B | S |
| RDV-020 Wire submit → redirect | A+B | S |

**Sprint goal:** A user can complete the full intake flow and a `WeddingProfile` + 15 `ChecklistItem` rows appear in the database.

---

### Sprint 3 — Weeks 5–6 | Milestone M2: Vendor Matching

| Issue | Owner | Size |
|---|---|---|
| RDV-021 Matching algorithm | A | M |
| RDV-022 GET /api/vendors | A | S |
| RDV-023 Dashboard layout | B | M |
| RDV-024 VendorCard | B | S |
| RDV-025 VendorGrid | B | M |
| RDV-026 Dashboard page | B | S |

**Sprint goal:** The dashboard shows real vendor cards from the database with visible, meaningful match scores. Category filters work.

---

### Sprint 4 — Week 7 | Milestone M3: Shortlist

| Issue | Owner | Size |
|---|---|---|
| RDV-027 POST /api/shortlist | A | S |
| RDV-028 ShortlistSidebar | B | S |
| RDV-029 Optimistic mutation | A+B | M |

**Sprint goal:** Saving a vendor updates the sidebar instantly and persists across refreshes.

---

### Sprint 5 — Weeks 7–8 | Milestone M4: AI Chat

| Issue | Owner | Size |
|---|---|---|
| RDV-030 POST /api/chat (streaming) | A | L |
| RDV-031 useChat hook | B | M |
| RDV-032 ChatPanel | B | M |

*Note: RDV-030 and RDV-031/RDV-032 can be developed in parallel once the API contract (SSE format) is agreed upfront.*

**Sprint goal:** The chat panel opens, a user can send a message, and a streaming response referencing real vendors appears token-by-token.

---

### Sprint 6 — Week 8 | Milestones M5 + M6: Compare + Checklist

| Issue | Owner | Size |
|---|---|---|
| RDV-035 Checklist API routes | A | S |
| RDV-034 PATCH notes + /compare page | A | S |
| RDV-033 CompareTable | B | M |
| RDV-036 Checklist UI | B | M |

**Sprint goal:** Vendors can be compared side-by-side. Checklist renders 15 tasks grouped by timeframe.

---

### Sprint 7 — Week 9 | Polish + Launch

| Issue | Owner | Size |
|---|---|---|
| RDV-037 Error handling + Toast | A+B | S |
| RDV-038 Mobile responsive | B | M |
| RDV-039 Production smoke test | A+B | S |

**Sprint goal:** All Definition of Done criteria pass on the production URL. MVP ships.

---

## Summary Metrics

| Metric | Value |
|---|---|
| Total issues | 39 |
| Feature issues | 26 |
| Chore issues | 13 |
| XS issues | 9 |
| S issues | 18 |
| M issues | 10 |
| L issues | 2 |
| Estimated sprints | 7 |
| Estimated calendar time (2 eng) | 9 weeks |
| Critical path | RDV-001 → 002 → 003 → 004 → 010 → 011 → 021 → 030 → 031 → 032 → 039 |

The critical path runs through the data model and AI chat — the two highest-risk deliverables. De-risking RDV-030 (streaming chat) early in Sprint 5 is the single highest-leverage scheduling decision.
