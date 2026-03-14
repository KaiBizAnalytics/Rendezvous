# Weekly Check-in Documentation: Session 4 – Prototype Building with Claude Code (March 13)

**Team Name:** Rendezvous
**Project:** AI-Driven Personalized Wedding Planner

---

## 1. Session Overview

This session marked a significant shift in the team's working method: rather than using AI to conduct research and generate planning artefacts, we used Claude Code — Anthropic's CLI-based agentic coding tool — to **build a working front-end prototype** of the Rendezvous product directly from our accumulated planning documents.

The session demonstrated that the full product discovery pipeline (personas, interviews, OST, PRD, style guide) created in prior sessions could serve as a live, actionable brief for AI-assisted implementation. Claude Code read our own documents and used them as the source of truth to generate code, vendor data, and UI logic.

---

## 2. Documents & Artefacts Produced

Across Sessions 1–4, the team has now produced the following body of work entirely using AI tools:

### Planning & Research (Sessions 1–3)
- **`Feb 21_ Product Discovery Session Notes.docx`** — Initial market research synthesis. Identified key pain points: decision fatigue, fragmented tools, distrust of platforms like The Knot, and the gap between AI utility tasks (budgeting, admin) vs. deeply personal planning.
- **`Mar 04_ Interview Snapshots.docx`** — Hypothesis validation via five AI personas (Karen Thompson, Jason Miller, Arjun Patel, Li Na Chen, Mateo Alvarez). Confirmed the pain points are real. Applied Cynefin model for scope categorisation. Decided to de-scope toward an aggressive MVP.
- **`session-4-claude-code/opportunity_solution_tree.md`** — OST mapping user problems to solution concepts and assumption tests.
- **`session-4-claude-code/rendezvous_mvp_prd.md`** — Full MVP PRD. Source of truth for features, user flow, metrics, and risks. Defines scope boundaries: vendor discovery, price transparency, and decision support are in; booking/payments, RSVP management, and seating charts are out.
- **`session-4-claude-code/concept_brief_ai_wedding_concierge.md`** — Synthesised concept brief combining OST and PRD insights into a single product narrative.
- **`session-4-claude-code/market_analysis.md`** — Competitive landscape and differentiator analysis.
- **`session-4-claude-code/vancouver_wedding_venues.md`** — Curated research dataset of 38 Vancouver and Sea-to-Sky wedding venues with full details: capacity, pricing, catering policies, cultural accommodation, style tags, and logistics.
- **`session-4-claude-code/wedding-questionnaire.md`** — Client intake questionnaire covering all planning dimensions: Client Information, The Date, The Location, Guest List, Budget, Style & Vision, and Optional Details.

### Build Planning (Session 4 — Early)
- **`session-4-claude-code/architecture_plan.md`** — Full system design, data model, API contracts, and infrastructure decisions (Next.js, Supabase, Vercel, Claude API).
- **`session-4-claude-code/implementation_plan.md`** — Code-level build guide organised by phase.
- **`session-4-claude-code/project_management_plan.md`** — 39 Linear issues with sprint assignments, size estimates, and dependency chains.
- **`session-4-claude-code/execution_plan.md`** — Operational runbook: day-by-day sprint guides, daily operating rhythm, risk response playbook, and launch sequence.

### Front-End Prototype (Session 4 — Build)
- **`index.html`** — A fully functional single-page prototype deployed to Vercel. Includes:
  - **Hero section** — Full-bleed wedding photo background with cursor-driven parallax (lerp animation), dark gradient veil for text legibility, lavender cursor light effect with `mix-blend-mode: screen`, and frosted glass pill CTA buttons.
  - **4-step intake wizard** — Collects all questionnaire fields across logical groupings: personal info + date flexibility / location + guests / budget + spending priorities / style + cultural requirements.
  - **Vendor discovery dashboard** — 47 vendor entries (38 real Vancouver venues + caterers, photographers, planners) rendered as filterable cards with match scores.
  - **Style guide implementation** — All visual tokens from the style guide applied: Fraunces display serif, DM Sans body, warm white/champagne/dusty rose palette via CSS variables, staggered page-load animations, and subtle elevation using backdrop blur rather than drop shadows.
- **`session-4-claude-code/style_guide.md`** — Updated to v1.1 during the build session to capture all design decisions made in the prototype: hero photo overlay colours, cursor parallax JS pattern, frosted glass pill component variant, and the full landing hero photo treatment.
- **`CLAUDE.md`** — Updated to include the prototype architecture, view system, intake step map, and deployment approach so future Claude Code sessions can pick up context immediately.
- **`index-backup.html`** — Safe restore point created before the photo background redesign.

---

## 3. Technical Approach

The prototype was built as a **single HTML file** (`index.html`) with no build tooling, enabling instant deployment to Vercel as a static site. All UI state is managed in vanilla JS; view switching is handled by an opacity-fade `show(id)` system. This approach prioritised speed of iteration over production architecture — the goal was a demo-quality prototype, not a scalable codebase.

**Key design decisions made during the build:**

- **Photo parallax implementation:** CSS `background-image` on the section element cannot be transformed by JS. The solution was to isolate the photo into a child `.scene-photo` div oversized at `inset: -6% -5%`, allowing up to ±38px of horizontal movement without revealing gaps at the edges. A `lerp` animation loop drives the translate.
- **Text contrast on variable photography:** Three-layer contrast approach: (1) dark gradient overlay heaviest at top/bottom edges, lighter in the midzone; (2) radial dark ellipse centred behind the headline; (3) strong `text-shadow: rgba(10,4,8,0.70)` on every hero text element.
- **Real venue data:** All 38 venues from the research document were manually extracted and encoded into the vendor JS array, preserving capacity, pricing ranges, style tags, and match scores.

---

## 4. What Claude Code Can Do

This session served as a live demonstration of Claude Code as a product development tool. Key capabilities exercised:

- **Read and reason across multiple documents simultaneously** — Claude Code held the PRD, style guide, questionnaire, and venue research in context and cross-referenced them to make consistent build decisions.
- **Iterative visual design** — Multiple rounds of feedback ("too dark," "text is unreadable," "restore the parallax") were resolved without losing prior work. The backup-first pattern (`index-backup.html`) gave the team a safety net for risky changes.
- **Data transformation** — 38 venue records from a markdown research document were parsed and converted into structured JS objects with appropriate data types in a single pass.
- **Documentation updates** — After the build session, Claude Code updated both `style_guide.md` and `CLAUDE.md` to reflect all design decisions, creating a self-documenting development loop.

---

## 5. Reflection: A Pivot in Product Vision

As we completed the prototype, we noticed something worth examining directly.

**What we built** is, in essence, a vendor list with a structured intake form and a basic match score. The prototype surfaces real venue data, filters by category, and collects the couple's requirements — but it does not yet do anything distinctly AI-powered that could not be approximated by a well-designed directory site.

**What we originally imagined** was something categorically different: a product where you could input your budget and immediately *see* your wedding — a grand, visually immersive experience that would dynamically render different aesthetic moods, venue styles, décor concepts, and atmosphere based on where a slider moved. The vision was generative and visual: AI not just recommending, but *showing* you a version of your day before you have made any decisions. That product would require image generation, real-time personalisation of visual assets, and a fundamentally different technical architecture.

The gap between these two visions is significant. We believe the reason our prototype converged on the vendor list model is that **our AI persona interviews strongly signalled vendor information as the primary pain point** — multiple personas cited difficulty finding accurate pricing, comparing options, and understanding what is and is not included. Because we were designing against that signal, we built toward it.

But AI personas are not real people. Their answers reflect patterns from training data, not lived experience. The "vendor clarity" pain point may be real — or it may be an artefact of how AI personas reason about wedding planning. The visual wedding experience we originally envisioned may be what users actually want, even if they cannot articulate it in an interview.

---

## 6. Next Steps: Real Person Interviews

To resolve this question, **we are conducting real person interviews this week** — specifically to validate or challenge the vendor-list direction and to understand whether the visual generative wedding experience resonates with actual couples.

**Focus questions for interviews:**
- **The Pivot:** When asked about the "AI Wedding Concierge" for the first time — does their eye light up at the idea of finding vendors easily, or at the idea of seeing their wedding visualised?
- **The Gap:** Do real couples experience vendor discovery as their primary planning pain, or does the stress live elsewhere (decision overload, partner alignment, family input)?
- **The Vision:** When shown a concept like "move a budget slider and watch your wedding change" — does that feel useful, gimmicky, or genuinely magical?
- **The Trust Signal:** Would they trust an AI-generated visual enough to base real decisions on it?

Interview findings will be synthesised in the next weekly check-in. Depending on results, the team may maintain the current vendor discovery trajectory or pivot toward the visual/generative concept as the core product differentiator.

---

*Session 4 facilitated with Claude Code (claude.ai/code) — prototype built, documents generated, and design decisions captured entirely within the AI-assisted workflow.*
