# Colour

Layer 1. Colours are names (`primary`, `card`, `muted-foreground` …) with a value per mode. Every primitive and
every `data-role` component reads these names, never a literal.

## Moves, cheapest first

1. **Palette** (`set_colours` `palette`): the whole neutral ramp and its tints at once. The system palettes
   (graphite, loam, clover …) carry a system's mood; the shadcn bases (stone, zinc, neutral, slate, gray) are plain.
2. **Accent** (`accent`): lays one hue over `primary`, `ring`, `sidebar-primary` and the selection colours.
3. **Chart** (`chart`): one hue's ramp over `chart-1` to `chart-5`.
4. **By hand** (`light`, `dark`): any of the 72 names, per mode. Use it for what the palette and accent cannot say:
   a tinted `card` against the `background`, a `border` that is warmer, the night version of the palette.

## The names that carry the feel

| Group | Names | What they decide |
|---|---|---|
| ground and planes | `background`, `card`, `popover`, `sidebar` | how far a raised plane is from the ground in colour (none, a tint, a step) |
| text | `foreground`, `muted-foreground`, `*-foreground` | contrast; keep body text ≥ 4.5:1 on its plane |
| action | `primary`, `primary-foreground`, `ring` | the one colour that means "do this" |
| quiet fills | `secondary`, `muted`, `accent` | hover and secondary fills; keep them close to the plane |
| edges | `border`, `input` | hairlines; in a glass or dark system often a translucent white |
| status | `destructive`, `info`, `success`, `warning` (+ `-soft`) | keep the hues recognisable; shift lightness to fit the palette |

## Write values as

`oklch(L C H)` keeps hue steady while you move lightness, which is what both modes need. `color-mix(in oklab, …)`
is fine for translucent edges (`color-mix(in oklab, white 12%, transparent)`).

## Dark mode

Dark is not the light palette inverted. Lower the chroma of large planes, keep the accent's hue and raise its
lightness, and step planes by lightness (ground darkest, raised lighter). Set it under `dark`.
