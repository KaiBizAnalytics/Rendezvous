# Rendezvous — Execution Plan
**Date:** March 2026
**Input:** `project_management_plan.md`, `implementation_plan.md`, `architecture_plan.md`
**Purpose:** Operational runbook. What the team does, in what order, on which day.

---

## How This Document Works

The architecture plan answers *what to build*.
The implementation plan answers *how to build it*.
The project management plan answers *who builds what and when*.

This document answers *what do we do tomorrow morning*.

It is structured as:
1. Pre-sprint setup — decisions and access before Day 1
2. Sprint runbooks — day-by-day actions for each sprint
3. Daily operating rhythm — standup, PRs, issue hygiene
4. Risk response playbook — specific triggers and responses
5. Launch sequence — ordered steps to go live
6. Post-launch monitoring — first 7 days

---

## 1. Pre-Sprint Setup
*Complete before Sprint 1, Day 1. Takes ~4 hours total.*

---

### 1.1 Accounts and Access

Provision the following before writing any code. Both engineers need access to everything.

| Service | Action | Who |
|---|---|---|
| GitHub | Create `rendezvous` repository (private). Add both engineers as owners. | Lead |
| Supabase | Create project in `ca-central-1`. Add both engineers to the organisation. | Lead |
| Vercel | Create project linked to the GitHub repo. Add both engineers. Enable auto-deploy on `main`. | Lead |
| Anthropic | Create API key at console.anthropic.com. Store in 1Password or shared vault — never in code. | Lead |
| Linear | Create `Rendezvous` project. Import the 39 issues from `project_management_plan.md`. Add both engineers. | Lead |
| Figma | Share the style guide reference (optional, the `style_guide.md` is sufficient for MVP). | Lead |

**First shared action:** Both engineers confirm they can log into all 5 services before ending Day 0.

---

### 1.2 Conventions — Agree Before Writing Code

These decisions eliminate ambiguity during the sprint. Record them in a `CONTRIBUTING.md` in the repo root.

**Branching:**
```
main          ← production (auto-deploys to Vercel)
dev           ← integration branch (merge PRs here, promote to main at sprint end)
feature/RDV-NNN-short-description
```

**Branch naming:** `feature/RDV-021-matching-algorithm`, `chore/RDV-007-tailwind-tokens`

**Commit format:** `RDV-NNN: short imperative description`
Examples: `RDV-015: add checklist seeding to intake route`, `RDV-030: stream claude response via SSE`

**PR rules:**
- PR title matches commit format
- Every PR links to its Linear issue
- Minimum: self-review before requesting review
- PR must pass `npm run build` and `npm run lint` — no exceptions
- Target branch: `dev` (never directly to `main`)

**Code conventions:**
- No `any` in TypeScript — use `unknown` and narrow, or define a type
- Zod validation on every API route body
- All colours via CSS variables — no hardcoded hex values in component files
- Client Components (`'use client'`) only when state or browser APIs are needed — default to Server Components

**Environment variables:**
- Never commit `.env.local`
- All new env vars added to `.env.example` with a placeholder value and a comment
- New production env vars added to Vercel dashboard before the PR that uses them merges

---

### 1.3 Linear Setup

Create the following in Linear before Sprint 1:

1. **Project:** `Rendezvous MVP`
2. **Milestones:** M0 through M6 (map to project_management_plan milestones)
3. **Labels:** `backend`, `frontend`, `data`, `devops`, `ai`, `chore`, `feature`
4. **Issue statuses:** `Backlog` → `In Progress` → `In Review` → `Done`
5. **Import all 39 issues** with correct labels, sizes, milestones, and `Blocked by` relations
6. **Assign sprint 1 issues** to M0 milestone and set status to `Backlog`

Rule: An issue moves to `In Progress` only when a branch is created for it. An issue moves to `Done` only when its PR is merged to `dev`.

---

### 1.4 Environment Decision

Confirm the `NEXT_PUBLIC_SKIP_AUTH` strategy before Sprint 1:

- `true` for all local development and internal demos throughout the project
- Switched to `false` only in Sprint 7 (Polish) when Supabase magic link is fully tested
- The hardcoded `userId = 'demo-user-id'` in API routes is replaced with real auth extraction in Sprint 7 as a dedicated task (add `RDV-040` if needed)

Document this decision in `CONTRIBUTING.md`.

---

## 2. Sprint Runbooks

---

### Sprint 1 — Weeks 1–2 | M0: Foundation

**Goal:** `npm run dev` shows the app. Prisma Studio shows 60+ vendors. Production URL is live.

**Sprint 1, Day 1 — Kickoff (Monday morning)**

*Eng A (backend/data):*
1. Create GitHub repo, push initial Next.js scaffold (RDV-001, first half)
2. While Eng B sets up tooling: begin `prisma/schema.prisma` (RDV-002)
3. Create Supabase project, copy connection strings to `.env.local` (RDV-003)

*Eng B (frontend):*
1. Clone repo after Eng A pushes scaffold
2. Configure Tailwind tokens and `globals.css` (RDV-007) — this can start the moment the repo exists
3. Set up Zustand store (RDV-008) and TanStack Query provider (RDV-009)

**Sprint 1, Mid-Point Check (End of Week 1)**

*Gate: Do not start seed data until these are true:*
- [ ] `npx prisma migrate dev` ran without error
- [ ] `npx prisma studio` opens and shows 5 empty tables
- [ ] `className="bg-surface text-rose font-serif"` renders correctly in a test element

*If Eng A is blocked on schema:* pair on it together — the schema is foundational and every other task depends on it.

**Sprint 1, Day Last — Review (Friday of Week 2)**

Run the sprint acceptance criteria before declaring done:
- [ ] `npx prisma db seed` exits 0 and shows 60+ rows in Prisma Studio
- [ ] `vercel --prod` produces a live URL
- [ ] Both engineers can access Supabase, Vercel, and Anthropic console

**Go/No-Go Gate for Sprint 2:**
The seed data (RDV-010) must be complete. This is the only L-sized issue in the sprint and the only hard blocker for Sprint 3. If seed data is not done, Sprint 2 starts but Sprint 3 cannot begin until it clears.

---

### Sprint 2 — Weeks 3–4 | M1: Intake

**Goal:** Complete intake flow creates a `WeddingProfile` and 15 `ChecklistItem` rows in the database.

**Sprint 2, Day 1 — Kickoff**

*Eng A:*
1. Auth middleware with `SKIP_AUTH` bypass (RDV-013) — 2–3 hours, clear this first
2. `POST /api/intake` route with Zod validation + checklist seeding (RDV-015)

*Eng B:*
1. Landing page (RDV-014) — highest-visibility work, start here
2. Once Eng A confirms the API contract for `/api/intake`, build the onboarding page shell (RDV-016)

**API contract agreement (Day 1–2):**
Before Eng B writes the form submit logic, Eng A and Eng B must agree on the exact request body shape for `POST /api/intake`. Write it in a shared comment on RDV-020 in Linear. This prevents integration pain at the end of the sprint.

```json
// Agreed request body (record in RDV-020):
{
  "city": "Vancouver, BC",
  "weddingDate": "2026-08-15",
  "guestCount": 80,
  "budgetMin": 3000000,
  "budgetMax": 5000000,
  "ceremonyType": "Indoor",
  "style": "Modern",
  "culturalReqs": "Chinese tea ceremony",
  "priorityCategory": "venue"
}
```

**Sprint 2, Mid-Point Check (End of Week 3)**

- [ ] Landing page renders in production
- [ ] `POST /api/intake` returns `{ profileId }` when called with curl/Postman
- [ ] Onboarding page shell exists and step navigation works (even with empty step content)

**Sprint 2, Day Last — Integration Day (Friday of Week 4)**

Reserve the last day for RDV-020 (wiring form → API → redirect). This is the integration point and should not be left to the last hour. Run end-to-end manually: fill out all 3 steps, submit, confirm rows in Supabase, confirm redirect to `/dashboard`.

**Go/No-Go Gate for Sprint 3:**
- `WeddingProfile` row appears in Supabase after completing intake
- 15 `ChecklistItem` rows appear in Supabase after first submission
- Submitting twice does not create duplicate profiles

---

### Sprint 3 — Weeks 5–6 | M2: Vendor Matching

**Goal:** Dashboard shows real vendor cards from the database with meaningful, differentiated match scores.

**Sprint 3, Day 1 — Kickoff**

*Eng A:*
1. Matching algorithm (RDV-021) — pure function, testable. Write it first, test manually with a few vendor records before wiring to the API.
2. `GET /api/vendors` route (RDV-022) once algorithm is confirmed

*Eng B:*
1. Dashboard layout (RDV-023) — sidebar shell, topbar, main content area
2. `VendorCard` component (RDV-024) — can be built with hardcoded mock data before the API exists

**Eng B's development strategy for this sprint:**
Build `VendorCard` with a hardcoded mock vendor object first. This lets the component be visually correct and reviewed before `GET /api/vendors` is ready. Once RDV-022 is merged, swap the mock for the real data hook (RDV-025).

**Manual matching test (before RDV-022 is written):**
Eng A writes a small test script that runs `scoreVendor()` against 5 representative vendors for three different profiles:
- Profile A: $10k budget, 40 guests, no cultural reqs
- Profile B: $50k budget, 100 guests, "Halal catering"
- Profile C: $80k budget, 200 guests, no cultural reqs

Confirm that scores are meaningfully differentiated (a $20k venue should score near 0 for Profile A and near 90 for Profile C). If they don't, fix the algorithm before building the API.

**Sprint 3, Mid-Point Check (End of Week 5)**
- [ ] Matching algorithm tested manually with 3 profiles — scores are differentiated
- [ ] `GET /api/vendors` returns vendors with `matchScore` in the response
- [ ] Dashboard layout renders (sidebar + topbar) with placeholder content

**Sprint 3, Day Last — Visual QA**

Both engineers open the dashboard and assess:
- Do vendor cards look correct per the style guide?
- Are match scores visibly different between vendors?
- Does the category filter change the displayed vendors?
- Is there a loading state?

**Go/No-Go Gate for Sprint 4:**
- Dashboard shows ≥ 10 vendor cards drawn from the real database
- Category filter works
- A $10k profile sees different vendors than a $75k profile

---

### Sprint 4 — Week 7 (First Half) | M3: Shortlist

**Goal:** Saving a vendor updates the sidebar instantly and persists across page refreshes.

**Sprint 4, Day 1 — Kickoff**

*Eng A:*
1. `POST /api/shortlist` route (RDV-027) — short, aim to finish by end of Day 1

*Eng B:*
1. `ShortlistSidebar` component (RDV-028) — build with Zustand mock data while Eng A works on the API

**Sprint 4, Integration (Day 3):**
Wire the optimistic mutation (RDV-029). This is the most technically subtle issue in the sprint — the Zustand store updates immediately, the API call happens in the background, and failures roll back. Pair-program this one if either engineer is uncertain about TanStack Query mutation patterns.

Test the rollback: temporarily make the API return 500 and confirm the heart button reverts.

**Go/No-Go Gate for Sprint 5:**
- Clicking the heart button updates the sidebar within 100ms (optimistic)
- Refreshing the page shows the same shortlisted vendors (persisted to DB)
- Removing a vendor from the sidebar removes it from Supabase

---

### Sprint 5 — Week 7 (Second Half) – Week 8 (First Half) | M4: AI Chat

**Goal:** The chat panel opens, a user sends a message, a streaming response referencing real vendors appears token-by-token.

**The highest-risk sprint. Read this section carefully before starting.**

**Sprint 5, Day 1 — Contract First**

Before any code is written, agree on the SSE wire format in writing (record in RDV-030):

```
// Each data event during streaming:
data: {"chunk": "text fragment"}\n\n

// Terminal event:
data: [DONE]\n\n

// Error event:
data: {"error": "message"}\n\n
```

Both engineers sign off on this. Eng B builds the `useChat` hook (RDV-031) and `ChatPanel` (RDV-032) against this contract using a mock endpoint first. Eng A builds the real `/api/chat` route (RDV-030) in parallel.

**Mock endpoint for Eng B (create temporarily as `src/app/api/chat-mock/route.ts`):**
```typescript
export const runtime = 'edge'
export async function POST() {
  const words = "Based on your profile I'd recommend starting with venues — availability in Vancouver fills fast.".split(' ')
  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        await new Promise(r => setTimeout(r, 80))
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ chunk: word + ' ' })}\n\n`))
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
}
```

Eng B develops against this mock until RDV-030 is ready. Delete the mock before Sprint 7.

**Sprint 5, Mid-Point Check:**
- [ ] Mock endpoint streams correctly in the browser (tokens appear one at a time)
- [ ] `useChat` hook accumulates tokens into the last message in state
- [ ] `ChatPanel` slides in and renders message bubbles

**Sprint 5, Integration Day:**
Swap `useChat` to point to real `/api/chat`. Send 5 test queries and evaluate responses:
1. "Find me a venue under $10k" — should reference real vendors
2. "What's a realistic catering budget for 80 guests?" — should reference profile data
3. "What vendors do I need for a Chinese tea ceremony?" — cultural reqs test
4. "When should I book my photographer?" — timing advice
5. "Can I pay vendors through Rendezvous?" — out-of-scope redirect test

All 5 must produce sensible, grounded responses before the sprint closes.

**Go/No-Go Gate for Sprint 6:**
- All 5 test queries produce acceptable responses
- Responses reference vendor names from the database (not hallucinated)
- Streaming is visible in production (not just localhost) — test on Vercel URL

---

### Sprint 6 — Week 8 (Second Half) | M5 + M6: Compare + Checklist

**Goal:** Comparison table and checklist both functional. Foundation for Polish sprint.

**Sprint 6, Day 1 — Kickoff**

*Eng A:*
1. Checklist API routes (RDV-035) — GET and PATCH, straightforward
2. PATCH notes endpoint + `/compare` page shell (RDV-034)

*Eng B:*
1. `CompareTable` component (RDV-033) — can build with shortlist data from Zustand while API is in progress
2. Checklist UI page (RDV-036)

**Timebox warning:** This sprint covers two milestones in a short window. If either `CompareTable` or the checklist UI runs long, prioritise `CompareTable` — it directly serves the "vendor comparison" feature which is a primary PRD requirement. The checklist is secondary.

**Go/No-Go Gate for Sprint 7:**
- At least 2 vendors can be shortlisted and the compare page renders them side-by-side
- Checklist shows 15 tasks after intake (verify in a fresh profile)
- Completing a checklist item persists across page refresh

---

### Sprint 7 — Week 9 | M6 Polish: Error Handling, Mobile, Launch

**Goal:** All Definition of Done criteria pass on the production URL. MVP ships.

**Sprint 7 is not a feature sprint. It is a quality and launch sprint.**

**Priority order for this sprint (strict):**
1. Error handling + Toast (RDV-037) — affects every user-facing action
2. Production smoke test (RDV-039) — done last, confirms everything else is working
3. Mobile responsive (RDV-038) — important but not blocking launch if desktop works
4. Bug fixes surfaced by smoke test — assigned as they're discovered

**Sprint 7, Day 1 — Error Audit**

Both engineers spend the morning walking through every API route and confirming:
- Every route returns `{ error: string }` on failure
- Every `useMutation` has an `onError` handler that shows a toast
- No silent failures exist anywhere in the UI

Create a bug ticket for each failure found. Fix before end of week.

**Sprint 7, Day 3 — Staging Smoke Test**

Run the complete user journey on the Vercel production URL. Not localhost. Follow this exact sequence:
1. Open the production URL in an incognito window
2. Land on the homepage
3. Click "Start planning"
4. Complete all 3 intake steps
5. Confirm redirection to dashboard
6. Confirm vendor cards appear (check Supabase to confirm they're from the DB)
7. Save 3 vendors to shortlist
8. Open the chat panel, send 2 messages
9. Navigate to `/dashboard/compare`
10. Navigate to `/dashboard/checklist`, mark 2 items complete
11. Refresh the page, confirm state persists

Record pass/fail for each step in a shared doc. Fix all failures before Day 5.

**Sprint 7, Day 5 — Go/No-Go Decision**

All 6 Definition of Done criteria must pass:
- [ ] Full journey completable in < 3 minutes from homepage
- [ ] ≥ 10 vendors shown from the database with meaningful match scores
- [ ] AI concierge answers all 5 test queries with grounded responses
- [ ] ≥ 2 vendors can be compared side-by-side
- [ ] Checklist shows 15 tasks with correct due dates
- [ ] All of the above works at the production Vercel URL

If all 6 pass → proceed to Launch Sequence.
If any fail → fix same day, re-run smoke test, then proceed.

---

## 3. Daily Operating Rhythm

---

### Standup Format
**Time:** 15 minutes, same time each day.
**Three questions — nothing else:**
1. What did I merge yesterday?
2. What am I working on today?
3. Am I blocked? If so, what do I need?

Blockers are not discussed in standup — they are flagged and resolved async (or in a follow-up pair session, maximum 30 minutes).

---

### Issue Hygiene Rules

| Rule | Detail |
|---|---|
| One issue per branch | Never combine two issues in one PR |
| Update status in real time | Move to `In Progress` when you create the branch, `In Review` when you open the PR |
| Close blocked issues immediately | If RDV-025 is blocked on RDV-022, mark it `Blocked` in Linear — don't leave it in `Backlog` |
| No zombie issues | If an issue is `In Progress` for more than 3 days without a PR, raise it in standup |

---

### PR Review Rules

| Rule | Detail |
|---|---|
| PR size | A PR should represent one issue. If it's > 400 lines, consider splitting. |
| Review turnaround | PRs are reviewed within 4 working hours of being opened |
| Self-merge rule | Never merge your own PR to `main`. PRs to `dev` can be self-merged for XS chores. |
| Build must pass | `npm run build` and `npm run lint` must pass before requesting review |
| One approval required | One engineer approves, then the author merges |

---

### End-of-Sprint Promotion

On the last day of each sprint:
1. All sprint issues are in `Done`
2. Eng A runs `git merge dev main` and pushes
3. Vercel auto-deploys to production
4. Both engineers verify the production URL reflects the sprint's work
5. Sprint retrospective: 20 minutes max — one thing that went well, one to improve

---

## 4. Risk Response Playbook

These are the specific risks identified in the architecture plan, with concrete response actions.

---

### Risk 1: Seed Data is Thin or Wrong
**Trigger:** During Sprint 3 integration, match scores are uniform (all vendors score within 10 points of each other) or categories are underrepresented.
**Response:**
1. Stop — don't proceed with vendor grid until scoring is differentiated
2. Review the seed data: are price ranges spread across the full spectrum ($500 to $25,000)?
3. Adjust price values first (takes 1 hour), re-run seed, re-test
4. If 2 hours doesn't fix it, the scoring algorithm may have a logic error — review `scoreVendor()` budget fit logic

---

### Risk 2: AI Responses Are Hallucinating Vendors
**Trigger:** During Sprint 5 integration testing, Claude names vendors not in the seed database (e.g., "The Vancouver Marriott" or "Sunshine Photography").
**Response:**
1. Strengthen the system prompt constraint: move "do not fabricate vendors outside this list" to the **first line** of the system prompt, not the guidelines section
2. Add an explicit negative: "If asked about a vendor not in the list below, say you don't have information about them."
3. Re-run the 5 test queries
4. If still hallucinating: reduce `max_tokens` from 400 to 300 and re-test (shorter responses leave less room for invention)

---

### Risk 3: Streaming Breaks on Vercel Production
**Trigger:** Chat works on localhost but the response on the Vercel URL either: doesn't stream (full response appears at once), or fails entirely (504 timeout).
**Response (try in order):**
1. Confirm `export const runtime = 'edge'` is at the top of `src/app/api/chat/route.ts`
2. Check Vercel function logs for the specific error
3. If timeout: reduce `max_tokens` from 400 to 200 as a temporary measure — Edge functions have a 30s timeout on free tier
4. If still broken: implement the non-streaming fallback (`await client.messages.create(...)` instead of `.stream()`), ship that, and fix streaming in a follow-up issue
5. The fallback is: accumulate the full response, then return it as a regular JSON response. The UX degrades (no streaming animation) but the feature works.

---

### Risk 4: Supabase Connection Pooling Issues in Development
**Trigger:** `npx prisma migrate dev` errors with "too many connections" or intermittent database errors during development.
**Response:**
1. Confirm `DATABASE_URL` uses the PgBouncer URL (`?pgbouncer=true` parameter) and `DIRECT_URL` uses the direct connection string
2. Confirm the Prisma singleton pattern is in place in `src/lib/prisma.ts` (not instantiating `new PrismaClient()` in multiple places)
3. If persisting: add `connection_limit=1` to the `DATABASE_URL` as a Prisma datasource parameter — this is safe in serverless contexts

---

### Risk 5: Sprint Runs Long
**Trigger:** End-of-sprint acceptance criteria are not met by the last day of the sprint.
**Response (in priority order):**
1. Identify the specific failing criterion — is it a bug or an incomplete feature?
2. Bug: fix same day, this is non-negotiable
3. Incomplete feature: assess whether it blocks the *next* sprint's critical path
   - If it **does** block (e.g., RDV-015 is incomplete and blocks Sprint 3): extend the sprint by 2 days, delay Sprint 3 start
   - If it **doesn't** block (e.g., RDV-038 mobile is incomplete): carry it into the next sprint as the first issue
4. Never start the next sprint's features while the current sprint has unresolved blockers

---

### Risk 6: Auth Breaks on Production Before Launch
**Trigger:** In Sprint 7, when `NEXT_PUBLIC_SKIP_AUTH=false` is set in Vercel, the magic link flow fails or sessions expire immediately.
**Response:**
1. Revert `NEXT_PUBLIC_SKIP_AUTH` to `true` in Vercel immediately — restore the working demo
2. Test magic link in Supabase dashboard → Authentication → Send test email
3. Verify Supabase `Site URL` is set to the correct Vercel production URL (not localhost)
4. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match the production project (not a dev project)
5. If auth cannot be fixed in 1 day: launch with `SKIP_AUTH=true` and add auth as a post-launch issue

---

## 5. Launch Sequence

*Run this sequence on Sprint 7, Day 5 after all smoke tests pass.*

---

### Day Before Launch — Pre-Launch Checklist

**Environment:**
- [ ] All Vercel environment variables confirmed for production
- [ ] `NEXT_PUBLIC_SKIP_AUTH` set to `true` for MVP launch (auth is post-launch)
- [ ] `ANTHROPIC_API_KEY` is a production-tier key (not a free-tier key with rate limits)
- [ ] Supabase project is on a paid tier (or confirmed free tier limits are safe)

**Code:**
- [ ] `main` branch reflects all merged sprint work
- [ ] `npm run build` passes on `main` locally
- [ ] All 39 Linear issues are in `Done`
- [ ] No `console.log` statements left in production code
- [ ] The mock chat endpoint (`/api/chat-mock`) is deleted
- [ ] `.env.example` is up to date with all required variables (no values, just keys)

**Data:**
- [ ] 60+ vendor records confirmed in Supabase production database
- [ ] At least one complete test profile exists in the database for internal demos
- [ ] `SKIP_AUTH=true` demo user (`userId: 'demo-user-id'`) has a complete profile and shortlist

**Review:**
- [ ] Both engineers have walked the full user journey on the production URL in the last 24 hours
- [ ] All 5 AI chat test queries produce acceptable responses on production

---

### Launch Day — Ordered Steps

**Step 1 — Final build (30 min before launch)**
```bash
git checkout main
git pull
npm run build          # must pass
npm run lint           # must pass
```

**Step 2 — Verify production deployment**
- Confirm the latest commit is deployed on Vercel (check the Vercel dashboard)
- Open the production URL in incognito — confirm the landing page loads

**Step 3 — Run the smoke test one final time**
Follow the exact 11-step sequence from Sprint 7, Day 3. Record pass for each step.

**Step 4 — Share the URL**
Share the production URL with the first users (team, stakeholders, or test users). No announcement — soft launch only. You want real usage data before any wider sharing.

**Step 5 — Monitor for 2 hours**
Both engineers available for the first 2 hours post-launch. Watch:
- Vercel function logs for errors
- Supabase database for new profile rows (sign of real usage)
- Any Anthropic API errors in function logs

**Step 6 — Declare launch**
If no P0 issues in the first 2 hours, the launch is stable. Document the live URL in the project Linear board description.

---

### Rollback Procedure

If a critical bug is discovered after launch:

| Severity | Definition | Response |
|---|---|---|
| P0 | Users cannot complete intake or the dashboard is blank | Roll back to previous deployment in Vercel immediately, investigate in parallel |
| P1 | AI chat is broken or returns errors | Set `max_tokens` to 200 and re-deploy; if still broken, hide the chat button temporarily |
| P2 | Minor visual bug or non-critical feature broken | Fix in a hotfix branch, merge to `main`, let Vercel auto-deploy |

**Vercel rollback (P0 procedure):**
1. Vercel dashboard → Deployments → select the previous successful deployment
2. Click "Promote to Production"
3. This takes < 60 seconds and requires no code changes

---

## 6. Post-Launch Monitoring — Week 1

The PRD defines primary success metrics. Track these manually in Week 1 using Supabase queries.

---

### Daily Metrics Check

Run these queries in Supabase SQL Editor each morning:

```sql
-- New profiles created today
SELECT COUNT(*) FROM wedding_profiles WHERE created_at > now() - interval '24 hours';

-- Intake completion rate (profiles / sessions — approximate)
SELECT COUNT(*) as profiles FROM wedding_profiles;

-- Average shortlist size per profile
SELECT AVG(item_count) FROM (
  SELECT profile_id, COUNT(*) as item_count FROM shortlist_items GROUP BY profile_id
) t;

-- AI concierge interaction rate (profiles with ≥ 1 chat message)
SELECT
  COUNT(DISTINCT profile_id) as profiles_with_chat,
  (SELECT COUNT(*) FROM wedding_profiles) as total_profiles
FROM chat_messages WHERE role = 'user';

-- Total vendor shortlists created (profiles with ≥ 1 saved vendor)
SELECT COUNT(DISTINCT profile_id) FROM shortlist_items;
```

---

### Week 1 Targets (Internal)

These are not KPIs — they are health signals that confirm the product is working as intended. No external commitments on these numbers.

| Metric | Healthy signal |
|---|---|
| Intake completion rate | > 60% of users who start intake finish step 3 |
| Shortlist creation rate | > 40% of users who reach the dashboard save ≥ 1 vendor |
| AI interaction rate | > 30% of users open the chat panel at least once |
| Zero P0 incidents | No rollbacks required in week 1 |

---

### What Constitutes a P0

A P0 requires an immediate response (within 1 hour) regardless of time of day:

- The landing page returns a 500 or fails to load
- The intake form cannot be submitted (API error on `POST /api/intake`)
- The vendor grid is empty for all users (not a data issue — a code or API issue)
- The Anthropic API key is invalid or rate-limited (all chat requests fail)
- User data is visible to the wrong user (data isolation failure)

---

### Week 1 Retrospective (End of Day 7 Post-Launch)

One hour. Answer four questions:
1. What did users actually do? (Review Supabase data)
2. Which of the 4 PRD hypotheses got validated or invalidated?
3. What is the most important thing broken or missing?
4. What does Sprint 8 look like?

The output of this retrospective is the first iteration backlog — not a plan, just a prioritised list of what comes next.

---

## Document Map

| Document | Purpose | Status |
|---|---|---|
| `rendezvous_mvp_prd.md` | Source of truth for features and scope | Stable |
| `opportunity_solution_tree.md` | User problems → solution hypotheses | Stable |
| `style_guide.md` | Visual design tokens and component rules | Stable |
| `market_analysis.md` | Competitive context and differentiators | Complete |
| `architecture_plan.md` | System design, data model, API contracts | Complete |
| `implementation_plan.md` | Code-level build guide by phase | Complete |
| `project_management_plan.md` | 39 Linear issues with dependencies and sprints | Complete |
| `execution_plan.md` | This document — operational runbook | **Active** |
| `prototype.html` | Frontend prototype for UX validation | Reference |
