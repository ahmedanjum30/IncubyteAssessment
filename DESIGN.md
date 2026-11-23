---
name: ACME Pay
description: Salary management for ACME's HR Manager, printed as one plate in a design annual.
colors:
  sheet: '#F5F4F6'
  sheet-warm: '#FAF6F5'
  sheet-green: '#EEF3EF'
  ink: '#16181A'
  ink-2: '#55585D'
  hairline: '#C9C7C4'
  hairline-soft: '#E3E1DE'
  seal: '#DCDDF3'
  periwinkle: '#4B4FA8'
  periwinkle-ink: '#34377F'
  danger: '#A3261A'
  paper: '#FFFFFF'
typography:
  display:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: 'clamp(36px, 4.2vw, 58px)'
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: 'clamp(34px, 3.8vw, 52px)'
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: '-0.025em'
  dialog:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '28px'
    fontWeight: 400
    letterSpacing: '-0.02em'
  stat:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '34px'
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '19px'
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: '-0.01em'
  brand:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '17px'
    fontWeight: 600
  body:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.5
  table:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 400
  small:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 400
  label:
    fontFamily: 'Azeret Mono, ui-monospace, monospace'
    fontSize: '11px'
    fontWeight: 400
    letterSpacing: '0.14em'
rounded:
  none: '0px'
  pill: '999px'
spacing:
  xs: '6px'
  sm: '10px'
  md: '18px'
  lg: '26px'
  gutter: '40px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.sheet}'
    rounded: '{rounded.none}'
    padding: '12px 18px'
  button-primary-hover:
    backgroundColor: '{colors.sheet}'
    textColor: '{colors.ink}'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '12px 18px'
  token:
    backgroundColor: '#FFFFFF99'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    padding: '7px 11px'
  token-active:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.sheet}'
  stamp:
    backgroundColor: '{colors.seal}'
    textColor: '{colors.periwinkle-ink}'
    rounded: '{rounded.pill}'
    typography: '{typography.label}'
---

# Design System: ACME Pay

## Mandatory process

All UI work goes through the **`impeccable`** and **`ui-ux-pro-max`** skills (see `CLAUDE.md`). This file records the system they produced, so it is the source of truth for new screens. The reference build is `design/prototype/index.html`.

## Overview

**Creative North Star: "The Plate Section"**

The org's pay is printed as one plate in a design annual. A near-white sheet is ruled in hairlines, and the distributions themselves are the illustrations. It is a data-dense working tool, so the world contributes only four things: type, palette, density and one signature move. Navigation, tables, inputs and dialogs stay standard web controls.

The sheet is never flat neutral: it drifts warm at the top-left and green at the bottom-right, so ink reads as printed. Ink carries almost everything. One periwinkle is reserved for anything that needs a decision.

**Key Characteristics:**

- Near-white tinted sheet, ink text, 1px hairlines, zero radius.
- One grotesque for everything, plus mono uppercase labels for metadata.
- Periwinkle appears only on "needs attention" states (below band, active selection).
- Registration crosshairs mark plate corners.
- Signature move: **the plate prints**. Box plots grow outward from the median, and morph to new values when filters change.

## Colors

An ink-on-paper palette with a single attention colour.

### Primary

- **Plate Ink** (#16181A): text, primary buttons, active tokens, chart strokes, the 1px rule above the stats row.

### Secondary

- **Decision Periwinkle** (#4B4FA8, text #34377F on #DCDDF3 seal): below-band states, the median of an at-risk country, selection markers, focus rings. Nothing decorative.

### Neutral

- **Annual Sheet** (#F5F4F6), drifting to **Warm Corner** (#FAF6F5) and **Green Corner** (#EEF3EF) through two large radial gradients on `body`.
- **Second Ink** (#55585D): secondary text and labels (≥ 6:1 on the sheet).
- **Hairline** (#C9C7C4): plate borders and section rules. **Soft Hairline** (#E3E1DE): row dividers.
- **Error Red** (#A3261A): form validation errors and destructive confirmation only.
- **Paper** (#FFFFFF): inputs, box-plot boxes and other figures that sit on the white-washed plates.

### Named Rules

**The One Seal Rule.** Periwinkle marks only what needs a decision. If everything is highlighted, nothing is.

## Typography

**Body/Display Font:** Schibsted Grotesk (fallback system-ui)
**Label Font:** Azeret Mono (fallback ui-monospace)

**Character:** a confident newspaper grotesque at light display sizes, with a precise mono for the registration-furniture labels.

### Hierarchy

- **Display** (400, clamp(36px, 4.2vw, 58px), 1.02, -0.025em): the Overview headline.
- **Headline** (400, clamp(34px, 3.8vw, 52px)): headlines on Employees, Insights and the employee page. **Dialog** titles use 28px.
- **Stat** (400, 34px, 28px on phones, 1.1): figures in the stats row, proportional numerals.
- **Title** (500, 19px): plate titles.
- **Body** (400, 15px, 1.5): everything else, prose capped at 62ch. **Table** text is 14px; secondary lines and captions are **Small** at 12px.
- **Label** (Azeret Mono 400, 11px, 0.14em, uppercase): plate meta, stat labels, tokens, stamps, axis ticks.

All sizes are CSS custom properties (`--fs-*`) in `apps/web/app/globals.css`; components never hard-code a size.

### Named Rules

**The Tabular Rule.** Numbers in tables and charts use `font-variant-numeric: tabular-nums` so columns align. Display figures (the stats row) keep proportional numerals, because tabular commas open visible gaps at 34px. Money shows its local currency first and the USD equivalent beneath in Second Ink.

## Layout

- 12-column grid, 40px column gap, max width 1440px, 40px side gutter (16px on phones).
- Sticky 64px token bar with the backdrop blurred, holding the brand, nav and filter tokens.
- Overview: headline (8 cols) and actions (4 cols), a full-width stats row, then plates at 5 and 7 cols.
- Below 1100px everything stacks into a single column and the tokens scroll horizontally. Below 640px the stats go 2-up and secondary table columns hide.
- Grid children set `min-width: 0` so wide tables scroll inside their plate, never the page.

## Elevation & Depth

Flat. Depth comes from the tinted sheet, white-washed plates (`rgba(255,255,255,.55)`) and hairlines. The sticky bar uses `backdrop-filter: saturate(1.2) blur(10px)`, which is functional, keeping it legible over scrolling content. Dialogs use one soft shadow: `0 24px 60px -20px rgba(22,24,26,.35)`.

## Shapes

Zero radius everywhere except stamps (pill). Plates have a 1px hairline border with registration crosshairs (15px, a 1px cross plus a ring) at the top-left and bottom-right corners.

## Components

### Buttons

- **Primary:** ink fill, sheet text, 12px 18px, 1px ink border. On hover the colours invert in 0.1s.
- **Ghost:** transparent with a 1px ink border, inverting to an ink fill on hover.
- **Focus:** 2px periwinkle outline, 3px offset, on every interactive element.

### Tokens (filters)

- Mono label, 1px hairline border, white wash. The active token sits on an ink slab that slides between tokens (0.45s, cubic-bezier(.19,1,.22,1)).

### Selection

- A selected box-plot row tints its background with the seal colour and sets its label in Periwinkle Ink at 500 weight. No side stripes.

### Plates

- White-washed panels with hairline borders and crosshair corners. The header row puts the 19px title on the left and mono meta ("Plate 1 · by country") on the right, on one baseline. Nothing sits above the title.

### Tables

- 1px ink rule under the header, soft hairline row dividers, tabular numerals, money right-aligned. Rows enter with a short rise (0.5s) when data changes.

### Stamps

- Pill with a seal fill and periwinkle border, carrying a mono label ("Below").

### Box plot (signature)

- Whisker line from P10 to P90, a white box from P25 to P75 with a 1px ink border, and a 2px median bar. At-risk rows fill the box with seal and turn the median periwinkle. The plot animates left/width (0.7s, staggered 45ms per row) so the borders stay crisp.

### Inputs and dialogs

- Inputs: 1px hairline border, white fill, zero radius, 10px 12px padding. Focus turns the border ink and adds the periwinkle ring. Errors show Error Red text beneath the field.
- Dialogs: a centred sheet-coloured panel with hairline border and plate crosshairs over a 40% ink scrim. They fade and rise 8px in 0.25s.

## Motion

- Easing: `cubic-bezier(.19,1,.22,1)` for arrivals and `cubic-bezier(.16,1,.3,1)` for routine state changes.
- 100–150ms for feedback, 250–450ms for state changes, 700ms only for the plate printing.
- `prefers-reduced-motion`: spatial motion collapses to opacity and the stamp ring stops.

## Do's and Don'ts

### Do:

- **Do** keep table and chart numbers tabular, and show every money value in local currency with USD beneath it.
- **Do** use periwinkle only for states that need a decision.
- **Do** use standard controls (buttons, selects, inputs, tables) in the plate vocabulary.

### Don't:

- **Don't** use rounded cards, drop shadows on plates, or gradient text.
- **Don't** add a second accent colour; state colour other than Error Red is periwinkle.
- **Don't** put a kicker or eyebrow above any heading. Metadata sits beside the title, never above it.
