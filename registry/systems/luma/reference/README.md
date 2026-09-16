# luma — reference

This system ports the shadcn create preset `base-luma` (shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`,
tag `shadcn@4.21.0`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Luma / Lucide / Inter` |
| `base` | `base` |
| `style` | `luma` |
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

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-luma.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs luma` — `npx shadcn@4.21.0 init -t next -b base -p luma -n luma`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## Comparison

`node tooling/snapshot/compare-shadcn.mjs --system luma --mode light` (and `--mode dark`). Exclusions live in
`compare-exclusions.json` with a reason each.

The run used the reference app on **3111** (`npx next start` after `npm run build` — the production build
compiles with no errors, unlike mira's hugeicons spinner) and the preview on **5182**:

```sh
node tooling/snapshot/compare-shadcn.mjs --system luma \
  --reference http://localhost:3111 --preview http://localhost:5182 --mode light|dark --max-shots 0
```

## Reference app

`make-reference.mjs` reported **no component missing from shadcn 4.21.0** and **0 type errors** in the copied
Specimen and coverage templates, so there is no API difference between `registry/ui` and the shadcn components
for this preset. `data-tone` and `data-shape` stay on both sides; luma has no tones or shapes, and the
comparison confirms the attributes change nothing.

Where `style-luma.css` and the generated `components/ui/*.tsx` disagree the app wins, as the procedure says.
Two places where that mattered:

- the sidebar's `[--radius:var(--radius-xl)]` on the header and the scroller: every corner inside them is one
  step larger than on the page (`rounded-xl` is 19.6px there, `rounded-2xl` 25.2, `rounded-3xl` 30.8), while
  the footer keeps the page's 10px `--radius`. luma re-declares `--sidebar-item-radius` and
  `--sidebar-badge-radius` on those three elements so the `calc()` resolves against the local `--radius`;
- the collapsed icon rail (`group-data-[collapsible=icon]:size-8! p-2!`) keeps the 32px square the item row
  grew out of — the row is `h-9 px-3 py-2`, the rail is not.

## Results (2026-09-16)

`compare-shadcn.mjs --system luma` (the `coverage` template), viewport 1440×900, DPR 1: 57 sections, each
opened alone so its popups render open, 2514 paired elements over 62 components, 0 unpaired on either side.

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | `port.mjs` only (foundation values, luma's radius scale) | 10924 | — |
| 1 | layer 2 across every axis: control 24 · 32 · 36 · 40 with 14/20 text and 16px icons, menu rows (p-1.5 surfaces, py-2 rows, 18px radii, 192px minimum), 36px sidebar items, the 12/14/16 UI ramp, 48px table heads, 22/26px surfaces, shadow-xl modals; layer 1 derived colours (bg-input/50 fills, bg-input/90 unchecked controls, ring-foreground/5 in light, a 30% backdrop, a transparent input border) | 4092 | — |
| 2 | `--control-radius-sm` for the input family's rounded-3xl; pill tabs; the calendar's 32px cell; the bubble's px-3.5/py-2.5 and leading-relaxed; the chart's 12/16 text and its ringed, rounded-xl, shadow-lg tooltip | 2559 | — |
| 3 | menu rows take `font-medium`, `pr-8` and the py-2 the family already carried; select and combobox items join them | 2194 | — |
| 4 | `--card-radius` (26) apart from the popover's 22, `--shadow-card` = shadow-md, the slider's bg-input/90 track, and the transparent border across input · textarea · select · native select · OTP · combobox · questionnaire | 1492 | — |
| 5 | alert 16/12 padding, the Command panel's own p-1 and gap-2 rows | 1001 | — |
| 6 | `--shadow-float` = shadow-lg (every floating surface), bg-secondary close buttons, menu labels at py-2.5 / text-xs, select and combobox separators at full `--border` | 759 | — |
| 7 | the switch thumb's pill and shadow (through `--tw-shadow`, since `ring-0` composes box-shadow in the utilities layer), the slider thumb's pill · ring-1 · shadow-md, h-3 progress, breadcrumb 10px gaps, the card corner family, menubar trigger, questionnaire choice, the resizable handle's 10px | 559 | — |
| 8 | dialog title `leading-none`, alert-dialog title text-lg, drawer p-4 and shadow-xl, tooltip text-xs, the sidebar's local `--radius`, attachment text-xs | 391 | — |
| 9 | questionnaire gaps, empty p-12 / gap-4 / text-lg title, `has-data-checked:bg-input/30` field labels, input-group block-addon padding and rounded-3xl kbd | 326 | — |
| 10 | the collapsed icon rail, sm sub-rows at text-xs, the navigation-menu chevron's size-3, alert `mb-4`, item group gap-4 | 261 | — |
| 11 | combobox chips py-1.5 / px-1.5, the Command separator without its negative margin, the menubar's p-1 and px-3.5 label | 226 | — |
| 12 | `inputGroupButtonVariants` sizes (xs h-6 px-1.5, icon-xs size-6, icon-sm size-8, all rounded-xl), the textarea's py-2.5 inside a group | 177 | — |
| 13 | the sidebar radius slots re-declared where `--radius` changes, `pl-2!`/`pr-2!` pagination, alert-dialog max widths | 51 | — |
| 14 | the context-menu indicator without its flex box, the context sub-trigger without a gap, sidebar badge text-xs | 35 | — |
| 15 | the dialog's `sm:max-w-md`, the navigation-menu popup's rounded-3xl and shadow-lg | 30 | — |
| 16 | the select row's own gap-2 | 28 | 67 |
| 17 | dark: `--radio-indicator-dot-size` (8 → 10), `--combobox-chip-fill` (`bg-input` → `input/60`), the tabs trigger's important transparent border; exclusions written | **0** (28 excluded) | **0** (43 excluded) |

Final: **light 0 mismatches / 28 excluded · dark 0 / 43**. `check-coverage.mjs --system luma` renders all 57
sections in both modes with no console errors, no page errors, no empty sections and every popup present.

## Exclusions

`compare-exclusions.json`, 28 rows in light and 43 in dark, one reason each. The first four are the same four
foundation carries, for the same reasons; the fifth is foundation's dark-ordering row narrowed to the elements
luma actually shows it on.

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu · command · menubar shortcut widths | ⌘ is in neither Inter build and the two font stacks fall back differently (0.3–1.8px) |
| dark state colours on open triggers and the invalid checked checkbox | Tailwind sorts luma's `dark:` colours after state utilities that have no dark counterpart, so upstream those states lose their colour in dark |

Of foundation's seven exclusion rows, **two do not apply to luma** and were dropped rather than carried:
the questionnaire action row (`sm:min-h-7` against `sm:min-h-9`) — luma's generated TSX carries `sm:min-h-9`,
the same value `registry/ui` has — and the `text-[0.625rem]` line heights — luma writes those types as
`text-xs`, which has a line height of its own, so no element inherits a unitless ratio.

Not covered by the comparison: nothing. The coverage template renders all 62 `registry/ui` components and the
comparison pairs every one that carries a `data-slot`.

## Foundation slot candidates

Four places needed a system-only name because foundation has one value where luma wants two. Each is a
candidate for the next axis-contract version:

| Name | Foundation would be | Why luma needs it |
|---|---|---|
| `--control-radius-sm` | `var(--control-radius)` | the input family is `rounded-3xl` (22) while the button family is `rounded-4xl` (26) |
| `--card-radius` | `var(--surface-radius)` | the card is `rounded-4xl` (26) while popovers and menus are `rounded-3xl` (22) |
| `--input-border` | `var(--input)` | luma draws no border on the input family at all (`border-transparent`) |
| `--radio-indicator-dot-size` (layer 1) | `var(--control-indicator-dot-size)` | the radio dot is `size-2` in light and `size-2.5` in dark, and a size that differs by mode has no layer-2 home |

`--slider-track-fill` and `--combobox-chip-fill` are two more, both layer-1 colours foundation currently takes
from `--muted` and `--input` directly.
