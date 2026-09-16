# lyra

lyra is the shadcn `lyra` preset: a terminal-plain system typeset entirely in JetBrains Mono, with
square corners on every surface and 1px rings doing the work that shadows do elsewhere. It reads like a
well-set config file — one type size, one corner radius (none), everything on a 4px grid. Use it for
tools whose users already live in a terminal: log viewers, query consoles, build dashboards, anything
where a monospace column that lines up is worth more than a soft edge.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- **Mode**: light first, dark complete. The two differ only in palette; no geometry changes by mode.
- **Planes and depth**: no drop shadows on resting surfaces. A card, dialog, popover and menu are all
  separated by a 1px `foreground/10` ring on a flat fill. Only floating lists carry a real shadow
  (`shadow-md`), and a submenu one step deeper (`shadow-lg`). The modal scrim is a light `black/10`,
  not the usual 80% — lyra dims rather than blacks out.
- **Density**: one step roomier than mira. Controls are 24 · 28 · 32 · 36 with `px-2.5` and `gap-1.5`;
  menu rows are 32 with `py-2`; the table head is 40; sidebar items are 32 and sit flush against one
  another with no gap.
- **Type**: one size does almost everything — 12px on a 16px line. The reading surfaces (card body,
  chat bubble, item and field descriptions, the sheet) relax to a 19.5px line. There is no 10px step:
  badges, keycaps and menu shortcuts are all 12px. Labels carry no weight of their own (400); titles
  and rows are 500.
- **Accents**: neutral throughout, including the chart ramp. `--primary` is the near-black/near-white
  foreground; selection, hover and active states are all `--muted`. The only colour is `--destructive`,
  and it appears as a 10% tint behind the text rather than a filled button.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | flat white page, near-black text (inverted in dark) |
| `--primary` | `oklch(0.205 0 0)` | the filled button and the checked indicator; neutral, not a hue |
| `--control-height-md` | `32px` | `h-8` — the default control, input, select, toggle and tabs bar |
| `--control-radius` · `--surface-radius` · `--menu-item-radius` | `0px` | the defining move: nothing is rounded |
| `--control-font-size-md` / `--control-line-height-md` | `12px` / `16px` | `text-xs`, the one type size |
| `--ui-line-height-relaxed` | `19.5px` | `text-xs/relaxed`, the reading step for descriptions and card bodies |
| `--focus-ring-width` · `--ring-focus` | `1px` · `ring/50` | a hairline ring, not a halo |
| `--ring-subtle` | `foreground/10` | the 1px ring that separates every resting surface |
| `--overlay-backdrop` | `black/10` | the light scrim |
| `--input-fill` | `transparent` (light) · `white/4.5%` (dark) | fields are drawn by their border, not a fill |

## Combination rules

- **Corners are never rounded.** If a new component needs a radius, it reads a radius token and that
  token is `0px`; do not write a literal.
- **Separate surfaces with the ring, not a shadow.** `--shadow-card` is `none`; reach for
  `--ring-subtle` first and `--shadow-float` only for something that actually floats.
- **One type size.** New UI text reads `--ui-text-md` on `--ui-line-height-md`. Use
  `--ui-line-height-relaxed` only where a paragraph is meant to be read, not scanned.
- **The body font is monospace.** Every glyph is the same width, so columns line up without a table and
  numbers align without tabular figures — but a string of text is ~30% wider than in a proportional
  font. Budget width accordingly; do not "fix" it by shrinking the type.
- `data-tone` and `data-shape` change nothing here: a toned badge looks like the plain badge and a
  shaped button keeps its (square) size radius. The preset has no tones or shapes.

## Do not

- Do not add a radius to "soften" one component. The square corner is the system; one rounded card
  reads as a bug.
- Do not swap the body font for a proportional one. `--font-sans` and `--font-mono` are deliberately the
  same family; splitting them changes every measured width in the system.
- Do not add drop shadows to cards, inputs or buttons. Depth here is a ring and a fill step.
- Do not introduce a second type size for "emphasis". Use weight (500) or colour (`--foreground` against
  `--muted-foreground`).
- Do not use the 10px step from other systems; `--ui-text-xs` is 12px here on purpose.

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — the record of the shadcn reference app this system was proved against, the comparison
  results, and `compare-exclusions.json`.
