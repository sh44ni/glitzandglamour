# Glitz & Glamour Studio — Brand Kit

> **Single source of truth** for all colors, typography, spacing, effects, and UI patterns.  
> Reference this file when building new pages, components, emails, or marketing assets.

---

## Brand Identity

| Property | Value |
|---|---|
| **Studio Name** | Glitz & Glamour Studio |
| **Tagline** | *Nails, Hair & Beauty* |
| **Location** | Vista, CA |
| **Website** | [glitzandglamours.com](https://glitzandglamours.com) |
| **Personality** | Luxurious · Feminine · Bold · Modern · Intimate |

---

## Color Palette

### Primary Colors

| Name | Hex | CSS Variable | Usage |
|---|---|---|---|
| **Hot Pink** | `#FF2D78` | `var(--pink)` | CTAs, highlights, brand accent |
| **Pink Light** | `#FF6BA8` | `var(--pink-light)` | Gradients, hover states |
| **Pink Dim** | `rgba(255,45,120,0.15)` | `var(--pink-dim)` | Subtle tints, backgrounds |
| **Rose Gold** | `#B76E79` | `var(--rose-gold)` | Secondary accent, gradients |

### Background / Surface Colors

| Name | Hex | CSS Variable | Usage |
|---|---|---|---|
| **Black** | `#0A0A0A` | `var(--black)` | Page background |
| **Deep** | `#111111` | `var(--deep)` | Section backgrounds |
| **Surface** | `#161616` | `var(--surface)` | Cards, panels |
| **Surface 2** | `#1A1A1A` | `var(--surface-2)` | Nested cards, inputs |

### Text Colors

| Name | Hex | CSS Variable | Usage |
|---|---|---|---|
| **White** | `#FFFFFF` | `var(--text-primary)` | Headings, body copy |
| **Muted** | `#AAAAAA` | `var(--text-muted)` | Subtitles, labels, secondary |
| **Dim** | `#777777` | `var(--text-dim)` | Placeholders, disabled |

### Glass / Overlay Colors

| Name | Value | CSS Variable | Usage |
|---|---|---|---|
| **Glass BG** | `rgba(255,255,255,0.04)` | `var(--glass-bg)` | Glassmorphism card fill |
| **Glass Border** | `rgba(255,45,120,0.18)` | `var(--glass-border)` | Glassmorphism card border |

### Status / Badge Colors

| Status | Color | Hex |
|---|---|---|
| **Pending** | Gold | `#FFB700` |
| **Confirmed** | Emerald | `#00D478` |
| **Completed** | Hot Pink | `#FF2D78` |
| **Cancelled** | Grey | `#666666` |

### Gradient Recipes

```css
/* Primary brand gradient — buttons, hero text */
background: linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%);

/* Text gradient — headings, logos */
background: linear-gradient(135deg, #FF2D78 0%, #FF6BA8 50%, #B76E79 100%);

/* Orb 1 — top-left ambient glow */
background: radial-gradient(circle, #FF2D78 0%, #8B0043 60%, transparent 100%);

/* Orb 2 — bottom-right ambient glow */
background: radial-gradient(circle, #7928CA 0%, #3B0764 60%, transparent 100%);

/* Orb 3 — mid-page ambient glow */
background: radial-gradient(circle, #B76E79 0%, #5C2232 60%, transparent 100%);
```

---

## Typography

### Font Stack

| Role | Font | Fallback |
|---|---|---|
| **Primary** | [Poppins](https://fonts.google.com/specimen/Poppins) | `-apple-system, BlinkMacSystemFont, sans-serif` |
| **Body default** | Poppins Regular (400) | — |

### Google Fonts Import

Load via `<link>` in `<head>` (not `@import`) to avoid render-blocking:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Font Weights

| Weight | Usage |
|---|---|
| **400** Regular | Body copy, descriptions |
| **500** Medium | Labels, captions, secondary UI |
| **600** SemiBold | Buttons, nav items, badge text |
| **700** Bold | Section headings, card titles |
| **800** ExtraBold | Hero headlines, display text |

### Type Scale (CSS Utility Classes)

| Class | Size | Weight | Use |
|---|---|---|---|
| `.heading-xl` | `clamp(2.5rem, 8vw, 5.5rem)` | 800 | Hero headline |
| `.heading-lg` | `clamp(2rem, 5vw, 3.5rem)` | 700 | Section headline |
| `.heading-md` | `clamp(1.5rem, 3.5vw, 2.5rem)` | 700 | Card / sub-section title |
| `.label` | `13px` | 500 | Form labels, UI labels |
| Body default | `16px` (min, iOS safe) | 400 | All body / paragraph copy |

---

## Spacing & Layout

### Border Radius

| Name | Value | CSS Variable | Usage |
|---|---|---|---|
| **Small** | `12px` | `var(--radius-sm)` | Inputs, small cards |
| **Default** | `20px` | `var(--radius)` | Cards, modals, glass panels |
| **Large** | `28px` | `var(--radius-lg)` | Feature cards, hero blocks |
| **Pill** | `50px` | — | Buttons, badges, tags |

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;        /* mobile */
}

@media (min-width: 768px) {
  .container { padding: 0 40px; }
}
```

### Section Padding

| Class | Mobile | Desktop |
|---|---|---|
| `.section` | `64px 0` | `96px 0` |
| `.section-lg` | `96px 0` | `96px 0` |

### Grid

```css
/* Bento grid — 2 col mobile, 3 col tablet+ */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (min-width: 1024px) { gap: 20px; }
```

---

## Motion & Transitions

### Global Easing

```css
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Named Animations

| Animation | Duration | Trigger | Effect |
|---|---|---|---|
| `fadeIn` | 0.5s ease | `.animate-fade-in` | Opacity 0→1, translateY 16→0 |
| `slideUp` | 0.6s ease | `.animate-slide-up` | Opacity 0→1, translateY 32→0 |
| `shimmer` | 1.5s infinite | `.skeleton` | Loading skeleton sweep |
| `stampPop` | 0.5s | `.stamp-pop` | Scale bounce + rotate pop |
| `pulsePink` | 2.5s infinite | `.btn-pulse` | Pink ring pulse on CTAs |
| `orbFloat1/2/3` | 18–25s infinite | `.orb-1/2/3` | Ambient background glow drift |

### Interaction Micro-animations

```css
/* Cards lift on hover */
.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px -10px rgba(255, 45, 120, 0.2);
}

/* Buttons lift on hover */
.btn-primary:hover { transform: translateY(-2px); }

/* Touch press scale feedback */
a:active, button:active { transform: scale(0.94); transition: transform 80ms ease; }
```

---

## Component Patterns

### Glass Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 45, 120, 0.15);
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Primary Button

```css
.btn-primary {
  background: linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%);
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 14px 32px;
  border-radius: 50px;
  border: none;
}
/* Hover: translateY(-2px) + box-shadow: 0 8px 32px rgba(255,45,120,0.5) */
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #FF2D78;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 13px 30px;
  border-radius: 50px;
  border: 1.5px solid rgba(255, 45, 120, 0.5);
}
/* Hover: border-color #FF2D78 + bg rgba(255,45,120,0.08) */
```

### Text Gradient (Headings)

```css
.text-gradient {
  background: linear-gradient(135deg, #FF2D78 0%, #FF6BA8 50%, #B76E79 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glow Effect

```css
.glow-pink {
  box-shadow: 0 0 30px rgba(255, 45, 120, 0.4), 0 0 60px rgba(255, 45, 120, 0.15);
}
```

### Form Input

```css
.input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  padding: 13px 16px;
}
/* Focus: border-color #FF2D78 + box-shadow: 0 0 0 3px rgba(255,45,120,0.12) */
```

### Badge

```css
/* Base */
.badge { padding: 4px 10px; border-radius: 50px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

/* Variants */
.badge-pending   { background: rgba(255,183,0,0.15);  color: #FFB700; border: 1px solid rgba(255,183,0,0.3); }
.badge-confirmed { background: rgba(0,212,120,0.12);  color: #00D478; border: 1px solid rgba(0,212,120,0.3); }
.badge-completed { background: rgba(255,45,120,0.12); color: #FF2D78; border: 1px solid rgba(255,45,120,0.3); }
.badge-cancelled { background: rgba(255,255,255,0.06); color: #666;   border: 1px solid rgba(255,255,255,0.1); }
```

---

## Scrollbar

```css
::-webkit-scrollbar        { width: 6px; }
::-webkit-scrollbar-track  { background: #0A0A0A; }
::-webkit-scrollbar-thumb  { background: rgba(255,45,120,0.4); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #FF2D78; }
```

---

## Design Principles

1. **Dark first** — All surfaces are near-black. Never use a white background.
2. **Pink is the only primary accent** — Resist adding new accent colors; stick to the pink → rose gold spectrum.
3. **Glassmorphism everywhere** — Cards and panels should feel frosted and layered.
4. **Typography hierarchy** — Use weight contrast (400 body / 700–800 headings), not size alone.
5. **Micro-motion = luxury** — Every interactive element has a hover/active state. No naked state changes.
6. **Mobile-first** — Minimum tap target 44px. Font sizes ≥ 16px on mobile. Safe area insets respected.
7. **No harsh borders** — Prefer `rgba` borders at 0.1–0.2 opacity. Only full-opacity border on focus states.

---

## Quick CSS Variables Reference

Copy this block into any new stylesheet:

```css
:root {
  /* Brand */
  --pink:           #FF2D78;
  --pink-light:     #FF6BA8;
  --pink-dim:       rgba(255, 45, 120, 0.15);
  --rose-gold:      #B76E79;

  /* Backgrounds */
  --black:          #0A0A0A;
  --deep:           #111111;
  --surface:        #161616;
  --surface-2:      #1A1A1A;

  /* Glass */
  --glass-bg:       rgba(255, 255, 255, 0.04);
  --glass-border:   rgba(255, 45, 120, 0.18);

  /* Text */
  --text-primary:   #ffffff;
  --text-muted:     #aaaaaa;
  --text-dim:       #777777;

  /* Shape */
  --radius:         20px;
  --radius-sm:      12px;
  --radius-lg:      28px;

  /* Motion */
  --transition:     all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

*Last updated: June 2026 — maintained alongside `src/app/globals.css`*
