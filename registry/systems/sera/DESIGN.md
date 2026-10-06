# sera

The editorial end of the shadcn family: nothing is rounded and almost every label is set in capitals. Card,
dialog, sheet and drawer titles are a serif (Playfair Display) at 18px with a widened track; buttons, tabs,
menu rows, table heads and badges are small uppercase sans (Noto Sans) with `tracking-wide` to
`tracking-widest`. The input family is not a box at all — it is a single underline: transparent border,
transparent fill, no horizontal padding. The palette is **taupe**, a warm grey with a hint of ochre, so the
page reads as printed paper rather than as a screen. Controls are large (28 · 36 · 40 · 44px) and the
spacing around them is generous. It suits publishing, documentation and brand surfaces where the type is
the design.

sera ports the shadcn create preset `base-sera` (shadcn 4.21.0): style sera, base colour and theme **taupe**,
chart colours taupe, lucide icons, Noto Sans with a Playfair Display heading, radius default.
`reference/README.md` records the sources, the reference app and the comparison results.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Declarations that differ from foundation's mira values
carry a `sera:` comment with the shadcn utility they reproduce; older comments that cite mira describe the
rule's origin.

## Character

- **Mode: both.** Light and dark are the shadcn **taupe** theme; neither is primary. Every derived layer-1
  colour (hover fills, rings, backdrops, tag tones) was recomputed from the taupe values with the alpha the
  preset's utility carries — no neutral grey is left in `globals.css`.
- **Two type families.** `--font-sans` is Noto Sans; `--font-heading` is its own stack, Playfair Display with
  a serif platform fallback (`ui-serif, Georgia, …`). The `cn-font-heading` titles — card, dialog, sheet,
  drawer, alert-dialog, empty, questionnaire — are the only place the serif appears, and their metrics
  differ from the body, so the heading stack must be installed for the system to look right.
- **Capitals are the system.** 44 selectors in `style-sera.css` set `uppercase`. They fall into five bands,
  each with its own track: controls `tracking-widest` (0.1em), menu rows and titles `tracking-wider`
  (0.05em), quiet labels `tracking-wide` (0.025em), tags `tracking-widest`, table heads `tracking-wider`.
  foundation has no slot for a text transform, so those are sera's own names (see the slot candidates in
  `reference/README.md`).
- **Nothing is rounded.** `--control-radius`, `--surface-radius{,-sm,-lg}`, `--menu-item-radius`,
  `--tag-radius`, `--sidebar-item-radius`, `--kbd-radius`, the calendar cell, the switch, the slider thumb
  and the scroll-area thumb are all `0`. Pills and rounds do not exist in this system.
- **The input family is an underline.** Input, textarea, select trigger, native select, OTP slot, input
  group, combobox chips and the questionnaire input draw `border-transparent border-b-input` over a
  transparent fill with `px-0`. Focus and validation move that one edge and draw **no ring**
  (`--input-border` · `--input-border-bottom`, and the split focus/invalid rules in `_control-family.css`).
- **Planes and depth.** White (light) or taupe-950 (dark) page. Menus, popovers and floating surfaces carry
  a 1px `foreground/10` ring plus `shadow-md`; the card carries a lighter `foreground/5` ring
  (`--card-ring`) with `shadow-sm`. The modal backdrop is a light 20% black.
- **Density: large.** Controls 28 · 36 · 40 · 44px with 12px uppercase text and 14px icons (xs 12px).
  Menu rows are `py-2` with 12px uppercase text, Command and Combobox rows 14px sentence case, sidebar items
  36px, table heads 48px with 12px cell padding, cards `--card-spacing` 32px, dialogs `p-6`, sheets `p-8`,
  Empty `p-12`.
- **Accents.** `--primary` is near-black taupe; the checked checkbox and switch take it, but the radio and
  the questionnaire dot mark themselves with `--foreground` on a transparent box. Badges have no box at
  all: `border-0 bg-transparent px-0`, coloured text only.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.147 0.004 49.3)` | paper and ink (taupe-950) |
| `--primary` | `oklch(0.214 0.009 43.1)` | filled buttons, checked checkbox and switch |
| `--input` | `oklch(0.922 0.005 34.3)` | the one edge the input family draws |
| `--input-border` / `--input-border-bottom` | `transparent` / `var(--input)` | the underline split |
| `--ring-subtle` / `--card-ring` | `foreground/10` / `foreground/5` | menu ring vs card ring |
| `--control-height-md` | `40px` | the default control |
| `--control-radius` · `--surface-radius` | `0px` | the system has no corners |
| `--control-text-transform` | `uppercase` | the control band's capitals |
| `--title-letter-spacing` | `0.05em` | the serif titles' track |
| `--tag-*` | height `auto`, padding `0`, radius `0` | the badge is text, not a box |

## Combination rules

- A title marked `cn-font-heading` gets Playfair Display, `uppercase` and `--title-letter-spacing`. Do not
  mix a serif title with a sentence-case body label in the same header — the pairing reads as a mistake.
- Controls and tags are capitals; Command rows, Combobox rows, descriptions and long-form text are not.
  When a new component needs a label, put it in the band it belongs to (`--control-*`, `--menu-*`,
  `--ui-label-*`, `--tag-*`) rather than writing `uppercase` in place.
- Never give a control a radius. Where a component needs a shape, use a border or a fill, not a corner.
- An input-shaped control gets `--input-border` on every side and `--input-border-bottom` on the block-end
  edge; the focus and invalid rules in `_control-family.css` already move that edge, so no component file
  should draw a focus ring on a field.

## Do not

- Do not reintroduce a ring on the input family — sera's whole field language is the one moving edge.
- Do not read `--ui-letter-spacing` for a label that should be uppercase; the five caps bands each have
  their own token so one band can be tuned without the others.
- Do not round anything "just a little". `0` is the system.
- Do not set the heading font on body text; the serif is for `cn-font-heading` only.

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — the preset's record: sources, the reference app, the comparison results and the exclusions.
