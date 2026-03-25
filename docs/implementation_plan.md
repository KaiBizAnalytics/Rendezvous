# Rendezvous — MVP Implementation Plan v2.0

**Date:** March 23, 2026
**Input:** `architecture_plan.md`, v2 product pivot
**Output:** Ordered, task-level build guide with commands, file paths, and acceptance criteria

---

## What Changed in v2

The hero feature of the MVP is now the **Interactive Wedding Vision Board** — an AI-generated ceremony image with per-category budget callout overlays, replacing the AI chat concierge as the primary differentiator.

Key removals: AI concierge chat (`/api/chat`, `useChat` hook, `ChatPanel`, SSE streaming, `chat_messages` table).

Key additions: Budget Allocation Engine, Image Generation Pipeline, Vision Board Overlay component, Vision Board summary card on the dashboard. Vendor matching now uses per-category Vision Board allocations rather than total budget fractions.

---

## How to Read This Document

Each phase maps to the architecture build sequence. Within each phase:
- **Setup** — commands and config to run once
- **Tasks** — discrete units of work, each with a concrete deliverable
- **Acceptance criteria** — the test that confirms the phase is done before moving on
- **Blockers** — what must exist before this phase starts

Do not start Phase N+1 until Phase N's acceptance criteria pass.

---

## Repository Initialization

Run once before Phase 0.

```bash
npx create-next-app@latest rendezvous \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd rendezvous
```

Install all dependencies upfront:

```bash
# Data & ORM
npm install @prisma/client prisma
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr

# State & data fetching
npm install zustand @tanstack/react-query

# Utilities
npm install zod
npm install clsx tailwind-merge

# Dev
npm install -D @types/node
npx prisma init
```

---

## Phase 0 — Foundation

**Goal:** Running app, connected database, seeded vendors, deployed shell.
**Blockers:** None.

---

### Task 0.1 — Prisma schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model WeddingProfile {
  id               String   @id @default(uuid())
  userId           String   @unique @map("user_id")
  city             String
  weddingDate      DateTime @map("wedding_date") @db.Date
  guestCount       Int      @map("guest_count")
  budgetTotal      Int      @map("budget_total")      // cents
  ceremonyType     String   @map("ceremony_type")
  style            String
  colors           String?
  culturalReqs     String?  @map("cultural_reqs")
  priorityRankings String[] @map("priority_rankings") // ordered category list
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  shortlistItems   ShortlistItem[]
  checklistItems   ChecklistItem[]
  visionBoards     VisionBoard[]

  @@map("wedding_profiles")
}

model Vendor {
  id            String   @id @default(uuid())
  category      String
  name          String
  city          String
  description   String
  priceMin      Int      @map("price_min")
  priceMax      Int      @map("price_max")
  priceUnit     String   @map("price_unit")
  capacityMin   Int?     @map("capacity_min")
  capacityMax   Int?     @map("capacity_max")
  tags          String[]
  culturalTags  String[] @map("cultural_tags")
  websiteUrl    String?  @map("website_url")
  phone         String?
  imageUrl      String?  @map("image_url")
  active        Boolean  @default(true)
  createdAt     DateTime @default(now()) @map("created_at")
  shortlistItems ShortlistItem[]

  @@map("vendors")
}

model ShortlistItem {
  id        String         @id @default(uuid())
  profileId String         @map("profile_id")
  vendorId  String         @map("vendor_id")
  notes     String?
  createdAt DateTime       @default(now()) @map("created_at")
  profile   WeddingProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  vendor    Vendor         @relation(fields: [vendorId], references: [id])

  @@unique([profileId, vendorId])
  @@map("shortlist_items")
}

model ChecklistItem {
  id             String         @id @default(uuid())
  profileId      String         @map("profile_id")
  title          String
  category       String
  dueOffsetDays  Int            @map("due_offset_days")
  completed      Boolean        @default(false)
  completedAt    DateTime?      @map("completed_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  profile        WeddingProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("checklist_items")
}

model VisionBoard {
  id               String         @id @default(uuid())
  profileId        String         @map("profile_id")
  imageUrl         String?        @map("image_url")       // Supabase Storage URL; null = using fallback
  imagePrompt      String         @map("image_prompt")
  allocations      Json                                   // BudgetAllocation JSON blob
  generationStatus String         @default("pending") @map("generation_status") // pending | complete | failed
  createdAt        DateTime       @default(now()) @map("created_at")
  profile          WeddingProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("vision_boards")
}
```

---

### Task 0.2 — Supabase project + environment

1. Create a new project at supabase.com
2. In **Project Settings → Database**, copy the connection strings
3. Create a Storage bucket named `vision-boards` with public read access
4. Create `.env.local`:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ca-central-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon key]"
SUPABASE_SERVICE_ROLE_KEY="[service role key]"
IMAGE_GENERATION_PROVIDER="dalle"    # "dalle" | "stability"
OPENAI_API_KEY="[openai key]"        # required if IMAGE_GENERATION_PROVIDER=dalle
STABILITY_API_KEY="[stability key]"  # required if IMAGE_GENERATION_PROVIDER=stability
NEXT_PUBLIC_SKIP_AUTH="true"
```

Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### Task 0.3 — Shared types

Create `src/types/index.ts` — single source of truth for types used across API and UI:

```typescript
export type VendorCategory = 'venue' | 'florals' | 'music' | 'mc' | 'photography'
export type WeddingStyle = 'Classic' | 'Bohemian' | 'Modern' | 'Intimate' | 'Cultural' | 'Garden Party'
export type CeremonyType = 'Indoor' | 'Outdoor' | 'Beach' | 'Destination' | 'Not sure yet'
export type GenerationStatus = 'pending' | 'complete' | 'failed'

export interface WeddingProfile {
  id: string
  userId: string
  city: string
  weddingDate: string          // ISO date string
  guestCount: number
  budgetTotal: number          // cents
  ceremonyType: CeremonyType
  style: WeddingStyle
  colors: string | null
  culturalReqs: string | null
  priorityRankings: VendorCategory[]  // ordered: [0] = top priority
}

export interface BudgetAllocation {
  venue:       number   // cents
  florals:     number
  music:       number
  mc:          number
  photography: number
  remaining:   number
}

export interface Vendor {
  id: string
  category: VendorCategory
  name: string
  city: string
  description: string
  priceMin: number             // cents
  priceMax: number             // cents
  priceUnit: string
  capacityMin: number | null
  capacityMax: number | null
  tags: string[]
  culturalTags: string[]
  websiteUrl: string | null
  imageUrl: string | null
  matchScore: number           // 0–100, computed server-side
}

export interface ShortlistItem {
  id: string
  vendorId: string
  vendor: Vendor
  notes: string | null
}

export interface ChecklistItem {
  id: string
  title: string
  category: string
  dueDate: string              // computed from weddingDate + dueOffsetDays
  completed: boolean
}

export interface VisionBoard {
  id: string
  profileId: string
  imageUrl: string | null
  imagePrompt: string
  allocations: BudgetAllocation
  generationStatus: GenerationStatus
  createdAt: string
}
```

---

### Task 0.4 — Utility helpers

`src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', maximumFractionDigits: 0
  }).format(cents / 100)
}

export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} – ${formatPrice(max)}`
}
```

`src/lib/prisma.ts` — singleton Prisma client:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

`src/lib/supabase/server.ts` — server-side Supabase client:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

`src/lib/supabase/client.ts` — browser Supabase client:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### Task 0.5 — Tailwind design tokens

In `tailwind.config.ts`, extend theme with the style guide tokens:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        'var(--color-bg)',
        surface:   'var(--color-surface)',
        surface2:  'var(--color-surface-2)',
        rose:      'var(--color-accent-rose)',
        sage:      'var(--color-accent-sage)',
        text:      'var(--color-text-primary)',
        text2:     'var(--color-text-secondary)',
        muted:     'var(--color-text-muted)',
        border:    'var(--color-border)',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

Add CSS variables to `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,300;0,9..144,400;1,9..144,200;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --color-bg:              #FAF8F5;
  --color-surface:         #F5EFE6;
  --color-surface-2:       #EDE5D8;
  --color-accent-rose:     #C9A49A;
  --color-accent-sage:     #8A9E8C;
  --color-text-primary:    #2C2420;
  --color-text-secondary:  #7A6E68;
  --color-text-muted:      #B0A89F;
  --color-border:          #E8DDD4;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:             #1A1714;
    --color-surface:        #242019;
    --color-surface-2:      #2E2923;
    --color-text-primary:   #F0EAE3;
    --color-text-secondary: #A89E97;
    --color-border:         #3A342D;
  }
}
```

---

### Task 0.6 — Vendor seed data

Create `prisma/seed.ts`. Seed data covers the five MVP categories: venue, florals, music, mc, photography. Quality of seed data directly impacts whether matching looks credible in user testing.

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const vendors = [
  // ── VENUES ──────────────────────────────────────────
  {
    category: 'venue', name: 'The Fairmont Pacific Rim', city: 'Vancouver, BC',
    description: 'Luxury waterfront hotel with indoor and outdoor ceremony spaces. Full-service event team. Iconic Burrard Inlet views.',
    priceMin: 800000, priceMax: 1800000, priceUnit: 'venue_rental',
    capacityMin: 50, capacityMax: 300,
    tags: ['Indoor', 'Outdoor', 'Luxury', 'Full service', 'Waterfront'],
    culturalTags: [],
    websiteUrl: 'https://www.fairmont.com/pacific-rim-vancouver',
    imageUrl: null,
  },
  {
    category: 'venue', name: 'Brix & Mortar', city: 'Vancouver, BC',
    description: 'Heritage building in Yaletown with a private courtyard garden. Intimate atmosphere, exposed brick, wine cellar.',
    priceMin: 350000, priceMax: 800000, priceUnit: 'venue_rental',
    capacityMin: 20, capacityMax: 120,
    tags: ['Indoor', 'Outdoor', 'Heritage', 'Courtyard', 'Intimate'],
    culturalTags: [],
    websiteUrl: 'https://brixandmortar.com',
    imageUrl: null,
  },
  {
    category: 'venue', name: 'Grouse Mountain Chalet', city: 'Vancouver, BC',
    description: 'Mountain-top events venue with panoramic views of Vancouver. Dramatic backdrop for ceremonies and receptions year-round.',
    priceMin: 500000, priceMax: 1200000, priceUnit: 'venue_rental',
    capacityMin: 30, capacityMax: 150,
    tags: ['Outdoor', 'Mountain views', 'Scenic', 'Rustic'],
    culturalTags: [],
    websiteUrl: 'https://www.grousemountain.com',
    imageUrl: null,
  },
  // Add 12 more venues...

  // ── FLORALS & DÉCOR ───────────────────────────────────
  {
    category: 'florals', name: 'Petal & Stem Studio', city: 'Vancouver, BC',
    description: 'Lush, garden-style floral design for weddings. Specializes in organic arrangements, arches, centrepieces, and full venue florals.',
    priceMin: 250000, priceMax: 600000, priceUnit: 'full_florals',
    capacityMin: null, capacityMax: null,
    tags: ['Garden style', 'Organic', 'Arches', 'Full décor'],
    culturalTags: ['South Asian', 'Marigold arrangements'],
    websiteUrl: null,
    imageUrl: null,
  },
  {
    category: 'florals', name: 'Bloom Theory', city: 'Vancouver, BC',
    description: 'Modern, editorial floral design. Dramatic installations and minimalist table arrangements for contemporary weddings.',
    priceMin: 180000, priceMax: 450000, priceUnit: 'full_florals',
    capacityMin: null, capacityMax: null,
    tags: ['Modern', 'Editorial', 'Minimalist', 'Installations'],
    culturalTags: [],
    websiteUrl: null,
    imageUrl: null,
  },
  // Add 12 more florists...

  // ── MUSIC & DJ ────────────────────────────────────────
  {
    category: 'music', name: 'Frequency DJ Collective', city: 'Vancouver, BC',
    description: 'Vancouver\'s top wedding DJ collective. Live remixing, ceremony acoustics, wireless setup. Experienced with multicultural receptions.',
    priceMin: 180000, priceMax: 350000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['DJ', 'Live remixing', 'Ceremony sound', 'Multicultural'],
    culturalTags: ['South Asian', 'Chinese', 'Latin'],
    websiteUrl: null,
    imageUrl: null,
  },
  {
    category: 'music', name: 'Cascade String Quartet', city: 'Vancouver, BC',
    description: 'Classical and contemporary string quartet. Ceremony processionals, cocktail hour, and first dance arrangements.',
    priceMin: 220000, priceMax: 420000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['Live music', 'Classical', 'String quartet', 'Ceremony'],
    culturalTags: [],
    websiteUrl: null,
    imageUrl: null,
  },
  // Add 12 more music vendors...

  // ── MC & HOST ─────────────────────────────────────────
  {
    category: 'mc', name: 'The Wedding Voice', city: 'Vancouver, BC',
    description: 'Professional wedding MC with 10+ years experience. Bilingual (English/Cantonese). Warm, witty, and reads the room perfectly.',
    priceMin: 100000, priceMax: 200000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['MC', 'Bilingual', 'Experienced', 'Warm'],
    culturalTags: ['Chinese', 'Cantonese'],
    websiteUrl: null,
    imageUrl: null,
  },
  {
    category: 'mc', name: 'Grand Events MC', city: 'Vancouver, BC',
    description: 'High-energy MC specializing in large receptions. Crowd games, toasts, and seamless transitions. Multilingual on request.',
    priceMin: 120000, priceMax: 220000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['MC', 'High energy', 'Large events', 'Multilingual'],
    culturalTags: ['South Asian', 'Latin', 'Chinese'],
    websiteUrl: null,
    imageUrl: null,
  },
  // Add 12 more MCs...

  // ── PHOTOGRAPHY & VIDEO ───────────────────────────────
  {
    category: 'photography', name: 'Studio Atelier', city: 'Vancouver, BC',
    description: 'Editorial and film-style wedding photography. Award-winning. Published in Vogue Weddings. Experienced with multicultural ceremonies.',
    priceMin: 420000, priceMax: 750000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['Editorial', 'Film-style', 'Award-winning', 'Second shooter available'],
    culturalTags: ['South Asian', 'Chinese ceremony', 'LGBTQ+ affirming'],
    websiteUrl: null,
    imageUrl: null,
  },
  {
    category: 'photography', name: 'Golden Hour Co.', city: 'Vancouver, BC',
    description: 'Candid, documentary-style photography with warm natural tones. Couples-focused, unobtrusive approach.',
    priceMin: 300000, priceMax: 550000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['Candid', 'Documentary', 'Natural light', 'Warm tones'],
    culturalTags: ['LGBTQ+ affirming'],
    websiteUrl: null,
    imageUrl: null,
  },
  // Add 12 more photographers...
]

async function main() {
  console.log('Seeding vendors...')
  await prisma.vendor.deleteMany()
  await prisma.vendor.createMany({ data: vendors })
  console.log(`Seeded ${vendors.length} vendors.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
```

Run:
```bash
npx prisma db seed
```

---

### Task 0.7 — Zustand store

`src/store/index.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WeddingProfile, ShortlistItem, VisionBoard } from '@/types'

interface AppStore {
  profile: WeddingProfile | null
  shortlist: ShortlistItem[]
  visionBoard: VisionBoard | null
  visionBoardOpen: boolean
  setProfile: (profile: WeddingProfile) => void
  setShortlist: (items: ShortlistItem[]) => void
  addToShortlist: (item: ShortlistItem) => void
  removeFromShortlist: (vendorId: string) => void
  setVisionBoard: (vb: VisionBoard) => void
  openVisionBoard: () => void
  closeVisionBoard: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      profile: null,
      shortlist: [],
      visionBoard: null,
      visionBoardOpen: false,
      setProfile: (profile) => set({ profile }),
      setShortlist: (shortlist) => set({ shortlist }),
      addToShortlist: (item) => set((s) => ({ shortlist: [...s.shortlist, item] })),
      removeFromShortlist: (vendorId) => set((s) => ({
        shortlist: s.shortlist.filter((i) => i.vendorId !== vendorId)
      })),
      setVisionBoard: (visionBoard) => set({ visionBoard }),
      openVisionBoard: () => set({ visionBoardOpen: true }),
      closeVisionBoard: () => set({ visionBoardOpen: false }),
    }),
    { name: 'rendezvous-store', partialize: (s) => ({ profile: s.profile, shortlist: s.shortlist, visionBoard: s.visionBoard }) }
  )
)
```

---

### Task 0.8 — TanStack Query provider

`src/app/providers.tsx`:
```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } }
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

Wrap `src/app/layout.tsx` with `<Providers>`.

---

### Task 0.9 — Initial Vercel deployment

```bash
npm install -g vercel
vercel
```

Add all environment variables to Vercel dashboard. Confirm `vercel --prod` produces a live URL.

---

### Phase 0 Acceptance Criteria

- [ ] `npx prisma studio` shows all five tables (`wedding_profiles`, `vendors`, `shortlist_items`, `checklist_items`, `vision_boards`) with correct schema
- [ ] Seed script runs without error; 60+ vendor rows visible in Prisma Studio across the five categories
- [ ] `npm run dev` serves `http://localhost:3000` with no TypeScript errors
- [ ] Vercel deployment is live at a public URL
- [ ] All environment variables confirmed working in production
- [ ] Supabase Storage bucket `vision-boards` is accessible from the app

---

## Phase 1 — Intake (Onboarding)

**Goal:** A couple can complete the 3-step questionnaire, which creates a `WeddingProfile` in the database and redirects to the Vision Board generation screen.
**Blockers:** Phase 0 complete.

---

### Task 1.1 — Auth middleware

`src/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip auth in demo mode
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') return NextResponse.next()

  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } }
  )
  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') ||
                      request.nextUrl.pathname.startsWith('/onboarding') ||
                      request.nextUrl.pathname.startsWith('/vision')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return response
}

export const config = { matcher: ['/dashboard/:path*', '/onboarding/:path*', '/vision/:path*'] }
```

---

### Task 1.2 — Landing page

`src/app/page.tsx` — Server Component. Port the landing section from the HTML prototype, adapting to Next.js + Tailwind. Key elements:

- Logo: `<span className="font-serif">Rendez<span className="text-rose">vous</span></span>`
- Hero headline using `font-serif` at display scale
- Staggered entrance animation via CSS `@keyframes fadeUp` with `animation-delay`
- "Start planning" button routes to `/onboarding`
- Stats bar at bottom

No client JavaScript needed on this page.

---

### Task 1.3 — `POST /api/intake`

`src/app/api/intake/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CHECKLIST_TEMPLATE = [
  { title: 'Set your total budget',           category: 'general',     dueOffsetDays: -540 },
  { title: 'Book your venue',                 category: 'venue',       dueOffsetDays: -365 },
  { title: 'Book your photographer',          category: 'photography', dueOffsetDays: -300 },
  { title: 'Book your florist',               category: 'florals',     dueOffsetDays: -270 },
  { title: 'Book your DJ or band',            category: 'music',       dueOffsetDays: -270 },
  { title: 'Book your MC',                    category: 'mc',          dueOffsetDays: -240 },
  { title: 'Send save-the-dates',             category: 'general',     dueOffsetDays: -240 },
  { title: 'Confirm ceremony details',        category: 'venue',       dueOffsetDays: -180 },
  { title: 'Order wedding attire',            category: 'general',     dueOffsetDays: -150 },
  { title: 'Send invitations',                category: 'general',     dueOffsetDays: -120 },
  { title: 'Confirm floral designs',          category: 'florals',     dueOffsetDays: -60  },
  { title: 'Confirm vendor arrival times',    category: 'general',     dueOffsetDays: -30  },
  { title: 'Final dress / suit fitting',      category: 'general',     dueOffsetDays: -21  },
  { title: 'Deliver final guest count',       category: 'general',     dueOffsetDays: -14  },
  { title: 'Prepare vendor payments',         category: 'general',     dueOffsetDays: -7   },
]

const schema = z.object({
  city:             z.string().min(2),
  weddingDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestCount:       z.number().int().min(1).max(1000),
  budgetTotal:      z.number().int().min(0),
  ceremonyType:     z.string(),
  style:            z.string(),
  colors:           z.string().nullable().optional(),
  culturalReqs:     z.string().nullable().optional(),
  priorityRankings: z.array(z.string()).min(1).max(5),
})

export async function POST(req: NextRequest) {
  const userId = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'
    ? 'demo-user-id'
    : (await req.json()).userId

  const body = schema.parse(await req.json())

  const profile = await prisma.weddingProfile.upsert({
    where:  { userId },
    create: { userId, ...body, weddingDate: new Date(body.weddingDate) },
    update: { ...body, weddingDate: new Date(body.weddingDate) },
  })

  // Seed checklist only on first creation
  const existingItems = await prisma.checklistItem.count({ where: { profileId: profile.id } })
  if (existingItems === 0) {
    await prisma.checklistItem.createMany({
      data: CHECKLIST_TEMPLATE.map((item) => ({ ...item, profileId: profile.id })),
    })
  }

  return NextResponse.json({ profileId: profile.id })
}
```

---

### Task 1.4 — Onboarding page (3-step form)

`src/app/onboarding/page.tsx` — Client Component.

**State shape:**
```typescript
const [step, setStep] = useState<1 | 2 | 3>(1)
const [form, setForm] = useState({
  city: '', weddingDate: '', ceremonyType: '',
  guestCount: '', budgetTotal: '',
  priorityRankings: [] as string[],
  style: '', colors: '', culturalReqs: '',
})
```

**Step components** (co-located in `src/app/onboarding/`):

- `StepWhereWhen.tsx` — city text input, date picker, ceremony type select
- `StepSizeBudget.tsx` — guest count number input, total budget select (maps to cents), draggable priority ranking for the five categories
- `StepVision.tsx` — 6 style option cards (click to select), color palette text input, cultural requirements text input

**Budget select → cents mapping:**
```typescript
const BUDGET_OPTIONS = [
  { label: 'Under $15,000',        value: 1500000  },
  { label: '$15,000 – $30,000',    value: 2250000  },
  { label: '$30,000 – $50,000',    value: 4000000  },
  { label: '$50,000 – $75,000',    value: 6250000  },
  { label: '$75,000+',             value: 10000000 },
]
```

**Priority ranking UI** — `StepSizeBudget` renders the five vendor category pills (Venue, Florals, Music, MC, Photography). The user drags them into their preferred order, which is stored as `priorityRankings: string[]`. Use native HTML5 `draggable` for MVP (no drag-and-drop library required).

**On final step submit:**
```typescript
async function handleSubmit() {
  const res = await fetch('/api/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...form, guestCount: Number(form.guestCount), budgetTotal: selectedBudget }),
  })
  const { profileId } = await res.json()
  setProfile({ ...form, id: profileId })   // write to Zustand
  router.push('/vision/generating')
}
```

Note: the user is routed to `/vision/generating`, not `/dashboard`. The Vision Board is generated before the dashboard is shown.

Progress dots animate using CSS transitions on the `.step-dot` class (same pattern as prototype).

---

### Phase 1 Acceptance Criteria

- [ ] User can complete all 3 steps without error
- [ ] Submitting step 3 creates a row in `wedding_profiles` in Supabase
- [ ] Submitting step 3 creates 15 rows in `checklist_items` in Supabase
- [ ] User is redirected to `/vision/generating` after submission
- [ ] Priority ranking drag interaction works and the ordered array is stored on the profile

---

## Phase 2 — Budget Allocation Engine

**Goal:** A pure `allocateBudget` function distributes the total budget across the five vendor categories using Vancouver market benchmarks weighted by the user's priority rankings. Vision Board and vendor matching both depend on this output.
**Blockers:** Phase 1 complete (need `priorityRankings` and `budgetTotal` from the profile).

---

### Task 2.1 — `allocateBudget` pure function

`src/lib/budget.ts`:

```typescript
import type { BudgetAllocation, VendorCategory, WeddingProfile } from '@/types'

// Vancouver market baseline shares — where a neutral couple spends their budget
const BASELINE_SHARES: Record<VendorCategory, number> = {
  venue:       0.38,
  photography: 0.17,
  florals:     0.15,
  music:       0.12,
  mc:          0.06,
  // remaining ~12% stays as buffer
}

const PRIORITY_MULTIPLIERS = [1.25, 1.10, 1.00, 0.90, 0.75]  // index 0 = top priority

/**
 * Allocates total budget across five vendor categories.
 * Priority rankings shift share away from lower-priority categories
 * toward higher-priority ones, anchored to Vancouver market baselines.
 *
 * @param profile - must include budgetTotal and priorityRankings
 * @returns BudgetAllocation with per-category cents and remaining buffer
 */
export function allocateBudget(profile: Pick<WeddingProfile, 'budgetTotal' | 'guestCount' | 'priorityRankings' | 'city'>): BudgetAllocation {
  const { budgetTotal, priorityRankings } = profile

  // Apply priority multipliers to baseline shares
  const adjustedShares: Record<string, number> = { ...BASELINE_SHARES }
  priorityRankings.forEach((category, index) => {
    if (category in adjustedShares) {
      adjustedShares[category] = BASELINE_SHARES[category as VendorCategory] * PRIORITY_MULTIPLIERS[index]
    }
  })

  // Normalise so category shares sum to 0.88 (leave 12% as buffer)
  const rawSum = Object.values(adjustedShares).reduce((a, b) => a + b, 0)
  const targetSum = 0.88
  const normalised: Record<string, number> = {}
  for (const [cat, share] of Object.entries(adjustedShares)) {
    normalised[cat] = (share / rawSum) * targetSum
  }

  const alloc: BudgetAllocation = {
    venue:       Math.round(budgetTotal * normalised.venue),
    photography: Math.round(budgetTotal * normalised.photography),
    florals:     Math.round(budgetTotal * normalised.florals),
    music:       Math.round(budgetTotal * normalised.music),
    mc:          Math.round(budgetTotal * normalised.mc),
    remaining:   0,
  }

  const allocated = alloc.venue + alloc.photography + alloc.florals + alloc.music + alloc.mc
  alloc.remaining = budgetTotal - allocated

  return alloc
}
```

---

### Task 2.2 — Unit tests for `allocateBudget`

`src/lib/__tests__/budget.test.ts`:

Key scenarios to cover:
1. Total allocated + remaining equals `budgetTotal` exactly (no cents lost)
2. When `venue` is ranked first, `alloc.venue` is greater than it would be under neutral rankings
3. When `photography` is ranked last, `alloc.photography` is less than the baseline share
4. A $15,000 budget produces reasonable absolute numbers (venue ≥ $5,000, remaining ≥ $1,500)
5. A $75,000 budget with South Asian cultural priority returns `alloc.florals` > $9,000 (florals usage is heavier)

Run with:
```bash
npx jest src/lib/__tests__/budget.test.ts
```

---

### Phase 2 Acceptance Criteria

- [ ] `allocateBudget` returns allocations that sum exactly to `budgetTotal`
- [ ] All five test scenarios in Task 2.2 pass
- [ ] Running with `priorityRankings = ['venue', ...]` always returns a higher venue allocation than `priorityRankings = ['photography', 'florals', 'music', 'mc', 'venue']`

---

## Phase 3 — Image Generation Pipeline

**Goal:** Given a completed wedding profile, generate a ceremony image via DALL·E 3 or Stability AI, store it in Supabase Storage, and create a `VisionBoard` record. Falls back gracefully if generation fails or times out.
**Blockers:** Phase 2 complete (`allocateBudget` must be available to store allocations with the board).

---

### Task 3.1 — `buildImagePrompt` function

`src/lib/imagePrompt.ts`:

```typescript
import type { WeddingProfile } from '@/types'

const STYLE_DESCRIPTORS: Record<string, string> = {
  Classic:       'timeless, formal elegance, white florals, candlelight, ballroom setting',
  Bohemian:      'loose wildflowers, macramé, pampas grass, soft afternoon light, outdoor meadow',
  Modern:        'clean geometric lines, monochrome palette, sculptural florals, industrial venue',
  Intimate:      'candlelit dinner party, warm glow, close family, garden terrace, lush greenery',
  Cultural:      'rich textiles, vibrant colours, ceremonial décor, layered traditions',
  'Garden Party': 'English garden, pastel blooms, wicker furniture, dappled sunlight, archway',
}

const CEREMONY_DESCRIPTORS: Record<string, string> = {
  Indoor:      'elegant indoor ceremony hall',
  Outdoor:     'open-air ceremony with natural light',
  Beach:       'oceanfront ceremony on sandy shore',
  Destination: 'destination wedding ceremony in scenic location',
  'Not sure yet': 'romantic ceremony setting',
}

/**
 * Maps questionnaire fields to an image generation prompt.
 * Produces a photorealistic description of the ceremony setting,
 * not generic wedding stock photography.
 */
export function buildImagePrompt(profile: WeddingProfile): string {
  const styleDesc = STYLE_DESCRIPTORS[profile.style] ?? 'romantic, elegant'
  const ceremonyDesc = CEREMONY_DESCRIPTORS[profile.ceremonyType] ?? 'romantic ceremony setting'
  const colorNote = profile.colors ? `Color palette: ${profile.colors}.` : ''
  const culturalNote = profile.culturalReqs ? `Incorporates ${profile.culturalReqs} traditions.` : ''
  const guestNote = profile.guestCount <= 40 ? 'intimate gathering' : profile.guestCount <= 100 ? 'mid-size celebration' : 'grand celebration'

  return [
    `Photorealistic wedding ceremony scene.`,
    `Setting: ${ceremonyDesc} in ${profile.city}.`,
    `Style: ${styleDesc}.`,
    colorNote,
    culturalNote,
    `Scale: ${guestNote}.`,
    `Shot as an atmospheric wide-angle editorial photograph, golden-hour lighting.`,
    `No people visible — focus on the decorated space, florals, and ambiance.`,
    `Magazine quality. Warm, romantic, cinematic.`,
  ].filter(Boolean).join(' ')
}
```

---

### Task 3.2 — Image generation service

`src/lib/imageGeneration.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'

const GENERATION_TIMEOUT_MS = 15_000

interface GenerateResult {
  imageUrl: string | null
  usedFallback: boolean
}

/**
 * Calls DALL·E 3 or Stability AI to generate an image from prompt.
 * Times out after 15 seconds and falls back to a curated template image.
 * On success, uploads to Supabase Storage and returns the public URL.
 */
export async function generateCeremonyImage(prompt: string, profileId: string): Promise<GenerateResult> {
  const provider = process.env.IMAGE_GENERATION_PROVIDER ?? 'dalle'

  try {
    const imageBuffer = await Promise.race([
      provider === 'dalle' ? callDalle(prompt) : callStability(prompt),
      timeout(GENERATION_TIMEOUT_MS),
    ])

    const supabase = createClient()
    const fileName = `${profileId}-${Date.now()}.png`
    const { error } = await supabase.storage
      .from('vision-boards')
      .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: true })

    if (error) throw error

    const { data } = supabase.storage.from('vision-boards').getPublicUrl(fileName)
    return { imageUrl: data.publicUrl, usedFallback: false }
  } catch {
    // Return null — the caller stores null and the overlay uses a fallback template
    return { imageUrl: null, usedFallback: true }
  }
}

async function callDalle(prompt: string): Promise<Buffer> {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1792x1024', response_format: 'b64_json' }),
  })
  const json = await res.json()
  return Buffer.from(json.data[0].b64_json, 'base64')
}

async function callStability(prompt: string): Promise<Buffer> {
  const res = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7, height: 1024, width: 1792, samples: 1, steps: 30,
    }),
  })
  const json = await res.json()
  return Buffer.from(json.artifacts[0].base64, 'base64')
}

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Image generation timeout')), ms))
}
```

**Fallback template:** Store 6 curated ceremony images at `public/vision-fallbacks/[style].jpg` (classic, bohemian, modern, intimate, cultural, garden-party). The Vision Board overlay selects the matching fallback when `imageUrl` is null.

---

### Task 3.3 — `POST /api/vision/generate`

`src/app/api/vision/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { allocateBudget } from '@/lib/budget'
import { buildImagePrompt } from '@/lib/imagePrompt'
import { generateCeremonyImage } from '@/lib/imageGeneration'

export async function POST(req: NextRequest) {
  const userId = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ? 'demo-user-id' : (await req.json()).userId
  const { regenerate } = await req.json().catch(() => ({ regenerate: false }))

  const profile = await prisma.weddingProfile.findUnique({ where: { userId } })
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  const profileData = {
    ...profile,
    weddingDate: profile.weddingDate.toISOString(),
    priorityRankings: profile.priorityRankings as string[],
  }

  // 1. Compute budget allocations
  const allocations = allocateBudget(profileData as any)

  // 2. Build image prompt
  const imagePrompt = buildImagePrompt(profileData as any)

  // 3. Create a pending VisionBoard record immediately so the generating screen can poll
  const pendingBoard = await prisma.visionBoard.create({
    data: {
      profileId: profile.id,
      imagePrompt,
      allocations: allocations as any,
      generationStatus: 'pending',
    },
  })

  // 4. Generate image (async — fire and update)
  generateCeremonyImage(imagePrompt, profile.id).then(async ({ imageUrl }) => {
    await prisma.visionBoard.update({
      where: { id: pendingBoard.id },
      data:  { imageUrl, generationStatus: imageUrl ? 'complete' : 'failed' },
    })
  })

  return NextResponse.json({ visionBoardId: pendingBoard.id })
}
```

---

### Task 3.4 — `GET /api/vision/[id]` (polling endpoint)

`src/app/api/vision/[id]/route.ts`:

The generating screen polls this endpoint every 2 seconds until `generationStatus` is `complete` or `failed`.

```typescript
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const board = await prisma.visionBoard.findUnique({ where: { id: params.id } })
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ board })
}
```

---

### Task 3.5 — Generating screen

`src/app/vision/generating/page.tsx` — Client Component:

- Shows an animated loading state: slow-fade between 4 preview phrases ("Envisioning your ceremony...", "Allocating your budget...", "Matching your vision...", "Almost ready...")
- Polls `GET /api/vision/[id]` every 2 seconds
- On `generationStatus === 'complete'` or `'failed'`: stores the board in Zustand, navigates to `/vision/board`
- Maximum wait: 20 seconds. After 20s, navigates regardless (the overlay handles the `null` image case via fallback)

---

### Phase 3 Acceptance Criteria

- [ ] `buildImagePrompt` for a Bohemian + outdoor + Vancouver profile contains recognizable style keywords (automated snapshot test)
- [ ] `POST /api/vision/generate` creates a `vision_boards` row with `generationStatus: 'pending'` and returns within 500ms
- [ ] Within 20 seconds, the row's `generationStatus` updates to `complete` or `failed` (never stays `pending`)
- [ ] A generated image URL is accessible publicly from Supabase Storage
- [ ] When generation fails or times out, `imageUrl` is null and the overlay uses the correct style fallback
- [ ] The generating screen navigates to `/vision/board` upon completion

---

## Phase 4 — Vision Board Overlay

**Goal:** Full-screen overlay presents the AI-generated ceremony image with 5 positioned budget callout boxes, SVG connector lines, and interactive expand/collapse for each callout. The user can regenerate the scene or proceed to the dashboard.
**Blockers:** Phase 3 complete.

---

### Task 4.1 — Vision Board page shell

`src/app/vision/board/page.tsx` — Client Component. Reads `visionBoard` from Zustand. If null, fetches from API using the profile's most recent board.

Layout:
```
<div class="vision-board-overlay">   ← fixed inset-0, z-50
  <img class="vision-bg" />          ← AI image (or fallback), cover fill
  <div class="vision-callouts" />    ← absolute-positioned callout boxes + SVG lines
  <div class="vision-bottom-bar" />  ← budget summary + CTAs
</div>
```

---

### Task 4.2 — Callout positioning map

Each of the five vendor categories is anchored to a named image zone. Positions are expressed as percentage coordinates so they scale with viewport:

```typescript
// src/lib/calloutPositions.ts
export const CALLOUT_POSITIONS: Record<string, { top: string; left: string; lineEnd: { x: string; y: string } }> = {
  venue:       { top: '15%', left: '5%',  lineEnd: { x: '22%', y: '30%' } },
  florals:     { top: '12%', left: '70%', lineEnd: { x: '60%', y: '28%' } },
  photography: { top: '55%', left: '72%', lineEnd: { x: '65%', y: '50%' } },
  music:       { top: '60%', left: '4%',  lineEnd: { x: '18%', y: '55%' } },
  mc:          { top: '82%', left: '38%', lineEnd: { x: '42%', y: '72%' } },
}
```

These defaults suit a wide outdoor ceremony image. They can be adjusted once real generated images are available in testing.

---

### Task 4.3 — `BudgetCallout` component

`src/components/BudgetCallout.tsx` — Client Component:

```typescript
interface BudgetCalloutProps {
  category: VendorCategory
  allocated: number        // cents
  isExpanded: boolean
  onToggle: () => void
  topVendors: Vendor[]     // pre-fetched top 3 vendors for this category
}
```

**Collapsed state:** Shows category label, allocated amount, and a `+` expand toggle. Width ~180px, frosted glass background (`backdrop-filter: blur(12px)`), dusty rose border on hover.

**Expanded state:** Slides open vertically (CSS `max-height` transition, 300ms). Shows:
- Budget bar: allocated amount + formatted (e.g., "~$14,200 for your venue")
- Top 3 vendor matches (name, match score, price range)
- Upgrade / Downgrade nudge: "Shift $2k to Florals →" if florals is priority #2

**SVG connector line:** Each callout renders its own `<svg>` with `position: absolute, inset: 0, pointer-events: none`. A `<line>` element connects the callout's anchor point to the image zone coordinate from `CALLOUT_POSITIONS`. Stroke: `rgba(255,255,255,0.4)`, stroke-width: 1.

---

### Task 4.4 — Budget summary bar

`src/components/VisionBudgetBar.tsx` — fixed to the bottom of the overlay:

Layout: horizontal bar showing five category chips with allocated amounts, plus "Remaining buffer" on the right. Total adds up to the `budgetTotal` from the profile.

```
[ Venue $18,400 ] [ Florals $7,600 ] [ Photography $8,500 ] [ Music $5,200 ] [ MC $2,900 ]  |  Buffer: $3,400
```

On mobile (< 768px): chips wrap into two rows, font size reduces.

---

### Task 4.5 — Regenerate and Continue CTAs

Two buttons positioned at the bottom-right corner of the overlay, above the budget bar:

**"Regenerate Scene"** — calls `POST /api/vision/generate` with `{ regenerate: true }`, then navigates to `/vision/generating` again. Disabled for 60 seconds after each use to prevent API cost abuse (show countdown timer on the button).

**"Continue to Dashboard →"** — calls `setVisionBoard(currentBoard)` in Zustand, navigates to `/dashboard`.

---

### Task 4.6 — Top vendors pre-fetch for callouts

Before rendering the overlay, fetch top 3 vendors per category against Vision Board allocations:

`GET /api/vendors?category=venue&budgetCap=1840000` — the `budgetCap` param is the Vision Board allocation for that category in cents.

The `GET /api/vendors` route (Task 5.2) must support this `budgetCap` parameter.

---

### Phase 4 Acceptance Criteria

- [ ] The overlay renders without error when `imageUrl` is set (AI image) and when it is null (fallback)
- [ ] All 5 callout boxes appear at the correct positions for a 1440px viewport
- [ ] Clicking a callout expands it to show the budget detail and top vendors; clicking again collapses it
- [ ] Only one callout is expanded at a time
- [ ] SVG connector lines are visible and connect each callout to its image zone anchor
- [ ] The budget summary bar totals equal the profile's `budgetTotal`
- [ ] "Regenerate Scene" is disabled for 60 seconds after being clicked
- [ ] "Continue to Dashboard" navigates to `/dashboard` with the Vision Board stored in Zustand

---

## Phase 5 — Vendor Matching

**Goal:** Dashboard renders a scored, filtered vendor grid drawn from real database records. Scoring uses per-category Vision Board allocations, not total budget fractions.
**Blockers:** Phase 4 complete (Vision Board allocations must exist before matching runs).

---

### Task 5.1 — Matching function

`src/lib/matching.ts` — Pure function, tested independently of the API:

```typescript
import type { Vendor, BudgetAllocation } from '@/types'

interface RawVendor {
  id: string; category: string; name: string; city: string; description: string;
  priceMin: number; priceMax: number; priceUnit: string;
  capacityMin: number | null; capacityMax: number | null;
  tags: string[]; culturalTags: string[];
  websiteUrl: string | null; imageUrl: string | null;
}

interface MatchProfile {
  city: string
  guestCount: number
  culturalReqs: string | null
  allocations: BudgetAllocation   // from Vision Board — used for budget fit scoring
}

export function scoreVendor(vendor: RawVendor, profile: MatchProfile): number {
  let score = 0

  // Budget fit (40 pts) — vendor range vs. the Vision Board allocation for this category
  const categoryAllocation = profile.allocations[vendor.category as keyof BudgetAllocation]
  if (typeof categoryAllocation === 'number' && categoryAllocation > 0) {
    const buffer = categoryAllocation * 0.15   // 15% flexibility
    const allocMin = categoryAllocation - buffer
    const allocMax = categoryAllocation + buffer

    const priceOverlap = vendor.priceMin <= allocMax && vendor.priceMax >= allocMin
    if (priceOverlap) {
      const centerDist = Math.abs(
        (vendor.priceMin + vendor.priceMax) / 2 - categoryAllocation
      )
      const maxDist = buffer * 2
      score += 40 * Math.max(0, 1 - centerDist / (maxDist || 1))
    }
  }

  // Capacity fit (30 pts) — only for venues
  if (vendor.capacityMax !== null) {
    if (vendor.capacityMax >= profile.guestCount) {
      score += vendor.capacityMin !== null && vendor.capacityMin <= profile.guestCount ? 30 : 20
    }
  } else {
    score += 30  // non-venue categories have no capacity constraint
  }

  // Cultural fit (20 pts)
  if (profile.culturalReqs) {
    const reqs = profile.culturalReqs.toLowerCase()
    const matchingTags = vendor.culturalTags.filter((t) =>
      reqs.includes(t.toLowerCase().split(' ')[0])
    )
    score += Math.min(20, matchingTags.length * 10)
  } else {
    score += 10
  }

  // Profile completeness (10 pts)
  if (vendor.imageUrl) score += 5
  if (vendor.websiteUrl) score += 3
  if (vendor.description.length > 50) score += 2

  return Math.round(Math.min(100, score))
}

export function filterVendors(vendors: RawVendor[], profile: MatchProfile, category?: string) {
  return vendors
    .filter((v) => {
      if (v.city.toLowerCase() !== profile.city.toLowerCase()) return false
      if (category && category !== 'all' && v.category !== category) return false
      return true
    })
    .map((v) => ({ ...v, matchScore: scoreVendor(v, profile) }))
    .sort((a, b) => b.matchScore - a.matchScore)
}
```

---

### Task 5.2 — `GET /api/vendors`

`src/app/api/vendors/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { filterVendors } from '@/lib/matching'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') ?? 'all'
  const budgetCap = req.nextUrl.searchParams.get('budgetCap')   // optional, used by Vision Board callouts

  const userId = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ? 'demo-user-id' : '...'
  const profile = await prisma.weddingProfile.findUnique({ where: { userId } })
  if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 404 })

  // Load the most recent Vision Board for allocations
  const visionBoard = await prisma.visionBoard.findFirst({
    where:   { profileId: profile.id, generationStatus: 'complete' },
    orderBy: { createdAt: 'desc' },
  })

  const allocations = visionBoard?.allocations as Record<string, number> ?? {}

  const matchProfile = {
    city:          profile.city,
    guestCount:    profile.guestCount,
    culturalReqs:  profile.culturalReqs,
    allocations:   allocations as any,
  }

  let rawVendors = await prisma.vendor.findMany({ where: { active: true } })

  // If budgetCap is provided (Vision Board callout pre-fetch), pre-filter by price
  if (budgetCap) {
    const cap = Number(budgetCap)
    rawVendors = rawVendors.filter((v) => v.priceMin <= cap * 1.2)  // 20% flex
  }

  const matched = filterVendors(rawVendors as any, matchProfile as any, category)
  const limited = category === 'all' ? matched.slice(0, 12) : matched.slice(0, 6)

  return NextResponse.json({ vendors: limited, total: matched.length })
}
```

---

### Task 5.3 — Dashboard layout

`src/app/dashboard/layout.tsx`:

```
DashboardLayout
├── <ShortlistSidebar />     ← fixed left sidebar (client component)
└── <main>
    ├── <DashboardTopbar />  ← greeting + "View Vision Board" button
    └── {children}
```

The sidebar reads from Zustand store. The topbar reads profile from Zustand store. Both are Client Components. `layout.tsx` itself is a Server Component that wraps them.

Note: the topbar replaces the v1 "Ask concierge" button with a "View Vision Board" button that calls `openVisionBoard()` from the Zustand store, which triggers the `VisionBoardOverlay` to render on top of the dashboard.

---

### Task 5.4 — `VendorCard` and `VendorGrid`

`src/components/VendorCard.tsx` — Client Component:

Props: `vendor: Vendor`, `isSaved: boolean`, `onSave: () => void`

Renders: category label, vendor name (font-serif), location, tags, price range, match score badge, save/unsave button.

`src/components/VendorGrid.tsx` — Client Component:

- Uses TanStack Query: `useQuery({ queryKey: ['vendors', category], queryFn: () => fetch(...).then(r => r.json()) })`
- Category filter buttons update the query key, triggering a new fetch
- Cards use `animation-delay` for stagger effect on render
- Loading state: skeleton cards (3 placeholder divs with pulse animation)

---

### Phase 5 Acceptance Criteria

- [ ] Dashboard renders vendor cards drawn from the database (not hardcoded)
- [ ] Match score is visible on each card and differs between vendors
- [ ] Category filter buttons (All / Venues / Florals / Music / MC / Photography) change the displayed vendors
- [ ] A couple with a $15k budget sees different vendors at different match scores than a couple with a $75k budget
- [ ] Scores are based on Vision Board per-category allocations, not hardcoded category fractions
- [ ] Loading state is shown while vendors are being fetched

---

## Phase 6 — Shortlist

**Goal:** User can save and remove vendors; shortlist persists across page refreshes.
**Blockers:** Phase 5 complete.

---

### Task 6.1 — `POST /api/shortlist`

`src/app/api/shortlist/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  vendorId: z.string().uuid(),
  action:   z.enum(['add', 'remove']),
  notes:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  const userId = 'demo-user-id'
  const { vendorId, action, notes } = schema.parse(await req.json())

  const profile = await prisma.weddingProfile.findUnique({ where: { userId } })
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  if (action === 'add') {
    await prisma.shortlistItem.upsert({
      where:  { profileId_vendorId: { profileId: profile.id, vendorId } },
      create: { profileId: profile.id, vendorId, notes },
      update: { notes },
    })
  } else {
    await prisma.shortlistItem.deleteMany({
      where: { profileId: profile.id, vendorId },
    })
  }

  const shortlist = await prisma.shortlistItem.findMany({
    where:   { profileId: profile.id },
    include: { vendor: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ shortlist })
}
```

---

### Task 6.2 — Optimistic shortlist mutation

In `VendorGrid`, use TanStack Query mutation with optimistic update:

```typescript
const mutation = useMutation({
  mutationFn: ({ vendorId, action }: { vendorId: string; action: 'add' | 'remove' }) =>
    fetch('/api/shortlist', { method: 'POST', body: JSON.stringify({ vendorId, action }) }).then(r => r.json()),
  onMutate: ({ vendorId, action }) => {
    if (action === 'add') addToShortlist(...)
    else removeFromShortlist(vendorId)
  },
  onError: (_, { vendorId, action }) => {
    if (action === 'add') removeFromShortlist(vendorId)
    else addToShortlist(...)
  },
})
```

The save button responds instantly; the API call happens in the background.

---

### Task 6.3 — `ShortlistSidebar`

`src/components/ShortlistSidebar.tsx` — reads from Zustand:

- Logo at top
- Wedding profile summary (city, date, guests, budget)
- Shortlist count badge
- Scrollable list of saved vendor items
- Each item: vendor name, category, remove button (×)
- Empty state: "Your shortlist is waiting." (per style guide voice)
- Link to `/dashboard/compare` when ≥ 2 vendors saved

---

### Phase 6 Acceptance Criteria

- [ ] Clicking the save button on a vendor card adds it to the sidebar immediately (optimistic)
- [ ] Refreshing the page retains the shortlist (persisted to DB and Zustand)
- [ ] Removing a vendor from the sidebar removes it from the database
- [ ] Shortlist count in the sidebar header stays accurate

---

## Phase 7 — Dashboard Vision Board Integration

**Goal:** The dashboard surfaces a Vision Board summary card at the top of the main content area and supports reopening the full Vision Board overlay from the dashboard.
**Blockers:** Phase 4 and Phase 5 complete.

---

### Task 7.1 — Vision Board summary card

`src/components/VisionBoardCard.tsx` — Client Component. Rendered at the top of `src/app/dashboard/page.tsx`, above the vendor grid.

Layout:
- Left: thumbnail of the AI-generated image (or fallback), 160×100px, `object-fit: cover`, rounded corners
- Right: three-line summary: "Your Vision", style name, budget total formatted
- Bottom-right: five category budget chips in a compact horizontal row
- Entire card is clickable → calls `openVisionBoard()` from Zustand store, which renders the `VisionBoardOverlay` on top of the dashboard

```typescript
// src/app/dashboard/page.tsx (server component shell)
import { VisionBoardCard } from '@/components/VisionBoardCard'
import { VendorGrid } from '@/components/VendorGrid'
import { VisionBoardOverlay } from '@/components/VisionBoardOverlay'

export default function DashboardPage() {
  return (
    <>
      <VisionBoardCard />
      <VendorGrid />
      <VisionBoardOverlay />   {/* renders conditionally based on visionBoardOpen Zustand state */}
    </>
  )
}
```

---

### Task 7.2 — `VisionBoardOverlay` re-entry component

`src/components/VisionBoardOverlay.tsx` — Client Component:

- Reads `visionBoard` and `visionBoardOpen` from Zustand
- Renders the full overlay (same `BudgetCallout` layout as Phase 4) when `visionBoardOpen` is true
- Close button (×) in the top-right corner calls `closeVisionBoard()`
- "Regenerate Scene" button works the same as in Phase 4 (navigates to `/vision/generating`)

---

### Task 7.3 — Budget tracker section

Below the Vision Board card, add a `BudgetTracker` section on the dashboard main page:

```
Budget Overview
───────────────────────────────────────────────────────────────
Venue          $18,400  ████████████░░░  38% of total
Photography    $8,500   ██████░░░░░░░░   18%
Florals        $7,600   █████░░░░░░░░░   16%
Music          $5,200   ███░░░░░░░░░░░   11%
MC             $2,900   ██░░░░░░░░░░░░   6%
Buffer         $3,400   ██░░░░░░░░░░░░   7%
───────────────────────────────────────────────────────────────
Total          $46,000
```

Each row uses a `div` progress bar filled to the category's percentage of `budgetTotal`. Values come from the `visionBoard.allocations` in Zustand — no additional API call.

---

### Phase 7 Acceptance Criteria

- [ ] The Vision Board summary card appears at the top of the dashboard above the vendor grid
- [ ] Clicking the card opens the full Vision Board overlay
- [ ] Closing the overlay with × returns to the dashboard without navigation
- [ ] The budget tracker section displays all 5 categories + buffer with correct values from the Vision Board allocations
- [ ] Budget tracker values update if the user regenerates the Vision Board

---

## Phase 8 — Vendor Comparison

**Goal:** User can compare shortlisted vendors side-by-side.
**Blockers:** Phase 6 complete; at least 2 vendors must be saveable to shortlist.

---

### Task 8.1 — Compare page

`src/app/dashboard/compare/page.tsx` — Server Component shell, `CompareTable` as Client Component.

**CompareTable layout:**

```
                | Vendor A        | Vendor B        | Vendor C
────────────────|─────────────────|─────────────────|─────────────
Category        | Venue           | Venue           | –
Price range     | $8k – $18k      | $3.5k – $8k     | –
Capacity        | Up to 300       | Up to 120       | –
Match score     | 97%             | 91%             | –
Tags            | Indoor, Luxury  | Heritage, Garden| –
Cultural fit    | –               | –               | –
Vision Board fit| Within budget   | $4k over budget | –
Notes           | [editable]      | [editable]      | –
                | Remove          | Remove          | –
```

The "Vision Board fit" row compares the vendor's midpoint price against the Vision Board allocation for that category. Max 4 vendors side-by-side for MVP.

Notes fields are editable inline — PATCH to `/api/shortlist/:id` with updated notes on blur.

---

### Phase 8 Acceptance Criteria

- [ ] Navigating to `/dashboard/compare` with 2+ saved vendors shows the comparison table
- [ ] Navigating with 0 or 1 saved vendors shows an empty state with a link back to the vendor grid
- [ ] The "Vision Board fit" row correctly flags vendors over or within allocation
- [ ] Notes can be edited inline and persist on refresh

---

## Phase 9 — Checklist

**Goal:** User has a persistent task list seeded from their wedding profile, with completion tracking.
**Blockers:** Phase 1 complete (checklist is seeded at intake).

---

### Task 9.1 — `GET /api/checklist` and `PATCH /api/checklist/[id]`

`src/app/api/checklist/route.ts`:
```typescript
export async function GET(req: NextRequest) {
  const profile = await prisma.weddingProfile.findUnique({ where: { userId: 'demo-user-id' } })
  const items = await prisma.checklistItem.findMany({
    where:   { profileId: profile!.id },
    orderBy: { dueOffsetDays: 'asc' },
  })
  const weddingMs = profile!.weddingDate.getTime()
  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      dueDate: new Date(weddingMs + item.dueOffsetDays * 86400000).toISOString().split('T')[0],
    }))
  })
}
```

`src/app/api/checklist/[id]/route.ts`:
```typescript
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { completed } = await req.json()
  const item = await prisma.checklistItem.update({
    where: { id: params.id },
    data:  { completed, completedAt: completed ? new Date() : null },
  })
  return NextResponse.json({ item })
}
```

---

### Task 9.2 — Checklist UI

`src/app/dashboard/checklist/page.tsx` — Client Component.

- Groups tasks by relative timeframe: "12+ months out", "6–12 months", "3–6 months", "Under 3 months", "Overdue"
- Each task row: checkbox, title, due date, category badge
- Completed items are visually struck through (CSS `line-through`)
- Completion triggers optimistic UI update + PATCH

---

### Phase 9 Acceptance Criteria

- [ ] 15 checklist items appear after completing intake
- [ ] Tasks are grouped by timeframe relative to the wedding date
- [ ] Checking a task marks it complete in the database
- [ ] Refreshing the page retains completion state

---

## Cross-Cutting Concerns

### Error handling conventions

All API routes return:
```typescript
// Success
NextResponse.json({ data }, { status: 200 })

// Validation error
NextResponse.json({ error: 'message', field: 'fieldName' }, { status: 400 })

// Auth error
NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Server error
NextResponse.json({ error: 'Internal error' }, { status: 500 })
```

UI displays a toast notification on API errors using a lightweight `useToast` hook with a portal-rendered div (no library needed for MVP).

### Loading states

- Vision Board generating screen: animated phrase cycle
- Vendor grid: skeleton cards (3 animated placeholder divs)
- Checklist: skeleton rows
- Shortlist mutation: button spinner (do not disable the entire card)
- Budget callout vendor list: shimmer placeholder while fetching

### Mobile

The dashboard is desktop-first for MVP. On screens < 768px:
- Sidebar collapses to a drawer (toggle via header button)
- Vision Board overlay: callouts stack vertically below the image rather than overlapping it
- Vendor grid is single-column

---

## File Structure (Final)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          ← Landing
│   ├── providers.tsx                     ← TanStack Query provider
│   ├── globals.css
│   ├── onboarding/
│   │   ├── page.tsx
│   │   ├── StepWhereWhen.tsx
│   │   ├── StepSizeBudget.tsx
│   │   └── StepVision.tsx
│   ├── vision/
│   │   ├── generating/page.tsx           ← Polling + animated loading screen
│   │   └── board/page.tsx                ← Full Vision Board overlay (initial view)
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── compare/page.tsx
│   │   └── checklist/page.tsx
│   └── api/
│       ├── intake/route.ts
│       ├── vision/
│       │   ├── generate/route.ts
│       │   └── [id]/route.ts             ← Polling endpoint
│       ├── vendors/route.ts
│       ├── shortlist/route.ts
│       └── checklist/
│           ├── route.ts
│           └── [id]/route.ts
├── components/
│   ├── VendorCard.tsx
│   ├── VendorGrid.tsx
│   ├── ShortlistSidebar.tsx
│   ├── VisionBoardOverlay.tsx
│   ├── VisionBoardCard.tsx
│   ├── BudgetCallout.tsx
│   ├── VisionBudgetBar.tsx
│   ├── BudgetTracker.tsx
│   ├── CompareTable.tsx
│   ├── ChecklistPanel.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Tag.tsx
│       └── Toast.tsx
├── hooks/
│   └── useToast.ts
├── lib/
│   ├── prisma.ts
│   ├── matching.ts
│   ├── budget.ts
│   ├── imagePrompt.ts
│   ├── imageGeneration.ts
│   ├── calloutPositions.ts
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── store/
│   └── index.ts
└── types/
    └── index.ts

prisma/
├── schema.prisma
└── seed.ts

public/
└── vision-fallbacks/
    ├── classic.jpg
    ├── bohemian.jpg
    ├── modern.jpg
    ├── intimate.jpg
    ├── cultural.jpg
    └── garden-party.jpg
```

---

## Definition of Done

The MVP is complete when:

1. A new visitor can reach the landing page, complete the 3-step intake, view their Vision Board, and reach the dashboard in under 5 minutes
2. The Vision Board displays an AI-generated (or fallback) ceremony image with all 5 budget callout boxes visible and interactive
3. Budget callout amounts sum exactly to the profile's `budgetTotal`
4. The dashboard displays ≥ 10 real vendors from the database, scored against Vision Board per-category allocations
5. A user can shortlist ≥ 2 vendors and navigate to the comparison view, which shows the Vision Board fit row
6. The checklist displays 15 seeded tasks with accurate due dates
7. All of the above works on a production Vercel URL, not just localhost
