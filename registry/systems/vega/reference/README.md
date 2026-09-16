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

`node tooling/snapshot/compare-shadcn.mjs --system vega --mode light` (and `--mode dark`). The default template is
`coverage` (every registry/ui component, section by section, popups open); `--template component-sheet` runs the
older Specimen comparison. Exclusions live in `compare-exclusions.json` with a reason each.

## Reference Specimen

`make-reference.mjs` copies `apps/preview/src/templates/component-sheet` **and `.../coverage`** into the
reference app unchanged except for:

- imports: `@tyohnn/components/*` → `@/components/ui/*`, `@tyohnn/icons` → a copy of `registry/ui/icons`
  for lucide (the same glyphs the tyohnn preview draws);
- Korean strings → English (`tooling/preset/specimen-text.json`); the comparison swaps the same strings on
  the tyohnn page before measuring, so the tyohnn Specimen keeps its Korean;
- comments removed and `"use client"` added.

The app's `app/page.tsx` renders the Specimen, or the coverage template for
`?template=coverage[&section=<name>]` — the same query the preview reads, so both apps show the same section
with the same popups open.

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

Exclusions in that run: none.

## Results — coverage template (2026-09-16)

`compare-shadcn.mjs --system vega` (the default `coverage` template), viewport 1440×900: 57 sections, each opened
alone so its popups render open, 2514 paired elements over 60 components (2097 slots; `direction` and `sonner`
render no `data-slot` of their own).

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | the component sheet's system, measured over the whole coverage template for the first time | 826 | — |
| 1 | focus and invalid rings compose the control's own shadow (`--control-shadow`); toggle border only on the outline variant; skeleton `bg-muted` + `rounded-md`; `file:h-7`; vertical separator `h-full`; avatar fallback `text-sm`; card content `flex flex-col gap-3`; field label `leading-snug` and field title `text-sm` | 256 | — |
| 2 | calendar `text-[0.8rem]` weekdays, `--cell-size` nav buttons (button sizes are `height`, not `min-height`), no border or padding on the dropdown root and caption label; `outline-style: none` so the base `outline-ring/50` survives; cmdk's `data-selected="false"` / `data-disabled="false"`; command panel `rounded-xl!` without a shadow; combobox item `py-1.5`; DialogTitle inherits its size; alert dialog content inherits `text-base`; menubar `min-w-36` and its label colour; menu indicators without a box; context menu sub-trigger and indicator; sidebar separator and sub-rail; sonner keeps its own type | 62 | 66 |
| 3 | exclusions written (see below) | 0 | 24 |
| 4 | dark: `color-scheme` on `:root` / `.dark` (native `<option>` colours), sidebar input border, button group separator `bg-input` | 0 | 0 |

Exclusions (`compare-exclusions.json`), 62 rows in light and 86 in dark, with one reason each:

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `field-description` top margin | registry/ui keeps `nth-last-2:-mt-1` but not shadcn's `[[data-variant=legend]+&]:-mt-1.5` |
| input group buttons, the combobox clear icon | registry/ui's `InputGroupButton` passes `size` to `Button`; shadcn's does not |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu shortcut widths | ⌘ is in neither Inter build and the two font stacks fall back differently (0.5px) |
| context menu sub-content shadow | registry/ui carries `cn-context-menu-subcontent`; the upstream name is `cn-context-menu-sub-content` |
| questionnaire action row height | registry/ui dropped shadcn's `sm:min-h-9` |
| dark state colours on open triggers, the focused outline button, the invalid checked checkbox and the sidebar search box | Tailwind sorts the preset's `dark:` colours after state utilities that have no dark counterpart, so upstream those states lose their colour in dark |

Five of those are differences in `registry/ui` rather than in vega; they are the list to hand to the next
`registry/ui` pass (the class-name typo is a plain bug).

Not covered by the comparison: nothing. The coverage template renders all 62 `registry/ui` components and the
comparison pairs every one that carries a `data-slot`.