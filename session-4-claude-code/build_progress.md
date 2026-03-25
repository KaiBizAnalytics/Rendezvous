# Rendezvous — Build Progress Log

> Running log of features shipped, design decisions made, and current prototype status.
> Updated: 2026-03-25

---

## Current Status

The prototype (`index.html`) is a fully functional SPA deployed on Vercel. It demonstrates the complete user flow from landing page through intake, AI-generated vision board, and vendor dashboard. All 38 Vancouver vendor records are enriched with real venue data.

**What works end-to-end:**
- Landing page → How It Works → 4-step intake wizard
- AI vision board generation via `gpt-image-1` (real API call, ~15–20s)
- Per-category budget sliders with live total and regenerate scene
- 38 vendor cards with match scoring, filtering by category, and shortlist
- Edit answers from dashboard → return to dashboard without regenerating

---

## Features Shipped

### Prototype Foundation
- Single-file SPA (`index.html`) with five views: landing, how-it-works, intake, generating, dashboard
- Cursor parallax hero with two light effects (scene glow + text illumination)
- 4-step intake wizard collecting 17 profile fields
- Staggered entrance animations and frosted-glass UI elements
- Design system: Fraunces + DM Sans, dusty rose + sage palette, CSS variables throughout

### Vendor Matching Engine
- 38 real Vancouver vendors across 7 categories (venue, caterer, photographer, florist, music, MC, planner)
- `scoreVendor()` function scoring vendors across budget fit, guest capacity, style match, cultural compatibility, and setting preference
- `topN()` utility for surfacing the best matches per category
- Vendor category filtering tabs
- Shortlist (heart/save) functionality

### AI Vision Board
- `api/generate-image.js` serverless function on Vercel
- Initial image generation on dashboard load (triggered by `startGen()`)
- Per-category budget sliders — venue, catering, flowers, photography, music, other
- Live budget total tracking (`currentAmounts`)
- Regenerate scene button (3 regenerations per session)
- Scene regeneration re-scores top venue from live budget amounts

### UX Improvements
- Progress bar on initial generation (`view-generating`) — staggered fake progress with `setTimeout`
- Regen overlay (`vb-regen-overlay`, z-index 60) covering the scene during regeneration — prevents text/content bleedthrough
- Progress bar inside regen overlay
- Back-to-dashboard button in intake nav (shown only when editing from dashboard)

### Vendor Card Enrichment
All 38 venue records now include:
- `setting` — Indoor / Outdoor / Mixed (shown as pill badge on card image)
- `desc` — one-sentence description (shown below venue name)
- `catering` — Included / External / Inquire (shown as sage tag)
- `lgbtq` — LGBTQ+-affirming flag (shown as sage tag when true)
- `rating` — Google rating (shown with gold star in card footer)

---

## Design Decisions

### Image Generation Model: `gpt-image-1`

**Decision:** Switch from `dall-e-3` to `gpt-image-1`.

**Why:** gpt-image-1 has stronger instruction following, better prompt adherence, and world knowledge of real venues (e.g. UBC Botanical Garden, Stanley Park Pavilion) — enabling venue-specific scenes without stored photography.

**Trade-offs:** Returns base64 only (no URL option), takes ~15–20s, costs more per image. Acceptable for a demo/prototype context. Quality set to `'high'`.

**Note:** gpt-image-1 does not accept `'standard'` or `'hd'` quality values — use `'low'`, `'medium'`, `'high'`, or `'auto'`.

---

### Prompt Engineering: Concrete Visual Descriptors

**Decision:** Use concrete, specific decor descriptions for budget tiers rather than adjectives.

**Why:** Abstract descriptors like "lavish" or "well-appointed" produce visually similar outputs from diffusion models. Specific descriptors (furniture types, floral quantities, architectural elements) force visible differentiation:

| Tier | Descriptor |
|---|---|
| Budget | simple wooden arch with 2–3 small floral clusters, folding chairs, minimal aisle décor |
| Mid | tasteful arch draped with chiffon and medium floral clusters, petal-lined aisle, chiavari chairs |
| Premium | elaborate full-bloom floral arch overflowing with roses and greenery, tall floral stands lining the full aisle, lush draped fabric canopy |
| Luxury | ultra-luxury towering overhead floral canopy, hundreds of premium roses, dramatic 6-ft floral columns flanking the aisle, cascading bloom installations |

---

### Venue-Specific Scene Generation

**Decision:** Pass `profile.topVenue` and `profile.topVenueTags` to the image API.

**Why:** gpt-image-1 has world knowledge of real Vancouver venues. Passing the venue name produces a scene that reflects that venue's actual architectural character, without needing stored photography or fine-tuning.

**Implementation:** `startGen()` scores all venue vendors and picks the top match before calling the API. `regenScene()` re-scores based on live budget amounts (venue allocation may change when sliders move).

---

### Budget → Image Feedback Loop

**Decision:** Pass `profile.liveBudget` (sum of all vision board sliders) to the API on regeneration, not the original intake budget string.

**Why:** The user can adjust per-category amounts on the vision board after intake. The live total should drive the image tier, not the original intake answer. `parseBudgetTier()` reads `liveBudget` first, falls back to parsing the intake budget string.

**Tier thresholds:** <$25k = budget, $25k–$60k = mid, $60k–$100k = premium, >$100k = luxury.

---

### Regen Overlay vs. Photo Opacity

**Decision:** Use a full-coverage dark overlay (`z-index: 60`) during regeneration, not `photo.style.opacity = 0.2`.

**Why:** Reducing photo opacity made the callout boxes, vendor tags, and other overlaid content visible beneath the semi-transparent image — visually confusing. The overlay cleanly covers the entire scene area while the new image loads.

---

### Back-to-Dashboard Button

**Decision:** Add a "Back to dashboard" button to the intake nav, shown only when editing from the dashboard (hidden otherwise).

**Why:** Without it, editing answers from the dashboard required completing a full re-generation to return, even if the user only wanted to review their answers. The button (`intake-back-dash`) is shown in `editProfile()` and hidden in `startGen()`.

---

## Known Limitations / Out of Scope for Prototype

- **No persistence** — profile and vendor state live in memory; refreshing the page resets everything
- **No real AI chat** — the "Ask anything" chat panel in the dashboard is not yet wired to an LLM
- **Vancouver only** — vendor data is manually curated for Vancouver; no dynamic vendor database
- **No booking/payment** — vendor inquiry is a placeholder CTA
- **3 regenerations hard-coded** — `vbRegenLeft` starts at 3; no account/quota system
- **Mobile layout** — not optimized for mobile screens

---

## File Reference

| File | Role |
|---|---|
| `index.html` | Entire frontend — all views, state, vendor data, scoring logic, API calls |
| `api/generate-image.js` | Serverless function — prompt engineering + gpt-image-1 API call |
| `session-4-claude-code/vancouver_wedding_venues.md` | Source data for vendor enrichment |
| `session-4-claude-code/style_guide.md` | Design token reference |
| `session-4-claude-code/wedding-questionnaire.md` | Intake field definitions |
| `session-4-claude-code/rendezvous_mvp_prd.md` | Feature scope authority |
