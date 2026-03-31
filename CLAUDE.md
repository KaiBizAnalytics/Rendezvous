# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

This is a **Build-A-Thon project** that began as a product discovery workspace and has evolved into a working deployed prototype. It now contains both product planning documents and a live single-file SPA prototype deployed on Vercel. Work here involves both product artifact generation (markdown documents) and direct prototype development in `index.html`.

---

## The Product: Rendezvous — AI Wedding Concierge

Rendezvous is an AI-powered wedding planning concierge. The core value proposition is replacing hours of fragmented vendor research with a personalized shortlist driven by a structured intake (location, budget, guest count, date, style, cultural requirements).

**Strategic goal:** Become the default starting point for wedding planning.

**MVP focus:** Vendor discovery, price transparency, and decision support. Out of scope for MVP: booking/payments, RSVP management, seating charts, timeline builders.

---

## Key Documents

| File | Purpose |
|---|---|
| `docs/rendezvous_mvp_prd.md` | Full MVP PRD — source of truth for features, scope, user flow, metrics, and risks |
| `docs/opportunity_solution_tree.md` | OST mapping user problems to solution concepts and assumption tests |
| `docs/concept_brief_ai_wedding_concierge.md` | Synthesized concept brief covering the full product across both documents |
| `docs/style_guide.md` | Full visual style guide — colors, typography, spacing, animation, components |
| `docs/wedding-questionnaire.md` | Source questionnaire defining all intake form fields and options |
| `docs/vancouver_wedding_venues.md` | Source of truth for all 38 Vancouver vendor records — used to populate and enrich vendor data |
| `docs/build_progress.md` | Running log of features shipped, design decisions, and current status |
| `index.html` | Live prototype — single-file SPA deployed on Vercel. All UI lives here. |
| `index-backup.html` | Previous working version of the prototype (safe restore point) |
| `api/generate-image.js` | Vercel serverless function — calls OpenAI `gpt-image-1` to generate the vision board scene |
| `wedding photo.jpg` | Hero background photo. Replace this file to change the landing hero image. |
| `cover_photo/` | Landing page photos — `cover_photo.jpg` (hero), `browse_venues.jpg`, `browse_photographer.jpg`, `browse_catering.jpg` |
| `vendor_photo/` | Vendor card background photos — filenames must be **lowercase** (Linux/Vercel is case-sensitive). Register in `VENDOR_PHOTOS` map by vendor id. |
| `rendezvous_pitch_script.md` | Demo Day pitch script with speaker notes and Q&A prep |
| `rendezvous_final.pptx` | Final pitch deck |
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

**Theme:** Light by default. Interior views (intake, dashboard, how-it-works) use warm white/champagne surfaces. The landing hero is the exception — it uses a full-bleed photo with dark overlay and white text.

**Color palette:** Soft and timeless. Base in warm whites and champagne. Accent with dusty rose (`#C9A49A`) and soft sage (`#8A9E8C`). Avoid cold whites, harsh grays, hot pink, millennial blush + gold. CSS variables required for all color tokens. See `style_guide.md` for the full token set and the hero overlay colors.

**Typography:** Fraunces (display serif) for all headings — italic weight 200 for the first display line, regular weight 400 for the second. DM Sans for body and UI. Strong size contrast (magazine hierarchy, not app hierarchy).

**Landing hero (implemented):** Full-bleed `wedding photo.jpg` background on a `div.scene-photo` element (`inset: -6% -5%`, `will-change: transform`) driven by a JS cursor-lerp parallax (LERP = 0.055). Dark gradient overlay (`rgba(10,4,8,...)`) ensures text legibility. Two cursor-following light divs: warm scene glow (`scene-light`) and lavender text illumination (`text-light`, `mix-blend-mode: screen`). Minimal top-right text-only nav. Centered two-line serif headline. Frosted glass pill CTA. Dark pill bottom-left + year bottom-right.

**Reference:** Luxury hotel website aesthetic — slow, atmospheric, generous spacing, full-bleed moments. Content breathes. Nothing feels crowded or rushed.

**Animation:** Staggered entrance animations on page load (`.r`, `.r1`–`.r6` classes with `animation-delay`). Cursor parallax on the hero. Slow elegant transitions (`0.4s–0.8s`). CSS-only preferred.

**The vibe in one sentence:** A rooftop at golden hour — romantic, editorial, unhurried, and just a little magical.

---

## Prototype Architecture (index.html)

`index.html` is a single-file SPA. Key structural patterns:

**View system** — Five views: `view-landing`, `view-howitworks`, `view-intake`, `view-generating`, `view-dashboard`. The `show(id)` function switches between them with an opacity fade. Navigation functions: `goHome()`, `goHowItWorks()`, `goIntake()`.

**Intake form** — 4-step wizard. `goStep(n)` manages step dots, left-panel copy (`lc1`–`lc4`), and form panels (`fs1`–`fs4`). The profile state object holds all collected fields:
```js
const profile = { name1, name2, email, phone, date, flexibility, city, venueStatus, venueName, setting, guests, budget, priority, style, colors, dietary, cultural }
```
`startGen()` collects form values into `profile`, scores the top venue (`profile.topVenue`, `profile.topVenueTags`), sets `profile.liveBudget = 0`, then starts the generating view. `editProfile()` restores profile values to the form and shows the back-to-dashboard button (`intake-back-dash`).

**Questionnaire coverage** — The 4 intake steps map to the questionnaire sections in `wedding-questionnaire.md`:
- Step 1: Client Information + The Date
- Step 2: The Location + Guest List
- Step 3: Budget
- Step 4: Style & Vision + Optional Details

**Image generation flow** — `fetchSceneImage(profile)` POSTs to `/api/generate-image` with style, setting, date, colors, cultural, guests, budget, priority, city, `liveBudget`, `topVenue`, and `topVenueTags`. Returns `{ url, prompt }` where `url` is a base64 data URI. The `view-generating` view shows a staggered progress bar (`gen-bar`) with `setTimeout`-based fake progress while the API call runs.

**Vision board + regen** — `regenScene()` re-scores the top venue from the live `currentAmounts`, sets `profile.liveBudget` from the sliders, calls `fetchSceneImage`, and shows a dark overlay (`vb-regen-overlay`, z-index 60) with its own progress bar (`vb-regen-bar`) covering the scene during generation. `vbRegenLeft` tracks remaining regenerations (starts at 3).

**Vendor data** — The `vendors` array (38 records) covers 7 categories: venue, caterer, photographer, florist, music, mc, planner. Each vendor has: `id`, `cat`, `name`, `loc`, `price`, `pLabel`, `cap`, `tags`, `emoji`, `setting`, `desc`, `catering`, `lgbtq`, `rating`. Setting values: `'Indoor'`, `'Outdoor'`, `'Indoor & Outdoor'`. The `scoreVendor(v)` function scores against the current `profile` across budget, capacity, style, cultural, and setting dimensions. `topN(list, n)` returns the top-n scored vendors from a list.

**Contextual pricing** — `PRICING` map (keyed by vendor id) with fields `pm`, `flatMin`, `flatMax`, `phMin`, `phMax`. `contextualPrice(v, guests)` computes estimated low/high for the couple's guest count using 5 pricing models: `mixed`, `per_head`, `flat`, `buyout`, `fixed`. Budget scoring uses this instead of `parsePrice(v.price)`. Over-budget venues receive a −16 penalty.

**Vendor cards** — `buildCard(v, delay)` renders the full card template including photo background (from `VENDOR_PHOTOS[v.id]`), setting badge, description, catering label, LGBTQ+ tag, rating, and contextual price estimate. CSS classes: `.vcard-desc`, `.vcard-rating`, `.vcard-setting`, `.tag-sage`, `.vcard-img.has-photo`.

**Fonts** — Fraunces + DM Sans loaded from Google Fonts in `<head>`.

**Deployment** — Vercel. `index.html` at root is the entry point. `api/generate-image.js` is a serverless function. Requires `OPENAI_API_KEY` environment variable in Vercel project settings. `wedding photo.jpg` must be in the same directory as `index.html`.

---

## Working Conventions

- The primary output format for product artifacts is Markdown (`.md`), saved into `docs/`.
- Interview transcripts and workshop outputs are stored as `.docx` files — read them with the Read tool (supports `.docx`).
- When generating new product artifacts, ground them in the PRD and OST rather than inventing requirements.
- The PRD is the authoritative scope document. If there is a conflict between the OST and PRD, defer to the PRD.
