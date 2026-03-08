# Rendezvous — MVP Implementation Plan

**Date:** March 2026
**Input:** `architecture_plan.md`
**Output:** Ordered, task-level build guide with commands, file paths, and acceptance criteria

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

# AI
npm install @anthropic-ai/sdk

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
  budgetMin        Int      @map("budget_min")
  budgetMax        Int      @map("budget_max")
  ceremonyType     String   @map("ceremony_type")
  style            String
  culturalReqs     String?  @map("cultural_reqs")
  priorityCategory String   @map("priority_category")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  shortlistItems   ShortlistItem[]
  checklistItems   ChecklistItem[]
  chatMessages     ChatMessage[]

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

model ChatMessage {
  id        String         @id @default(uuid())
  profileId String         @map("profile_id")
  role      String
  content   String
  createdAt DateTime       @default(now()) @map("created_at")
  profile   WeddingProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("chat_messages")
}
```

---

### Task 0.2 — Supabase project + environment

1. Create a new project at supabase.com
2. In **Project Settings → Database**, copy the connection strings
3. Create `.env.local`:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ca-central-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon key]"
SUPABASE_SERVICE_ROLE_KEY="[service role key]"
ANTHROPIC_API_KEY="[anthropic key]"
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
export type VendorCategory = 'venue' | 'caterer' | 'photographer' | 'planner'
export type WeddingStyle = 'Classic' | 'Bohemian' | 'Modern' | 'Intimate' | 'Cultural' | 'Garden Party'
export type CeremonyType = 'Indoor' | 'Outdoor' | 'Beach' | 'Destination' | 'Not sure yet'

export interface WeddingProfile {
  id: string
  userId: string
  city: string
  weddingDate: string        // ISO date string
  guestCount: number
  budgetMin: number          // cents
  budgetMax: number          // cents
  ceremonyType: CeremonyType
  style: WeddingStyle
  culturalReqs: string | null
  priorityCategory: VendorCategory | 'all'
}

export interface Vendor {
  id: string
  category: VendorCategory
  name: string
  city: string
  description: string
  priceMin: number           // cents
  priceMax: number           // cents
  priceUnit: string
  capacityMin: number | null
  capacityMax: number | null
  tags: string[]
  culturalTags: string[]
  websiteUrl: string | null
  imageUrl: string | null
  matchScore: number         // 0–100, computed server-side
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
  dueDate: string            // computed from weddingDate + dueOffsetDays
  completed: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
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

Create `prisma/seed.ts`. This is a critical deliverable — the quality of seed data directly impacts whether the matching algorithm looks credible in user testing.

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

  // ── CATERERS ─────────────────────────────────────────
  {
    category: 'caterer', name: 'Culinary Capers', city: 'Vancouver, BC',
    description: 'Award-winning full-service catering. Custom menus, full dietary accommodation, WSET-certified bar service.',
    priceMin: 6500, priceMax: 12000, priceUnit: 'per_person',
    capacityMin: 20, capacityMax: 500,
    tags: ['Full service', 'Award-winning', 'Dietary options', 'Bar service'],
    culturalTags: ['Halal available', 'Kosher available'],
    websiteUrl: 'https://www.culinarycapers.com',
    imageUrl: null,
  },
  {
    category: 'caterer', name: 'Pacific Table', city: 'Vancouver, BC',
    description: 'Farm-to-table catering sourcing from BC producers. Seasonal menus, grazing tables, and family-style service.',
    priceMin: 5500, priceMax: 9500, priceUnit: 'per_person',
    capacityMin: 30, capacityMax: 200,
    tags: ['Farm-to-table', 'Local', 'Seasonal', 'Grazing tables'],
    culturalTags: [],
    websiteUrl: null,
    imageUrl: null,
  },
  {
    category: 'caterer', name: 'Feastify Collective', city: 'Vancouver, BC',
    description: 'Multi-cuisine catering specializing in fusion and cultural menus. Indian, Chinese, Mexican, and Western options.',
    priceMin: 4500, priceMax: 8000, priceUnit: 'per_person',
    capacityMin: 50, capacityMax: 250,
    tags: ['Multi-cuisine', 'Cultural menus', 'Fusion'],
    culturalTags: ['Halal', 'South Asian', 'Chinese banquet', 'Vegetarian specialist'],
    websiteUrl: null,
    imageUrl: null,
  },
  // Add 12 more caterers...

  // ── PHOTOGRAPHERS ────────────────────────────────────
  {
    category: 'photographer', name: 'Studio Atelier', city: 'Vancouver, BC',
    description: 'Editorial and film-style wedding photography. Award-winning. Published in Vogue Weddings. Experienced with multicultural ceremonies.',
    priceMin: 420000, priceMax: 750000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['Editorial', 'Film-style', 'Award-winning', 'Second shooter available'],
    culturalTags: ['South Asian', 'Chinese ceremony', 'LGBTQ+ affirming'],
    websiteUrl: null,
    imageUrl: null,
  },
  {
    category: 'photographer', name: 'Golden Hour Co.', city: 'Vancouver, BC',
    description: 'Candid, documentary-style photography with warm natural tones. Couples-focused, unobtrusive approach.',
    priceMin: 300000, priceMax: 550000, priceUnit: 'full_day',
    capacityMin: null, capacityMax: null,
    tags: ['Candid', 'Documentary', 'Natural light', 'Warm tones'],
    culturalTags: ['LGBTQ+ affirming'],
    websiteUrl: null,
    imageUrl: null,
  },
  // Add 13 more photographers...

  // ── PLANNERS ─────────────────────────────────────────
  {
    category: 'planner', name: 'Gather Events', city: 'Vancouver, BC',
    description: 'Full-service luxury wedding planning and design. 12+ years in Vancouver market. Strong vendor relationships for priority availability.',
    priceMin: 350000, priceMax: 600000, priceUnit: 'full_planning',
    capacityMin: null, capacityMax: 200,
    tags: ['Full service', 'Day-of coordination', 'Luxury', 'Design'],
    culturalTags: [],
    websiteUrl: null,
    imageUrl: null,
  },
  {
    category: 'planner', name: 'Bloom & Co.', city: 'Vancouver, BC',
    description: 'Day-of coordination with optional floral design. Budget-friendly entry point. Ideal for couples who have planned most details themselves.',
    priceMin: 180000, priceMax: 350000, priceUnit: 'coordination',
    capacityMin: null, capacityMax: 150,
    tags: ['Day-of coordination', 'Budget-friendly', 'Floral included'],
    culturalTags: [],
    websiteUrl: null,
    imageUrl: null,
  },
  // Add 13 more planners...
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
import type { WeddingProfile, ShortlistItem, Vendor } from '@/types'

interface AppStore {
  profile: WeddingProfile | null
  shortlist: ShortlistItem[]
  chatOpen: boolean
  setProfile: (profile: WeddingProfile) => void
  setShortlist: (items: ShortlistItem[]) => void
  addToShortlist: (item: ShortlistItem) => void
  removeFromShortlist: (vendorId: string) => void
  toggleChat: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      profile: null,
      shortlist: [],
      chatOpen: false,
      setProfile: (profile) => set({ profile }),
      setShortlist: (shortlist) => set({ shortlist }),
      addToShortlist: (item) => set((s) => ({ shortlist: [...s.shortlist, item] })),
      removeFromShortlist: (vendorId) => set((s) => ({
        shortlist: s.shortlist.filter((i) => i.vendorId !== vendorId)
      })),
      toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
    }),
    { name: 'rendezvous-store', partialize: (s) => ({ profile: s.profile, shortlist: s.shortlist }) }
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

- [ ] `npx prisma studio` shows all five tables with correct schema
- [ ] Seed script runs without error; 60+ vendor rows visible in Prisma Studio
- [ ] `npm run dev` serves `http://localhost:3000` with no TypeScript errors
- [ ] Vercel deployment is live at a public URL
- [ ] All environment variables confirmed working in production

---

## Phase 1 — Intake (Onboarding)

**Goal:** A couple can complete the 3-step questionnaire, which creates a `WeddingProfile` in the database.
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
                      request.nextUrl.pathname.startsWith('/onboarding')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return response
}

export const config = { matcher: ['/dashboard/:path*', '/onboarding/:path*'] }
```

---

### Task 1.2 — Landing page

`src/app/page.tsx` — Server Component. Port the landing section from the HTML prototype, adapting to Next.js + Tailwind. Key elements:

- Logo: `<span className="font-serif">Rendez<span className="text-rose">vous</span></span>`
- Hero headline using `font-serif` at display scale
- Staggered entrance animation via CSS `@keyframes fadeUp` with `animation-delay`
- "Start planning" button routes to `/onboarding` (or triggers Supabase magic link if auth is enabled)
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
  { title: 'Set your total budget',           category: 'general',   dueOffsetDays: -540 },
  { title: 'Book your venue',                 category: 'venue',     dueOffsetDays: -365 },
  { title: 'Hire a wedding planner',          category: 'general',   dueOffsetDays: -365 },
  { title: 'Book your photographer',          category: 'general',   dueOffsetDays: -300 },
  { title: 'Book your caterer',               category: 'catering',  dueOffsetDays: -270 },
  { title: 'Send save-the-dates',             category: 'general',   dueOffsetDays: -240 },
  { title: 'Confirm ceremony details',        category: 'venue',     dueOffsetDays: -180 },
  { title: 'Book music / entertainment',      category: 'general',   dueOffsetDays: -180 },
  { title: 'Order wedding attire',            category: 'general',   dueOffsetDays: -150 },
  { title: 'Send invitations',                category: 'general',   dueOffsetDays: -120 },
  { title: 'Finalise menu with caterer',      category: 'catering',  dueOffsetDays: -60  },
  { title: 'Confirm vendor arrival times',    category: 'general',   dueOffsetDays: -30  },
  { title: 'Final dress / suit fitting',      category: 'general',   dueOffsetDays: -21  },
  { title: 'Deliver final guest count',       category: 'catering',  dueOffsetDays: -14  },
  { title: 'Prepare vendor payments',         category: 'general',   dueOffsetDays: -7   },
]

const schema = z.object({
  city:             z.string().min(2),
  weddingDate:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestCount:       z.number().int().min(1).max(1000),
  budgetMin:        z.number().int().min(0),
  budgetMax:        z.number().int().min(0),
  ceremonyType:     z.string(),
  style:            z.string(),
  culturalReqs:     z.string().nullable().optional(),
  priorityCategory: z.string(),
})

export async function POST(req: NextRequest) {
  // For SKIP_AUTH mode, use a fixed demo userId
  const userId = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'
    ? 'demo-user-id'
    : (await req.json()).userId  // replace with real auth extraction

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
  guestCount: '', budgetMin: '', budgetMax: '',
  priorityCategory: '', style: '', culturalReqs: '',
})
```

**Step components** (co-located in `src/app/onboarding/`):

- `StepWhereWhen.tsx` — city text input, date picker, ceremony type select
- `StepSizeBudget.tsx` — guest count number input, budget range select (maps to min/max cents), priority select
- `StepVision.tsx` — 6 style option cards (click to select), cultural requirements text input

**Budget select → cents mapping:**
```typescript
const BUDGET_OPTIONS = [
  { label: 'Under $15,000',        min: 0,       max: 1500000  },
  { label: '$15,000 – $30,000',    min: 1500000,  max: 3000000  },
  { label: '$30,000 – $50,000',    min: 3000000,  max: 5000000  },
  { label: '$50,000 – $75,000',    min: 5000000,  max: 7500000  },
  { label: '$75,000+',             min: 7500000,  max: 20000000 },
]
```

**On final step submit:**
```typescript
async function handleSubmit() {
  const res = await fetch('/api/intake', {
    method: 'POST',
    body: JSON.stringify({ ...form, guestCount: Number(form.guestCount), ...selectedBudget }),
  })
  const { profileId } = await res.json()
  setProfile({ ...form, id: profileId })   // write to Zustand
  router.push('/dashboard')
}
```

Progress dots animate using CSS transitions on the `.step-dot` class (same pattern as prototype).

---

### Phase 1 Acceptance Criteria

- [ ] User can complete all 3 steps without error
- [ ] Submitting step 3 creates a row in `wedding_profiles` in Supabase
- [ ] Submitting step 3 creates 15 rows in `checklist_items` in Supabase
- [ ] User is redirected to `/dashboard` after submission
- [ ] Reloading `/onboarding` with an existing profile redirects to `/dashboard`

---

## Phase 2 — Vendor Matching

**Goal:** Dashboard renders a scored, filtered vendor grid drawn from real database records.
**Blockers:** Phase 1 complete; 60+ vendors seeded.

---

### Task 2.1 — Matching function

`src/lib/matching.ts` — Pure function, tested independently of the API:

```typescript
import type { Vendor, WeddingProfile } from '@/types'

interface RawVendor {
  id: string; category: string; name: string; city: string; description: string;
  priceMin: number; priceMax: number; priceUnit: string;
  capacityMin: number | null; capacityMax: number | null;
  tags: string[]; culturalTags: string[];
  websiteUrl: string | null; imageUrl: string | null;
}

export function scoreVendor(vendor: RawVendor, profile: WeddingProfile): number {
  let score = 0

  // Budget fit (40 pts) — vendor range overlaps profile budget allocation
  const categoryBudgetShare = { venue: 0.35, caterer: 0.28, photographer: 0.15, planner: 0.10 }
  const share = categoryBudgetShare[vendor.category as keyof typeof categoryBudgetShare] ?? 0.15
  const allocatedMax = profile.budgetMax * share
  const allocatedMin = profile.budgetMin * share * 0.7  // 30% buffer below minimum

  const priceOverlap = vendor.priceMin <= allocatedMax && vendor.priceMax >= allocatedMin
  if (priceOverlap) {
    const centerDist = Math.abs(
      (vendor.priceMin + vendor.priceMax) / 2 - (allocatedMin + allocatedMax) / 2
    )
    const maxDist = allocatedMax - allocatedMin
    score += 40 * Math.max(0, 1 - centerDist / (maxDist || 1))
  }

  // Capacity fit (30 pts) — only for venues/caterers
  if (vendor.capacityMax !== null) {
    if (vendor.capacityMax >= profile.guestCount) {
      score += vendor.capacityMin !== null && vendor.capacityMin <= profile.guestCount ? 30 : 20
    }
  } else {
    score += 30  // photographers/planners have no capacity constraint
  }

  // Cultural fit (20 pts)
  if (profile.culturalReqs) {
    const reqs = profile.culturalReqs.toLowerCase()
    const matchingTags = vendor.culturalTags.filter((t) =>
      reqs.includes(t.toLowerCase().split(' ')[0])
    )
    score += Math.min(20, matchingTags.length * 10)
  } else {
    score += 10  // neutral if no cultural reqs specified
  }

  // Profile completeness (10 pts)
  if (vendor.imageUrl) score += 5
  if (vendor.websiteUrl) score += 3
  if (vendor.description.length > 50) score += 2

  return Math.round(Math.min(100, score))
}

export function filterVendors(vendors: RawVendor[], profile: WeddingProfile, category?: string) {
  return vendors
    .filter((v) => {
      if (!v.active) return false
      if (v.city.toLowerCase() !== profile.city.toLowerCase()) return false
      if (category && category !== 'all' && v.category !== category) return false
      return true
    })
    .map((v) => ({ ...v, matchScore: scoreVendor(v, profile) }))
    .sort((a, b) => b.matchScore - a.matchScore)
}
```

---

### Task 2.2 — `GET /api/vendors`

`src/app/api/vendors/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { filterVendors } from '@/lib/matching'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') ?? 'all'

  // Get profile (demo mode: fixed userId)
  const userId = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true' ? 'demo-user-id' : '...'
  const profile = await prisma.weddingProfile.findUnique({ where: { userId } })
  if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 404 })

  const rawVendors = await prisma.vendor.findMany({ where: { active: true } })

  const profileData = {
    ...profile,
    weddingDate: profile.weddingDate.toISOString(),
  }

  const matched = filterVendors(rawVendors as any, profileData as any, category)
  const limited = category === 'all' ? matched.slice(0, 12) : matched.slice(0, 6)

  return NextResponse.json({ vendors: limited, total: matched.length })
}
```

---

### Task 2.3 — Dashboard layout

`src/app/dashboard/layout.tsx`:

```
DashboardLayout
├── <ShortlistSidebar />     ← fixed left sidebar (client component)
└── <main>
    ├── <DashboardTopbar />  ← greeting + "Ask concierge" button
    └── {children}
```

The sidebar reads from Zustand store. The topbar reads profile from Zustand store. Both are Client Components. The `layout.tsx` itself is a Server Component that wraps them.

---

### Task 2.4 — `VendorCard` and `VendorGrid`

`src/components/VendorCard.tsx` — Client Component:

Props: `vendor: Vendor`, `isSaved: boolean`, `onSave: () => void`

Renders: category label, vendor name (font-serif), location, tags, price range, match score badge, save/unsave button.

`src/components/VendorGrid.tsx` — Client Component:

- Uses TanStack Query: `useQuery({ queryKey: ['vendors', category], queryFn: () => fetch(...).then(r => r.json()) })`
- Category filter buttons update the query key, triggering a new fetch
- Cards use `animation-delay` for stagger effect on render
- Loading state: skeleton cards (3 placeholder divs with pulse animation)

---

### Phase 2 Acceptance Criteria

- [ ] Dashboard renders vendor cards drawn from the database (not hardcoded)
- [ ] Match score is visible on each card and differs between vendors
- [ ] Category filter buttons (All / Venues / Caterers / Photographers / Planners) change the displayed vendors
- [ ] A couple with a $15k budget sees different vendors than a couple with a $75k budget (test with two seed profiles)
- [ ] Loading state is shown while vendors are being fetched

---

## Phase 3 — Shortlist

**Goal:** User can save and remove vendors; shortlist persists across page refreshes.
**Blockers:** Phase 2 complete.

---

### Task 3.1 — `POST /api/shortlist`

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
  const userId = 'demo-user-id' // replace with real auth
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

### Task 3.2 — Optimistic shortlist mutation

In `VendorGrid`, use TanStack Query mutation with optimistic update:

```typescript
const mutation = useMutation({
  mutationFn: ({ vendorId, action }: { vendorId: string; action: 'add' | 'remove' }) =>
    fetch('/api/shortlist', { method: 'POST', body: JSON.stringify({ vendorId, action }) }).then(r => r.json()),
  onMutate: ({ vendorId, action }) => {
    // Optimistically update Zustand store
    if (action === 'add') addToShortlist(...)
    else removeFromShortlist(vendorId)
  },
  onError: (_, { vendorId, action }) => {
    // Rollback on error
    if (action === 'add') removeFromShortlist(vendorId)
    else addToShortlist(...)
  },
})
```

The save button responds instantly; the API call happens in the background.

---

### Task 3.3 — `ShortlistSidebar`

`src/components/ShortlistSidebar.tsx` — reads from Zustand:

- Logo at top
- Wedding profile summary (city, date, guests, budget)
- Shortlist count badge
- Scrollable list of saved vendor items
- Each item: vendor name, category, remove button (×)
- Empty state: "Your shortlist is waiting." (per style guide voice)
- Link to `/dashboard/compare` when ≥ 2 vendors saved

---

### Phase 3 Acceptance Criteria

- [ ] Clicking the heart on a vendor card adds it to the sidebar immediately (optimistic)
- [ ] Refreshing the page retains the shortlist (persisted to DB and Zustand)
- [ ] Removing a vendor from the sidebar removes it from the database
- [ ] Shortlist count in the sidebar header stays accurate

---

## Phase 4 — AI Chat

**Goal:** User can ask the AI concierge questions and receive contextually grounded streaming responses.
**Blockers:** Phase 2 complete (vendor matching must work before chat references vendors).

---

### Task 4.1 — `POST /api/chat` (streaming)

`src/app/api/chat/route.ts` — **Edge runtime required for SSE streaming**:

```typescript
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { filterVendors } from '@/lib/matching'

export const runtime = 'edge'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  const userId = 'demo-user-id'

  // 1. Fetch profile
  const profile = await prisma.weddingProfile.findUnique({ where: { userId } })
  if (!profile) return new Response('No profile', { status: 404 })

  // 2. Fetch top vendors for context
  const allVendors = await prisma.vendor.findMany({ where: { active: true } })
  const contextVendors = filterVendors(allVendors as any, profile as any)
    .slice(0, 10)
    .map(({ id, category, name, city, priceMin, priceMax, priceUnit, capacityMax, tags, culturalTags }) => ({
      id, category, name, city, priceMin, priceMax, priceUnit, capacityMax, tags, culturalTags
    }))

  // 3. Fetch recent chat history
  const history = await prisma.chatMessage.findMany({
    where:   { profileId: profile.id },
    orderBy: { createdAt: 'desc' },
    take:    6,
  })
  const recentHistory = history.reverse()

  // 4. Save user message
  await prisma.chatMessage.create({
    data: { profileId: profile.id, role: 'user', content: message }
  })

  // 5. Build system prompt
  const budgetFormatted = `$${Math.round(profile.budgetMin / 100).toLocaleString()} – $${Math.round(profile.budgetMax / 100).toLocaleString()}`
  const systemPrompt = `You are a warm, knowledgeable wedding concierge for Rendezvous. You speak confidently and concisely — never effusive, never clinical. You address the couple as capable adults.

The couple's wedding profile:
- Location: ${profile.city}
- Date: ${profile.weddingDate.toISOString().split('T')[0]}
- Guests: ${profile.guestCount}
- Budget: ${budgetFormatted} CAD
- Style: ${profile.style}
- Ceremony: ${profile.ceremonyType}
- Cultural requirements: ${profile.culturalReqs ?? 'none specified'}

Vendors available in their area (ground all vendor recommendations in this list — do not fabricate vendors):
${JSON.stringify(contextVendors, null, 2)}

Guidelines:
- Reference actual vendor names and price ranges from the list above
- Keep responses under 120 words unless the user asks to elaborate
- If asked about out-of-scope features (booking, payments, RSVP), say it is coming soon
- If a question is outside wedding planning, gently redirect`

  // 6. Stream Claude response
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: systemPrompt,
    messages: [
      ...recentHistory.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ],
  })

  // 7. Collect full response for persistence, stream to client
  let fullResponse = ''
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const chunk = event.delta.text
          fullResponse += chunk
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ chunk })}\n\n`))
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()

      // Save assistant response after stream completes
      await prisma.chatMessage.create({
        data: { profileId: profile.id, role: 'assistant', content: fullResponse }
      })
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

---

### Task 4.2 — `useChat` hook

`src/hooks/useChat.ts`:

```typescript
import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'

export function useChat(initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), role: 'user', content, createdAt: new Date().toISOString()
    }
    setMessages((m) => [...m, userMsg])
    setIsStreaming(true)

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(), role: 'assistant', content: '', createdAt: new Date().toISOString()
    }
    setMessages((m) => [...m, assistantMsg])

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter((l) => l.startsWith('data:'))
      for (const line of lines) {
        const data = line.replace('data: ', '').trim()
        if (data === '[DONE]') { setIsStreaming(false); break }
        const { chunk } = JSON.parse(data)
        setMessages((m) => {
          const updated = [...m]
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: updated[updated.length - 1].content + chunk }
          return updated
        })
      }
    }
  }, [])

  return { messages, sendMessage, isStreaming }
}
```

---

### Task 4.3 — `ChatPanel` component

`src/components/ChatPanel.tsx` — Client Component:

- Reads `chatOpen` from Zustand
- Slides in from right using CSS `transform: translateX(100%)` → `0` transition
- Renders message bubbles (user right-aligned, AI left with ✦ avatar)
- Shows typing indicator (3 animated dots) while `isStreaming`
- Quick suggestion chips that pre-fill the input
- Auto-scrolls to latest message

---

### Phase 4 Acceptance Criteria

- [ ] Sending a message produces a streaming response (text appears token by token)
- [ ] The AI references vendors from the database (not hallucinated ones)
- [ ] The AI's response reflects the user's wedding profile (city, budget, guest count)
- [ ] Chat history persists across page refreshes (loaded from DB on mount)
- [ ] Typing indicator disappears when streaming completes

---

## Phase 5 — Vendor Comparison

**Goal:** User can compare shortlisted vendors side-by-side.
**Blockers:** Phase 3 complete; at least 2 vendors must be saveable to shortlist.

---

### Task 5.1 — Compare page

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
Notes           | [editable]      | [editable]      | –
                | Remove          | Remove          | –
```

Rows are attribute labels (left column), vendor values fill columns. Max 4 vendors side-by-side for MVP.

Notes fields are editable inline — PATCH to `/api/shortlist/:id` with updated notes on blur.

---

### Phase 5 Acceptance Criteria

- [ ] Navigating to `/dashboard/compare` with 2+ saved vendors shows the comparison table
- [ ] Navigating with 0 or 1 saved vendors shows an empty state with a link back to the vendor grid
- [ ] Notes can be edited inline and persist on refresh

---

## Phase 6 — Checklist

**Goal:** User has a persistent task list seeded from their wedding profile, with completion tracking.
**Blockers:** Phase 1 complete (checklist is seeded at intake).

---

### Task 6.1 — `GET /api/checklist` and `PATCH /api/checklist/[id]`

`src/app/api/checklist/route.ts`:
```typescript
// GET — return items with computed due dates
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
// PATCH — toggle completed
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

### Task 6.2 — Checklist UI

`src/app/dashboard/checklist/page.tsx` — Client Component.

- Groups tasks by relative timeframe: "12+ months out", "6–12 months", "3–6 months", "Under 3 months", "Overdue"
- Each task row: checkbox, title, due date, category badge
- Completed items are visually struck through (CSS `line-through`)
- Completion triggers optimistic UI update + PATCH

---

### Phase 6 Acceptance Criteria

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

UI displays a toast notification on API errors using a lightweight toast component (no library needed for MVP — a single `useToast` hook with a portal-rendered div).

### Loading states

- Vendor grid: skeleton cards (3 animated placeholder divs)
- Chat: typing indicator dots
- Checklist: skeleton rows
- Shortlist mutation: button spinner (do not disable the entire card)

### Mobile

The dashboard is desktop-first for MVP. On screens < 768px:
- Sidebar collapses to a drawer (toggle via header button)
- Chat panel is full-screen
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
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── compare/page.tsx
│   │   └── checklist/page.tsx
│   └── api/
│       ├── intake/route.ts
│       ├── vendors/route.ts
│       ├── shortlist/route.ts
│       ├── chat/route.ts                 ← Edge runtime
│       └── checklist/
│           ├── route.ts
│           └── [id]/route.ts
├── components/
│   ├── VendorCard.tsx
│   ├── VendorGrid.tsx
│   ├── ShortlistSidebar.tsx
│   ├── ChatPanel.tsx
│   ├── CompareTable.tsx
│   ├── ChecklistPanel.tsx
│   └── ui/                              ← Primitive components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Tag.tsx
│       └── Toast.tsx
├── hooks/
│   ├── useChat.ts
│   └── useToast.ts
├── lib/
│   ├── prisma.ts
│   ├── matching.ts
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
```

---

## Definition of Done

The MVP is complete when:

1. A new visitor can reach the landing page, complete intake, and reach the dashboard in under 3 minutes
2. The dashboard displays ≥ 10 real vendors from the database, correctly scored against the user's profile
3. The AI concierge can answer at least the 5 test queries from PRD §2 (vendor search, budget guidance, cultural requirements) with grounded, accurate responses
4. A user can shortlist ≥ 2 vendors and navigate to the comparison view
5. The checklist displays 15 seeded tasks with accurate due dates
6. All of the above works on a production Vercel URL, not just localhost
