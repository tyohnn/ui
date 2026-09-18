# cirrus

Daylight. A cool near-white page, white cards floating on wide soft shadows, pill buttons, and one
sky blue doing all the signalling. What makes it cirrus rather than a tinted luma is the material:
**every layer that floats is glass** — menus, select lists, popovers, hover cards, dialogs, sheets,
drawers and the modal backdrop are frosted, 76% fill over a 24px blur. Anything that sits down in the
flow — cards, tables, banners, the sidebar — stays opaque, because a reading surface that shows what
is behind it cannot promise its own contrast. It suits marketing surfaces, onboarding, and product
screens that want air: the places where a screen should feel like weather, not like furniture.

Forked from `luma` (see `system.json` → `forkedFrom`) for its borderless fills, big rounds and real
shadows, then given the glass axis, a cool blue palette, Pretendard, pill buttons and smaller corners.
This folder is a complete, frozen snapshot: every file under `styles/` belongs to this system.

## Character

- **Mode**: light first. Dark is a designed counterpart — a deep blue-charcoal night
  (`oklch(0.19 0.016 258)`) with cards a step up and the same blue one shade brighter; the glass axis
  is unchanged, so a dark menu frosts its own dark ground.
- **Material — glass, and where it stops.** `--glass-fill` (76% of `--popover`) and `--glass-filter`
  (`blur(24px) saturate(1.6)`) live in `tokens.css` with the four contracts that keep glass honest:
  fill and blur move together; 72% is the opacity floor; a nested layer turns glass **off** (a
  `backdrop-filter` makes a stacking context, and a submenu inside one gets trapped); and only one
  blur per stack. Sub-menus, the chart tooltip and the toast are the documented opaque exceptions.
- **Planes and depth**: white cards on a cool near-white page, lifted by a wide, low-opacity shadow
  tinted blue-black (`rgb(16 32 64)`) so it reads as light rather than as grey dirt. Rings stay
  luma's hairline `foreground/5`.
- **Shape**: the button family is a pill (`9999px`); the input family is a 12px rectangle. Cards 20px,
  floating surfaces 18px, dialogs 24px. Pressing is still luma's 1px drop, not a scale.
- **Density**: luma's comfortable ramp — 36px default controls, 14px text, generous padding. Nothing
  here is compact; if the screen needs a hundred rows, it wants `vellum`, not this.
- **Accents**: ink-navy `oklch(0.26 0.03 255)` is the action (the near-black pill). Sky blue
  `oklch(0.62 0.16 250)` is `--ring`, `--link`, `--checked`, `--chart-1` and the selection fill —
  focus and reference. Mint (`chart-2`, `chart-3`) is the blue's only partner in charts.

## Key values

| Slot | Value (light) | Meaning |
|---|---|---|
| `--glass-fill` · `--glass-filter` | `popover 76%` · `blur(24px) saturate(1.6)` | the material, and it only applies to floating layers |
| `--overlay-backdrop` · `--overlay-backdrop-blur` | `oklch(0.55 0.03 250 / 26%)` · `20px` | a pale blue scrim; the blur is the effect, the colour steps aside |
| `--background` / `--foreground` | `oklch(0.985 0.004 240)` / `oklch(0.22 0.02 255)` | cool daylight page, blue-ink text |
| `--primary` | `oklch(0.26 0.03 255)` | ink-navy: the pill CTA |
| `--ring` · `--link` · `--checked` · `--chart-1` | `oklch(0.62 0.16 250)` | the one sky blue |
| `--shadow-card` | `0 8px 24px -8px rgb(16 32 64 / 0.12), …` | wide and soft, tinted blue-black |
| `--control-radius` · `--control-radius-sm` | `9999px` · `12px` | buttons are pills, inputs are rectangles |
| `--card-radius` · `--surface-radius` · `--surface-radius-lg` | `20px` · `18px` · `24px` | card · floating surface · dialog |
| `--control-height-md` · `--control-font-size-md` | `36px` · `14px` | luma's comfortable default |

## Combination rules

- **Glass floats, opaque sits.** The test is not "is it pretty here" but "does it float?" If the layer
  is portalled and has a backdrop behind it, it is glass; if it is in the document flow, it is opaque.
- **One blur per stack.** The modal backdrop already blurs; the dialog on top of it blurs its own
  ground. Do not add a third blur inside the dialog — pay for the repaint once.
- **One blue per view.** Focus, a link and the first chart series are already three appearances. A
  fourth (a tinted surface, a blue-filled button) makes the signal stop signalling.
- **Mint is the second series, not a second accent.** It belongs in charts and progress; it is not a
  success colour — `--success` is.

## Do not

- Do not put glass under body text. A translucent card cannot pass a static contrast check, and the
  reader pays for the effect in every paragraph.
- Do not drop `--glass-fill` below 72%. Below that the ground behind shows through the text.
- Do not make the primary button blue. The pill is ink; the blue is the signal, and a blue fill puts
  the two in competition on every screen that has a focus ring.
- Do not square the buttons. The pill/rectangle split — press it, it's a pill; type in it, it's a
  rectangle — is the system's shape grammar.

## Files

- `system.json` — name, theme, description, `forkedFrom`, fonts, tags, source.
- `registry/themes/cirrus.json` — the 72 colours; `styles/theme.css` is generated from it
  (`node tooling/theme/write-css.mjs cirrus`). Any other theme can be worn on this system.
- `styles/globals.css` (layer 1 formulas · shadows · backdrop) · `styles/tokens.css` (layer 2, with the
  glass axis) · `styles/typeset*.css` · `styles/style.css` + `styles/components/*.css` (layer 3; the
  glass rules live in `_surface-family.css`, `_menu-family.css`, `select.css`, `navigation-menu.css`).
- `reference/` — the source material is described, not stored: screens of a Korean startup-legal
  marketing site shared by the owner on 2026-09-18, read for colour, material, shape and shadow only.
