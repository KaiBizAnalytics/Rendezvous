# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

This is a **product discovery workspace** for a Build-A-Thon project — not a code repository. There are no build commands, tests, or deployable artifacts. Work here involves analyzing documents, generating product artifacts, and supporting AI-assisted product discovery exercises.

---

## The Product: Rendezvous — AI Wedding Concierge

Rendezvous is an AI-powered wedding planning concierge. The core value proposition is replacing hours of fragmented vendor research with a personalized shortlist driven by a structured intake (location, budget, guest count, date, style, cultural requirements).

**Strategic goal:** Become the default starting point for wedding planning.

**MVP focus:** Vendor discovery, price transparency, and decision support. Out of scope for MVP: booking/payments, RSVP management, seating charts, timeline builders.

---

## Key Documents

| File | Purpose |
|---|---|
| `session-4-claude-code/rendezvous_mvp_prd.md` | Full MVP PRD — source of truth for features, scope, user flow, metrics, and risks |
| `session-4-claude-code/opportunity_solution_tree.md` | OST mapping user problems to solution concepts and assumption tests |
| `session-4-claude-code/concept_brief_ai_wedding_concierge.md` | Synthesized concept brief covering the full product across both documents |
| `session-4-claude-code/style_guide.md` | Full visual style guide — colors, typography, spacing, animation, components |
| `Product Discovery/` | Workshop templates, examples, and AI persona prompt files |
| `Interview/` | Interview snapshots for each of the five user personas |

---

## User Personas

Five AI personas are defined for simulated user interviews. Each persona file contains a full system prompt for roleplay. When asked to respond "as" a persona, use the corresponding file.

| Persona | File | Key trait |
|---|---|---|
| Karen Thompson | `Product Discovery/Karen Thompson.md` | Highly organized, 120-guest, $40–60k, demanding about quality and reliability |
| Jason Miller | `Product Discovery/Jason Miller.md` | Budget-first, 40–60 guests, $10–15k, Vancouver, wants transparent pricing |
| Arjun Patel | `Product Discovery/Arjun Patel.md` | Indian traditions in Vancouver, 80–120 guests, cross-cultural complexity |
| Li Na Chen | `Product Discovery/Li Na Chen.md` | Chinese Canadian, 200 guests, $60k, decision fatigue, time-constrained |
| Mateo Alvarez | `Product Discovery/Mateo Alvarez.md` | Same-sex wedding, Mexican traditions, budget-aware, logistics-focused |

---

## Frontend Aesthetics

When generating any frontend HTML/CSS/JS for this project, append the following to the system prompt:

```
<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. Avoid converging on common choices (Space Grotesk, for example) across generations — think outside the box.
</frontend_aesthetics>
```

Once project-specific style decisions are captured below, also include those as additional constraints in the system prompt so Claude generates on-brand output from the start.

---

## Project Style: Rendezvous

When generating frontend for Rendezvous, apply these style constraints on top of the aesthetics prompt above:

**Mood:** Romantic and editorial — feels like flipping through a beautiful wedding magazine. Evokes a rooftop terrace at golden hour: warm light, open air, romantic but relaxed. Never clinical, never corporate.

**Theme:** Light by default with a dark mode option. The light theme is the primary design surface.

**Color palette:** Soft and timeless. Base in warm whites and champagne. Accent with dusty rose and soft sage. Avoid cold whites, harsh grays, and anything that reads as generic bridal (no hot pink, no millennial blush + gold clichés). CSS variables required for all color tokens.

**Typography:** Display serif for all headings (consider Fraunces, Cormorant Garamond, or Playfair Display — choose the most editorial option). Clean, refined sans-serif for body and UI text. Strong size contrast between heading and body scales — think magazine hierarchy, not app hierarchy.

**Reference:** Luxury hotel website aesthetic — slow, atmospheric, generous spacing, full-bleed moments. Content breathes. Nothing feels crowded or rushed.

**Animation:** Expressive — motion is part of the personality. Page load should feel like a reveal. Use staggered entrance animations, slow elegant transitions, and micro-interactions that reward attention. CSS-only preferred; Motion library if React is used.

**The vibe in one sentence:** A rooftop at golden hour — romantic, editorial, unhurried, and just a little magical.

---

## Working Conventions

- The primary output format for product artifacts is Markdown (`.md`), saved into `session-4-claude-code/`.
- Interview transcripts and workshop outputs are stored as `.docx` files — read them with the Read tool (supports `.docx`).
- When generating new product artifacts, ground them in the PRD and OST rather than inventing requirements.
- The PRD is the authoritative scope document. If there is a conflict between the OST and PRD, defer to the PRD.
