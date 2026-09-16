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

Four places needed a system-only name because foundation has one value where luma wants two. All of them
(and the two colours below) were adopted by axis contract v4 under the same names; the table is kept as the
record of why:

| Name | Foundation would be | Why luma needs it |
|---|---|---|
| `--control-radius-sm` | `var(--control-radius)` | the input family is `rounded-3xl` (22) while the button family is `rounded-4xl` (26) |
| `--card-radius` | `var(--surface-radius)` | the card is `rounded-4xl` (26) while popovers and menus are `rounded-3xl` (22) |
| `--input-border` | `var(--input)` | luma draws no border on the input family at all (`border-transparent`) |
| `--radio-indicator-dot-size` (layer 1) | `var(--control-indicator-dot-size)` | the radio dot is `size-2` in light and `size-2.5` in dark, and a size that differs by mode has no layer-2 home |

`--slider-track-fill` and `--combobox-chip-fill` are two more, both layer-1 colours foundation currently takes
from `--muted` and `--input` directly.

## Axis contract v4 slot migration (stage 2, 2026-09-17)

`tooling/preset/slot-migration.md` listed **52 rows** for luma (118 declaration sites, 66 adopting foundation's
rule unchanged). Every row was applied: each layer-3 file was rebuilt as foundation's current rule plus luma's
remaining edits (a three-way merge from foundation at `ab3c807`), and the value moved into the slot in place
in `styles/tokens.css` / `styles/globals.css` (and out of the backfill block).

| Slot | luma value |
|---|---|
| `--menu-item-font-weight` · `--menu-label-padding-y` | `var(--ui-font-weight)` · `10px` |
| `--avatar-font-size` · `--avatar-line-height` | `var(--ui-text-sm)` · `var(--ui-line-height-sm)` |
| `--badge-height` · `-padding-x` · `-padding-x-icon` · `-radius` | `20px` · `var(--tag-padding-x)` · `6px` · `var(--tag-radius)` |
| `--bubble-padding-x` · `-padding-y` · `-line-height` | `14px` · `10px` · `22.75px` |
| `--chart-tooltip-radius` · `--empty-radius` | `14px` · `18px` |
| `--control-padding-y-field` | `4px` |
| `--item-gap` | `8px` |
| `--kbd-height` · `--kbd-padding-x` | `22px` · `6px` (`--kbd-min-width` keeps its `var(--kbd-height)` default) |
| `--menubar-padding` | `4px` |
| `--sidebar-input-height` · `-surface-gap` · `-surface-padding` · `-separator-margin-inline` · `-item-padding-y` | `32px` · `8px` · `8px` · `8px` · `8px` |
| `--slider-track-thickness` | `8px` |
| `--tabs-list-height` · `-list-padding` · `--tabs-trigger-gap` · `-padding-x` · `-padding-y` | `var(--control-height-md)` · `4px` · `8px` · `12px` · `4px` |
| `--toggle-group-joined-radius` · `--toggle-gap` | `var(--control-radius-sm)` · `4px` |
| `--switch-track-border-on` (layer 1, both scopes) | `var(--primary)` |

Rows whose value is foundation's default (`--accordion-border-width` ×2, `--badge-border-width`, the badge
glyph) needed no token. Two slots the list did not name also took luma's value, removing a layer-3 edit
each: `--command-item-gap: 8px` (the added `.cn-command-item { gap: 8px }` rule is gone) and
`--questionnaire-shortcut-border` = `primary/10` in both scopes. `--radio-indicator-dot-size`,
`--control-radius-sm`, `--card-radius` and `--input-border` lost their "Foundation slot candidate" comments.

**Check.** Computed values of every coverage section (2530 elements) and of the component sheet (307) were
dumped before and after in both modes: **0 differences**. Against the reference app (3121, preview 5191):
**light 0 mismatches / 28 excluded · dark 0 / 43** — the same as before the migration.

**Layer 3 against foundation:** 16 of 62 files are byte-identical (12 before; `_control-family.css`,
`context-menu.css`, `kbd.css` and `label.css` joined). 46 still differ:

- **v4 slot meanings that do not fit luma (3 places) — two resolved in v5** (`input-group.css`, `badge.css`; below). luma proposed `--control-radius-sm` for the input
  family's `rounded-3xl` (22); v4 adopted the name as the *sm control's* corner and made the sm button,
  the sm icon button and `.cn-input-group-button` read it. luma's sm buttons are `rounded-4xl` (26), so
  `button.css` (two rules — its only difference) and `input-group.css` keep `var(--control-radius)`.
  `.cn-badge[data-tone]` now reads `--badge-height` in foundation; luma's toned tag was the xs control's 24px
  while the plain badge is 20, so `badge.css` keeps `var(--control-height-xs)` there (luma's upstream has no
  tones to decide it — the component sheet shows it).
- **Structure (DESIGN.md §5's four shapes):** the sidebar's local `--radius` (now re-declaring
  `--sidebar-part-radius` too, so the skeleton rules read foundation's slot), the joined toggle group's
  `data-spacing="0"][data-variant="outline"]` selector, the context-menu indicator without a flex box,
  added declarations foundation never makes (the card's `shadow-md`, bg-secondary close buttons, the drawer
  shadow, the switch thumb's `--tw-shadow`, alert-dialog and dialog title type, popover header gap, menubar
  label padding, sub-trigger gaps, the Command panel's `p-1`, the Command and combobox separators, the
  input-group textarea's `py-2.5`, the dialog-scoped command row radius, the vertical line-tab corners).
- **Values with no v4 slot**, where foundation writes a literal or reads a shared axis step luma does not
  share: paddings · gaps · radii · type in `_menu-family` (label text-xs) · `_surface-family` (tooltip, popover gap) · accordion · alert · alert-dialog · attachment · avatar ·
  breadcrumb · bubble (`ring-3`) · calendar · chart · combobox · dialog · drawer · empty · field · input ·
  input-group · input-otp · item · menubar · message · message-scroller · native-select · navigation-menu ·
  pagination · popover · progress · questionnaire · resizable · select · sidebar · skeleton · slider ·
  switch (`border-2`) · table · tabs · textarea · toggle, and the input family's `--control-radius-sm` /
  `--input-border` reads. None of these is a slot today; they stay luma's own rules.

## Axis contract v5 (2026-09-17)

Two of the three slot-meaning places are values now: `--tag-height: var(--control-height-xs)` (the toned tag) and
`--input-group-button-radius: var(--control-radius)`. The card reads `--card-shadow` at its default (luma's
`--shadow-card`). **Still a rule:** `button.css`'s sm button and sm icon button keep `var(--control-radius)`,
because luma's `--control-radius-sm` (22) is the input family's corner and v5 split only the input-group button
off that slot — the sm button and the sm select trigger still share it.

**Check:** coverage dumps before and after, **0 differences** in light and dark. `compare-shadcn` against the reference app: light **0 mismatches / 28 excluded**, dark **0 / 43** —
unchanged. `scan-tokens` · `validate-system` pass.
