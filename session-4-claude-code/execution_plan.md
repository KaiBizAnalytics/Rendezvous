# Rendezvous — Execution Plan v2.0
**Date:** March 23, 2026
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
| Image Generation API | Create API key (DALL·E 3 at platform.openai.com, or Stability AI at platform.stability.ai). Store in 1Password or shared vault — never in code. | Lead |
| Linear | Create `Rendezvous` project. Import issues from `project_management_plan.md`. Add both engineers. | Lead |
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

**Branch naming:** `feature/RDV-021-vision-board-pipeline`, `chore/RDV-007-tailwind-tokens`

**Commit format:** `RDV-NNN: short imperative description`
Examples: `RDV-015: add checklist seeding to intake route`, `RDV-030: add image generation pipeline`

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
3. **Labels:** `backend`, `frontend`, `data`, `devops`, `image-gen`, `chore`, `feature`
4. **Issue statuses:** `Backlog` → `In Progress` → `In Review` → `Done`
5. **Import all issues** with correct labels, sizes, milestones, and `Blocked by` relations
6. **Assign sprint 1 issues** to M0 milestone and set status to `Backlog`

Rule: An issue moves to `In Progress` only when a branch is created for it. An issue moves to `Done` only when its PR is merged to `dev`.

---

### 1.4 Environment Variables

The following environment variables must be provisioned before the relevant sprints begin. Add all keys to `.env.example` with placeholder values on Day 1.

| Variable | When needed | Notes |
|---|---|---|
| `DATABASE_URL` | Sprint 1 | Supabase PgBouncer URL with `?pgbouncer=true` |
| `DIRECT_URL` | Sprint 1 | Supabase direct connection for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Sprint 1 | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sprint 1 | Public Supabase anon key |
| `IMAGE_GENERATION_API_KEY` | Sprint 3 | DALL·E 3 or Stability AI key — stored in 1Password |
| `NEXT_PUBLIC_SKIP_AUTH` | Sprint 1 | `true` for all dev and demos; `false` only in Sprint 7 |

Confirm `NEXT_PUBLIC_SKIP_AUTH` strategy before Sprint 1: `true` for all local development and internal demos throughout the project. Switched to `false` only in Sprint 7 (Polish) when Supabase magic link is fully tested. Document this decision in `CONTRIBUTING.md`.

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
- [ ] Both engineers can access Supabase, Vercel, and image generation API console

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

### Sprint 3 — Weeks 5–6 | M2: Vision Board Core

**Goal:** After intake, the Vision Board renders an AI-generated ceremony scene image with a budget allocation overlay. Budget figures are derived from the user's profile.

**This is the highest-risk sprint. Read this section carefully before starting.**

**Sprint 3, Day 1 — Kickoff**

*Eng A:*
1. Budget allocation engine (RDV-021) — pure function, testable. Write it first. Given a total budget and guest count, it should return a breakdown by category (venue, catering, photography, florals, etc.) based on Vancouver market research data. Test manually with 5 profiles before wiring to the API.
2. `POST /api/vision-board` route (RDV-022) once budget engine is confirmed — accepts `profileId`, returns image URL and budget breakdown JSON.

*Eng B:*
1. Vision Board layout shell (RDV-023) — the full-bleed image container, overlay positioning, loading state skeleton
2. Budget callout component (RDV-024) — can be built with hardcoded mock budget data before the API exists

**Image generation pipeline (Eng A, Day 2–3):**

The image generation prompt must be constructed from the profile. Build a `buildImagePrompt(profile)` helper that produces a detailed, consistent scene description. Example:

```
A romantic outdoor wedding ceremony at golden hour in Vancouver, BC.
Lush floral arrangements in dusty rose and soft sage. 80 guests seated
in white chairs on a manicured lawn. Warm evening light, cinematic,
editorial photography style. No people in the foreground.
```

Run the prompt against DALL·E 3 or Stability AI manually (via the API console or a test script) before wiring it to the API route. Evaluate quality before committing to the pipeline.

**Eng B's development strategy for this sprint:**
Build the Vision Board overlay with hardcoded mock data (a placeholder image URL + static budget breakdown). This lets the layout and callout styling be reviewed before the image generation pipeline exists. Once RDV-022 is merged, swap the mock for the real data hook (RDV-025).

**Manual budget engine test (before RDV-022 is written):**
Eng A runs `allocateBudget()` against 5 representative profiles:
- Profile A: $15k total, 50 guests, priority: photography
- Profile B: $40k total, 80 guests, priority: venue
- Profile C: $80k total, 150 guests, priority: catering
- Profile D: $25k total, 60 guests, priority: florals
- Profile E: $60k total, 120 guests, no priority

Confirm that allocations shift meaningfully based on priority and guest count. A venue-priority profile should allocate 35–45% to venue. A catering-priority profile with 150 guests should shift more toward per-head costs. If allocations are flat across profiles, fix the engine before building the API.

**Latency target:** The image generation call must complete within 10 seconds. Test this before sprint close. If consistently over 10 seconds, implement the loading animation (Sprint 4) earlier and consider reducing image resolution.

**Sprint 3, Mid-Point Check (End of Week 5)**
- [ ] `allocateBudget()` tested manually with 5 profiles — allocations are meaningfully differentiated
- [ ] Image generation prompt tested manually — output images are recognisably wedding scenes
- [ ] `POST /api/vision-board` returns `{ imageUrl, budgetBreakdown }` when called with curl/Postman
- [ ] Vision Board layout shell renders (image container + overlay placeholder)

**Sprint 3, Day Last — Visual QA**

Both engineers open the Vision Board on the production URL and assess:
- Does the generated image match the user's style and setting?
- Are budget callouts legible against the image?
- Is the total budget figure correct (matches intake input)?
- Is there a loading state while the image generates?
- Does the page handle a failed image generation gracefully?

**Go/No-Go Gate for Sprint 4:**
- Vision Board generates a real image via the API for a completed intake profile
- Budget breakdown totals correctly to the user's stated budget
- Image generation completes within 10 seconds on the production URL (Vercel)
- A fallback state is shown if image generation fails

---

### Sprint 4 — Week 7 (First Half) | M3: Vision Board Polish

**Goal:** Vision Board callout interactions, budget adjustment controls, regenerate flow, and fallback templates are all functional and production-ready.

**Sprint 4, Day 1 — Kickoff**

*Eng A:*
1. Regenerate endpoint (RDV-027) — `POST /api/vision-board/regenerate`. Enforce a limit of 3 regenerations per session (store count in the user's session or profile row). Return a clear error when the limit is reached.
2. Image caching layer (RDV-028) — generated images must be stored (Supabase Storage or equivalent) so refreshing the page does not trigger a new generation. Cache key: `profileId + promptHash`.

*Eng B:*
1. Callout interaction states (RDV-029) — hover, tap, and expanded states for each budget category callout. Tapping a callout expands a detail panel (vendor category description + estimated range).
2. Budget adjustment controls (RDV-030) — allow the user to drag or input-adjust individual category allocations. The total must remain fixed; adjusting one category redistributes from others.

**Regenerate UX (Eng B, Day 2–3):**
The regenerate button triggers the "Designing your ceremony..." loading animation. This animation must be engaging — it is the primary latency mitigation. Design it to run for the full generation window without feeling like a wait. Consider: slow crossfade between two placeholder images, an animated typewriter line describing the scene being designed, or a soft pulsing gradient over the image area.

Disable the regenerate button when the 3-per-session limit is reached. Show a clear, friendly message: "You've used all 3 generations for this session. Adjust your vision and start a new session to generate again."

**Fallback templates (Eng A, Day 3–4):**
Prepare 5 high-quality static scene images as fallback templates (source from royalty-free stock or generate a curated set manually). These display when:
1. The image generation API returns an error
2. The generation times out (> 15 seconds)
3. The 3-regeneration limit is reached and the user wants to see a different scene

Templates should be selected by style tag (rustic, modern, garden, ballroom, beach) to match the user's intake style selection.

**Sprint 4, Integration Day (Day 3):**
Wire budget adjustment controls to update the callout overlay in real time (Zustand store update → overlay re-renders). Adjustments do not trigger a new image generation — only the callout numbers change. Test that the total remains fixed through 10 rapid adjustments.

**Go/No-Go Gate for Sprint 5:**
- Clicking a budget callout expands the detail panel
- Budget adjustments redistribute correctly (total stays fixed)
- Regenerate button works up to 3 times, then disables with a clear message
- Refreshing the page shows the cached image, not a new generation
- Fallback templates display correctly when image generation fails

---

### Sprint 5 — Week 7 (Second Half) – Week 8 (First Half) | M4: Vendor Matching + Dashboard

**Goal:** Dashboard shows real vendor cards from the database with meaningful, differentiated match scores. Vision Board summary is embedded in the dashboard header.

**Sprint 5, Day 1 — Kickoff**

*Eng A:*
1. Vendor matching algorithm update (RDV-031) — update `scoreVendor()` to incorporate budget allocation data from the Vision Board engine. A vendor's match score should reflect not just total budget fit but whether they fit the *allocated* budget for their category.
2. `GET /api/vendors` route (RDV-032) once algorithm is confirmed

*Eng B:*
1. Dashboard layout (RDV-033) — sidebar shell, topbar, main content area, Vision Board summary panel in the dashboard header
2. `VendorCard` component (RDV-034) — can be built with hardcoded mock data before the API exists

**Dashboard Vision Board summary (Eng B, Day 2–3):**
The dashboard header includes a compact Vision Board summary: a thumbnail of the generated image, the top 3 budget allocations as a horizontal bar, and a link to the full Vision Board view. This gives the dashboard context without requiring the user to navigate away. Build with mock data first, wire to real data once RDV-032 is ready.

**Eng B's development strategy for this sprint:**
Build `VendorCard` with a hardcoded mock vendor object first. This lets the component be visually correct and reviewed before `GET /api/vendors` is ready. Once RDV-032 is merged, swap the mock for the real data hook (RDV-035).

**Manual matching test (before RDV-032 is written):**
Eng A writes a small test script that runs the updated `scoreVendor()` against 5 representative vendors for three different profiles:
- Profile A: $10k total, 40 guests, photography priority
- Profile B: $50k total, 100 guests, venue priority
- Profile C: $80k total, 200 guests, no priority

Confirm that scores are meaningfully differentiated and reflect category allocation (a photographer should score higher for Profile A than Profile B, even if total budgets fit). If scores are not differentiated, fix the algorithm before building the API.

**Sprint 5, Mid-Point Check (End of Week 7)**
- [ ] Updated matching algorithm tested manually with 3 profiles — scores reflect category allocation
- [ ] `GET /api/vendors` returns vendors with `matchScore` in the response
- [ ] Dashboard layout renders (sidebar + topbar + Vision Board summary) with placeholder content

**Sprint 5, Day Last — Visual QA**

Both engineers open the dashboard and assess:
- Do vendor cards look correct per the style guide?
- Are match scores visibly different between vendors?
- Does the category filter change the displayed vendors?
- Is there a loading state?
- Does the Vision Board summary thumbnail display correctly?

**Go/No-Go Gate for Sprint 6:**
- Dashboard shows ≥ 10 vendor cards drawn from the real database
- Category filter works
- A photography-priority profile sees a different vendor ranking than a venue-priority profile
- Vision Board summary displays in the dashboard header

---

### Sprint 6 — Week 8 (Second Half) | M5 + M6: Compare + Checklist

**Goal:** Comparison table and checklist both functional. Foundation for Polish sprint.

**Sprint 6, Day 1 — Kickoff**

*Eng A:*
1. Checklist API routes (RDV-037) — GET and PATCH, straightforward
2. PATCH notes endpoint + `/compare` page shell (RDV-036)

*Eng B:*
1. `CompareTable` component (RDV-033) — can build with shortlist data from Zustand while API is in progress
2. Checklist UI page (RDV-038)

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
1. Error handling + Toast (RDV-039) — affects every user-facing action
2. Production smoke test (RDV-041) — done last, confirms everything else is working
3. Mobile responsive (RDV-040) — important but not blocking launch if desktop works
4. Bug fixes surfaced by smoke test — assigned as they're discovered

**Sprint 7, Day 1 — Error Audit**

Both engineers spend the morning walking through every API route and confirming:
- Every route returns `{ error: string }` on failure
- Every `useMutation` has an `onError` handler that shows a toast
- Image generation failures show the fallback template, not a blank panel
- No silent failures exist anywhere in the UI

Create a bug ticket for each failure found. Fix before end of week.

**Sprint 7, Day 3 — Staging Smoke Test**

Run the complete user journey on the Vercel production URL. Not localhost. Follow this exact sequence:
1. Open the production URL in an incognito window
2. Land on the homepage
3. Click "Start planning"
4. Complete all 3 intake steps
5. Confirm redirection to the Vision Board generation view
6. Confirm the "Designing your ceremony..." loading animation plays
7. Confirm the generated image appears within 10 seconds
8. Confirm budget callouts display with correct figures (verify math against intake budget)
9. Tap each callout — confirm detail panel expands
10. Click "Regenerate" — confirm a new image generates (up to 3 times)
11. Navigate to the dashboard
12. Confirm vendor cards appear (check Supabase to confirm they're from the DB)
13. Confirm Vision Board summary thumbnail displays in the dashboard header
14. Save 3 vendors to shortlist
15. Navigate to `/dashboard/compare`
16. Navigate to `/dashboard/checklist`, mark 2 items complete
17. Refresh the page, confirm state persists

Record pass/fail for each step in a shared doc. Fix all failures before Day 5.

**Sprint 7, Day 5 — Go/No-Go Decision**

All 6 Definition of Done criteria must pass:
- [ ] Full journey completable in < 3 minutes from homepage
- [ ] Vision Board generates a real image and displays correct budget callouts
- [ ] ≥ 10 vendors shown from the database with meaningful match scores
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
**Trigger:** During Sprint 5 integration, match scores are uniform (all vendors score within 10 points of each other) or categories are underrepresented.
**Response:**
1. Stop — don't proceed with vendor grid until scoring is differentiated
2. Review the seed data: are price ranges spread across the full spectrum ($500 to $25,000)?
3. Adjust price values first (takes 1 hour), re-run seed, re-test
4. If 2 hours doesn't fix it, the scoring algorithm may have a logic error — review `scoreVendor()` budget fit logic

---

### Risk 2: Image Generation Quality is Inconsistent
**Trigger:** During Sprint 3 integration testing, generated images do not resemble wedding ceremonies, contain distorted subjects, or look generic in ways that undermine the Vision Board's value.
**Response:**
1. Invest in prompt engineering before accepting the output — add specific style modifiers ("editorial photography", "cinematic lighting", "no distorted faces") and negative prompts if the API supports them
2. Test at least 10 prompt variations before settling on a template
3. If quality remains unacceptable after prompt work: activate the curated fallback template system early — ship Sprint 4's fallback templates in Sprint 3 as the primary experience, and treat AI-generated images as a progressive enhancement
4. Document which prompt constructions produce the best results and encode them in `buildImagePrompt()`

---

### Risk 3: Image Generation Latency Causes Drop-off
**Trigger:** Image generation consistently takes > 10 seconds on the production Vercel URL, or user testing reveals drop-off during the loading state.
**Response (try in order):**
1. Confirm the generation request is being made server-side (API route), not client-side — network latency from the user's browser adds unnecessary overhead
2. Reduce image resolution or dimensions if the API supports it — a smaller image generates faster and a wedding scene at 1024×768 is sufficient for the Vision Board overlay
3. Strengthen the loading animation — the "Designing your ceremony..." state must feel deliberate and exciting, not like a broken loading spinner. If the animation is weak, users perceive the wait as longer than it is
4. If latency regularly exceeds 15 seconds: trigger a fallback template at the 12-second mark while the real image continues generating in the background. Swap in the real image when it arrives.
5. Last resort: pre-generate images server-side at intake submission time (fire-and-forget), so the Vision Board view loads the cached result instantly

---

### Risk 4: Image API Cost and Rate Limits
**Trigger:** During Sprint 3 or later, the image generation API returns rate limit errors (429), or estimated monthly API costs exceed acceptable thresholds for an MVP.
**Response:**
1. Implement image caching immediately (Sprint 4 RDV-028) — every generated image is stored and served from cache on subsequent page loads. This is the single most effective cost control.
2. Enforce the 3-regenerations-per-session limit (Sprint 4 RDV-027) to cap per-user API calls
3. If rate limits are hit during development: stagger test generations, do not run multiple generation tests in parallel
4. If costs are projected to exceed budget: evaluate switching between DALL·E 3 and Stability AI — compare cost per generation and quality, switch if the savings are material
5. Add a circuit breaker to the API route: if the image generation API returns errors on 3 consecutive requests, serve fallback templates for the next 5 minutes before retrying

---

### Risk 5: Budget Breakdown Accuracy is Questioned
**Trigger:** During user testing or internal review, the budget allocation figures feel arbitrary or inconsistent with real Vancouver wedding market costs.
**Response:**
1. Audit the Vancouver market research data seeded into `allocateBudget()` — verify price ranges against at least 3 current vendor websites or wedding planning resources
2. Ensure the allocation percentages by category are grounded in real market data, not assumed ratios
3. Add a visible data source note to the Vision Board UI ("Based on Vancouver market averages") — this signals transparency and reduces trust friction
4. If specific categories are flagged as wrong: update the seed data and re-test the allocation engine. The fix is a data change, not a code change.

---

### Risk 6: Supabase Connection Pooling Issues in Development
**Trigger:** `npx prisma migrate dev` errors with "too many connections" or intermittent database errors during development.
**Response:**
1. Confirm `DATABASE_URL` uses the PgBouncer URL (`?pgbouncer=true` parameter) and `DIRECT_URL` uses the direct connection string
2. Confirm the Prisma singleton pattern is in place in `src/lib/prisma.ts` (not instantiating `new PrismaClient()` in multiple places)
3. If persisting: add `connection_limit=1` to the `DATABASE_URL` as a Prisma datasource parameter — this is safe in serverless contexts

---

### Risk 7: Sprint Runs Long
**Trigger:** End-of-sprint acceptance criteria are not met by the last day of the sprint.
**Response (in priority order):**
1. Identify the specific failing criterion — is it a bug or an incomplete feature?
2. Bug: fix same day, this is non-negotiable
3. Incomplete feature: assess whether it blocks the *next* sprint's critical path
   - If it **does** block (e.g., RDV-022 is incomplete and blocks Sprint 4): extend the sprint by 2 days, delay Sprint 4 start
   - If it **doesn't** block (e.g., RDV-040 mobile is incomplete): carry it into the next sprint as the first issue
4. Never start the next sprint's features while the current sprint has unresolved blockers

---

### Risk 8: Auth Breaks on Production Before Launch
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
- [ ] `IMAGE_GENERATION_API_KEY` is a production-tier key (not a free-tier key with rate limits)
- [ ] Supabase project is on a paid tier (or confirmed free tier limits are safe)
- [ ] Image caching storage bucket exists and is accessible in production

**Code:**
- [ ] `main` branch reflects all merged sprint work
- [ ] `npm run build` passes on `main` locally
- [ ] All Linear issues are in `Done`
- [ ] No `console.log` statements left in production code
- [ ] `.env.example` is up to date with all required variables (no values, just keys)

**Data:**
- [ ] 60+ vendor records confirmed in Supabase production database
- [ ] At least one complete test profile exists in the database for internal demos
- [ ] `SKIP_AUTH=true` demo user (`userId: 'demo-user-id'`) has a complete profile, a generated Vision Board image (cached), and a shortlist
- [ ] 5 fallback template images are uploaded to storage and accessible

**Review:**
- [ ] Both engineers have walked the full user journey on the production URL in the last 24 hours
- [ ] Vision Board smoke test passed: image generates after intake, callouts display, budget math is correct
- [ ] Regenerate flow tested: all 3 regenerations work, 4th attempt is blocked with correct message

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
Follow the exact 17-step sequence from Sprint 7, Day 3. Record pass for each step.

**Step 4 — Share the URL**
Share the production URL with the first users (team, stakeholders, or test users). No announcement — soft launch only. You want real usage data before any wider sharing.

**Step 5 — Monitor for 2 hours**
Both engineers available for the first 2 hours post-launch. Watch:
- Vercel function logs for errors
- Supabase database for new profile rows (sign of real usage)
- Any image generation API errors in function logs
- Image generation latency in function logs (flag if consistently > 10 seconds)

**Step 6 — Declare launch**
If no P0 issues in the first 2 hours, the launch is stable. Document the live URL in the project Linear board description.

---

### Rollback Procedure

If a critical bug is discovered after launch:

| Severity | Definition | Response |
|---|---|---|
| P0 | Users cannot complete intake or the dashboard is blank | Roll back to previous deployment in Vercel immediately, investigate in parallel |
| P1 | Vision Board fails to generate any image (API down or all generations time out) | Activate fallback templates as default, serve from storage — users still see a Vision Board, just not AI-generated |
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

-- Vision Board generation rate (profiles with a generated image)
SELECT
  COUNT(DISTINCT profile_id) as profiles_with_vision_board,
  (SELECT COUNT(*) FROM wedding_profiles) as total_profiles
FROM vision_boards WHERE image_url IS NOT NULL;

-- Average regeneration count per Vision Board
SELECT AVG(regeneration_count) FROM vision_boards;

-- Average shortlist size per profile
SELECT AVG(item_count) FROM (
  SELECT profile_id, COUNT(*) as item_count FROM shortlist_items GROUP BY profile_id
) t;

-- Total vendor shortlists created (profiles with ≥ 1 saved vendor)
SELECT COUNT(DISTINCT profile_id) FROM shortlist_items;
```

---

### Week 1 Targets (Internal)

These are not KPIs — they are health signals that confirm the product is working as intended. No external commitments on these numbers.

| Metric | Healthy signal |
|---|---|
| Intake completion rate | > 60% of users who start intake finish step 3 |
| Vision Board generation rate | > 80% of users who complete intake view their Vision Board |
| Vision Board engagement rate | > 50% of users who see the Vision Board interact with a callout |
| Shortlist creation rate | > 40% of users who reach the dashboard save ≥ 1 vendor |
| Zero P0 incidents | No rollbacks required in week 1 |

---

### What Constitutes a P0

A P0 requires an immediate response (within 1 hour) regardless of time of day:

- The landing page returns a 500 or fails to load
- The intake form cannot be submitted (API error on `POST /api/intake`)
- The Vision Board view fails to load for all users (not a generation failure — a code or API issue)
- The vendor grid is empty for all users (not a data issue — a code or API issue)
- The image generation API key is invalid or revoked (all generations fail, fallback must activate)
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
| `project_management_plan.md` | Linear issues with dependencies and sprints | Complete |
| `execution_plan.md` | This document — operational runbook | **Active** |
| `index.html` | Frontend prototype for UX validation | Reference |
