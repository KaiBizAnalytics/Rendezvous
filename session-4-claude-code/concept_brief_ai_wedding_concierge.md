# Concept Brief: Rendezvous — AI Wedding Concierge

**Source documents:** Opportunity Solution Tree, MVP PRD

---

## One-Line Concept

Rendezvous is an AI-powered wedding planning concierge that reduces planning time and stress by 50% — replacing scattered research with a single, personalized experience that finds the right vendors, surfaces realistic pricing, and guides couples through every decision.

---

## The Problem

Wedding planning is broken across five specific dimensions identified in user research:

1. **Vendor research takes too long.** Couples spend hours browsing only to find vendors are outside their budget, wrong for their guest count, or stylistically off. They want 5 relevant options, not 100 generic ones.
2. **Pricing is opaque.** Vendors rarely show realistic price ranges. Couples must contact many vendors individually just to build a budget estimate.
3. **Planning is fragmented.** Work happens across Google Sheets, Pinterest, Instagram, vendor sites, and email threads — none of which talk to each other or help couples make decisions.
4. **Decision fatigue is real.** Hundreds of small decisions accumulate quickly. Couples want decision support, not longer checklists or inspiration galleries.
5. **Personalization is missing.** Most platforms assume a generic Western wedding. Cultural traditions, guest counts, and budget constraints are afterthoughts, not inputs.

---

## The Product

Rendezvous is a web application built around an AI concierge at its core. The experience starts with a structured intake — collecting location, guest count, budget, date, style, and cultural requirements — then uses that profile to power everything downstream.

### AI Wedding Concierge
A conversational interface that guides couples through planning, answers questions, and provides tailored recommendations. Couples ask naturally ("Find venues under $15k in Vancouver" or "What vendors do I need for a Chinese tea ceremony?") and receive guidance grounded in their actual profile — not generic advice.

### Personalized Vendor Matching
Instead of browsing directories, couples receive a curated shortlist of 5--10 vendors matched to their budget, guest count, wedding style, cultural requirements, and location. MVP covers venues, caterers, photographers, and wedding planners.

### Transparent Pricing Engine
Aggregated pricing insights from vendors and real weddings, surfaced as estimated price ranges, budget planning tools, vendor price comparisons, and real-cost benchmarks. Budget filtering is a first-class feature, not an afterthought.

### Wedding Planning Hub
A centralized dashboard combining the vendor shortlist, budget estimates, task checklist, and timeline management. Replaces the current fragmented multi-tool workflow.

### Cultural Planning Modules
Optional planning layers tailored to specific wedding traditions — Indian ceremonies (mehndi, sangeet, multi-day events), Chinese ceremonies (tea ceremony, banquet), multicultural weddings, and LGBTQ+-friendly vendor discovery.

---

## Target Users

Engaged couples aged 25--40, planning weddings of 40--200 guests in urban markets. Tech-comfortable and budget-conscious, but time-constrained. Four key personas:

- Budget-conscious planners
- Highly organized planners managing complex weddings
- Multicultural couples with specific tradition requirements
- Busy professionals with limited planning bandwidth

---

## MVP Focus

The MVP narrows to the highest-impact early-stage problems: vendor discovery, price transparency, and decision support. Core MVP features:

| Feature | Purpose |
|---|---|
| Wedding intake questionnaire | Builds the couple's profile to personalize everything downstream |
| AI concierge chat | Conversational vendor recommendations, budget guidance, and planning advice |
| Personalized vendor recommendations | Curated shortlist filtered by budget, capacity, location, and cultural fit |
| Vendor comparison view | Side-by-side price range, capacity, features, and user notes |
| Basic planning dashboard | Vendor shortlist, budget estimates, and task checklist in one place |

**Out of scope for MVP:** Vendor booking and payments, full budget automation, guest RSVP management, seating charts, detailed timeline builders, multi-event planning workflows.

---

## Hypotheses Being Tested

1. Couples prefer curated recommendations over browsing directories.
2. Price transparency and budget filtering meaningfully reduce research time.
3. Couples will trust and engage with an AI concierge for planning guidance.
4. A centralized tool can replace the fragmented multi-tool workflow.

---

## How Success Is Measured

**Primary metrics:** Time to first vendor shortlist, onboarding completion rate, AI concierge interaction rate, shortlist creation rate.

**Secondary metrics:** Satisfaction with recommendations, weekly active users, vendor click-through rate.

---

## Technical Approach

- **Platform:** Web application
- **Frontend:** React
- **Backend:** API server for vendor data and user profiles
- **AI layer:** LLM-powered concierge for recommendations and Q&A
- **Data:** Vendor database with pricing estimates and cultural compatibility tags, driven by user profile inputs

---

## Key Risks

1. Users may not trust AI-generated recommendations.
2. Vendor pricing data may be incomplete or inconsistent.
3. Couples may default back to familiar tools like spreadsheets.

Validation experiments address trust, recommendation accuracy, and usability directly — not assumed.

---

## Future Direction

- Vendor booking and payment platform
- Full budget automation
- Guest list and RSVP management
- Cultural wedding templates
- Vendor review marketplace
- Collaborative planning tools for families

---

## Strategic Goal

Become the **default starting point for wedding planning** — the first thing couples open when they get engaged, and the one tool they actually keep using through to the wedding day.
