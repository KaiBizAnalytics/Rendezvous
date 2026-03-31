# Rendezvous — Build Progress Log

> Running log of features shipped, design decisions made, and current prototype status.
> Updated: 2026-03-28

---

## Current Status

The prototype (`index.html`) is a fully functional SPA deployed on Vercel. It demonstrates the complete user flow from landing page through intake, AI-generated vision board, and vendor dashboard. All 38 Vancouver vendor records are enriched with real venue data.

**What works end-to-end:**
- Landing page → How It Works → 4-step intake wizard
- AI vision board generation via `gpt-image-1` (real API call, ~15–20s)
- Per-category budget sliders with live total and regenerate scene
- 38 vendor cards with match scoring, filtering by category, photo backgrounds, and shortlist
- Request Quote flow — shortlist vendors → modal with pre-filled message → confirmation
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
- `scoreVendor()` scoring vendors across budget fit, guest capacity, style match, cultural compatibility, and setting preference
- Budget scoring uses `contextualPrice()` (all-in cost for guest count) not raw price string — with +18/+7/−16 tiers
- `topN()` utility for surfacing the best matches per category
- Vendor category filtering tabs
- Shortlist (heart/save) with pop animation — no full re-render on toggle

### AI Vision Board
- `api/generate-image.js` serverless function on Vercel
- Initial image generation on dashboard load (triggered by `startGen()`)
- Per-category budget sliders — venue, catering, flowers, photography, music, other
- Live budget total tracking (`currentAmounts`)
- Regenerate scene button (3 regenerations per session)
- Scene regeneration re-scores top venue from live budget amounts
- `CULTURAL_DESCRIPTORS` map — 13 traditions mapped to specific visible decor elements; prompt uses "must be clearly visible" instruction

### UX Improvements
- Progress bar on initial generation (`view-generating`) — staggered fake progress spread across real 15–20s API duration
- Regen overlay (`vb-regen-overlay`, z-index 60) covering the scene during regeneration
- Progress bar inside regen overlay
- Back-to-dashboard button in intake nav (shown only when editing from dashboard)
- Heart button pop animation on save/unsave (scale bounce, CSS `@keyframes`)

### Vendor Card Features
All 38 vendor records include:
- `setting` — Indoor / Outdoor / Indoor & Outdoor (shown as pill badge on card image)
- `desc` — one-sentence description (shown below venue name)
- `catering` — "In-house catering only" / "Bring your own caterer" / "Ask about catering"
- `lgbtq` — LGBTQ+-affirming flag (shown as sage tag when true)
- `rating` — Google rating (shown with gold star in card footer)
- `cap` — capacity shown as "Up to X guests" (label added if not already in string)
- Tags expanded from 3 to 5–7 per venue for reliable style matching
- Photo backgrounds via `VENDOR_PHOTOS` map (3 venue photos shipped; add more by id)

### Contextual Pricing
- `PRICING` map — 62 entries across 5 models: `mixed` (flat rental + per-head F&B), `per_head`, `flat`, `buyout`, `fixed`
- `contextualPrice(v, guests)` — computes estimated low/high for the couple's actual guest count
- Cards display "~$X–$Y est. for N guests" instead of raw vendor price ranges

### Request Quote Feature
- Shortlist sidebar "Request Quotes (N)" button (rose background, dark text)
- Modal with: read-only profile summary, per-vendor message editable textarea, send button
- `buildQuoteMessage()` — one-paragraph message, no names, strips size labels from guest string
- Sent confirmation popup
- Caterers section hidden in "All" view when all top-recommended venues have in-house catering

---

## Design Decisions

### Image Generation Model: `gpt-image-1`

**Decision:** Use `gpt-image-1` at `quality: 'high'`, `size: '1536x1024'`.

**Why:** gpt-image-1 has stronger instruction following, better prompt adherence, and world knowledge of real venues — enabling venue-specific scenes without stored photography. Quality was temporarily lowered to `'medium'` ($0.08 vs $0.25) during development; restored to `'high'` for demo.

**Note:** gpt-image-1 does not accept `'standard'` or `'hd'` — use `'low'`, `'medium'`, `'high'`, or `'auto'`. Only supports sizes: `1024x1024`, `1536x1024`, `1024x1536`, `auto`.

---

### Cultural Elements: Specific Descriptors over Generic Text

**Decision:** `CULTURAL_DESCRIPTORS` map in `api/generate-image.js` maps tradition keywords to concrete visual elements. Prompt instruction uses "CULTURAL ELEMENTS (must be clearly visible):" rather than "Subtle ... incorporated into the decor."

**Why:** The generic "subtle" instruction was ignored by the model. Specific element lists (e.g., "red silk ribbons, gold double-happiness characters on archway panels, red paper lanterns, peony and plum blossom arrangements in red and gold" for Chinese) force visible output.

---

### Contextual Pricing Model

**Decision:** `PRICING` map + `contextualPrice(v, guests)` replaces raw price string parsing for budget scoring and card display.

**Why:** Raw price strings (e.g., "$5,000–$25,000 venue rental") for mixed-catering venues exclude per-head F&B minimums. A 140-guest event at such a venue actually costs $16k–$27k, not $5k–$25k. Using raw strings caused "Fits your budget" to appear falsely.

**5 pricing models:**
| Model | Formula |
|---|---|
| `mixed` | flat rental + per-head × guests |
| `per_head` | per-head × guests |
| `flat` | flat rental only (external catering) |
| `buyout` | flat exclusive-use rate |
| `fixed` | fixed package (photographers, florists, etc.) |

---

### Budget Scoring: Penalty for Over-Budget Venues

**Decision:** Budget scoring now uses −16 penalty when `contextualPrice.low > catBudget × 1.15`.

**Why:** Previously, no-penalty for over-budget meant stylish, large venues could outscore affordable ones purely on style/capacity/setting. Now: +18 (fits), +7 (low end within budget), 0 (borderline), −16 (clearly over).

---

### Style Keywords: Expanded & Waterfront Removed from Romantic

**Decision:** `STYLE_KEYWORDS` expanded to 8–13 keywords per style. "Waterfront" removed from "Romantic & Floral."

**Why:** With 3-tag vendors and 7-keyword style lists, most venues hit 0–1 keywords. Now venues reliably hit 2+ for their primary style, getting +14 vs +7 or 0. "Waterfront" in Romantic was producing misleading reason text ("Waterfront aesthetic") for couples who never requested waterfront.

---

### Prompt Engineering: Concrete Visual Descriptors

**Decision:** Use concrete, specific decor descriptions for budget tiers rather than adjectives.

**Why:** Abstract descriptors like "lavish" produce visually similar outputs. Specific descriptors force visible differentiation:

| Tier | Descriptor |
|---|---|
| Budget | simple wooden arch with 2–3 small floral clusters, folding chairs, minimal aisle décor |
| Mid | tasteful arch draped with chiffon and medium floral clusters, petal-lined aisle, chiavari chairs |
| Premium | elaborate full-bloom floral arch overflowing with roses and greenery, tall floral stands lining the full aisle, lush draped fabric canopy |
| Luxury | ultra-luxury towering overhead floral canopy, hundreds of premium roses, dramatic 6-ft floral columns flanking the aisle, cascading bloom installations |

---

### Regen Overlay vs. Photo Opacity

**Decision:** Use a full-coverage dark overlay (`z-index: 60`) during regeneration, not `photo.style.opacity = 0.2`.

**Why:** Reducing photo opacity made callout boxes and overlaid content visible beneath the semi-transparent image. The overlay cleanly covers the entire scene area while the new image loads.

---

### Back-to-Dashboard Button

**Decision:** Add a "Back to dashboard" button to the intake nav, shown only when editing from the dashboard.

**Why:** Without it, editing answers required completing a full re-generation to return. The button (`intake-back-dash`) is shown in `editProfile()` and hidden in `startGen()`.

---

### Vendor Photos: Case-Sensitive Paths

**Decision:** `VENDOR_PHOTOS` map keyed by vendor id, paths relative to site root. All filenames must be lowercase.

**Why:** Windows filesystem is case-insensitive; Vercel/Linux is case-sensitive. `Stanley_Park_Pavilion.jpg` works locally but 404s on Vercel. Use `git mv` to rename — direct filesystem rename is not tracked by Git on Windows.

---

## Known Limitations / Out of Scope for Prototype

- **No persistence** — profile and vendor state live in memory; refreshing resets everything
- **No real AI chat** — the "Ask anything" panel is not wired to an LLM
- **Vancouver only** — vendor data is manually curated; no dynamic vendor database
- **No booking/payment** — vendor inquiry is a placeholder CTA
- **3 regenerations hard-coded** — `vbRegenLeft` starts at 3; no account/quota system
- **Mobile layout** — not optimized for mobile screens
- **Partial photo coverage** — `VENDOR_PHOTOS` covers 3 venues; other cards show emoji placeholder

---

## File Reference

| File | Role |
|---|---|
| `index.html` | Entire frontend — all views, state, vendor data, scoring logic, API calls |
| `api/generate-image.js` | Serverless function — prompt engineering + gpt-image-1 API call |
| `vendor_photo/` | Venue card background photos (keyed by vendor id in `VENDOR_PHOTOS`) |
| `cover_photo/` | Landing page hero and browse card backgrounds |
| `rendezvous_pitch_script.md` | Demo Day pitch script with speaker notes and Q&A prep |
| `rendezvous_final.pptx` | Final pitch deck |
| `docs/vancouver_wedding_venues.md` | Source data for vendor enrichment |
| `docs/style_guide.md` | Design token reference |
| `docs/wedding-questionnaire.md` | Intake field definitions |
| `docs/rendezvous_mvp_prd.md` | Feature scope authority |
