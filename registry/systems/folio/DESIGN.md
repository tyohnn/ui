# folio

Vellum's paper and ink, given the voice of a landing page. The parchment shell, the white document
surface, the serif that carries headings and the hairline rules stay as vellum has them. What changes is the
action: one deep teal (`#4E7A78`) is the primary colour, the primary button is lit from above and lifts on a
teal glow, and large buttons may take a pill shape. Body text is Pretendard, so Korean and Latin share one face;
headings keep Source Serif 4 with MaruBuri for Hangul.

Forked from `vellum` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- Mode: light first. Dark is vellum's warm dark stock, with a flat ink primary.
- Planes and depth: colour steps and hairline borders, as vellum. The primary button is the only raised thing.
- Density: vellum's (compact controls, dense tables).
- Accents: teal is the action, focus ring and checked state. Status colours and tags are vellum's.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--primary` (light) | `oklch(0.547 0.049 192)` = `#4E7A78` | teal action; white text 4.8:1 |
| `--primary-hover` | `--primary` 86% + black | hover darkens instead of fading over white |
| `--checked` | `--primary` | checkbox · radio · switch in teal |
| `--surface-primary` | `--folio-primary-sheen` | top highlight over a 135° teal gradient |
| `--shadow-control-primary` | `--folio-primary-lift` | inner light and shade, teal glow under the button |
| `--button-pill-radius` | `999px` | `data-shape="pill"` buttons |
| `--font-sans` | Pretendard | one face for Korean and Latin body text |

## Combination rules

- One lit button per view: the primary action. Secondary actions are outline or ghost and stay flat.
- Pill shape is for large calls to action, not for toolbar buttons.
- Teal also marks a key word: a soft teal box (`--primary-soft-strong` fill, `--primary` text).

## Do not

- Do not add a second signal colour; charts and highlights stay in the teal ramp (`--chart-1…5`).
- Do not light secondary or outline buttons.

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — source material.
