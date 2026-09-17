# nocturne reference

## Source

The tyohnn website's exhibition tone (2026-09-17), given as a written spec: the dark palette (ground
`#0b0c0e`, card `#121316`, raised `#1a1c20`, hover-strong `#24262b`, hairline and strong borders at 9% / 20% of
`#ecece8`, text `#ecece8` · `#a3a5ab` · `#6b6e75`), the pale primary pill, the lavender `#b9c2ff` signal, the
pill · 10 · 14 · 16 · 18 radius ladder, the deep `0 30px 80px rgba(0,0,0,0.6)` popup shadow, Geist / Bricolage
Grotesque / Geist Mono and the mono uppercase label voice. No screenshots or assets are stored.

## Why foundation, not luma

luma is the closest shape (pill buttons, 36px controls, 14px text), but it draws fields with no border, puts a
shadow under cards, and still carries 46 layer-3 files forked from foundation. nocturne wants hairline edges,
flat cards and 10px fields, which is foundation's structure with different values. Forking foundation keeps the
layer-3 rules on the current slot contract, so every nocturne edit below is visible as a diff against foundation.

## Layer-3 edits and the names they read (foundation slot candidates)

Every edit reads a name; no value is written into a rule. Colours are in layer 1 (both scopes), the rest in the
last `:root` block of `styles/tokens.css`.

| Name | Layer | Foundation would be | Read by | Why nocturne needs it |
|---|---|---|---|---|
| `--control-radius-field` | 2 | `var(--control-radius)` | input · textarea · select trigger (both sizes) · native select · combobox · input group · input OTP · field choice card | the button family is a pill (`--control-radius: 9999px`) while fields are 10px boxes; one corner cannot carry both |
| `--tabs-list-radius` | 2 | `var(--surface-radius)` | `.cn-tabs-list` | the default tabs bar is a pill; `--surface-radius` is the 14px popup corner |
| `--title-font-weight` | 2 | `var(--ui-font-weight)` | card · dialog · alert-dialog · sheet · drawer · empty titles | Bricolage titles at 700 while UI labels stay 500 |
| `--sidebar-group-label-font-family` · `--table-head-font-family` · `--menu-label-font-family` | 2 | `initial` (inherit) | sidebar group label · table head · dropdown / context / menubar / command / combobox / select group labels | the mono label voice; no family slot exists on any label band |
| `--sidebar-item-active-marker-width` · `-offset` · `-inset-y` | 2 | — (no marker) | `[data-slot=sidebar-menu-item]:has(> .cn-sidebar-menu-button[data-active])::before` | the straight bar outside the active item (a structural addition, shape 1 in DESIGN.md §5) |
| `--typeset-heading-weight` · `--typeset-heading-tracking` | 2 | the vendor's `600` · `normal` | `typeset-preset.css` h1–h4 | Bricolage long-form headings at 700 / -0.04em |
| `--sidebar-item-active-marker` | 1 | — | the bar above | lavender, darker in light |
| `--progress-indicator-fill` · `--slider-range-fill` | 1 | `var(--primary)` | `.cn-progress-indicator` · `.cn-slider-range` | indicators take the signal while the primary pill stays pale |
| `--tabs-line-indicator` | 1 | `var(--foreground)` | `.cn-tabs-list[data-variant=line] .cn-tabs-trigger::after` (`!important`) | the line-tab underline is lavender; upstream paints it with the utility `after:bg-foreground` |
| `--tooltip-fill` · `--tooltip-foreground` · `--tooltip-ring` | 1 | `var(--foreground)` · `var(--background)` · none | `.cn-tooltip-content` (`!important` on the two colours); the arrow is hidden | tooltips are raised surfaces with the strong edge and deep shadow, not inverted chips; upstream colours them with utilities |
| `--shadow-float-color` | 1 | — | `--shadow-float` (`@theme static`) | the one deep shadow differs by mode and a static theme value has no `.dark` scope |

Other rule edits that read existing slots: `.cn-select-label` now reads the menu-label band
(`--menu-label-padding-y` · `-letter-spacing` · `-text-transform`) like the other popup group labels (foundation
gives it literals), and `.cn-empty-title` reads `--title-letter-spacing` instead of mira's `-0.025em` literal.

The three `!important`s are the DESIGN.md §1 kind: upstream sets the value with a utility, and layer 3 in
`layer(base)` cannot beat a utility otherwise.

## Not matched

- The default tabs' **active trigger fill** is the component's utility (`data-active:bg-background`, dark
  `bg-input/30` with a `border-input` edge). It stays neutral, as the spec asks, but its exact step is not
  tunable without an `!important` override.
- Bricolage Grotesque loads the fontsource `wght` entry, like every catalog font (and like next/font's default
  axis), so the `opsz` axis stays at its default instead of following the size.
