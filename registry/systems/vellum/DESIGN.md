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
- **Two weights of line**: the hairline (`--border`) separates, and it may stay faint because the
  content on either side says where each part is. The edge of a field (`--input-border`) locates: it is
  the only thing that says where a field starts, so it is ink at half strength and clears 3:1 against
  every surface a field sits on (WCAG 1.4.11), in both modes. A form reads like a printed form — ruled
  boxes on a page of faint rules.
- **Density**: 32px controls with 13px text — a step taller than mira, because the controls sit in a
  document and want to be comfortable. The table goes the other way: a 36px head, 7px cell padding, and
  rows that size to their content.
- **Two type voices**: Source Serif 4 for headings (`--font-heading`, read by `.cn-font-heading`),
  Inter for everything else. The serif is what makes a panel read as a document rather than an app pane.
- **Accents**: ink is the primary action (a near-black button, paper text). Teal
  (`oklch(0.4 0.05 192)`) is `--ring`, `--link`, `--chart-1` and the text-selection fill — focus and
  reference, never a fill for a button. Status colours stay in the alert/badge vocabulary.
- **Charts**: `--chart-1` … `--chart-5` are one ramp of that teal, strongest first — an ordinal ramp
  for order and amount, not five colours for five things. This system has no categorical chart
  palette, on purpose: five hues strong enough to tell series apart would each be louder than the one
  signal the page has.

## Key values

| Slot | Value (light) | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(0.995 0.002 85)` / `oklch(0.215 0.004 70)` | the white document surface, warm ink |
| `--card` | `oklch(1 0 0)` | white on white — cards are drawn by their hairline, not by a tint |
| `--primary` | `oklch(0.215 0.004 70)` | ink: the action is the same colour as the text |
| `--ring` · `--link` · `--chart-1` | `oklch(0.4 0.05 192)` | the one teal signal |
| `--chart-1` … `--chart-5` | `oklch(0.4 0.05 192)` → `oklch(0.74 0.05 192)`, 0.085 L apart | one teal ramp, strongest first (dark: `0.72` → `0.44`, brightest first); the faintest step is still 2.2:1 on the page |
| `--sidebar` | `oklch(0.982 0.005 80)` | the parchment shell: the rail, and the gutter around an inset |
| `--checked` | `oklch(0.215 0.004 70)` | a checked box is ink, not teal |
| `--input-border` · `--checkbox-border` · `--switch-track-off` | `color-mix(in oklab, var(--foreground) 50%, var(--background))` | the edge of a field, half-strength ink: 3.8:1 on the page in light, 4.0:1 in dark (the hairline is 1.3 and 1.5) |
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
- **The field edge is for what a person fills in.** Input, Textarea, Select, Native Select, Input Group,
  Input OTP, the Combobox chip box, Checkbox, Radio and the off Switch read it. A button does not: the
  outline Button and the outline Toggle keep the hairline, because their label is what identifies them
  and a page of dark-edged buttons would compete with the fields. An invalid field keeps the same weight
  in red (`--border-invalid` is the full `--destructive` in both modes).
- **The chart ramp says order, never kind.** Use `--chart-1..5` where swapping the items would change
  the meaning — funnel stages, tiers, age bands, this period against the last — or as one colour
  (`--chart-1`) for a single series. Nominal bars (channels, teams, accounts) all take `--chart-1`; the
  axis label says which is which. When several series have to be compared, draw **small multiples**:
  one small chart per series on the same scale, each in `--chart-1`, each titled with its series. Two
  series that must share a plot take steps far apart (`--chart-1` and `--chart-4`) and a direct label
  each, so the reader never has to match a swatch.
- **Serif for titles, sans for everything else.** A serif label inside a control, a serif table header,
  or serif body copy all break the voice. The marker `.cn-font-heading` is the boundary.

## Do not

- Do not add drop shadows to lift a card. The parchment-to-white step at the shell plus a hairline is
  the depth; a shadow makes the page look like an app and flattens the reading.
- Do not make the primary button teal. The teal is a signal; a teal filled button competes with
  every focus ring on the page.
- Do not turn labels back into pills (`9999px`). The 6px rectangle is a system-wide voice — badges,
  tags and the select chips all share it.
- Do not draw a field with the hairline, and do not rule the page with the field edge. Setting
  `--input-border` back to `--border` makes a form on white paper invisible (1.3:1); using the field edge
  for separators, table rules or card rings turns the document into a grid of boxes.
- Do not add hues to tell chart series apart, and do not borrow the tag tones or the status colours for
  them. A tag tone is a soft plate, not a mark, and a status colour already means something. If a chart
  needs more than two series in one plot, it is several charts.
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
