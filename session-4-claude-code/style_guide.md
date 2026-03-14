# Rendezvous — Style Guide

**Product:** Rendezvous AI Wedding Concierge
**Version:** 1.1 — updated after prototype build session

---

## Brand Essence

> A rooftop at golden hour — romantic, editorial, unhurried, and just a little magical.

Rendezvous feels like flipping through a beautiful wedding magazine in a high-end hotel lobby. Every interaction should be calm, considered, and quietly elegant. Never clinical. Never corporate. Never rushed.

---

## Color

### Palette

| Token | Name | Value | Usage |
|---|---|---|---|
| `--color-bg` | Warm White | `#FAF8F5` | Primary background |
| `--color-surface` | Champagne | `#F5EFE6` | Cards, panels, elevated surfaces |
| `--color-surface-2` | Parchment | `#EDE5D8` | Hover states, secondary surfaces |
| `--color-accent-rose` | Dusty Rose | `#C9A49A` | Primary accent, CTA highlights |
| `--color-accent-sage` | Soft Sage | `#8A9E8C` | Secondary accent, tags, icons |
| `--color-text-primary` | Deep Linen | `#2C2420` | Headings, primary text |
| `--color-text-secondary` | Warm Stone | `#7A6E68` | Body text, captions, labels |
| `--color-text-muted` | Pale Stone | `#B0A89F` | Placeholders, disabled states |
| `--color-border` | Soft Linen | `#E8DDD4` | Dividers, card borders |

### Dark Mode Overrides

| Token | Dark Value |
|---|---|
| `--color-bg` | `#1A1714` |
| `--color-surface` | `#242019` |
| `--color-surface-2` | `#2E2923` |
| `--color-text-primary` | `#F0EAE3` |
| `--color-text-secondary` | `#A89E97` |
| `--color-border` | `#3A342D` |

### Hero / Photo Overlay Colors

These are used specifically on the landing hero where text sits over the wedding photo. They are not part of the standard light-surface palette.

| Purpose | Value | Usage |
|---|---|---|
| Dark veil overlay | `rgba(10,4,8,0.48)` | Top and bottom of hero via gradient |
| Dark veil midzone | `rgba(10,4,8,0.18)` | Center of hero (let photo breathe) |
| Radial shadow behind text | `rgba(10,4,8,0.32)` | Centered ellipse behind headline |
| Heading text-shadow | `rgba(10,4,8,0.70)` | All display text on photo |
| Lavender cursor light | `rgba(188,162,222,0.26)` | Cursor-following glow on headline text |

### Rules
- All colors on light surfaces must be referenced via CSS variables — never hardcoded
- Dominant warm whites with dusty rose and sage as accents, not co-dominants
- Avoid: cold whites (#FFFFFF), harsh grays, hot pink, yellow-gold, millennial blush + metallic gold combinations
- On the hero photo: all text is white (`#fff`) with deep dark text-shadows for legibility — do not use the standard palette text colors here

---

## Typography

### Typefaces

| Role | Font | Source |
|---|---|---|
| Display / Headings | Fraunces | Google Fonts |
| Body / UI | DM Sans | Google Fonts |

**Fraunces** is the editorial voice — used for all headings, hero text, pull quotes, and brand moments. Its optical size axis and soft serifs evoke quality print media.

**DM Sans** is the functional voice — used for body copy, labels, inputs, navigation, and UI elements. Clean and readable without being cold.

### Scale

| Level | Size | Weight | Font | Usage |
|---|---|---|---|---|
| Display | 72–96px | 300 | Fraunces | Hero headlines |
| H1 | 48–60px | 400 | Fraunces | Page titles |
| H2 | 32–40px | 400 | Fraunces | Section headings |
| H3 | 22–26px | 500 | Fraunces | Card titles, subsections |
| Body Large | 18px | 400 | DM Sans | Intro paragraphs |
| Body | 16px | 400 | DM Sans | Default body text |
| Small / Label | 13–14px | 500 | DM Sans | Labels, tags, captions |
| Micro | 11–12px | 500 | DM Sans | Metadata, timestamps |

### Rules
- Size jumps should be dramatic — magazine hierarchy, not app hierarchy
- Heading weight should be light-to-regular (300–400); avoid heavy headings
- Letter-spacing on display text: `0.02em` to `0.04em` for elegance
- Line height: `1.15` for headings, `1.65` for body text

---

## Spacing & Layout

- Base unit: `8px`
- Generous padding is a feature, not waste — sections breathe
- Max content width: `1200px` for full layouts, `720px` for editorial/reading views
- Prefer asymmetric layouts and editorial grid arrangements over rigid equal columns
- Full-bleed moments (images, hero sections) are encouraged — let content reach the edges
- Section padding: minimum `80px` vertical on desktop, `48px` on mobile

---

## Elevation & Surfaces

- Avoid hard drop shadows — use subtle backdrop blur and border instead
- Cards: `border: 1px solid var(--color-border)`, `border-radius: 12px`, background `var(--color-surface)`
- Modals / overlays: `backdrop-filter: blur(12px)` over a semi-transparent warm overlay
- No harsh box shadows. If depth is needed: `box-shadow: 0 2px 20px rgba(44, 36, 32, 0.06)`

---

## Animation & Motion

Motion is a core part of the Rendezvous personality. It should feel expressive, elegant, and intentional — not decorative noise.

### Principles
- **Page load is the hero moment** — use staggered entrance animations to reveal content like a curtain rising
- Transitions should be slow and graceful: `0.4s–0.8s` duration, `ease-out` or custom cubic-bezier
- Micro-interactions reward attention — hover states, focus rings, and button presses should feel alive
- Never abrupt. Never instant. Never frantic.

### Timing Reference

| Interaction | Duration | Easing |
|---|---|---|
| Page load stagger | 0.6–1.0s per element | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Hover transitions | 0.3s | `ease-out` |
| Modal open/close | 0.4s | `ease-in-out` |
| Button press | 0.15s | `ease-out` |
| Scroll reveals | 0.5–0.7s | `ease-out` |

### Stagger Pattern (CSS)
```css
.reveal { opacity: 0; transform: translateY(24px); }
.reveal.visible { animation: fadeUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.reveal:nth-child(2) { animation-delay: 0.1s; }
.reveal:nth-child(3) { animation-delay: 0.2s; }

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}
```

### Cursor Parallax Pattern (JS)

The landing hero uses a smooth lerp cursor-tracking parallax on the background photo. The photo element (`.scene-photo`) is oversized at `inset: -6% -5%` so movement never reveals a gap.

```js
// Smooth lerp cursor parallax
var photoBg = document.getElementById('scene-photo');
var target = {x: 0, y: 0}, cur = {x: 0, y: 0};
var LERP = 0.055; // lower = smoother/slower

document.addEventListener('mousemove', function(e) {
  target.x = (e.clientX / window.innerWidth  - 0.5);
  target.y = (e.clientY / window.innerHeight - 0.5);
});

function tick() {
  cur.x += (target.x - cur.x) * LERP;
  cur.y += (target.y - cur.y) * LERP;
  photoBg.style.transform =
    'translate(' + (-cur.x * 38).toFixed(2) + 'px, ' + (-cur.y * 22).toFixed(2) + 'px)';
  requestAnimationFrame(tick);
}
tick();
```

**Cursor light effects** — two overlay divs (`scene-light`, `text-light`) follow the cursor and update `background` radial-gradients on `mousemove`. `text-light` uses `mix-blend-mode: screen` with a soft lavender (`rgba(188,162,222,...)`) to illuminate headline text as the cursor passes over it.

---

## UI Components

### Buttons

- **Primary:** Dusty rose background, deep linen text, `border-radius: 4px`, no border — understated, not loud
- **Secondary:** Transparent background, `border: 1px solid var(--color-border)`, warm stone text
- **Ghost / Text:** No background, no border — dusty rose text, underline on hover
- **Hero CTA (frosted glass pill):** `border-radius: 100px`, `background: rgba(10,4,8,0.30)`, `border: 1px solid rgba(255,255,255,0.45)`, `backdrop-filter: blur(16px)`, white text — used only on the landing hero over a photo background
- Padding: `12px 28px` for standard, `10px 20px` for small
- Pill buttons (`border-radius: 100px`) are reserved for the hero CTA and bottom-bar actions; do not use on light interior surfaces

### Inputs & Forms

- Border: `1px solid var(--color-border)`, focused: `1px solid var(--color-accent-rose)`
- Background: `var(--color-surface)` — never stark white
- `border-radius: 6px`
- Label above field, DM Sans 13px, weight 500, warm stone color
- Placeholder text in `--color-text-muted`

### Cards

- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- `border-radius: 12px`
- Padding: `28px 32px`
- On hover: subtle upward translate `transform: translateY(-2px)`, transition `0.3s ease-out`

---

## Imagery & Backgrounds

- Prefer atmospheric, warm-toned photography — golden hour light, natural textures, human moments
- Avoid stock-photo-generic imagery (posed couples on white backgrounds)
- Interior surfaces (below the hero fold): layered CSS gradients are preferred over solid colors
  - Example: `background: linear-gradient(160deg, #FAF8F5 0%, #F0E8DC 100%)`
- Subtle texture overlays (noise, linen grain) add warmth and depth — use at low opacity (`0.03–0.06`)

### Landing Hero Photo Treatment

The landing hero (`#hero-section`) uses a real wedding photo as a full-bleed parallax background:

1. **Photo element** — `.scene-photo` div at `inset: -6% -5%` (oversized), `will-change: transform`. The `background-image` is set on this element, not on the section itself, so JS can move it.
2. **Dark overlay** — `::before` pseudo-element with a layered gradient:
   - `rgba(10,4,8,0.48)` at top and bottom edges (nav and bottom bar legibility)
   - `rgba(10,4,8,0.18)` in the midzone (let the photo breathe)
   - `radial-gradient` dark ellipse centered behind the headline
3. **Text** — always white (`#fff`) with strong `text-shadow` using `rgba(10,4,8,0.70)`. Never use light-surface text colors over the photo.
4. **Cursor lights** — `scene-light` (warm glow) and `text-light` (lavender, `mix-blend-mode: screen`) overlay divs follow the cursor. See Animation section for implementation.
5. **Photo file** — `wedding photo.jpg` in the project root. Swap this file to change the hero image.

---

## Voice & Tone (UI Copy)

- Warm but not effusive
- Confident and clear — no jargon, no filler
- Speaks to the couple as capable adults, not overwhelmed victims
- Short sentences. Let whitespace do work.
- Examples:
  - CTA: "Start planning" not "Get started for free today!"
  - Empty state: "Your shortlist is waiting." not "You haven't added any vendors yet."
  - Error: "Something went wrong. Try again." not "Oops! We hit a snag!"
