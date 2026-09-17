# nocturne

The tyohnn website's exhibition tone as a design system: work hung on near-black walls. Planes sit one
step apart, hairlines do the separating, the main action is a pale pill, titles are set in Bricolage
Grotesque, small labels speak in mono uppercase, and a single lavender signal says "this has focus" or
"this is the selected one". Nothing else is coloured.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- **Mode:** dark first (`defaultMode: dark`). Light is a designed counterpart, not an inversion: a cool
  off-white ground, white cards, an ink pill and the lavender family darkened for contrast.
- **Planes and depth:** ground `#0b0c0e` → card `#121316` → raised `#1a1c20` → hover-strong `#24262b`.
  Resting cards are flat with a 1px hairline (`rgba(236,236,232,0.09)`). Everything that floats — popovers,
  menus, select and combobox lists, tooltips, dialogs, drawers, sheets — sits on the raised surface with the
  strong edge (`rgba(236,236,232,0.20)`) and one deep shadow, `0 30px 80px rgba(0,0,0,0.6)`
  (`rgb(17 18 20 / 14%)` in light).
- **Density:** 36px controls with 14px Geist text; pills at 24 · 32 · 36 · 40; 36px sidebar rows; 40px table
  heads with 10px cell padding.
- **Accents:** lavender `#b9c2ff` (light `#5a63d6`) is a signal only — focus rings, the sidebar's active
  bar, the line-tab underline, progress, slider range, a checked selection card's edge and chart-1.

## Key values

| Slot | Dark · light | Meaning |
|---|---|---|
| `--background` / `--foreground` | `#0b0c0e` / `#ecece8` · `#f6f6f3` / `#111214` | the wall and the ink |
| `--card` · `--popover` · `--secondary` | `#121316` · `#1a1c20` · `#24262b` (light `#fff` · `#fff` · `#ebebe7`) | resting plane · raised plane · strong hover |
| `--border` · `--border-strong` / `--input` | 9% · 20% of `#ecece8` (light 8% · 18% of `#111214`) | hairline · inputs, outline pills, popup edges |
| `--muted-foreground` · `--foreground-subtle` | `#a3a5ab` · `#6b6e75` (light `#5d6068` · `#8c8f96`) | secondary text · disabled and placeholders only |
| `--primary` / `--primary-foreground` | `#ecece8` / `#0b0c0e` · `#111214` / `#f6f6f3` | the pale (light: ink) pill |
| `--ring` | `#b9c2ff` · `#5a63d6` | the lavender signal; every indicator slot aliases it |
| `--selection` | `var(--primary)` | checked checkbox / radio / switch take the pill pair, not lavender |
| `--chart-1…5` | lavender · sky · mint · sand · coral | cool to warm, restrained |
| `--control-height-md` · `--control-font-size-md` | 36px · 14px | the control |
| `--control-radius` · `--control-radius-field` | 9999px · 10px | pills · fields |
| `--surface-radius` · `--card-radius` · `--surface-radius-lg` | 14px · 16px · 18px | popups and tooltips · cards · dialogs, drawers, sheets |
| `--menu-item-radius` · `--sidebar-item-radius` | 8px · 8px | rows inside a surface |
| `--title-font-weight` · `--title-letter-spacing` | 700 · -0.03em | Bricolage surface titles |
| `--typeset-heading-weight` · `--typeset-heading-tracking` | 700 · -0.04em | long-form headings |
| `--*-label-*` (sidebar group · table head · menu, select, command group) | Geist Mono · 11–12px · uppercase · 0.08em · `#868990` (light `#6b6e75`) | the label voice |

## The radius ladder

**pill · 10 · 14 · 16 · 18**, and 8 for rows inside a surface.

| Step | Where |
|---|---|
| pill (9999px) | buttons of every variant and size, badges and tags, toggles, toggle-group / segmented items, the default tabs bar and its triggers, switches, sidebar count badges |
| 10px | input, textarea, select trigger, native select, combobox input, input group, OTP cells, field choice cards |
| 8px | menu rows, command rows, sidebar items and parts |
| 14px | popover, hover card, dropdown / context menu, select and combobox content, tooltip, chart tooltip, accordion frame |
| 16px | card, empty state, chat bubble |
| 18px | dialog, alert dialog, command palette, drawer, sheet |

## The label voice

Small labels are set, not written: **Geist Mono, 11–12px, uppercase, letter-spacing 0.08em, in the label
colour** (`#868990` dark, `#6b6e75` light). It is used for sidebar group labels (11px), table heads (11px) and
menu / select / combobox / command group labels (12px). Body text, menu rows, form labels and descriptions
stay in Geist sentence case.

The label colour is one step lighter than the design's subtle grey `#6b6e75`: at 11px that grey is 3.8:1 on
the ground, below AA, so labels take `#868990` (5.6:1 on `#0b0c0e`, 4.9:1 on `#1a1c20`) and `#6b6e75` stays
for disabled text and placeholders.

## Combination rules

- **One pale pill per view.** The primary pill is the one action the view is for; the rest are outline
  (strong edge, no fill), secondary (`#24262b`) or ghost pills.
- **Lavender marks, it never fills.** Focus is a lavender ring; selection is a neutral fill (`#1a1c20`) plus a
  lavender mark where a mark exists (the sidebar bar, the tab underline, a card's edge). Checked checkboxes,
  radios and switches use the pale pill pair.
- **The active sidebar item** is the `#1a1c20` fill with an 8px corner, plus a straight 2px lavender bar
  standing 6px outside the item's left edge, inset 8px top and bottom. The bar is its own pseudo-element on
  the menu item (`sidebar.css`), so it stays straight whatever the item's corner is.
- **Titles in Bricolage, everything else in Geist.** Card, dialog, sheet, drawer, alert-dialog and empty
  titles are Bricolage 700 at -0.03em; typeset headings are 700 at -0.04em.
- **Depth comes in two kinds only:** a hairline for things at rest, the deep shadow with the strong edge for
  things that float. Nothing in between.
- Tags are quiet outline pills on the neutral ramp; status colours (info · success · warning · destructive)
  are text on a soft fill and read on both grounds.

## Do not

- **Draw the active marker as an inset box-shadow** (or a border) on a rounded item. It follows the 8px corner
  and curves into a bracket shape — rejected. Use the separate straight bar.
- **Fill anything with lavender** — not hover, not selected rows, not checked controls, not buttons, not
  badges. Lavender is focus and indicators only.
- **Shadow a resting card.** Cards are flat with a hairline; the deep shadow is for floating surfaces.
- Round a field like a pill, or a button like a field: pills act, 10px boxes take input.
- Use `--foreground-subtle` for readable text, or set the label voice in the body text colour.
- Add a second accent hue for emphasis. Emphasis is the pale pill, weight, or Bricolage.

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — source material and the nocturne-only names (foundation slot candidates).
