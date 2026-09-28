# loam — reference

Design values only. No product's marks, names, wording, icons or screen layouts are reproduced, and no
screenshots or assets are stored here.

## Source

**A creator-workspace dashboard the owner was logged into (2026-09-28).** Its home, library, chat, a custom-AI
pane and that pane's knowledge tab were captured in the browser, and computed styles were read from the page.
Taken from it:

- the dark ramp: `#111` ground, `#171717` sidebar, `#1c1c1c` cards, `#222` raised surfaces, `#2a2a2a`
  fields and hover, and white-alpha veils for quiet fills (2–8%) and hairlines (8–14%);
- the text: `#d9dcd8` body, white titles, `#919191` secondary, 72% white for idle sidebar rows;
- the white pill CTA (40px, 14px medium text, 20px side padding) and the 6%-white outline pill beside it;
- the sage accent family (`#73b490` dark, `#66b08b` / `#3a7854` light) and the fruit hues used for charts and
  tags (blueberry · gooseberry · acai · cloudberry);
- the lighting: the page's two radial washes (4% white above the top left, 1.5% past the bottom right, blended
  lighter), a 16% sage glow from the top of hero surfaces, and 3–4% white fills with 7–10% edges on cards;
- the panels: a `#171717` sidebar with a 10% edge on 12px corners and `#111` panes with a 6% edge on 18px
  corners, floating on the ground with gaps between them;
- the geometry: 30px sidebar rows on 12px corners, 12px list rows and suggestion cards, 16px section cards,
  18px panes, a 24px hero card, a 10–12px popup corner, and a soft `0 14px 32px` popup shadow;
- the light counterpart's values: `#f6f6f6` page, `#fafafa` sidebar, white panes, warm ink `#272523`,
  `#686764` secondary text, 10% ink hairlines.

## Why nocturne

nocturne already has the shape: dark first, a ladder of planes one step apart, pill controls, 10px fields and a
single signal colour that marks without filling. loam changes values and drops two voices — Bricolage titles
and the mono uppercase label band — so every layer-3 rule it inherits still reads the same names.

## Names loam adds

| Name | Layer | Default when unset | Read by | Why loam needs it |
|---|---|---|---|---|
| `--bubble-fill` · `--bubble-foreground` | 1 | `var(--primary)` · `var(--primary-foreground)` | `.cn-bubble-variant-default` | the person's bubble is a quiet plane while the primary stays the one white pill |
| `--card-sheen` | 1 | `none` | `.cn-card` (`background-image`) | light falls across every card from the top left |
| `--card-emphasis-sheen` · `--card-emphasis-radius` | 1 · 2 | `--card-sheen` · `--card-radius` | `.cn-card[data-emphasis]` (a new selector) | the one hero card: a signal glow from the top edge and the hero corner |
| `--pane-sheen` | 1 | `none` | the floating sidebar's inner panel · the pane beside it | panels are lit from the top left |
| `--sidebar-floating-shadow` | 2 | `var(--shadow-chip)` | `.group[data-variant=floating] .cn-sidebar-inner` | the source's panels have an edge and no shadow |
| `--sidebar-pane-ring` · `--sidebar-pane-gap` · `--pane-sheen-blend` | 1 · 2 · 1 | `var(--border)` · — · `normal` | `.peer[data-variant=floating] ~ .cn-sidebar-inset` at md and up (a new selector) | beside a floating sidebar the main area is a bordered pane too; upstream styles the inset only for `variant="inset"`. The edge and the light are an `::after` overlay so an app's opaque main cannot hide them |

loam also keeps nocturne's names (`--control-radius-field`, `--tabs-list-radius*`, `--title-font-weight`, the
label family slots, the active-marker slots with a 0px width, `--typeset-heading-*`, `--shadow-float-color`,
`--progress-indicator-fill`, `--slider-range-fill`, `--tabs-line-indicator`, `--tooltip-*`) with its own
values; nocturne's `reference/README.md` describes them.
