# Typography

Stacks, weights, tracking and how labels speak.

| Token | What |
|---|---|
| `--font-sans`, `--font-heading`, `--font-mono` | the stacks; `--font-heading` is for titles only |
| `--ui-text-xs` · `-sm` · `-md` · `-lg`, `--ui-line-height-*` | the interface type ramp |
| `--control-font-size-*`, `--control-font-weight`, `--control-letter-spacing`, `--control-text-transform` | how buttons speak |
| `--control-font-size-field` | text inside inputs (keep ≥ 16px on touch screens to stop zoom) |
| `--heading-font-size-*`, `--heading-letter-spacing`, `--title-letter-spacing`, `--title-text-transform` | titles |
| `--ui-label-text-transform`, `--ui-label-letter-spacing`, `--label-font-weight` | small labels (group labels, table heads) |
| `--indicator-font-size`, `--indicator-font-weight`, `--indicator-text-transform` | badges |

## Fonts

A stack is a CSS `font-family` value. Name a widely available family first and end with a generic
(`"Inter", ui-sans-serif, system-ui, sans-serif`). If the system needs a web font, say so in the concept; the app
loads it (the setup skill adds the link or `next/font`), the tokens only name it.

## Reading a mood

- **Neutral tool**: sans 13–14px controls, weight 500, titles −0.01em.
- **Editorial**: serif `--font-heading`, uppercase labels with +0.06em tracking, regular weight body.
- **Friendly**: rounded or geometric sans, weight 500–600 controls, sizes a step up.
- **Technical**: mono for numbers and keys (`--font-mono`), tight tracking, small sizes.

Size the ramp together; keep body text and control text within one step of each other.
