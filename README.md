# Rendezvous — AI Wedding Concierge

> *Plan the day you've imagined.*

Rendezvous is an AI-powered wedding planning concierge that replaces hours of fragmented vendor research with a personalised shortlist — driven by a structured intake of location, budget, guest count, date, style, and cultural requirements.

---

## The Problem

Wedding planning today is broken:

- **Vendor research is time-consuming** — couples spend hours browsing only to find vendors exceed their budget or don't fit their needs
- **Pricing is opaque** — 88% of vendors hide real pricing, forcing couples to contact dozens before getting a realistic quote
- **Tools are fragmented** — planning happens across Google Sheets, Pinterest, Instagram, and vendor websites with no central hub
- **Personalization is absent** — most platforms assume a generic Western wedding and ignore cultural traditions entirely

---

## The Solution

A couple-first AI concierge that inverts the discovery model:

1. **Structured intake** — location, date, guests, budget, style, cultural requirements
2. **AI-matched vendor shortlist** — scored by budget fit, capacity, cultural compatibility
3. **Concierge chat** — ask anything; answers are grounded in real vendor data, not generic advice
4. **Comparison and planning tools** — side-by-side vendor comparison, budget tracking, task checklist

---

## Repository Contents

This repository contains the full product discovery and planning document set produced during the Build-A-Thon.

### `session-4-claude-code/`

| File | Description |
|---|---|
| [`rendezvous_mvp_prd.md`](session-4-claude-code/rendezvous_mvp_prd.md) | Full MVP Product Requirements Document — features, scope, user flow, metrics, risks |
| [`opportunity_solution_tree.md`](session-4-claude-code/opportunity_solution_tree.md) | OST mapping user problems to solution concepts and assumption tests |
| [`concept_brief_ai_wedding_concierge.md`](session-4-claude-code/concept_brief_ai_wedding_concierge.md) | Synthesised concept brief covering the full product |
| [`style_guide.md`](session-4-claude-code/style_guide.md) | Full visual style guide — colours, typography, spacing, animation, components |
| [`market_analysis.md`](session-4-claude-code/market_analysis.md) | Competitive analysis of The Knot, Zola, WeddingWire, Bridebook, and Joy — features ranked by review evidence |
| [`architecture_plan.md`](session-4-claude-code/architecture_plan.md) | System architecture — stack, data model, API contracts, AI layer design |
| [`implementation_plan.md`](session-4-claude-code/implementation_plan.md) | Phase-by-phase build guide with commands, file paths, and acceptance criteria |
| [`project_management_plan.md`](session-4-claude-code/project_management_plan.md) | 39 Linear-compatible issues with dependencies, sizes, and sprint assignments |
| [`execution_plan.md`](session-4-claude-code/execution_plan.md) | Operational runbook — daily rhythm, sprint runbooks, risk playbook, launch sequence |
| [`prototype.html`](session-4-claude-code/prototype.html) | Interactive frontend prototype (open in browser — no build step required) |
| [`prompting_for_frontend_aesthetics.ipynb`](session-4-claude-code/prompting_for_frontend_aesthetics.ipynb) | Notebook covering frontend aesthetics prompting techniques |

### Root

| File | Description |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Claude Code instructions for this workspace |

---

## Product Vision

**MVP focus:** Vendor discovery, price transparency, decision support.

**Strategic goal:** Become the default starting point for wedding planning.

**Out of scope for MVP:** Booking and payments, RSVP management, seating charts, timeline builders.

---

## Key Differentiators

| Feature | Incumbents | Rendezvous |
|---|---|---|
| Price transparency | Optional, rarely enforced | Core to the intake → matching flow |
| Personalization | Inspiration-first (image matching) | Constraint-first (budget, guests, culture) |
| Multicultural support | Bilingual websites at best | Vendor tags by cultural capability |
| Business model | Vendor-pays marketplace | Couple-first — no advertising conflict |
| UX model | Browse directories | Concierge shortlist |

---

## Tech Stack (Planned)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth (magic link) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| State | Zustand + TanStack Query |
| Deployment | Vercel |

---

## Design Language

**Mood:** Romantic and editorial — a rooftop at golden hour.

**Typography:** Fraunces (display/headings) + DM Sans (body/UI)

**Palette:** Warm whites and champagne, accented with dusty rose (`#C9A49A`) and soft sage (`#8A9E8C`)

**Motion:** Staggered entrance animations, slow elegant transitions — motion is part of the personality.

See [`style_guide.md`](session-4-claude-code/style_guide.md) for the full specification.

---

## Getting Started with the Prototype

The interactive prototype requires no build step:

```bash
open session-4-claude-code/prototype.html
```

Or simply open the file in any browser. It demonstrates the full user flow: landing → intake → generating → dashboard with vendor matching, shortlist, and AI chat.

---

## Document Lineage

```
PRD + OST  ──►  Market Analysis  ──►  Architecture Plan
                                            │
                                    Implementation Plan
                                            │
                                    Project Management Plan (39 issues)
                                            │
                                      Execution Plan
```

Each document is derived from and consistent with the one before it. The PRD is the authoritative scope document.
