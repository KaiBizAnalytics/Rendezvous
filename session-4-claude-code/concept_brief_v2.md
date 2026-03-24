# Concept Brief: Rendezvous — AI Wedding Concierge (v2)

**Source documents:** Opportunity Solution Tree v2, MVP PRD v2
**Updated:** March 23, 2026
**Research base:** AI persona interviews (5) + real-person interviews with Vancouver couples (3: Chole, Jason, Nina)

---

## One-Line Concept

Rendezvous is an AI-powered wedding planning platform that helps couples go from "We're engaged — now what?" to a clear, personalized wedding vision with realistic budget breakdowns and curated vendor recommendations — replacing months of scattered research with a single guided experience that shows you your wedding before you plan it.

---

## What Changed (v1 → v2)

The original concept was built on AI persona interviews that emphasized vendor discovery and vendor lists. Three real-person interviews in Vancouver revealed a critical insight: **the biggest pain point is not finding vendors — it's not knowing where to start.**

| v1 Assumption | v2 Reality |
|---|---|
| Vendor research is the #1 pain point | Early-stage uncertainty is the #1 pain point — couples don't know what they need before they can search for it |
| Couples want a better vendor directory | Couples want structured guidance and a tangible vision of their wedding |
| Budget filtering solves the pricing problem | Budget allocation guidance — where to spend, and seeing trade-offs visually — is what couples actually need |
| AI chatbot is a core MVP feature | Couples distrust generic AI chat output; visual, specific, personalized proof earns trust before a conversational layer adds value |
| Inspiration helps planning | Inspiration platforms (Instagram, Pinterest, Xiaohongshu) increase decision fatigue, not reduce it |

The product vision shifts from **"AI-powered vendor marketplace"** to **"AI wedding guide that shows you your wedding and helps you make it real."**

---

## The Problem

Wedding planning is broken across seven dimensions identified across eight interviews (five AI personas, three real couples):

1. **The "0→1" problem.** Couples don't know where to start. They have no mental model for what a wedding involves, what order to do things in, or what's realistic for their budget. Nina: "At the beginning I had no direction." Chole: "I don't really know how all the pieces fit together." Even couples who hire professional planners still feel lost in the early weeks.

2. **Decision fatigue and inspiration overload.** Hundreds of small decisions accumulate into paralysis. Inspiration platforms make it worse by presenting endless beautiful options with no way to filter by budget, location, or feasibility. Chole: "Everything looks good, so I want to include everything."

3. **Budget allocation is opaque.** Total budget ranges are meaningless without knowing how to distribute money across categories. Vendor pricing is hidden. Generic AI tools give ranges too broad to be actionable. Nina: "ChatGPT gave me too wide of a budget range... it wasn't very useful."

4. **Planning is fragmented.** Work happens across spreadsheets, Pinterest, Instagram, vendor websites, email threads, and planner-provided trackers — none of which connect to each other. Chole: "I can list things, but I can't connect them together."

5. **Vendor trust and quality are unverifiable.** Even after finding vendors, couples have no reliable way to evaluate quality. Portfolios are curated, reviews are unreliable, comparison is nearly impossible. Jason: "They only show you their best work."

6. **AI earns skepticism, not trust.** Couples have tried AI tools and found them generic. Trust requires specificity, visual proof, and local relevance — not broad text recommendations. Chole: "I still trust human judgment more than a system's taste."

7. **Cultural personalization is absent.** Most platforms assume Western weddings. Multicultural couples face added complexity without tool support.

---

## The Product

Rendezvous is a web application that guides couples from their first moment of "now what?" to a confident wedding plan. The experience opens with a structured questionnaire, then immediately delivers a personalized visual mockup of the couple's wedding with an interactive budget breakdown — creating an emotional anchor point before any vendor discovery begins.

### Interactive Wedding Vision Board with Budget Breakdown ★ Hero Feature

The moment that earns trust and demonstrates value. After completing the style questionnaire, couples see a full-screen visual mockup of their dream wedding ceremony — styled to match their venue type, guest count, and aesthetic preferences — with annotated budget callout boxes overlaid on the image.

**User flow:**
1. User completes the questionnaire: outdoor venue, ~50 guests, $30,000 budget, elegant style.
2. A large overlay appears containing an **AI-generated ceremony scene image** uniquely created from their selections — matching their venue type, style, colour palette, and setting. (Example: an elegant outdoor garden ceremony with a draped floral arch, white chairs, lush backdrop — generated specifically for this couple's inputs.)
3. Annotated budget callout boxes are placed around the image, each linked to a visible element in the scene: Venue & Setup ($15,000), Florals & Décor ($4,000), Music & DJ ($3,000), MC & Host ($5,000), Photography & Video ($3,000).
4. Each callout box is clickable — expanding to show details, alternatives, or upgrade/downgrade options.
5. A total budget summary bar at the bottom shows allocated vs. remaining budget.

**Why this is the hero feature:**
- The AI-generated image is uniquely personal — no two couples see the same scene, which no competitor can offer.
- Solves the 0→1 problem by giving couples an immediate, tangible "big picture" of their specific wedding.
- Makes budget allocation intuitive and visual rather than abstract.
- Earns trust by demonstrating AI capability through visual proof, not text.
- Replaces inspiration doom-scrolling with one curated, budget-realistic, personalized vision.
- Creates an emotionally powerful, shareable moment that drives word-of-mouth.

### Personalized Vendor Matching

Instead of browsing directories, couples receive 5–10 curated vendor recommendations matched to their profile. The emphasis shifts from listing vendors to building decision confidence: each recommendation includes transparent pricing, capacity data, quality signals, and comparison context.

Matching criteria: budget fit (weighted by Vision Board allocations), guest capacity, wedding style, cultural requirements, and location. MVP covers venues, caterers, photographers, and wedding planners.

### Visual Budget Allocation Engine

Budget guidance specific to the couple's profile — not generic ranges. Uses location, guest count, style, and spending priorities to produce an itemized budget breakdown. Visualized through the Vision Board callout boxes and the planning dashboard.

Features: personalized budget splits, priority-weighted allocation (couples rank what matters most), trade-off visualization ("if you upgrade florals by $2k, here's where to reduce"), and real-cost benchmarks for the Vancouver market.

### Centralized Planning Hub

A single dashboard combining the Vision Board, vendor shortlist, budget tracker, and task checklist. Designed around the principle that tools must be connected — changing a budget allocation updates vendor recommendations; shortlisting a vendor updates the budget view.

### Cultural Wedding Planning Integration

Cultural awareness woven into the core experience. Questionnaire captures cultural context upfront; recommendations, budget templates, and vendor matching adapt accordingly.

---

## What's Not in the MVP

### AI Wedding Concierge Chat — Future Feature

A conversational chatbot that guides couples through planning step-by-step is a compelling long-term feature — but it's deferred from the MVP. The rationale:

- The Vision Board, vendor matching, and planning hub already address the core user problems without requiring a chatbot.
- Real interviews showed that couples distrust generic AI chat output. Trust must be earned through visual, structured experiences first.
- A chatbot introduces significant additional complexity (LLM integration, prompt engineering, streaming UX, trust calibration) that is better invested after the foundation is validated.
- Once couples are engaged with the Vision Board and vendor recommendations, a conversational layer can amplify trust and add decision-support depth in a future release.

---

## Target Users

Engaged couples aged 25–40, planning weddings of 40–200 guests in urban markets (starting with Vancouver). Tech-comfortable and budget-conscious, but time-constrained. Five key personas refined from research:

- **Lost starters** — engaged but have no idea where to begin (Chole, Nina) ★ primary target for MVP
- **Budget navigators** — know their total number but need help allocating it wisely
- **Decision-fatigued researchers** — drowning in inspiration and options, need curation
- **Multicultural planners** — coordinating multiple traditions and vendor requirements
- **Confidence seekers** — willing to pay more for certainty and peace of mind (Jason)

---

## MVP Focus

The MVP shifts from vendor-discovery-first to **vision-and-guidance-first**. The core experience loop is: understand → visualize → plan → discover vendors.

| Feature | Priority | Purpose |
|---|---|---|
| Wedding intake questionnaire | P0 | Builds the couple's profile to personalize everything downstream |
| **Interactive Vision Board with Budget Breakdown** ★ | P0 | Immediate emotional payoff + tangible budget guidance after questionnaire |
| Personalized vendor recommendations | P1 | Curated shortlist filtered by budget, capacity, location, and cultural fit |
| Vendor comparison view | P1 | Side-by-side price range, capacity, features, and user notes |
| Basic planning dashboard | P1 | Vision Board + vendor shortlist + budget tracker + task checklist in one place |
| AI concierge chat | **Future** | Conversational planning guidance — deferred until foundation is validated |

**Out of scope for MVP:** AI concierge chatbot, vendor booking and payments, full budget automation, guest RSVP management, seating charts, detailed timeline builders, multi-event planning workflows.

---

## Hypotheses Being Tested

1. **Vision Board engagement:** Couples who see a personalized visual mockup with budget breakdown are more likely to continue planning on the platform than those who go directly to vendor lists.
2. **Budget specificity builds trust:** Profile-specific budget breakdowns earn higher trust ratings than generic ranges.
3. **Curated recommendations beat directories:** 5 well-matched vendors outperform browsing 100 options.
4. **Centralized planning replaces fragmented workflows:** Couples who use the dashboard reduce their use of external spreadsheets and platforms.

---

## How Success Is Measured

**Primary metrics:**
- Vision Board interaction rate (% of users who click at least one budget callout after questionnaire)
- Onboarding completion rate (questionnaire → Vision Board → dashboard)
- Time to first vendor shortlist
- Vendor shortlist creation rate

**Secondary metrics:**
- User satisfaction with budget breakdown accuracy
- Weekly active users
- Vendor click-through rate from recommendations
- Net Promoter Score

---

## Technical Approach

- **Platform:** Web application (Next.js on Vercel)
- **Frontend:** React with Tailwind CSS
- **Backend:** Next.js API routes, Supabase (Postgres + Auth)
- **Vendor matching:** Deterministic scoring algorithm (TypeScript) — budget fit, capacity, cultural compatibility
- **Vision Board:** AI-generated ceremony scene images (via image generation API — e.g., DALL·E, Stability AI, or Midjourney API) with dynamic budget callout overlay (CSS/SVG); prompt constructed from questionnaire inputs (venue type, style, colour palette, guest count, cultural elements)
- **Data:** Vendor database with pricing estimates, cultural compatibility tags, and capacity data; Vancouver market as launch market

---

## Key Risks

1. **AI-generated image quality and consistency.** If the generated ceremony scene looks unrealistic, uncanny, or inconsistent with the couple's selections, it could undermine trust. Mitigation: invest in prompt engineering and style tuning; implement quality checks and fallback to curated templates if generation fails; allow users to regenerate.
2. **Image generation latency.** Generating a custom image takes time (5–15 seconds). If the wait feels too long, it could cause drop-off. Mitigation: engaging loading animation with progress messaging ("Designing your ceremony..."); pre-warm generation pipeline; optimize prompt for speed.
3. **Budget data accuracy.** Profile-specific budget breakdowns require reliable local pricing data. Mitigation: seed with researched Vancouver vendor data; surface confidence levels.
4. **Vendor coverage.** Jason's insight: "If I still have to go outside your platform to find vendors, then I don't need your platform." Mitigation: ensure sufficient vendor coverage in Vancouver before launch.
5. **No chatbot means less flexibility.** Without an AI chat, couples can't ask freeform questions. Mitigation: ensure the structured UI (Vision Board, vendor cards, comparison view, checklist) covers the most common planning needs; add contextual tooltips and guidance throughout.

---

## Future Direction

**Near-term (post-MVP):**
- AI wedding concierge chatbot (conversational planning guidance and decision support)
- Budget trade-off simulator ("What if I spent $2k more on florals?")
- Vendor review marketplace with verified couple reviews
- Vision Board image regeneration with style variations ("Show me a rustic version")

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

## Strategic Goal

Become the **default first step after getting engaged** — the one tool couples open to go from "now what?" to "I can see my wedding and I know how to get there." Not a vendor directory. Not a chatbot. A wedding guide.
