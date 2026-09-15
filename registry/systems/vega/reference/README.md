# vega — reference

This system ports the shadcn create preset `base-vega` (shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`,
tag `shadcn@4.21.0`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Vega / Lucide / Inter` |
| `base` | `base` |
| `style` | `vega` |
| `baseColor` | `neutral` |
| `theme` | `neutral` |
| `chartColor` | `neutral` |
| `iconLibrary` | `lucide` |
| `font` | `inter` |
| `fontHeading` | `inherit` |
| `item` | `Item` |
| `rtl` | `false` |
| `menuAccent` | `subtle` |
| `menuColor` | `default` |
| `radius` | `default` |

## Sources

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-vega.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs vega` — `npx shadcn@4.21.0 init -t next -b base -p vega -n vega`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## Comparison

`node tooling/snapshot/compare-shadcn.mjs --system vega --mode light` (and `--mode dark`). Exclusions live in
`compare-exclusions.json` with a reason each.

## Reference Specimen

`make-reference.mjs` copies `apps/preview/src/templates/component-sheet` into the reference app unchanged
except for:

- imports: `@tyohnn/components/*` → `@/components/ui/*`, `@tyohnn/icons` → a copy of `registry/ui/icons`
  for lucide (the same glyphs the tyohnn preview draws);
- Korean strings → English (`tooling/preset/specimen-text.json`); the comparison swaps the same strings on
  the tyohnn page before measuring, so the tyohnn Specimen keeps its Korean;
- comments removed and `"use client"` added.

`data-tone` (Badge, AvatarFallback) and `data-shape` (Button) are **kept** on both sides. shadcn ignores
them; vega's slots make a toned tag look exactly like the plain outline badge and a shaped button keep its
size radius, so the comparison checks that the attributes change nothing. No Specimen component was
missing from shadcn 4.21.0 and the copy type-checks against the shadcn components (no API differences).

## Results (2026-09-15)

`compare-shadcn.mjs`, viewport 1440×900, sheet plus the open select, dropdown menu and dialog:

| Iteration | What changed | Light mismatches |
|---|---|---|
| 0 | `port.mjs` only (foundation values, vega chart colours and radius scale) | 1021 (sheet only) |
| 1 | layer 2 control · menu · sidebar · ui-text axes, focus ring 3px/50%, letter-spacing normal | 362 |
| 2 | shadow-xs, outline fills, card · badge · kbd · input · select · switch · tabs rules | 32 |
| 3 | select trigger height, alert padding | 0 (dark: 15) |
| 4 | outline badge and tags unfilled in dark | 0 · dark 0 |
| 5 | open states added to the comparison | 62 |
| 6 | menu family, select items, dialog and popover surfaces | 6 |
| 7 | dropdown width excluded (TSX drift, see below) | 0 + 6 excluded · dark 0 + 6 excluded |
| 8 | `registry/ui` synced with shadcn 4.21.0 base components; exclusion removed | 0 · dark 0 (no exclusions) |

Exclusions (`compare-exclusions.json`): none. Until iteration 7 the heights of `dropdown:root`,
`dropdown-menu-group#0` and `dropdown-menu-item#0` were excluded: shadcn 4.21's `DropdownMenuContent` carries
`w-(--anchor-width)` and `registry/ui` did not, so only the upstream menu wrapped "Move to review ⌘D". The
sync of `registry/ui` with the shadcn 4.21.0 sources restored the utility.

Not covered by the comparison (ported from `style-diff.mjs mira vega` by reading, not measured): accordion,
alert dialog, breadcrumb, button group, calendar, chart tooltip, combobox, command, context menu, drawer,
empty, field, hover card, input group, input OTP, item, menubar, navigation menu, native select,
pagination, popover, progress, sheet, sidebar parts beyond the menu, slider, textarea, toast, toggle,
toggle group, bubble, attachment, marker, questionnaire and message.
