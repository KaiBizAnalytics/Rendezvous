# Rendezvous — MVP Architecture Plan

**Version:** 2.0 | **Date:** March 23, 2026
**Derived from:** `rendezvous_mvp_prd.md`, `opportunity_solution_tree.md`

---

## Guiding Principles

1. **Ship the hypothesis, not the platform.** The MVP exists to validate four assumptions (PRD §5). Every architectural choice is evaluated against: does this enable faster validation?
2. **Couple-first data model.** The wedding profile is the system's nucleus — everything else (vision board, vendors, checklist) is a function of it.
3. **Explainable AI.** Budget allocations are computed by a deterministic rule-based engine, not LLM inference. Vendor match scores are computed from structured rules. The image generation API handles creativity; logic stays in code.
4. **Seam at the right place.** Start with a unified deployment; design seams so the image generation layer, vendor data layer, and frontend can split into separate services post-validation without a rewrite.

---

## What Changed in v2

The hero feature has been redesigned. v1 centered on an AI chat concierge surfacing vendor recommendations. v2 replaces this with an **Interactive Wedding Vision Board with Budget Breakdown**: after completing the questionnaire, the user sees an AI-generated ceremony scene image with overlaid budget callout boxes showing per-category allocations.

| Area | v1 | v2 |
|---|---|---|
| Hero feature | AI chat concierge | Vision Board (generated image + budget overlay) |
| User flow after intake | Vendor grid | Vision Board overlay → Dashboard |
| AI usage | Claude LLM for chat | Image generation API (DALL·E 3 / Stability AI SDXL) |
| Budget allocation | LLM-generated | Deterministic rule-based engine |
| API: chat | `POST /api/chat` (streaming SSE) | Removed from MVP |
| API: vision board | Not present | `POST /api/vision-board` (NEW) |
| DB: chat_messages | Present | Removed from MVP |
| DB: generated_images | Not present | Added |
| DB: budget_allocations | Not present | Added |

The AI concierge chat is explicitly deferred to post-MVP.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│                                                                 │
│  ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Landing  │  │  Onboarding │  │  Vision  │  │ Dashboard  │  │
│  │  Page    │→ │  (Intake)   │→ │  Board   │→ │  Vendors / │  │
│  └──────────┘  └─────────────┘  │  Overlay │  │  Shortlist │  │
│                                  └──────────┘  │  / Tasks   │  │
│                                                └────────────┘  │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────────────┐
│                    Next.js Application                           │
│                  (Vercel — single deployment)                    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    App Router (RSC)                         │ │
│  │  /         /onboarding      /vision-board    /dashboard    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Routes                               │ │
│  │  POST /api/intake         →  create/update profile         │ │
│  │  POST /api/vision-board   →  generate image + allocations  │ │
│  │  GET  /api/vendors        →  fetch matched vendors         │ │
│  │  POST /api/shortlist      →  save / remove vendor          │ │
│  │  GET/PATCH /api/checklist →  task management               │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────┬───────────────────────────────┬─────────────────────┘
            │                               │
┌───────────▼──────────┐       ┌────────────▼────────────────────┐
│      Supabase         │       │     Image Generation API         │
│                       │       │                                 │
│  • PostgreSQL (data)  │       │  DALL·E 3 (primary)             │
│  • Auth (sessions)    │       │  Stability AI SDXL (fallback)   │
│  • Storage (images)   │       │  Curated template (timeout >15s)│
└───────────────────────┘       └─────────────────────────────────┘
```

---

## Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Collocates frontend and API routes; RSC reduces client JS; single Vercel deployment |
| Language | **TypeScript** | Type-safe data models across API boundary; Prisma requires it |
| Styling | **Tailwind CSS + CSS variables** | Design tokens map directly to style guide; utility-first accelerates iteration |
| State | **Zustand** | Lightweight; wedding profile, shortlist, and vision board state live in a single flat store |
| Data fetching | **TanStack Query** | Cache management, loading states, and optimistic updates for shortlist |
| Database | **PostgreSQL via Supabase** | Relational model fits structured vendor + profile data; Supabase adds Auth and free tier |
| ORM | **Prisma** | Type-safe queries; schema migrations; auto-generates types used across app |
| Auth | **Supabase Auth** | Magic link (no password friction for planning context); OAuth optional |
| Image generation | **OpenAI DALL·E 3** (primary) + **Stability AI SDXL** (fallback) | DALL·E 3 for photorealism and prompt adherence; SDXL as failover; curated template image if both exceed 15s |
| Deployment | **Vercel** | Zero-config Next.js; edge functions available if needed |
| Fonts | **Google Fonts** | Fraunces + DM Sans (per style guide) |

---

## Data Model

### `users`
Managed by Supabase Auth. Extended with a profile row on first login.

```
id            uuid  PK
email         text
created_at    timestamptz
```

### `wedding_profiles`
The nucleus. Created at intake completion. One per user for MVP.

```
id                uuid  PK
user_id           uuid  FK → users.id
city              text           -- "Vancouver, BC"
wedding_date      date
guest_count       int
budget_min        int            -- stored in CAD cents
budget_max        int
ceremony_type     text           -- "Indoor" | "Outdoor" | "Beach" | "Destination"
style             text           -- "Classic" | "Bohemian" | "Modern" | "Intimate" | "Cultural" | "Garden Party"
cultural_reqs     text           -- free text, nullable
priority_category text           -- "venue" | "photographer" | "caterer" | "all"
created_at        timestamptz
updated_at        timestamptz
```

### `vendors`
Curated, seeded by the team. No vendor self-service in MVP.

```
id              uuid  PK
category        text           -- "venue" | "caterer" | "photographer" | "planner"
name            text
city            text
description     text
price_min       int            -- per-unit price minimum (cents)
price_max       int            -- per-unit price maximum (cents)
price_unit      text           -- "venue_rental" | "per_person" | "full_day" | "full_planning"
capacity_min    int            -- nullable for photographers/planners
capacity_max    int            -- nullable
tags            text[]         -- ["Indoor", "Luxury", "Award-winning"]
cultural_tags   text[]         -- ["Halal", "South Asian", "Mandarin-speaking"]
website_url     text
phone           text
image_url       text
active          boolean  DEFAULT true
created_at      timestamptz
```

### `shortlist_items`
Vendors a user has saved.

```
id          uuid  PK
user_id     uuid  FK → users.id
vendor_id   uuid  FK → vendors.id
notes       text  nullable
created_at  timestamptz
UNIQUE (user_id, vendor_id)
```

### `checklist_items`
Planning tasks. Seeded from a default template on profile creation.

```
id              uuid  PK
user_id         uuid  FK → users.id
title           text
category        text   -- "venue" | "catering" | "legal" | "general"
due_offset_days int    -- days before wedding date (e.g. -365 = 12 months before)
completed       boolean  DEFAULT false
completed_at    timestamptz nullable
created_at      timestamptz
```

### `generated_images`
Stores the AI-generated ceremony scene image for each profile. One per profile for MVP; regeneration overwrites the existing row.

```
id            uuid  PK
profile_id    uuid  FK → wedding_profiles.id
image_url     text           -- Supabase Storage public URL
prompt        text           -- the full prompt passed to the image API
model_used    text           -- "dalle3" | "sdxl" | "template"
created_at    timestamptz
```

### `budget_allocations`
Per-category budget splits computed deterministically from the profile. Written once on vision board generation; re-computed if the profile is edited.

```
id            uuid  PK
profile_id    uuid  FK → wedding_profiles.id
category      text           -- "venue" | "catering" | "photography" | "florals" | "music" | "attire" | "other"
amount        int            -- allocated amount in CAD cents
percentage    numeric(5,2)   -- percentage of total budget
created_at    timestamptz
```

---

## API Routes

### `POST /api/intake`
Creates or updates the user's `wedding_profile`. On creation, seeds `checklist_items` from the default template.

**Request body:**
```json
{
  "city": "Vancouver, BC",
  "wedding_date": "2026-08-15",
  "guest_count": 80,
  "budget_min": 30000,
  "budget_max": 50000,
  "ceremony_type": "Indoor",
  "style": "Modern",
  "cultural_reqs": "Chinese tea ceremony",
  "priority_category": "venue"
}
```

**Response:** `{ profile_id: string }`

---

### `POST /api/vision-board`
The core new endpoint. Runs two tasks in parallel: generates the ceremony scene image and computes budget allocations. Both results are persisted, then returned together.

**Request body:** `{ profile_id: string }`

**Processing steps:**
```
1. Fetch wedding_profile from Supabase
2. In parallel:
   a. Call buildImagePrompt(profile) → send to DALL·E 3
      - On timeout (>15s) or error: try Stability AI SDXL
      - On second failure: use curated template image for style + ceremony_type
      - Upload result to Supabase Storage
      - Write row to generated_images
   b. Call allocateBudget(profile) → deterministic category splits
      - Write rows to budget_allocations
3. Return image_url + allocations[]
```

**Response:**
```json
{
  "image_url": "https://…supabase.co/storage/…/ceremony.jpg",
  "model_used": "dalle3",
  "allocations": [
    { "category": "venue",       "amount": 15000, "percentage": 35.0 },
    { "category": "catering",    "amount": 12000, "percentage": 28.0 },
    { "category": "photography", "amount":  6000, "percentage": 14.0 },
    { "category": "florals",     "amount":  4000, "percentage":  9.5 },
    { "category": "music",       "amount":  2500, "percentage":  5.8 },
    { "category": "attire",      "amount":  2500, "percentage":  5.8 },
    { "category": "other",       "amount":   800, "percentage":  1.9 }
  ]
}
```

---

### `GET /api/vendors?category=all`
Returns matched and scored vendors for the authenticated user's profile. In v2 the `budget_per_category` parameter (optional) passes the Vision Board allocation for that category, used to filter vendor price ranges more precisely against the per-category budget rather than the total.

**Matching logic (deterministic, not LLM):**

```
1. Filter:
   - city match (exact for MVP, proximity later)
   - price_max >= allocation for this category (from budget_allocations if present,
     else profile.budget_max / expected_vendor_count)
   - capacity_max >= profile.guest_count (where applicable)
   - active = true

2. Score each vendor (0–100):
   - Budget fit:   40 pts  (is vendor's range within the category allocation?)
   - Capacity fit: 30 pts  (does capacity cover guest_count?)
   - Cultural fit: 20 pts  (cultural_tags overlap with cultural_reqs?)
   - Profile complete: 10 pts (has image, description, website)

3. Sort by score DESC within each category
4. Return top 10 overall, or top 5 per category if filtered
```

**Response:** `{ vendors: Vendor[], total: number }`

---

### `POST /api/shortlist`
Adds or removes a vendor from the user's shortlist.

**Request body:** `{ vendor_id: string, action: "add" | "remove", notes?: string }`

**Response:** `{ shortlist: ShortlistItem[] }`

---

### `GET /api/checklist` + `PATCH /api/checklist/:id`
Returns the user's checklist items, sorted by due date relative to their wedding date. PATCH toggles `completed`.

---

## Core Logic: `buildImagePrompt(profile)`

Constructs a photorealistic image generation prompt from structured questionnaire inputs. The goal is a ceremony scene — not a couple portrait — that communicates the style, setting, and cultural tone of the wedding.

```
Template structure:
  "A [ceremony_type] wedding ceremony at [setting_descriptor],
   [style_descriptor] aesthetic, [lighting], [cultural_details],
   editorial photography, warm tones, no people, cinematic depth of field"

Examples by style:
  Classic  → "An elegant ballroom ceremony, ivory florals, candlelight, …"
  Bohemian → "An outdoor garden ceremony with wildflower arches, golden hour, …"
  Modern   → "A minimalist indoor ceremony, geometric installations, cool natural light, …"

Cultural details are appended when cultural_reqs is non-empty:
  "South Asian" → "marigold garlands, mandap canopy, vibrant draping"
  "Chinese"     → "red and gold floral arrangements, traditional lanterns"
  "default"     → (omit cultural clause)
```

Prompt output is stored in `generated_images.prompt` for auditability and regeneration.

---

## Core Logic: `allocateBudget(profile)`

A deterministic rule-based function. Takes the wedding profile and returns per-category splits. No LLM involved — results are consistent, fast, and explainable to users.

**Base allocation percentages (default):**

| Category | Default % | Notes |
|---|---|---|
| Venue | 33% | Largest single cost driver |
| Catering | 27% | Scales with guest count |
| Photography | 13% | |
| Florals | 10% | |
| Music / Entertainment | 6% | |
| Attire | 6% | |
| Other / Buffer | 5% | Officiant, transport, favours |

**Adjustment rules (applied in order):**

1. **Priority category boost:** If `priority_category` is set, increase its allocation by 5 percentage points, redistributed proportionally from non-priority categories.
2. **Guest count scaling:** If `guest_count > 100`, increase Catering by 3 pp, reduce Other by 3 pp.
3. **Cultural requirements:** If `cultural_reqs` is non-empty, increase Florals by 2 pp (decor-heavy ceremonies), reduce Music by 2 pp.

All allocations are clamped so no category falls below 3% or above 45%. Final amounts are `Math.round(total_budget_midpoint * percentage / 100)` where `total_budget_midpoint = (budget_min + budget_max) / 2`.

---

## Vision Board Overlay

The Vision Board view renders the generated ceremony image full-bleed, with CSS/SVG callout boxes positioned over it to display per-category budget allocations. This is a client-side component — no server round-trip after the initial data load.

**Overlay architecture:**
```
<VisionBoardOverlay>
  ├── <img>  (generated_images.image_url, object-fit: cover)
  ├── <BudgetCallout category="venue"       amount={15000} />
  ├── <BudgetCallout category="catering"    amount={12000} />
  ├── <BudgetCallout category="photography" amount={6000}  />
  ├── <BudgetCallout category="florals"     amount={4000}  />
  └── … (remaining categories)
```

Each `<BudgetCallout>` is an absolutely-positioned pill (CSS) with a connecting SVG line to a focal point on the image. Positions are fixed per category (not dynamically placed by AI) — defined as percentage-based coordinates against the image container.

**Fallback states:**
- While generating: animated placeholder with a frosted-glass loading state over a low-opacity background
- On timeout / error: template image displayed with identical callout overlay (allocations are unaffected — they are computed independently)

**CTA from Vision Board:** A "Explore vendors" button at the bottom transitions to the Dashboard, passing per-category allocations as query params so `GET /api/vendors` can use them immediately.

---

## Frontend Component Map

```
app/
├── page.tsx                    ← Landing (static, no auth required)
│
├── onboarding/
│   └── page.tsx                ← 4-step intake form
│       ├── StepClientInfo      ← names, email, phone
│       ├── StepWhereWhen       ← city, date, flexibility, ceremony type
│       ├── StepSizeBudget      ← guests, budget range, priority
│       └── StepVision          ← style cards, colors, cultural requirements
│
├── vision-board/
│   └── page.tsx                ← Vision Board overlay view
│       ├── VisionBoardOverlay  ← full-bleed image + callout layer
│       ├── BudgetCallout       ← positioned pill with SVG connector
│       └── GeneratingState     ← loading placeholder during image gen
│
├── dashboard/
│   ├── layout.tsx              ← sidebar + topbar shell
│   ├── page.tsx                ← vendor grid (default: all categories)
│   ├── compare/
│   │   └── page.tsx            ← side-by-side vendor comparison table
│   └── checklist/
│       └── page.tsx            ← task list view
│
└── api/
    ├── intake/route.ts
    ├── vision-board/route.ts
    ├── vendors/route.ts
    ├── shortlist/route.ts
    └── checklist/route.ts
```

**Key client components:**
- `<VisionBoardOverlay>` — renders ceremony image with overlaid budget callout boxes
- `<BudgetCallout>` — absolutely-positioned pill + SVG connector line per category
- `<GeneratingState>` — animated loading placeholder during image generation
- `<VendorGrid>` — renders vendor cards, triggers shortlist mutation
- `<VendorCard>` — displays vendor info, match score, save button; shows category allocation as context
- `<ShortlistSidebar>` — reads shortlist from Zustand store
- `<CompareTable>` — renders shortlisted vendors in a side-by-side grid
- `<ChecklistPanel>` — task list with completion toggle

**Zustand store shape:**
```typescript
interface AppStore {
  profile: WeddingProfile | null
  visionBoard: {
    imageUrl: string | null
    modelUsed: "dalle3" | "sdxl" | "template" | null
    allocations: BudgetAllocation[]
    status: "idle" | "generating" | "ready" | "error"
  }
  shortlist: ShortlistItem[]
  addToShortlist: (vendor: Vendor) => void
  removeFromShortlist: (vendorId: string) => void
  setVisionBoard: (data: VisionBoardResult) => void
}
```

---

## Image Generation Pipeline

```
POST /api/vision-board
       │
       ├─ 1. Fetch wedding_profile (Supabase)
       │
       ├─ 2a. buildImagePrompt(profile)
       │        │
       │        ▼
       │   DALL·E 3 API  ──── timeout >15s ──→  Stability AI SDXL
       │        │                                      │
       │        │                         timeout >15s │
       │        │                                      ▼
       │        │                            Curated template image
       │        │                           (selected by style + ceremony_type)
       │        ▼
       │   Upload to Supabase Storage
       │   Write → generated_images
       │
       ├─ 2b. allocateBudget(profile)  [runs in parallel with 2a]
       │        │
       │        ▼
       │   Write → budget_allocations
       │
       └─ 3. Return { image_url, model_used, allocations[] }
```

**Why DALL·E 3 over alternatives for MVP?**
Prompt adherence and photorealism are the priority for a ceremony scene. DALL·E 3 handles complex spatial and cultural prompts more reliably than earlier models. SDXL provides a cost-efficient fallback. The curated template set guarantees a graceful UI even when both APIs are slow or unavailable.

---

## Auth Flow

```
Landing  →  "Start planning"
               │
               ▼
         Supabase magic link email
               │
               ▼
         Confirm link  →  session cookie set
               │
               ▼
         /onboarding  (if no profile)  OR  /dashboard  (if profile exists)
               │
               ▼  (on intake completion)
         /vision-board  (image generating → Vision Board overlay)
               │
               ▼  (on "Explore vendors")
         /dashboard
```

For the prototype / early demos, auth can be bypassed with a hardcoded seed profile. Feature-flagged via `NEXT_PUBLIC_SKIP_AUTH=true`.

---

## Deployment & Infrastructure

```
Vercel (Production)
├── Next.js App (SSR + static)
├── API Routes (Node.js runtime)
└── /api/vision-board (Node.js runtime — image upload can be long-running)

Supabase (Production)
├── PostgreSQL
├── Auth (magic link, JWT sessions)
└── Storage (vendor images + generated ceremony images)

OpenAI
└── DALL·E 3 API
    └── API key stored in Vercel environment variable

Stability AI
└── SDXL API (fallback)
    └── API key stored in Vercel environment variable
```

**Environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       ← server-side only
OPENAI_API_KEY                  ← server-side only (DALL·E 3)
STABILITY_AI_API_KEY            ← server-side only (SDXL fallback)
IMAGE_GEN_TIMEOUT_MS            ← default 15000
NEXT_PUBLIC_SKIP_AUTH           ← dev/demo bypass
```

---

## Vendor Data Strategy (MVP)

No vendor-facing portal. The team manually curates and seeds the initial vendor set.

**Seed scope:** Vancouver, BC — 4 categories (venue, caterer, photographer, planner) — ~15 vendors per category (~60 total).

**Data sourced from:**
- Public vendor websites (pricing pages, package PDFs)
- Tulle Together pricing database
- Direct vendor outreach for cultural capability tags

**Schema migrations:** Managed via Prisma Migrate. Seed script at `prisma/seed.ts`.

---

## Build Sequence (Suggested)

| Phase | Deliverable | Validates |
|---|---|---|
| **0 — Foundation** | Supabase schema, Prisma setup, auth flow, seed data | Data model is correct |
| **1 — Intake** | 4-step onboarding form → creates `wedding_profile` | Completion rate hypothesis |
| **2 — Vision Board** | `allocateBudget()` + `/api/vision-board` + overlay UI | Vision Board engagement hypothesis |
| **3 — Image generation** | `buildImagePrompt()` + DALL·E 3 integration + fallback chain | Image quality + generation reliability |
| **4 — Vendor matching** | `/api/vendors` with allocation-aware filtering + VendorGrid UI | Recommendation relevance hypothesis |
| **5 — Shortlist** | Save/remove vendors, ShortlistSidebar | Shortlist creation rate metric |
| **6 — Compare** | CompareTable from shortlist | Decision support quality |
| **7 — Checklist** | Seeded task list + completion toggle | Engagement / return visit metric |

---

## Out of Scope (Deferred by PRD)

These are explicitly excluded from the architecture above, per PRD §8:

- AI concierge chat (deferred to post-MVP; `POST /api/chat` and `chat_messages` table removed)
- Vendor booking / payments (no Stripe, no booking state machine)
- Guest RSVP management
- Seating chart tooling
- Detailed timeline builder
- Multi-event workflows (mehndi, rehearsal dinner, etc.)
- Vendor self-service portal
- Email / push notifications
- Mobile native app
- Vendor reviews / ratings system

---

## Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Image generation latency degrades the post-intake experience | 15s timeout with two-tier fallback (SDXL, then curated template). Loading state keeps the UI responsive. |
| DALL·E 3 / SDXL costs accumulate quickly | Generate once per profile; cache in Supabase Storage. Regeneration is user-initiated only. Monitor cost per generation; gate with a monthly spend cap on the API key. |
| Generated images are off-brand or inappropriate | Prepend a negative prompt clause. Review 50 generations across style + ceremony_type combinations before launch. |
| Budget allocations feel arbitrary to users | Display allocation rationale ("venues typically take 30–35% of budget") as tooltip copy adjacent to each callout box. |
| Cold-start vendor data is thin | Seed 60 curated vendors before first user. Narrow to one city. |
| Auth adds friction before value is demonstrated | `SKIP_AUTH` flag for prototype demos. Add auth before production. |
| Supabase free tier limits | Row count and bandwidth are well within free tier at MVP scale. Upgrade path is a single tier change. |
