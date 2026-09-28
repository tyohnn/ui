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

loam also keeps nocturne's names (`--control-radius-field`, `--tabs-list-radius*`, `--title-font-weight`, the
label family slots, the active-marker slots with a 0px width, `--typeset-heading-*`, `--shadow-float-color`,
`--progress-indicator-fill`, `--slider-range-fill`, `--tabs-line-indicator`, `--tooltip-*`) with its own
values; nocturne's `reference/README.md` describes them.
