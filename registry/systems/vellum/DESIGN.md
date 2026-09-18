# vellum

A documentary system: the kind of screen you read for an hour and then cite. The parchment is the
shell — the sidebar rail and the gutter around an inset — and the document surface inside it is white,
so what you are reading is the brightest thing on screen. A serif carries every heading, hairlines do
the separating, and tables are tight enough to hold a hundred rows without turning into a wall. Ink is
the action; one deep teal is the only signal. It suits work where the document is the product —
matters, reviews, filings, contracts, audit trails.

Forked from `mira` (see `system.json` → `forkedFrom`) for its compact controls and hairline rings, then
given a parchment shell, a serif heading axis, softer-but-smaller corners and a denser table rhythm.
This folder is a complete, frozen snapshot: every file under `styles/` belongs to this system.

## Character

- **Mode**: light first. Dark is a designed counterpart, not an inversion — warm dark stock
  (`oklch(0.18 0.004 70)`), cards a step up, the same teal one shade brighter.
- **Planes and depth**: two planes and no shadow. The parchment shell (`--sidebar`) holds the white
  document surface (`--background`, `--card`), and everything inside it is separated by a 1px hairline
  (`--border`) plus the one subtle inner ring cards and menus share. `--shadow-card` is empty; depth
  comes from the parchment/white step at the shell boundary, not from lift.
- **Density**: 32px controls with 13px text — a step taller than mira, because the controls sit in a
  document and want to be comfortable. The table goes the other way: a 36px head, 7px cell padding, and
  rows that size to their content.
- **Two type voices**: Source Serif 4 for headings (`--font-heading`, read by `.cn-font-heading`),
  Inter for everything else. The serif is what makes a panel read as a document rather than an app pane.
- **Accents**: ink is the primary action (a near-black button, paper text). Teal
  (`oklch(0.4 0.05 192)`) is `--ring`, `--link`, `--chart-1` and the text-selection fill — focus and
  reference, never a fill for a button. Status colours stay in the alert/badge vocabulary.

## Key values

| Slot | Value (light) | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(0.995 0.002 85)` / `oklch(0.215 0.004 70)` | the white document surface, warm ink |
| `--card` | `oklch(1 0 0)` | white on white — cards are drawn by their hairline, not by a tint |
| `--primary` | `oklch(0.215 0.004 70)` | ink: the action is the same colour as the text |
| `--ring` · `--link` · `--chart-1` | `oklch(0.4 0.05 192)` | the one teal signal |
| `--sidebar` | `oklch(0.982 0.005 80)` | the parchment shell: the rail, and the gutter around an inset |
| `--checked` | `oklch(0.215 0.004 70)` | a checked box is ink, not teal |
| `--control-height-md` | `32px` | comfortable controls (mira: 28) |
| `--table-head-height-default` | `36px` | tight rows (mira: 40) |
| `--tag-radius` · `--badge-radius` | `6px` | a label is a small rounded rectangle, never a pill |
| `--surface-radius` / `--surface-radius-lg` | `10px` / `12px` | modest corners: a dialog is a sheet |

## Combination rules

- **Tag tones are categories, not severity.** The seven tones (`blue` … `gray`) all carry a soft tinted
  plate, a slightly darker hairline and readable ink; use them for kinds of thing (segment, stage,
  rights granted). Say "needs attention" with the status colours or `destructive`, not with a red tag.
- **Avatar tones stay quiet.** They are near-paper tints with one shared ink for the initials, so a
  column of forty avatars reads as texture, not confetti.
- **One teal per view.** If focus, a link and a chart series are all on screen, that is already three
  places the teal appears; do not add a fourth by tinting a surface with it.
- **Serif for titles, sans for everything else.** A serif label inside a control, a serif table header,
  or serif body copy all break the voice. The marker `.cn-font-heading` is the boundary.

## Do not

- Do not add drop shadows to lift a card. The parchment-to-white step at the shell plus a hairline is
  the depth; a shadow makes the page look like an app and flattens the reading.
- Do not make the primary button teal. The teal is a signal; a teal filled button competes with
  every focus ring on the page.
- Do not turn labels back into pills (`9999px`). The 6px rectangle is a system-wide voice — badges,
  tags and the select chips all share it.
- Do not tint the document surface to match the shell. The parchment belongs to the rail and the
  gutter; the moment the reading surface goes warm, the page loses the plane that says "this is the
  document". In dark mode the same split holds, one step deeper: the rail sits below the page, not above.

## Files

- `system.json` — name, theme, description, `forkedFrom`, fonts, tags, source.
- `registry/themes/vellum.json` — the 72 colours; `styles/theme.css` is generated from it
  (`node tooling/theme/write-css.mjs vellum`). Any other theme can be worn on this system.
- `styles/globals.css` (layer 1 formulas) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — the source material is described, not stored: screens of a legal AI workspace shared
  by the owner on 2026-09-18, read for colour, density, shape and the type pairing only.
