# Rendezvous — Project Management Plan
**Format:** Linear-compatible issues
**Version:** 2.0
**Date:** March 23, 2026
**Source:** `implementation_plan.md` (v2 Vision Board pivot)

---

## Project Overview

| Field | Value |
|---|---|
| Team size assumed | 2 engineers |
| Estimated duration | 8 weeks (parallelised) / 11 weeks (sequential) |
| Issue prefix | RDV |
| Total issues | 46 |
| Milestones | 7 (M0–M6) |

---

## What Changed in v2

The hero feature of v2 is the **Interactive Wedding Vision Board** — an AI-generated ceremony scene image with a budget callout overlay. The AI concierge chatbot has been **removed from MVP scope** and deferred post-launch.

**Removed from v1:** All AI chat issues (RDV-030 through RDV-032: streaming API route, `useChat` hook, `ChatPanel` component, SSE streaming, system prompt engineering, chat message storage).

**Added in v2:** Budget allocation engine, image prompt builder, image generation pipeline, image storage, Vision Board overlay component, budget callout interactions, budget summary bar, budget adjustment UI, regenerate button, fallback image system, dashboard Vision Board summary card, dashboard budget tracker section, and updated vendor matching to use per-category Vision Board allocations.

---

## Labels

| Label | Meaning |
|---|---|
| `backend` | API route, server-side logic, database |
| `frontend` | React component, UI, client-side state |
| `data` | Seed data, migrations, schema |
| `devops` | Deployment, environment, configuration |
| `ai` | Image generation API, prompt engineering |
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
| M1 | Intake | Couple completes 3-step onboarding, profile created | Phase 1 |
| M2 | Vision Board Core | Budget engine, image generation pipeline, Vision Board overlay live | Phase 2 |
| M3 | Vision Board Polish | Callout interactions, budget adjustments, regenerate, fallback | Phase 3 |
| M4 | Shortlist | Vendors saved and persisted | Phase 4 |
| M5 | Compare + Checklist | Side-by-side comparison and checklist | Phase 5 |
| M6 | Vendor Matching + Dashboard + Polish | Updated matching, dashboard Vision Board card, error handling, mobile, smoke test | Phase 6 |

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
- [ ] All packages installed: `@prisma/client prisma @supabase/supabase-js @supabase/ssr zustand @tanstack/react-query zod clsx tailwind-merge`
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
Write the complete `prisma/schema.prisma` covering `WeddingProfile`, `Vendor`, `ShortlistItem`, `ChecklistItem`, and `VisionBoard` with all fields, relations, and constraints. Replace `ChatMessage` with `VisionBoard` (stores generated image URL, prompt, budget allocations JSON, and fallback template ID).

**Acceptance criteria:**
- [ ] All 5 models defined with correct field types and nullability
- [ ] `VisionBoard` has fields: `id`, `profileId` (FK → `WeddingProfile`, cascade delete), `imageUrl` (nullable), `imagePrompt`, `budgetAllocations` (JSON), `fallbackTemplateId` (nullable), `createdAt`, `updatedAt`
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
Provision a new Supabase project, retrieve connection strings and API keys, and populate `.env.local`. Enable magic link auth and create the `vision-board-images` storage bucket.

**Acceptance criteria:**
- [ ] Supabase project created in `ca-central-1` region
- [ ] `.env.local` contains all required variables: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `IMAGE_GENERATION_API_KEY` (DALL·E 3 or Stability AI) added to `.env.local`
- [ ] `IMAGE_GENERATION_PROVIDER` set to `"dalle"` or `"stability"` in `.env.local`
- [ ] `NEXT_PUBLIC_SKIP_AUTH=true` set for local development
- [ ] `.env.local` added to `.gitignore`
- [ ] `vision-board-images` Supabase Storage bucket created with public read access
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
- [ ] `npx prisma studio` opens and shows all 5 empty tables (including `VisionBoard`)
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
Create `src/types/index.ts` as the single source of truth for types shared across API routes and client components: `WeddingProfile`, `Vendor`, `ShortlistItem`, `ChecklistItem`, `VisionBoard`, `BudgetAllocations`, and associated union types (`VendorCategory`, `WeddingStyle`, `CeremonyType`).

**Acceptance criteria:**
- [ ] All interfaces and type aliases defined in `src/types/index.ts`
- [ ] `Vendor` type includes computed `matchScore: number` field
- [ ] `ChecklistItem` includes computed `dueDate: string` (not `dueOffsetDays`)
- [ ] `BudgetAllocations` type defined as `Record<VendorCategory, number>` (amounts in cents)
- [ ] `VisionBoard` type includes `imageUrl: string | null`, `budgetAllocations: BudgetAllocations`, `fallbackTemplateId: string | null`
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
Create `src/store/index.ts` with the `useAppStore` hook. Store persists `profile`, `shortlist`, and `visionBoard` to `localStorage` via Zustand's `persist` middleware. Exposes `setProfile`, `setShortlist`, `addToShortlist`, `removeFromShortlist`, `setVisionBoard`, and `updateBudgetAllocations`.

**Acceptance criteria:**
- [ ] Store initialises without errors in a Client Component
- [ ] `profile`, `shortlist`, and `visionBoard` survive a page refresh (persisted to localStorage)
- [ ] `visionBoardOpen` is session-only (not persisted)
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
Write `prisma/seed.ts` with a minimum of 15 vendors per category (venue, caterer, photographer, planner) for Vancouver, BC. Each record must include realistic price ranges (in cents), capacity where applicable, at least 3 tags, and cultural tags where relevant.

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
- [ ] All env vars (including `IMAGE_GENERATION_API_KEY` and `IMAGE_GENERATION_PROVIDER`) set in Vercel production environment
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
Create `src/app/api/intake/route.ts`. Accepts the wedding profile fields, validates with Zod, upserts the `WeddingProfile` record, and seeds 15 `ChecklistItem` rows on first creation only. The 3-step intake collects: city + date + ceremony type (step 1), guest count + budget range + priority (step 2), style + cultural requirements (step 3).

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
Create `src/app/onboarding/page.tsx` as a Client Component. Manages `step` (1 | 2 | 3) and `form` state. Renders the two-column layout: animated left panel (copy changes per step) and right panel (form steps). Includes progress dot indicators. This is a 3-step wizard (simplified from v1's 4-step flow).

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
Implement the third intake step: 6 clickable style option cards (Classic, Bohemian, Modern, Intimate, Cultural, Garden Party) and an optional cultural requirements text input. This is the final step — replaces the v1 4-step flow.

**Acceptance criteria:**
- [ ] Style cards display in a 2-column grid
- [ ] Clicking a style card selects it (rose border, tinted background) and deselects any previous selection
- [ ] Only one style card can be selected at a time
- [ ] Cultural requirements input is labelled as optional
- [ ] "Create my Vision Board →" button is the primary CTA on this step (not "Find my vendors")
- [ ] Selected style and cultural input bind to parent `form` state

---

#### RDV-020
**Title:** Wire intake form submission to API and redirect to generating view
**Type:** Feature
**Labels:** `frontend` `backend`
**Size:** S
**Milestone:** M1
**Blocked by:** RDV-015, RDV-017, RDV-018, RDV-019

**Description:**
Connect the StepVision "Create my Vision Board" button to `POST /api/intake`. On success, write the returned profile to the Zustand store and navigate to `/dashboard/vision-board/generating` (a loading/generating interstitial). Show a loading state during the API call.

**Acceptance criteria:**
- [ ] Clicking "Create my Vision Board →" calls `POST /api/intake` with all form values
- [ ] During the API call, the button shows a loading spinner and is disabled
- [ ] On success, `useAppStore.setProfile()` is called with the profile data
- [ ] User is redirected to `/dashboard/vision-board/generating` via `router.push()`
- [ ] On API error, an error message is shown (no silent failure)
- [ ] Visiting `/onboarding` with an existing profile in the store redirects directly to `/dashboard`

---

### M2 — Vision Board Core

---

#### RDV-021
**Title:** Implement `allocateBudget` pure function
**Type:** Feature
**Labels:** `backend`
**Size:** M
**Milestone:** M2
**Blocked by:** RDV-005

**Description:**
Create `src/lib/budget.ts` with the `allocateBudget(profile: WeddingProfile): BudgetAllocations` pure function. Uses priority-weighted allocation percentages based on Vancouver market benchmarks. The function distributes the total budget across all vendor categories, boosting the priority category's share.

**Acceptance criteria:**
- [ ] Returns a `BudgetAllocations` object with a key for every `VendorCategory`
- [ ] All allocated amounts sum to ≤ the profile's `budgetMax`
- [ ] When `priority = "venue"`, venue allocation ≥ 35% of total budget
- [ ] When `priority = "photographer"`, photographer allocation ≥ 20% of total budget
- [ ] When `priority = "all equally"`, no single category exceeds 40% of total budget
- [ ] Allocations reflect Vancouver benchmark percentages (venue ~35%, catering ~30%, photography ~15%, planner ~10%, misc ~10%) as a starting baseline before priority adjustment
- [ ] Function is pure — no database calls, no side effects, fully unit-testable
- [ ] All allocation values are in cents (integers)

---

#### RDV-022
**Title:** Implement `buildImagePrompt` function
**Type:** Feature
**Labels:** `backend` `ai`
**Size:** S
**Milestone:** M2
**Blocked by:** RDV-005

**Description:**
Create `src/lib/imagePrompt.ts` with the `buildImagePrompt(profile: WeddingProfile): string` function. Constructs a descriptive natural-language prompt suitable for DALL·E 3 or Stability AI, incorporating the couple's ceremony type, wedding style, city/setting, and season derived from the wedding date.

**Acceptance criteria:**
- [ ] Prompt includes the ceremony type (e.g. "outdoor garden ceremony")
- [ ] Prompt includes the wedding style (e.g. "bohemian aesthetic with wild florals")
- [ ] Prompt includes the city/region context (e.g. "Vancouver, BC, Pacific Northwest")
- [ ] Prompt derives season from wedding date (e.g. June → "summer golden hour light")
- [ ] Prompt ends with a quality/style directive (e.g. "editorial photography, cinematic, warm tones, 16:9 aspect ratio")
- [ ] Cultural requirements, when present, are incorporated into scene descriptions
- [ ] Prompt length is between 80–200 words
- [ ] Function is pure — no side effects, fully unit-testable

---

#### RDV-023
**Title:** Implement image generation API integration
**Type:** Feature
**Labels:** `backend` `ai`
**Size:** L
**Milestone:** M2
**Blocked by:** RDV-022, RDV-003

**Description:**
Create `src/lib/imageGeneration.ts` with a `generateImage(prompt: string): Promise<string>` function that calls the configured image generation provider (DALL·E 3 or Stability AI, driven by `IMAGE_GENERATION_PROVIDER` env var). Returns the public image URL after uploading to Supabase Storage.

**Acceptance criteria:**
- [ ] DALL·E 3 provider: calls `POST https://api.openai.com/v1/images/generations` with `model: "dall-e-3"`, `size: "1792x1024"`, `quality: "standard"`
- [ ] Stability AI provider: calls the Stability AI generate endpoint with equivalent parameters
- [ ] Provider is selected at runtime via `IMAGE_GENERATION_PROVIDER` env var — no code change required to switch
- [ ] Generated image binary is fetched and uploaded to the `vision-board-images` Supabase Storage bucket
- [ ] Uploaded file path: `{profileId}/{timestamp}.png`
- [ ] Returns the public Supabase Storage URL for the uploaded image
- [ ] On API error, throws a typed `ImageGenerationError` with the provider error message
- [ ] Request timeout set to 30 seconds

---

#### RDV-024
**Title:** Implement image storage and VisionBoard record management
**Type:** Feature
**Labels:** `backend` `data`
**Size:** S
**Milestone:** M2
**Blocked by:** RDV-023, RDV-021

**Description:**
Create `src/app/api/vision-board/route.ts`. On POST, runs `allocateBudget`, runs `buildImagePrompt`, calls `generateImage`, and upserts the `VisionBoard` record with the image URL, prompt, and budget allocations. Returns the complete `VisionBoard` record.

**Acceptance criteria:**
- [ ] POST accepts `{ profileId: string }` and validates the profile exists
- [ ] `allocateBudget`, `buildImagePrompt`, and `generateImage` are called in the correct order
- [ ] `VisionBoard` record is upserted (not duplicated on re-generation)
- [ ] Response includes `{ visionBoard: VisionBoard }` with all fields including `budgetAllocations`
- [ ] If image generation fails and a fallback template exists, the fallback `imageUrl` is used and `fallbackTemplateId` is set on the record
- [ ] Returns `404` if profile does not exist
- [ ] Returns `202 Accepted` immediately and processes asynchronously if generation takes > 5s (with polling endpoint)

---

#### RDV-025
**Title:** Build Vision Board generating interstitial page
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M2
**Blocked by:** RDV-008, RDV-020

**Description:**
Implement `src/app/dashboard/vision-board/generating/page.tsx`. Displays an atmospheric loading screen while the image generation API call is in progress. Polls `GET /api/vision-board/status?profileId={id}` every 2 seconds. Redirects to `/dashboard/vision-board` when complete.

**Acceptance criteria:**
- [ ] Page immediately triggers `POST /api/vision-board` on mount
- [ ] Displays an animated loading indicator with romantic copy (e.g. "Painting your day...")
- [ ] Polls for completion status every 2 seconds
- [ ] On completion, transitions to `/dashboard/vision-board` with a smooth fade
- [ ] On error, shows an error message with a "Try again" button that re-triggers generation
- [ ] Page does not allow the user to navigate away mid-generation without a confirmation prompt

---

#### RDV-026
**Title:** Build Vision Board overlay component
**Type:** Feature
**Labels:** `frontend`
**Size:** L
**Milestone:** M2
**Blocked by:** RDV-024, RDV-025, RDV-007

**Description:**
Create `src/components/VisionBoard.tsx`. Full-screen overlay: the AI-generated ceremony scene image fills the background. Positioned callout boxes overlay the image for each vendor category, each showing the allocated budget amount. SVG connector lines link each callout to its region of the scene image.

**Acceptance criteria:**
- [ ] Component fills the viewport (100vw × 100vh) with no scrollbar
- [ ] AI-generated image is the full-bleed background (`object-fit: cover`)
- [ ] A dark gradient overlay (`rgba(10,4,8,0.35)`) ensures callout legibility
- [ ] One callout box rendered per vendor category (venue, catering, photography, planning)
- [ ] Each callout shows: category label (DM Sans, uppercase, 11px), allocated amount (Fraunces serif, 24px), and a brief descriptor (e.g. "Venue rental")
- [ ] Callout boxes use frosted glass styling (`backdrop-filter: blur(12px)`, semi-transparent warm white)
- [ ] SVG `<line>` or `<path>` connectors link each callout to a hardcoded region of the image (top-left for venue, bottom-center for catering, etc.)
- [ ] Callout positions are responsive — use percentage-based positioning
- [ ] Component accepts `visionBoard: VisionBoard` and `onClose: () => void` as props

---

### M3 — Vision Board Polish

---

#### RDV-027
**Title:** Build budget callout interaction (expandable panels)
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M3
**Blocked by:** RDV-026

**Description:**
Extend the Vision Board callout boxes to be interactive. Clicking a callout expands it into a panel showing the full budget allocation for that category, 2–3 alternative vendor suggestions (from the matched vendor list), and a brief rationale for the allocation percentage.

**Acceptance criteria:**
- [ ] Clicking a collapsed callout expands it in-place (no modal, no page navigation)
- [ ] Expanded panel shows: allocated amount, allocation percentage of total, rationale text (e.g. "35% — your top priority"), and 2–3 vendor name suggestions with price ranges
- [ ] Only one callout can be expanded at a time — clicking another collapses the current one
- [ ] Clicking outside the expanded callout collapses it
- [ ] Expansion/collapse uses a smooth CSS transition (height + opacity, 0.3s ease)
- [ ] Vendor suggestions are drawn from the matched vendor results (not hardcoded)

---

#### RDV-028
**Title:** Build budget summary bar
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M3
**Blocked by:** RDV-026, RDV-021

**Description:**
Create `src/components/BudgetSummaryBar.tsx`. A fixed bar at the bottom of the Vision Board overlay showing total allocated amount vs. total budget, with a visual progress bar. Updates in real time as the user adjusts allocations.

**Acceptance criteria:**
- [ ] Bar is fixed at the bottom of the Vision Board overlay (not scrollable)
- [ ] Shows: "Allocated: $X,XXX of $XX,XXX" with formatted CAD amounts
- [ ] Visual progress bar fills proportionally to allocated / total budget
- [ ] Progress bar uses rose fill color; turns amber when allocated > 95% of budget
- [ ] Remaining amount displayed: "Remaining: $X,XXX"
- [ ] Updates reactively when any allocation is adjusted (reads from Zustand)

---

#### RDV-029
**Title:** Build budget adjustment UI
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M3
**Blocked by:** RDV-027, RDV-028

**Description:**
Add an "Adjust budget" mode to the Vision Board. When activated, each callout shows a slider or +/− stepper allowing the user to increase or decrease the allocation for that category. Changes are reflected in real time in the budget summary bar and persisted to the `VisionBoard` record on save.

**Acceptance criteria:**
- [ ] "Adjust budget" toggle button visible at top-right of the Vision Board overlay
- [ ] In adjust mode, each callout shows a `<input type="range">` slider below the amount
- [ ] Slider min = $500, max = total budget × 0.6, step = $500
- [ ] Adjusting one category does not automatically re-distribute other categories (user controls all)
- [ ] Budget summary bar updates in real time as sliders move
- [ ] "Save adjustments" button calls `PATCH /api/vision-board` with updated `budgetAllocations`
- [ ] "Reset to suggested" button reverts to `allocateBudget()` output
- [ ] All amounts displayed in formatted CAD

---

#### RDV-030
**Title:** Build regenerate scene button
**Type:** Feature
**Labels:** `frontend` `backend`
**Size:** S
**Milestone:** M3
**Blocked by:** RDV-026, RDV-024

**Description:**
Add a "Regenerate scene" button to the Vision Board overlay. Re-triggers `POST /api/vision-board` with a variation seed to produce a different image for the same profile. Shows a loading state over the existing image while the new image generates.

**Acceptance criteria:**
- [ ] "Regenerate ↺" button visible at top-left of the Vision Board overlay
- [ ] Clicking shows a translucent loading overlay on top of the current image with "Creating a new scene…" copy
- [ ] The existing image remains visible and blurred during generation (not replaced with a blank)
- [ ] On success, the new image fades in over the old one (cross-fade, 0.6s)
- [ ] Regeneration passes a different `seed` parameter to the image generation API on each call
- [ ] Previous budget allocations are preserved across regeneration (only the image changes)
- [ ] "Regenerate" button is disabled while generation is in progress

---

#### RDV-031
**Title:** Implement fallback image system
**Type:** Feature
**Labels:** `backend` `frontend`
**Size:** S
**Milestone:** M3
**Blocked by:** RDV-023, RDV-010

**Description:**
Create `src/lib/fallback.ts` with a curated library of fallback images organised by `WeddingStyle` × `CeremonyType`. When image generation fails or is unavailable, `getFallbackImage(style, ceremonyType): string` returns the best-matching fallback image URL from Supabase Storage. Seed 10 curated fallback images.

**Acceptance criteria:**
- [ ] Fallback library covers all 6 wedding styles × at least 3 ceremony types = 18+ combinations
- [ ] `getFallbackImage()` returns the most specific match, then falls back to style-only, then to a default
- [ ] Fallback images are stored in a dedicated `fallback-images` Supabase Storage bucket (public read)
- [ ] When a fallback is used, `VisionBoard.fallbackTemplateId` is set to the fallback key
- [ ] A UI indicator ("Using a curated scene — regenerate for your custom image") is shown when a fallback is active
- [ ] Seed script uploads 10 placeholder fallback images (or uses publicly licensed stock images)

---

### M4 — Shortlist

---

#### RDV-032
**Title:** Implement vendor matching and scoring algorithm
**Type:** Feature
**Labels:** `backend`
**Size:** M
**Milestone:** M4
**Blocked by:** RDV-011, RDV-021

**Description:**
Create `src/lib/matching.ts` with `scoreVendor()` and `filterVendors()` pure functions. Scoring weights: budget fit 40pts, capacity fit 30pts, cultural fit 20pts, profile completeness 10pts. Budget fit uses the per-category `BudgetAllocations` output from `allocateBudget()` rather than a fixed percentage of total budget. This ensures vendor budget-fit scoring reflects the user's actual Vision Board allocations.

**Acceptance criteria:**
- [ ] `scoreVendor(vendor, profile, allocations)` accepts `BudgetAllocations` as a third argument
- [ ] A venue priced within its Vision Board allocation scores ≥ 70
- [ ] A venue double its Vision Board allocation scores ≤ 30
- [ ] A caterer with matching `culturalTags` scores higher than an identical caterer without them (given a profile with cultural requirements)
- [ ] `filterVendors()` excludes vendors where `v.city !== profile.city`
- [ ] `filterVendors()` excludes vendors where `active = false`
- [ ] Both functions are pure (no database calls, no side effects) — testable in isolation

---

#### RDV-033
**Title:** Implement GET /api/vendors route
**Type:** Feature
**Labels:** `backend`
**Size:** S
**Milestone:** M4
**Blocked by:** RDV-032, RDV-015

**Description:**
Create `src/app/api/vendors/route.ts`. Reads the user's profile and Vision Board allocations from the database, fetches all active vendors, runs `filterVendors()` with optional category filter, and returns the top results with match scores reflecting Vision Board budget allocations.

**Acceptance criteria:**
- [ ] Returns `{ vendors: Vendor[], total: number }`
- [ ] `?category=venue` returns only venue vendors
- [ ] `?category=all` (or no param) returns top 12 across all categories
- [ ] Each returned vendor includes `matchScore` field
- [ ] If a `VisionBoard` record exists for the profile, its `budgetAllocations` are used for scoring; otherwise falls back to `allocateBudget(profile)`
- [ ] Returns `404` if no profile exists for the user
- [ ] Results are sorted by `matchScore DESC`

---

#### RDV-034
**Title:** Build dashboard layout (sidebar shell and topbar)
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M4
**Blocked by:** RDV-008, RDV-009, RDV-020

**Description:**
Implement `src/app/dashboard/layout.tsx`. Sticky left sidebar (`ShortlistSidebar` placeholder), fixed topbar with greeting and "View Vision Board" button, scrollable main content area. Both sidebar and topbar are Client Components reading from Zustand.

**Acceptance criteria:**
- [ ] Three-column layout: sidebar (272px fixed) | main (flex-1) | overlay (Vision Board, full-screen when open)
- [ ] Sidebar scrolls independently from main content
- [ ] Topbar stays fixed at top of main content area on scroll
- [ ] "View Vision Board ✦" button is present in topbar; clicking opens the Vision Board overlay
- [ ] Wedding greeting uses italic Fraunces for the personalised portion
- [ ] Layout does not break if `profile` is null (guard against store hydration delay)

---

#### RDV-035
**Title:** Build VendorCard component
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M4
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

#### RDV-036
**Title:** Build VendorGrid with category filter and loading state
**Type:** Feature
**Labels:** `frontend`
**Size:** M
**Milestone:** M4
**Blocked by:** RDV-033, RDV-035

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

#### RDV-037
**Title:** Implement POST /api/shortlist route
**Type:** Feature
**Labels:** `backend`
**Size:** S
**Milestone:** M4
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

#### RDV-038
**Title:** Build ShortlistSidebar component
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M4
**Blocked by:** RDV-008, RDV-034

**Description:**
Implement `src/components/ShortlistSidebar.tsx`. Reads shortlist from Zustand. Displays the logo, wedding profile summary (city, date, guests, budget), a shortlist count badge, and scrollable list of saved vendors with remove buttons. Includes a "View Vision Board" thumbnail link.

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

#### RDV-039
**Title:** Wire dashboard page and VendorGrid; implement optimistic shortlist mutation
**Type:** Feature
**Labels:** `frontend` `backend`
**Size:** M
**Milestone:** M4
**Blocked by:** RDV-037, RDV-038, RDV-036

**Description:**
Implement `src/app/dashboard/page.tsx` with the VendorGrid. Wire the `VendorCard` save button to a TanStack Query `useMutation` with optimistic updates. The Zustand store updates immediately on click; the API call happens in the background. On API failure, the store is rolled back.

**Acceptance criteria:**
- [ ] Page renders at `/dashboard` after intake is complete
- [ ] VendorGrid is present and fetches real vendor data
- [ ] Section heading uses `font-serif` H2 styling
- [ ] Clicking the heart button updates the sidebar instantly (no perceptible delay)
- [ ] API call is made in the background after the optimistic update
- [ ] If the API call fails, the heart button reverts to its previous state
- [ ] Saving a vendor increments the shortlist count badge in the sidebar immediately
- [ ] Refreshing the page retains the shortlist (fetched from DB on mount)
- [ ] Page does not error if navigated to directly without completing intake — shows empty state

---

### M5 — Compare + Checklist

---

#### RDV-040
**Title:** Build CompareTable component and /dashboard/compare page
**Type:** Feature
**Labels:** `frontend` `backend`
**Size:** M
**Milestone:** M5
**Blocked by:** RDV-039

**Description:**
Create `src/components/CompareTable.tsx` and `src/app/dashboard/compare/page.tsx`. Renders shortlisted vendors in a side-by-side attribute table: category, price range, capacity, match score, tags, cultural fit, Vision Board allocation for that category, and an editable notes field. Max 4 vendors. Add `PATCH /api/shortlist/[id]` to persist notes edits.

**Acceptance criteria:**
- [ ] Attribute labels in the left column; vendor values fill subsequent columns
- [ ] Price range formatted as CAD (e.g. "$3,500 – $8,000")
- [ ] Tags rendered as chips within the table cell
- [ ] Match score shown as a percentage
- [ ] Vision Board budget allocation shown per category row (e.g. "Your venue budget: $12,500")
- [ ] Notes field is a `<textarea>` that auto-resizes; saves on blur
- [ ] `PATCH /api/shortlist/[id]` accepts `{ notes: string }` and returns updated item
- [ ] Notes persist after page refresh
- [ ] Remove button at the bottom of each vendor column triggers `removeFromShortlist()`
- [ ] Table scrolls horizontally on smaller screens
- [ ] With < 2 vendors: "Add at least two vendors to compare." with a link to `/dashboard`

---

#### RDV-041
**Title:** Implement checklist API routes and UI
**Type:** Feature
**Labels:** `backend` `frontend`
**Size:** M
**Milestone:** M5
**Blocked by:** RDV-015, RDV-034

**Description:**
Create `src/app/api/checklist/route.ts` (GET) and `src/app/api/checklist/[id]/route.ts` (PATCH). Implement `src/app/dashboard/checklist/page.tsx`. Groups tasks into timeframe buckets; each row has a checkbox, title, due date, and category badge. Completion updates optimistically.

**Acceptance criteria:**
- [ ] GET returns all checklist items for the user's profile, ordered by `dueOffsetDays ASC`
- [ ] Each item includes a computed `dueDate` string (`YYYY-MM-DD`)
- [ ] PATCH with `{ completed: true }` sets `completedAt` to current timestamp
- [ ] PATCH with `{ completed: false }` clears `completedAt` to null
- [ ] Both routes return 404 if no profile exists
- [ ] Tasks grouped into: "12+ months out", "6–12 months", "3–6 months", "Under 3 months", "Overdue"
- [ ] Groups with no tasks are not rendered
- [ ] "Overdue" group uses rose-tinted styling to indicate urgency
- [ ] Checking a box updates the UI immediately (optimistic) and sends PATCH
- [ ] Completed task text has CSS `line-through` and muted colour
- [ ] Page shows a skeleton loader while fetching

---

### M6 — Dashboard Summary + Polish

---

#### RDV-042
**Title:** Build dashboard Vision Board summary card
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M6
**Blocked by:** RDV-026, RDV-034

**Description:**
Add a Vision Board summary card to the top of `src/app/dashboard/page.tsx`. Displays a clickable thumbnail of the generated (or fallback) scene image alongside headline budget numbers. Clicking opens the full Vision Board overlay.

**Acceptance criteria:**
- [ ] Card appears above the vendor grid on the dashboard
- [ ] Thumbnail shows the Vision Board image at reduced size (max 280px wide)
- [ ] Card shows total budget, top allocated category and amount, and remaining unallocated amount
- [ ] Clicking anywhere on the card opens the full-screen Vision Board overlay
- [ ] If no Vision Board exists yet, card shows "Your Vision Board is ready to create" with a CTA to `/dashboard/vision-board/generating`
- [ ] Fallback indicator is shown if a fallback image is active (per RDV-031)

---

#### RDV-043
**Title:** Build dashboard budget tracker section
**Type:** Feature
**Labels:** `frontend`
**Size:** S
**Milestone:** M6
**Blocked by:** RDV-024, RDV-034

**Description:**
Add a budget tracker section to the dashboard page, below the vendor grid. Displays a breakdown of Vision Board allocations per category as a horizontal stacked bar chart and a supporting table. Reflects the current `budgetAllocations` from the Zustand store.

**Acceptance criteria:**
- [ ] Stacked bar chart shows each category as a proportional segment (CSS `flex` widths, no canvas/SVG library)
- [ ] Each segment is colored distinctly (using the design token palette)
- [ ] Supporting table rows: category, allocated amount, % of total, suggested price range from matched vendors
- [ ] "Adjust in Vision Board" link opens the Vision Board overlay in adjust mode (RDV-029)
- [ ] Section updates reactively if the user saves adjusted allocations from the Vision Board
- [ ] Section is not shown if no Vision Board record exists

---

#### RDV-044
**Title:** Implement error handling conventions and Toast component
**Type:** Chore
**Labels:** `frontend` `backend`
**Size:** S
**Milestone:** M6
**Blocked by:** RDV-034

**Description:**
Create `src/components/ui/Toast.tsx` and `src/hooks/useToast.ts`. Toast renders in a fixed bottom-right portal. All API routes are audited to return consistent error shapes `{ error: string, field?: string }`. Client-side API calls are audited to display toast on failure.

**Acceptance criteria:**
- [ ] Toast appears in bottom-right corner, auto-dismisses after 4 seconds
- [ ] Toast has error (rose) and success (sage) variants
- [ ] Every `useMutation` `onError` handler calls `showToast({ type: 'error', message: '...' })`
- [ ] All API routes return `{ error: string }` on failure (no unstructured error objects)
- [ ] Image generation failure surfaces a toast: "Scene generation failed — using a curated image"
- [ ] No unhandled Promise rejections in the browser console during normal use

---

#### RDV-045
**Title:** Mobile responsive adjustments
**Type:** Chore
**Labels:** `frontend`
**Size:** M
**Milestone:** M6
**Blocked by:** RDV-039, RDV-026, RDV-041

**Description:**
Audit all views at 375px (iPhone SE) and 768px (iPad). Apply responsive adjustments: sidebar collapses to a drawer on mobile, Vision Board overlay is full-screen with scrollable callouts stacked vertically, vendor grid is single-column, onboarding stacks to single column.

**Acceptance criteria:**
- [ ] Onboarding form renders correctly at 375px (single column, no horizontal scroll)
- [ ] Dashboard sidebar is hidden by default on < 768px; accessible via a hamburger toggle
- [ ] Vendor grid is 1-column at 375px, 2-column at 768px, 3+ columns at 1024px+
- [ ] Vision Board overlay is full-screen on mobile; callout boxes stack vertically at the bottom rather than overlaying the image
- [ ] Budget summary bar remains visible and readable on mobile
- [ ] No horizontal scrollbar appears on any page at 375px

---

#### RDV-046
**Title:** Production smoke test and Definition of Done verification
**Type:** Chore
**Labels:** `devops`
**Size:** S
**Milestone:** M6
**Blocked by:** RDV-001 through RDV-045

**Description:**
Run the complete user journey end-to-end on the production Vercel URL. Verify all Definition of Done criteria. Confirm no console errors, no broken API calls, and Vision Board image generation works on production.

**Acceptance criteria:**
- [ ] A new visitor can reach landing → complete 3-step intake → reach Vision Board generating view → reach dashboard in < 5 minutes
- [ ] Vision Board overlay renders with the AI-generated scene image and 4 budget callout boxes
- [ ] Budget callouts expand correctly and show vendor suggestions
- [ ] Budget summary bar reflects allocations accurately
- [ ] Regenerate scene produces a different image without resetting allocations
- [ ] Dashboard shows the Vision Board summary card and budget tracker section
- [ ] Dashboard displays ≥ 10 vendors from the database with visible match scores reflecting Vision Board allocations
- [ ] 2+ vendors can be shortlisted and the compare view shows Vision Board allocation per category
- [ ] Checklist shows 15 tasks with accurate due dates relative to the profile's wedding date
- [ ] All of the above works at the production Vercel URL (not localhost)
- [ ] No unhandled errors in Vercel function logs during the smoke test

---

## Dependency Graph

```
RDV-001
├── RDV-002 → RDV-004 → RDV-006, RDV-010 → RDV-011
├── RDV-003 → RDV-004, RDV-006, RDV-012
├── RDV-005 → RDV-006, RDV-008, RDV-021, RDV-022
├── RDV-007 → RDV-014, RDV-035, RDV-026
├── RDV-008 → RDV-038
├── RDV-009
└── RDV-012

RDV-021 (allocateBudget) → RDV-024, RDV-028, RDV-032
RDV-022 (buildImagePrompt) → RDV-023 (generateImage) → RDV-024
RDV-003 → RDV-023 (Supabase Storage)
RDV-023 → RDV-031 (fallback uses same storage)

RDV-024 (VisionBoard API) → RDV-025 (generating page)
RDV-025 → RDV-026 (Vision Board overlay)
RDV-026 → RDV-027, RDV-028, RDV-030
RDV-027 + RDV-028 → RDV-029
RDV-026 + RDV-023 → RDV-030 (regenerate)

RDV-006 + RDV-011 → RDV-015
RDV-006 → RDV-013 → RDV-016 → RDV-017, RDV-018, RDV-019
RDV-015 + RDV-017 + RDV-018 + RDV-019 → RDV-020

RDV-021 + RDV-011 → RDV-032 (matching uses allocations)
RDV-032 + RDV-015 → RDV-033 (vendors API)

RDV-008 + RDV-009 + RDV-020 → RDV-034 (dashboard layout)
RDV-033 + RDV-035 → RDV-036 (VendorGrid)
RDV-015 → RDV-037 (shortlist API)
RDV-008 + RDV-034 → RDV-038 (ShortlistSidebar)
RDV-037 + RDV-038 + RDV-036 → RDV-039 (dashboard page + optimistic mutations)

RDV-039 → RDV-040 (compare)
RDV-015 + RDV-034 → RDV-041 (checklist)

RDV-026 + RDV-034 → RDV-042 (Vision Board summary card)
RDV-024 + RDV-034 → RDV-043 (budget tracker)
RDV-034 → RDV-044 (toast)

RDV-039 + RDV-026 + RDV-041 → RDV-045 (mobile)
[all] → RDV-046
```

---

## Sprint Plan (2-Engineer Team)

Assumes Eng A owns backend/data, Eng B owns frontend/components. Work is parallelised where dependencies allow.

---

### Sprint 1 — Weeks 1–2 | Milestone M0: Foundation

| Issue | Owner | Size |
|---|---|---|
| RDV-001 Init repo + install deps | A or B | XS |
| RDV-002 Prisma schema (with VisionBoard) | A | S |
| RDV-003 Supabase setup + env + storage buckets | A | S |
| RDV-004 Migration + generate | A | XS |
| RDV-005 Shared TypeScript types | A | S |
| RDV-006 Utility helpers + clients | A | XS |
| RDV-007 Tailwind tokens + globals | B | S |
| RDV-008 Zustand store | B | XS |
| RDV-009 TanStack Query provider | B | XS |
| RDV-010 Vendor seed data | A | L |
| RDV-011 Run seed + verify | A | XS |
| RDV-012 Vercel deploy | A | S |

**Sprint goal:** `npm run dev` shows the app; `npx prisma studio` shows 60+ vendors and all 5 tables including `VisionBoard`; production URL is live.

---

### Sprint 2 — Weeks 3–4 | Milestone M1: Intake

| Issue | Owner | Size |
|---|---|---|
| RDV-013 Auth middleware | A | S |
| RDV-015 POST /api/intake | A | M |
| RDV-014 Landing page | B | M |
| RDV-016 Onboarding page shell (3-step) | B | S |
| RDV-017 StepWhereWhen | B | S |
| RDV-018 StepSizeBudget | B | S |
| RDV-019 StepVision | B | S |
| RDV-020 Wire submit → generating redirect | A+B | S |

**Sprint goal:** A user can complete the full 3-step intake flow and a `WeddingProfile` + 15 `ChecklistItem` rows appear in the database. The CTA reads "Create my Vision Board →".

---

### Sprint 3 — Weeks 5–6 | Milestone M2: Vision Board Core

| Issue | Owner | Size |
|---|---|---|
| RDV-021 `allocateBudget` pure function | A | M |
| RDV-022 `buildImagePrompt` function | A | S |
| RDV-023 Image generation API integration | A | L |
| RDV-024 Image storage + VisionBoard API | A | S |
| RDV-025 Generating interstitial page | B | S |
| RDV-026 Vision Board overlay component | B | L |

*Note: RDV-021 through RDV-024 (backend pipeline) and RDV-025/RDV-026 (frontend overlay) can be developed in parallel once the `VisionBoard` API response shape is agreed upfront.*

**Sprint goal:** A user completes intake, sees the generating screen, and the Vision Board overlay renders with a real AI-generated scene image and 4 budget callout boxes with correct allocations.

---

### Sprint 4 — Week 7 | Milestone M3: Vision Board Polish

| Issue | Owner | Size |
|---|---|---|
| RDV-027 Budget callout interaction (expand) | B | M |
| RDV-028 Budget summary bar | B | S |
| RDV-029 Budget adjustment UI | B | M |
| RDV-030 Regenerate scene button | A+B | S |
| RDV-031 Fallback image system | A | S |

**Sprint goal:** Callouts expand to show vendor suggestions. Budget adjustments work and persist. Regenerate produces a new scene. Fallback images display when generation fails.

---

### Sprint 5 — Week 8 | Milestones M4: Shortlist + Vendor Matching

| Issue | Owner | Size |
|---|---|---|
| RDV-032 Vendor matching algorithm (uses allocations) | A | M |
| RDV-033 GET /api/vendors | A | S |
| RDV-034 Dashboard layout | B | M |
| RDV-035 VendorCard | B | S |
| RDV-036 VendorGrid | B | M |
| RDV-037 POST /api/shortlist | A | S |
| RDV-038 ShortlistSidebar | B | S |
| RDV-039 Dashboard page + optimistic mutations | A+B | M |

**Sprint goal:** The dashboard shows real vendor cards with match scores reflecting Vision Board allocations. Saving a vendor updates the sidebar instantly and persists across refreshes.

---

### Sprint 6 — Week 9 | Milestone M5: Compare + Checklist

| Issue | Owner | Size |
|---|---|---|
| RDV-040 CompareTable + /compare page + PATCH notes | A+B | M |
| RDV-041 Checklist API routes + UI | A+B | M |

**Sprint goal:** Vendors can be compared side-by-side with Vision Board allocation context. Checklist renders 15 tasks grouped by timeframe.

---

### Sprint 7 — Week 10 | Milestone M6: Dashboard Summary + Polish + Launch

| Issue | Owner | Size |
|---|---|---|
| RDV-042 Dashboard Vision Board summary card | B | S |
| RDV-043 Dashboard budget tracker section | B | S |
| RDV-044 Error handling + Toast | A+B | S |
| RDV-045 Mobile responsive | B | M |
| RDV-046 Production smoke test | A+B | S |

**Sprint goal:** All Definition of Done criteria pass on the production URL. Vision Board is the hero of the dashboard. MVP ships.

---

## Summary Metrics

| Metric | Value |
|---|---|
| Total issues | 46 |
| Feature issues | 31 |
| Chore issues | 15 |
| XS issues | 9 |
| S issues | 22 |
| M issues | 12 |
| L issues | 3 |
| Estimated sprints | 7 |
| Estimated calendar time (2 eng) | 10 weeks |
| Critical path | RDV-001 → 002 → 003 → 004 → 021 → 022 → 023 → 024 → 026 → 027 → 029 → 046 |

The critical path runs through the image generation pipeline and Vision Board overlay — the two highest-risk deliverables in v2. De-risking RDV-023 (image generation API integration) early in Sprint 3 is the single highest-leverage scheduling decision. The fallback image system (RDV-031) should be implemented in parallel to ensure no blocking dependency on third-party API availability.
