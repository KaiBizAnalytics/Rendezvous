# Rendezvous — MVP Architecture Plan

**Version:** 1.0 | **Date:** March 2026
**Derived from:** `rendezvous_mvp_prd.md`, `opportunity_solution_tree.md`

---

## Guiding Principles

1. **Ship the hypothesis, not the platform.** The MVP exists to validate four assumptions (PRD §5). Every architectural choice is evaluated against: does this enable faster validation?
2. **Couple-first data model.** The wedding profile is the system's nucleus — everything else (vendors, chat, checklist) is a function of it.
3. **Explainable AI.** Vendor match scores are deterministic and computed from structured rules, not LLM inference. The LLM handles language, not logic.
4. **Seam at the right place.** Start with a unified deployment; design seams so the AI layer, vendor data layer, and frontend can split into separate services post-validation without a rewrite.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Landing  │  │  Onboarding │  │     Dashboard         │  │
│  │  Page    │→ │  (Intake)   │→ │  Vendors / Chat /     │  │
│  └──────────┘  └─────────────┘  │  Shortlist / Tasks    │  │
│                                  └──────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────────┐
│                    Next.js Application                       │
│                  (Vercel — single deployment)                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    App Router (RSC)                   │  │
│  │  /           /onboarding      /dashboard             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API Routes                         │  │
│  │  POST /api/intake      →  create/update profile      │  │
│  │  GET  /api/vendors     →  fetch matched vendors      │  │
│  │  POST /api/shortlist   →  save / remove vendor       │  │
│  │  POST /api/chat        →  streaming AI response      │  │
│  │  GET/POST /api/checklist → task management           │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────┬───────────────────────────────┬─────────────────┘
            │                               │
┌───────────▼──────────┐       ┌────────────▼────────────────┐
│      Supabase         │       │      Anthropic Claude API    │
│                       │       │                             │
│  • PostgreSQL (data)  │       │  Model: claude-sonnet-4-6   │
│  • Auth (sessions)    │       │  Streaming: SSE             │
│  • Storage (images)   │       │  Context: profile + vendors │
└───────────────────────┘       └─────────────────────────────┘
```

---

## Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Collocates frontend and API routes; RSC reduces client JS; single Vercel deployment |
| Language | **TypeScript** | Type-safe data models across API boundary; Prisma requires it |
| Styling | **Tailwind CSS + CSS variables** | Design tokens map directly to style guide; utility-first accelerates iteration |
| State | **Zustand** | Lightweight; wedding profile and shortlist live in a single flat store |
| Data fetching | **TanStack Query** | Cache management, loading states, and optimistic updates for shortlist |
| Database | **PostgreSQL via Supabase** | Relational model fits structured vendor + profile data; Supabase adds Auth and free tier |
| ORM | **Prisma** | Type-safe queries; schema migrations; auto-generates types used across app |
| Auth | **Supabase Auth** | Magic link (no password friction for planning context); OAuth optional |
| AI | **Anthropic Claude API** | claude-sonnet-4-6 for cost/capability balance; streaming SSE for perceived speed |
| Deployment | **Vercel** | Zero-config Next.js; edge functions for streaming AI route |
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
id            uuid  PK
user_id       uuid  FK → users.id
title         text
category      text   -- "venue" | "catering" | "legal" | "general"
due_offset_days int  -- days before wedding date (e.g. -365 = 12 months before)
completed     boolean  DEFAULT false
completed_at  timestamptz nullable
created_at    timestamptz
```

### `chat_messages`
Conversation history. Used to populate context window on subsequent turns.

```
id          uuid  PK
user_id     uuid  FK → users.id
role        text  -- "user" | "assistant"
content     text
created_at  timestamptz
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

### `GET /api/vendors?category=all`
Returns matched and scored vendors for the authenticated user's profile.

**Matching logic (deterministic, not LLM):**

```
1. Filter:
   - city match (exact for MVP, proximity later)
   - price_max >= profile.budget_min / expected_vendor_count
   - capacity_max >= profile.guest_count (where applicable)
   - active = true

2. Score each vendor (0–100):
   - Budget fit:   40 pts  (is vendor's range squarely within budget?)
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

### `POST /api/chat`
Streaming endpoint. Builds a context-aware prompt and streams Claude's response.

**Request body:** `{ message: string }`

**Response:** `text/event-stream` (SSE)

**Prompt construction:**
```
SYSTEM:
  You are a warm, knowledgeable wedding concierge for Rendezvous.
  Speak confidently and concisely. Never be effusive or clinical.

  The couple's wedding profile:
  - Location: {city}
  - Date: {wedding_date}
  - Guests: {guest_count}
  - Budget: ${budget_min}–${budget_max}
  - Style: {style}
  - Cultural requirements: {cultural_reqs || "none specified"}

  Relevant vendors in their area (do not fabricate vendors outside this list):
  {top_10_vendors_as_JSON}

  Guidelines:
  - Ground vendor recommendations in the list above
  - When discussing pricing, reference the vendor's actual price range
  - If asked about something out of scope (payments, RSVP), say it's coming soon
  - Keep responses under 120 words unless asked to elaborate

HISTORY:
  {last_6_chat_messages}

USER:
  {message}
```

**After streaming completes:** save both the user message and assistant response to `chat_messages`.

---

### `GET /api/checklist` + `PATCH /api/checklist/:id`
Returns the user's checklist items, sorted by due date relative to their wedding date. PATCH toggles `completed`.

---

## Frontend Component Map

```
app/
├── page.tsx                    ← Landing (static, no auth required)
│
├── onboarding/
│   └── page.tsx                ← 3-step intake form
│       ├── StepWhereWhen       ← city, date, ceremony type
│       ├── StepSizeBudget      ← guests, budget range, priority
│       └── StepVision          ← style cards, cultural requirements
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
    ├── vendors/route.ts
    ├── shortlist/route.ts
    ├── chat/route.ts           ← Edge runtime for streaming
    └── checklist/route.ts
```

**Key client components:**
- `<VendorGrid>` — renders vendor cards, triggers shortlist mutation
- `<VendorCard>` — displays vendor info, match score, save button
- `<ShortlistSidebar>` — reads shortlist from Zustand store
- `<ChatPanel>` — manages message history, streams AI responses via `useChat` hook
- `<CompareTable>` — renders shortlisted vendors in a side-by-side grid
- `<ChecklistPanel>` — task list with completion toggle

**Zustand store shape:**
```typescript
interface AppStore {
  profile: WeddingProfile | null
  shortlist: ShortlistItem[]
  chatOpen: boolean
  addToShortlist: (vendor: Vendor) => void
  removeFromShortlist: (vendorId: string) => void
  toggleChat: () => void
}
```

---

## AI Layer Design

The LLM has one job: **produce helpful natural language**. It does not decide which vendors to surface, score results, or filter by budget — that is all done by the matching query. This keeps recommendations deterministic, auditable, and trustworthy.

```
User message
     │
     ▼
API Route /api/chat
     │
     ├─ 1. Fetch wedding_profile (Supabase)
     ├─ 2. Fetch top 10 matched vendors (reuse /api/vendors logic)
     ├─ 3. Fetch last 6 chat_messages (conversation context)
     ├─ 4. Build system prompt (profile + vendors + history)
     │
     ▼
Claude API (streaming)
     │
     ▼
SSE stream → client (token by token)
     │
     ▼ (on stream end)
Save user message + assistant response → chat_messages
```

**Why not semantic/vector search for MVP?**
Vendor data is small (< 100 records per city), structured, and has explicit price/capacity/location attributes. A SQL filter + scoring function is faster, cheaper, more predictable, and produces explainable results. Semantic search adds complexity with no benefit at this scale.

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
```

For the prototype / early demos, auth can be bypassed with a hardcoded seed profile. Feature-flagged via `NEXT_PUBLIC_SKIP_AUTH=true`.

---

## Deployment & Infrastructure

```
Vercel (Production)
├── Next.js App (SSR + static)
├── API Routes (Node.js runtime)
└── /api/chat (Edge runtime — required for streaming SSE)

Supabase (Production)
├── PostgreSQL
├── Auth (magic link, JWT sessions)
└── Storage (vendor images)

Anthropic
└── Claude API (claude-sonnet-4-6)
    └── API key stored in Vercel environment variable
```

**Environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     ← server-side only
ANTHROPIC_API_KEY             ← server-side only
NEXT_PUBLIC_SKIP_AUTH         ← dev/demo bypass
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
| **1 — Intake** | 3-step onboarding form → creates `wedding_profile` | Completion rate hypothesis |
| **2 — Vendor matching** | `/api/vendors` matching query + VendorGrid UI | Recommendation relevance hypothesis |
| **3 — Shortlist** | Save/remove vendors, ShortlistSidebar | Shortlist creation rate metric |
| **4 — AI chat** | Streaming `/api/chat` + ChatPanel | Concierge interaction hypothesis |
| **5 — Compare** | CompareTable from shortlist | Decision support quality |
| **6 — Checklist** | Seeded task list + completion toggle | Engagement / return visit metric |

---

## Out of Scope (Deferred by PRD)

These are explicitly excluded from the architecture above, per PRD §8:

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
| Cold-start vendor data is thin | Seed 60 curated vendors before first user. Narrow to one city. |
| AI response quality is inconsistent | Ground Claude in structured vendor JSON. Evaluate 20 test queries before launch. |
| Streaming breaks on slower connections | Implement fallback to non-streaming with a loading state. |
| Auth adds friction before value is demonstrated | `SKIP_AUTH` flag for prototype demos. Add auth before production. |
| Supabase free tier limits | Row count and bandwidth are well within free tier at MVP scale. Upgrade path is a single tier change. |
