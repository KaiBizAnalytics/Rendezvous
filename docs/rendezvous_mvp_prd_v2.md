# MVP Product Requirements Document (PRD) — v2

## Product: Rendezvous — AI Wedding Concierge

**Updated:** March 23, 2026
**Source:** Opportunity Solution Tree v2, Concept Brief v2
**Research base:** AI persona interviews (5) + real-person interviews (3: Chole, Jason, Nina)

---

# 1. Product Overview

Rendezvous is an **AI-powered wedding planning platform** that helps couples go from "We're engaged — now what?" to a clear, personalized wedding vision with realistic budget breakdowns and curated vendor recommendations.

The v1 MVP concept focused on vendor discovery and an AI chatbot. Real-person interviews revealed that the core pain point is earlier and deeper: **couples don't know where to start, can't visualize their wedding, and have no framework for budget allocation.** Vendor discovery is a downstream need that only makes sense after the couple has a vision. A conversational chatbot, while valuable, adds complexity that is better invested after the visual, structured foundation is validated.

The updated MVP focuses on **solving the "0→1" problem first** — giving couples an immediate, tangible picture of their wedding with a personalized budget breakdown — then layering in curated vendor recommendations, comparison tools, and planning features.

---

# 2. Problem Statement

Wedding planning today suffers from seven key problems validated across eight user interviews:

1. **Early-stage uncertainty ("0→1" problem)** — Couples don't know what they need, in what order, or at what cost. Even those who hire professional planners feel lost in the first weeks. (Chole: "I don't really know how all the pieces fit together." Nina: "At the beginning I had no direction.")

2. **Decision fatigue and inspiration overload** — Hundreds of small decisions pile up. Inspiration platforms (Instagram, Pinterest, Xiaohongshu) amplify this by showing endless options with no budget or feasibility filter. (Chole: "Everything looks good, so I want to include everything.")

3. **Opaque budget allocation** — Couples know their total budget but not how to distribute it. Vendor pricing is hidden; generic AI tools give ranges too broad to be useful. (Nina: "ChatGPT gave me too wide of a budget range." Chole wants help distributing budget across categories based on priorities.)

4. **Fragmented planning tools** — Planning happens across spreadsheets, Instagram, vendor websites, email, and planner trackers — none of which connect. (Chole: "I can list things, but I can't connect them together.")

5. **Vendor trust and quality gaps** — Vendor portfolios are curated, reviews are unreliable, and comparison is nearly impossible. (Jason: "They only show you their best work." Jason: "If I still have to go outside your platform to find vendors, then I don't need your platform.")

6. **AI trust gap** — Couples who have tried AI tools found them generic and unhelpful. Trust requires specificity, visual proof, and local relevance. (Chole: "I still trust human judgment more than a system's taste." Nina: "I prefer a human wedding consultant because it's more worry-free.")

7. **Cultural personalization is absent** — Most platforms assume Western weddings. Multicultural couples face additional complexity without tool support.

---

# 3. Product Vision

Create a **personalized wedding planning guide** that:

- Shows couples their wedding before they plan it (Vision Board)
- Provides specific, profile-based budget allocation guidance
- Recommends realistic vendors matched to their unique profile
- Organizes everything in one connected hub

The long-term goal is to become the **default first step after getting engaged**.

---

# 4. Target Users

## Primary User Segment

Engaged couples planning weddings in urban markets (launch market: Vancouver, BC).

Typical characteristics:
- Age: 25–40
- Tech-comfortable
- Budget-conscious but value convenience and confidence
- Planning weddings between **40–200 guests**
- Often in early-stage planning (0–3 months post-engagement)

### Key Personas (Refined from Real Interviews)

1. **Lost starters** — no idea where to begin; need structure and a "big picture" (Chole, Nina) ★ primary target
2. **Budget navigators** — know total budget, need help allocating it wisely across categories
3. **Decision-fatigued researchers** — overwhelmed by options, want curation not more inspiration
4. **Confidence seekers** — willing to pay more for certainty; need quality signals and comparison tools (Jason)
5. **Multicultural planners** — coordinating multiple traditions and culturally-aware vendors (Li Na)

---

# 5. MVP Goals

The MVP aims to validate the following hypotheses:

1. **Vision Board drives engagement:** Couples who see a personalized visual mockup with budget breakdown after the questionnaire are more likely to continue planning on the platform than those who see a vendor list.
2. **Specific budget breakdowns build trust:** Profile-based budget allocations ("Venue: $15k, Florals: $4k") earn higher trust than generic ranges ("$20k–$50k").
3. **Curated vendor recommendations beat directories:** 5 well-matched recommendations outperform browsing 100 options.
4. **A connected hub replaces fragmented tools:** Couples who use the dashboard reduce reliance on external spreadsheets and platforms.

---

# 6. Success Metrics

**Primary Metrics:**
- Vision Board interaction rate (% of users clicking ≥1 budget callout after questionnaire)
- Onboarding completion rate (questionnaire start → Vision Board → dashboard)
- Time to first vendor shortlist
- Vendor shortlist creation rate

**Secondary Metrics:**
- User satisfaction with budget breakdown accuracy (survey)
- Weekly active users
- Vendor click-through rate from recommendations
- Net Promoter Score

**Healthy Launch Signals (Week 1):**

| Metric | Target |
|---|---|
| Questionnaire completion rate | >60% of users who start |
| Vision Board interaction rate | >50% click at least one callout |
| Shortlist creation rate | >40% of dashboard users save ≥1 vendor |

---

# 7. MVP Scope

## Core Features (in priority order)

### 1. Wedding Intake Questionnaire — P0

**Purpose:** Collect the information needed to generate a personalized Vision Board and budget breakdown, and to power all downstream recommendations.

**Inputs:**
- Wedding location (city/region)
- Wedding date (or preferred season/year)
- Date flexibility
- Venue preference (indoor / outdoor / mix / no preference)
- Guest count
- Total budget range
- Spending priority ranking (venue, photographer, catering, florals, music, etc.)
- Wedding style/vibe (elegant, rustic, boho, modern, romantic, fun/casual)
- Colour palette or theme (optional)
- Cultural / religious considerations (optional)
- Dietary considerations (optional)

**Output:** Structured `WeddingProfile` used by the Vision Board generator and vendor matching engine.

**Design notes:**
- 3-step flow: (1) Date & Location, (2) Guests, Budget & Priorities, (3) Style & Vision.
- Must feel like a conversation, not a form — warm copy, progress indicators, minimal friction.
- Spending priority ranking is critical for the budget allocation algorithm.

---

### 2. Interactive Wedding Vision Board with Budget Breakdown — P0 ★ Hero Feature

**Purpose:** Deliver an immediate, emotional "this is your wedding" moment after the questionnaire — solving the 0→1 problem and making budget allocation tangible.

**User flow:**
1. User completes the questionnaire (e.g., outdoor venue, ~50 guests, $30,000 budget, elegant style).
2. A loading animation plays while the AI generates a unique ceremony scene ("Designing your ceremony...").
3. A full-screen overlay/pop-up appears containing:
   - An **AI-generated ceremony scene image** created uniquely from the couple's questionnaire inputs — matching their venue type, style, colour palette, guest count, and cultural elements. (Example: an elegant outdoor garden ceremony with a draped floral arch, white folding chairs in rows, lush garden backdrop — generated specifically for this couple.)
   - **Annotated budget callout boxes** positioned around the image, each linked to a visible element:
     - **Venue & Setup** — $15,000
     - **Florals & Décor** — $4,000
     - **Music & DJ** — $3,000
     - **MC & Host** — $5,000
     - **Photography & Video** — $3,000
   - Visual connector lines from each callout to its corresponding element in the scene.
4. Each callout box is **clickable** — expanding to show:
   - What's included in that budget allocation
   - Alternative spend levels (e.g., "Budget: $2,500 / Standard: $4,000 / Premium: $6,000")
   - How changing this allocation affects remaining budget
5. A **total budget summary bar** at the bottom shows allocated vs. remaining budget.
6. Users can **adjust allocations** and see the Vision Board update in response.
7. A **"Regenerate Scene"** button allows users to generate a new variation if they want to explore different looks.
8. A "Continue to My Dashboard" CTA leads to the planning hub.

**Budget allocation algorithm:**
- Base allocations derived from spending priority rankings × total budget × location-based cost benchmarks.
- Vancouver market data seeds the initial model.
- Category percentages shift based on user's ranked priorities (e.g., if photography is ranked #1, that category gets a higher share).

**Technical approach (MVP):**
- Vision Board uses **AI-generated ceremony scene images** created via an image generation API (e.g., DALL·E 3, Stability AI SDXL, or Midjourney API).
- A structured prompt is constructed from the couple's questionnaire inputs: venue type, wedding style, colour palette, cultural elements, and setting preferences. Example prompt: "An elegant outdoor garden wedding ceremony with a draped floral arch in blush and white, white folding chairs arranged in rows for approximately 50 guests, lush green garden backdrop, soft natural lighting, photorealistic style."
- Budget callout overlay is rendered via CSS/SVG positioned over the generated image.
- Budget calculations are deterministic (rule-based, not LLM-generated).
- A "Regenerate Scene" button triggers a new image generation with slight prompt variation for variety.
- Fallback: if image generation fails or times out, display a curated high-quality template image matched to style + venue type while retrying in the background.
- Target generation time: <10 seconds. Loading animation with progress messaging during generation.

**Acceptance criteria:**
- [ ] Vision Board appears as a full-screen overlay after questionnaire submission
- [ ] AI-generated scene image reflects the user's venue type (indoor/outdoor/garden/beach), style (elegant/rustic/boho/modern), and colour palette
- [ ] Image generation completes in <10 seconds with a loading animation during generation
- [ ] If image generation fails, a curated fallback template is displayed while retrying
- [ ] "Regenerate Scene" button produces a visually distinct variation
- [ ] At least 5 budget callout boxes are displayed with dollar amounts totaling ≤ the user's total budget
- [ ] Each callout is clickable and shows expanded detail
- [ ] Budget summary bar displays correct allocated vs. remaining amounts
- [ ] Adjusting an allocation updates the remaining budget in real time
- [ ] "Continue to My Dashboard" navigates to the dashboard with profile, budget data, and generated image persisted

---

### 3. Personalized Vendor Recommendations — P1

**Purpose:** Curated vendor shortlist that builds decision confidence — not a directory to browse.

**Vendor categories for MVP:** Venues, Caterers, Photographers, Wedding Planners.

**Matching and display:**
- Budget fit (weighted 40%), capacity match (30%), cultural compatibility (20%), profile completeness (10%)
- Each recommendation shows: estimated price range, capacity, key features, cultural tags, match score
- 5–10 vendors per category, sorted by match score
- Transparent reasoning: "This venue scores 85% because it fits your budget, accommodates 70 guests, and supports outdoor ceremonies"

**Key integration:** Vendor budget-fit scoring uses the Vision Board allocations per category (not just total budget). If a user allocated $15k to venue on the Vision Board, venue recommendations filter against that $15k, not the full $30k.

**Acceptance criteria:**
- [ ] Recommendations are generated from the vendor database, not hallucinated
- [ ] Match scores are deterministic and explainable
- [ ] Budget-fit scoring uses the Vision Board category allocations
- [ ] Each vendor card links to detailed vendor information
- [ ] Category filters work correctly (venues, caterers, photographers, planners)

---

### 4. Vendor Comparison View — P1

**Purpose:** Side-by-side comparison of shortlisted vendors to support confident decision-making.

**Display:** Estimated price range, capacity, key features, match score, cultural compatibility, and editable user notes. Max 4 vendors compared at once.

**Acceptance criteria:**
- [ ] Comparison table renders when ≥2 vendors are shortlisted
- [ ] Price ranges formatted as CAD
- [ ] Notes field saves on blur
- [ ] Remove button works per vendor column

---

### 5. Planning Dashboard — P1

**Purpose:** Central hub that connects Vision Board, vendor shortlist, budget tracker, and task checklist.

**Components:**
- Vision Board summary (clickable to re-open full overlay)
- Vendor shortlist sidebar
- Budget tracker (reflecting Vision Board allocations and adjustments)
- Task checklist (15 seeded tasks grouped by timeline: "12+ months out", "6–12 months", "3–6 months", "1–3 months", "Final month")

**Design principle:** Connected, not siloed. Shortlisting a venue should update the budget view. Changing a budget allocation should flag if current shortlisted vendors are still in range.

**Acceptance criteria:**
- [ ] Dashboard loads with Vision Board summary, vendor grid, budget summary, and checklist
- [ ] Clicking Vision Board summary reopens the full overlay
- [ ] Vendor shortlist persists across refreshes
- [ ] Budget tracker reflects Vision Board allocations
- [ ] Checklist displays 15 seeded tasks with timeline groupings

---

# 8. Out of Scope (For MVP)

The following will **not** be included in the MVP:

- **AI concierge chatbot** (deferred to post-MVP — see §14)
- Vendor booking and payments
- Full budget automation (manual adjustments only)
- Guest RSVP management
- Seating charts
- Detailed timeline builders
- Multi-event planning workflows
- Real-time vendor availability checking
- Vendor reviews or ratings marketplace

---

# 9. User Flow (Updated)

1. User lands on homepage → sees value proposition and CTA
2. User completes 3-step wedding intake questionnaire
3. **Vision Board overlay appears** — personalized ceremony scene with interactive budget callouts ★
4. User explores budget allocations, clicks callout boxes, adjusts priorities
5. User continues to planning dashboard
6. User reviews personalized vendor recommendations
7. User saves vendors to shortlist
8. User compares shortlisted vendors
9. User uses checklist to track planning progress

---

# 10. Technical Approach

**Platform:** Web application (Next.js on Vercel)

**Core components:**

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Tailwind CSS | UI, Vision Board overlay, dashboard |
| Backend | Next.js API routes | Intake, vendor matching, budget calculations, image generation orchestration |
| Database | Supabase (Postgres + Auth) | User profiles, vendor data, shortlists, checklists, generated image references |
| Image generation | AI image API (DALL·E 3, Stability AI, or Midjourney) | Personalized ceremony scene images for Vision Board |
| Vendor matching | Deterministic scoring (TypeScript) | Budget-fit, capacity, cultural compatibility |
| Budget engine | Rule-based allocation (TypeScript) | Priority-weighted budget splits, trade-off calculations |
| Vision Board | AI-generated image + CSS/SVG overlay | Personalized ceremony scene with budget callouts |

**Vision Board technical detail:**
- **Image generation pipeline:** Questionnaire inputs → prompt construction function → image generation API call → image storage (Supabase Storage or CDN) → display in overlay.
- **Prompt construction:** A `buildImagePrompt(profile)` function maps questionnaire fields to descriptive prompt segments. Venue type determines setting, style determines aesthetic vocabulary, colour palette determines tones, cultural fields add ceremony-specific elements (e.g., tea ceremony setup, mandap).
- **Example prompt output:** "A photorealistic elegant outdoor garden wedding ceremony, draped floral arch in blush pink and ivory, white folding chairs arranged in rows for approximately 50 guests, lush green hedges and trees in background, soft golden hour lighting, shot from the perspective of a guest looking toward the altar."
- **Fallback strategy:** If generation fails or exceeds 15-second timeout, display a curated high-quality template image matched to style + venue type. Retry generation in background; notify user when ready.
- **Image caching:** Generated images are stored and associated with the user's profile. Regeneration creates a new image without deleting the original.
- **Budget callout overlay:** Absolutely-positioned SVG elements with connector lines, rendered over the generated image. Callout positions are pre-mapped to image zones (top-center for arch/décor, bottom-left for seating, etc.).
- **Budget calculations:** Pure functions — `allocateBudget(profile)` returns category breakdowns based on total budget, guest count, location benchmarks, and priority rankings.
- **Interaction:** Clicking a callout opens an expandable detail panel; adjusting allocations triggers recalculation and re-renders the summary bar.

**What's NOT in the tech stack for MVP:**
- No LLM/chat integration (AI concierge chatbot is deferred). All vendor recommendations and budget calculations are deterministic.
- No real-time vendor availability checking.

---

# 11. Risks & Assumptions

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| AI-generated image quality is inconsistent or unrealistic | High — undermines hero feature and trust | Medium | Invest in prompt engineering; implement quality checks; maintain curated fallback templates; allow regeneration |
| Image generation latency causes drop-off | High — users abandon during loading | Medium | Target <10s generation; engaging loading animation with progress messages; pre-warm API; optimize prompts for speed |
| Image generation API cost or rate limits | Medium — affects scalability | Medium | Cache generated images per user; limit regenerations (e.g., 3 per session); evaluate cost-effective API options |
| Budget breakdown accuracy is questioned | High — erodes trust | Medium | Seed with researched Vancouver market data; show confidence levels; allow manual overrides |
| Vendor coverage is insufficient for Vancouver | Medium — Jason's "platform completeness" concern | Low | Seed 50+ Vancouver vendors across 4 categories before launch; prioritize quality over quantity |
| No chatbot limits flexibility | Medium — couples can't ask freeform questions | Low | Ensure structured UI covers common needs; add contextual tooltips, FAQ sections, and guided prompts throughout the dashboard |
| Couples default back to spreadsheets | Medium — reduces retention | Medium | Make the dashboard genuinely better than a spreadsheet by connecting budget, vendors, and checklist |

**Key assumptions to validate:**
- Couples will complete a 3-step questionnaire before seeing value.
- AI-generated ceremony images are compelling enough to create an emotional "wow" moment and build trust.
- Image generation latency (<10 seconds) is acceptable with a well-designed loading experience.
- Vancouver market pricing data is accurate enough for specific budget allocations.
- The Vision Board + vendor matching is sufficient to validate the product without a chatbot.
- Structured UI guidance (tooltips, checklists, contextual prompts) can substitute for conversational AI in the short term.

---

# 12. Future Expansion

**Near-term (post-MVP — highest priority):**
- **AI wedding concierge chatbot** — conversational planning guidance, decision support, budget advice, and freeform Q&A. This is the top post-MVP feature, layered on after the visual foundation is validated.
- Vision Board image style variations ("Show me a rustic version of my wedding")
- Budget trade-off simulator ("What if I spent $2k more on florals?")
- Vendor review marketplace with verified couple reviews

**Medium-term:**
- Multi-city expansion (Toronto, Seattle)
- Vendor booking and payment integration
- Full budget automation with real-time tracking
- Cultural wedding ceremony planning workflows
- Collaborative planning tools for families and wedding parties

**Long-term:**
- Guest list and RSVP management
- Seating chart tools
- Day-of timeline and coordination
- Wedding vendor CRM (B2B revenue model)

---

# 13. MVP Summary

The MVP shifts the product from **vendor-directory-first** to **vision-and-guidance-first**. The core experience loop is:

**Understand → Visualize → Plan → Discover**

By leading with the **Interactive Wedding Vision Board** — showing couples a personalized picture of their wedding with realistic budget breakdowns — Rendezvous solves the "0→1" problem that real couples identified as their biggest pain point. Personalized vendor recommendations, comparison tools, and planning features follow as natural next steps once the couple has a clear vision and budget framework.

The hero moment is not "here are 100 vendors" or "chat with an AI." It's "here's your wedding — and here's how to make it happen."

---

# 14. AI Concierge Chat — Post-MVP Roadmap

The conversational AI chatbot is the **#1 post-MVP priority**. It is deferred from the initial release but should be the first major feature added after launch validation.

**Why it's deferred:**
- The Vision Board, vendor matching, and planning hub already address core user problems without requiring LLM integration.
- Real interviews showed couples distrust generic AI chat output — visual, structured proof must come first.
- Removing the chatbot from MVP significantly reduces technical complexity (no LLM API integration, no streaming UX, no prompt engineering, no hallucination guardrails).
- The MVP can validate the core value proposition without conversational AI.

**When to build it:**
- After launch, if Vision Board interaction rate >50% and shortlist creation rate >40%, the foundation is validated and adding a conversational layer will amplify engagement.
- If user feedback consistently requests freeform Q&A or planning guidance beyond what the structured UI provides, prioritize chatbot development.

**Planned capabilities:**
- Step-by-step planning guidance grounded in the couple's profile
- Budget-aware recommendations referencing Vision Board allocations
- Vendor comparison and trade-off analysis
- Cultural ceremony guidance
- Contextual help ("What should I do next?")
