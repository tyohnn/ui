# maia — reference

This system ports the shadcn create preset `base-maia` (shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`,
tag `shadcn@4.21.0`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Maia / Hugeicons / Figtree` |
| `base` | `base` |
| `style` | `maia` |
| `baseColor` | `neutral` |
| `theme` | `neutral` |
| `chartColor` | `neutral` |
| `iconLibrary` | `hugeicons` |
| `font` | `figtree` |
| `fontHeading` | `inherit` |
| `item` | `Item` |
| `rtl` | `false` |
| `menuAccent` | `subtle` |
| `menuColor` | `default` |
| `radius` | `default` |

## Sources

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-maia.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs maia` — `npx shadcn@4.21.0 init -t next -b base -p maia -n maia`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## Comparison

`node tooling/snapshot/compare-shadcn.mjs --system maia --mode light` (and `--mode dark`). Exclusions live in
`compare-exclusions.json` with a reason each.

The run used the reference app on **3113** (`npx next start` after `npm run build`) and the preview on
**5184**:

```sh
node tooling/snapshot/compare-shadcn.mjs --system maia \
  --reference http://localhost:3113 --preview http://localhost:5184 --mode light|dark --max-shots 0
```

## Reference app

`make-reference.mjs` reported **no component missing from shadcn 4.21.0** and **one type error**, the same
hugeicons typing bug mira hit: the generated `components/ui/spinner.tsx` spreads `React.ComponentProps<"svg">`
into `HugeiconsIcon`, whose `strokeWidth` is number-only. It does not change what the page renders, so the
production build runs with `typescript.ignoreBuildErrors` rather than editing the answer key
(`registry/foundation/reference/README.md` records the same for mira). `next build` then succeeds and the run
was made against `next start`.

`data-tone` (Badge, AvatarFallback) and `data-shape` (Button) are **kept** on both sides. shadcn ignores them;
maia's slots make a toned tag look exactly like the plain badge and a shaped button keep its size radius, so
the comparison checks that the attributes change nothing.

### Where `style-maia.css` and the app disagree

The procedure says the rendered app wins, and for maia it mattered in four places. A preset app's
`globals.css` carries no `.cn-*` rules at all: the CLI bakes the preset's utilities into
`components/ui/*.tsx`, and `style-maia.css` is a separate distribution.

| Place | `style-maia.css` | the app (`components/ui/*.tsx`) |
|---|---|---|
| `SidebarMenuButton` size `sm` | `h-8` only, so the base `text-sm` applies | `h-8 text-xs` |
| `.cn-attachment-size-{sm,xs}` | `px-2 py-1.5 p-1.5` on both, no type | sm `text-xs px-2 py-1.5 p-1.5`, xs `text-xs px-1.5 py-1 p-1` |
| `.cn-*-sub-trigger` and the Context Menu's check rows | `gap-2.5` from the shared row rule | `gap-2` (the Context Menu's sub-trigger has no gap at all) |
| `.cn-select-item` inner spans | — | `*:[span]:last:gap-2`, so the indicator span stays at gap-2 |

`style-maia.css` also styles `.cn-calendar-dropdown-root` and `.cn-calendar-caption-label`, which shadcn's
`calendar.tsx` never applies, so those rules do nothing upstream; conversely `input-otp.tsx` keeps `cn-*` names
for which a preset app has no rules (see the `input-otp` exclusion).

## Results (2026-09-16)

Template `coverage`, viewport 1440×900, DPR 1: 57 sections, each opened alone so its popups render open,
2514 paired elements over 60 components (2 render no `data-slot` of their own), 0 unpaired on either side.

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | `port.mjs` only (foundation/mira values, maia's colours and multiplied radius scale) | 10242 | — |
| 1 | layer 2 across every axis — control 24 · 32 · 36 · 40 with 14/20 text and 16px icons, the 26px control radius, 3px focus rings, menu rows (192px, `py-2`, 14px radius, `pl-9.5` inset), 36px sidebar items, the 12/14/16 UI ramp, 48px table heads, 18/26px surfaces — plus layer 1: `bg-input/30` fills in both modes, `ring-ring/50`, `ring-foreground/5`, a filled outline button, a page-coloured sidebar search | 3238 | — |
| 2 | the split axes that layer 2 alone could not reach: `--badge-*` and `--kbd-height` (maia's xs button grew to h-6 while the badge stayed h-5), `--avatar-font-size`, `--card-ring`, `--bubble-radius`, `--chart-tooltip-radius`, `--empty-radius`, `--menu-narrow-min-width`; the 32px calendar cell; input-group button sizes | 2020 | — |
| 3 | the `@apply` tail per component: item · field · message · attachment · toggle · tabs · slider · input · input-group · combobox row values | 1255 | — |
| 4 | the sidebar's local `--radius` (`[--radius:var(--radius-xl)]` on the header and the scroller) with `--sidebar-part-radius`; `shadow-2xl` for `--shadow-float`; command · select · menubar · alert · accordion · native-select · questionnaire · breadcrumb · card · toggle-group values | 860 → 624 | — |
| 5 | the collapsed icon rail (`size-8! p-2!`), sidebar gaps and type per size, menu labels at `py-2.5`/text-xs, the tooltip's own type and gap, progress `h-3`, the joined toggle group's `rounded-3xl`, `--command-item-radius` | 465 → 279 | — |
| 6 | drawer and popover paddings and header gaps, alert-dialog max widths and 64px media, dialog title `leading-none`, combobox chip and chip box, navigation-menu paddings and its 12px chevron, `--field-label-checked-border`, empty · pagination · table · message-scroller · item-group gaps | 179 → 102 | — |
| 7 | the per-row tail: menu separators (only the palette drops `-mx-1`), sub-trigger and Context Menu check-row gaps, sidebar input and sub-button, input-group button gaps and the textarea's `py-2` in a group, the addon's two negative margins, the select indicator span, the vertical line tab | 55 → 28 | — |
| 8 | exclusions written | **0** | 12 |
| 9 | dark: `--menu-ring` (the Dropdown Menu and the Menubar keep `ring-foreground/10` in dark), `--field-label-checked-border` against dark `--primary` | 0 | 4 |
| 10 | the dark ordering exclusion written | **0** | **0** |

Final: **light 0 mismatches / 28 excluded · dark 0 / 32**. `check-coverage.mjs --system maia` renders all 57
sections in both modes with no console errors, no page errors, no empty sections and every popup present.

## Exclusions

`compare-exclusions.json`, 28 rows in light and 32 in dark, one reason each. The first four are four of
foundation's; the fifth is foundation's dark-ordering row narrowed to the one element maia shows it on.

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu · command · menubar shortcut widths | ⌘ is in neither Figtree build and the two font stacks fall back differently (0.5–1px) |
| the invalid checked checkbox's border in dark | Tailwind sorts `dark:aria-invalid:border-destructive/50` after `aria-invalid:aria-checked:border-primary`, which has no dark counterpart, so upstream the checked border is lost in dark |

Of foundation's seven exclusion rows, **two do not apply to maia** and were dropped rather than carried:

- the questionnaire action row (`sm:min-h-7` against `sm:min-h-9`) — maia's generated `questionnaire.tsx`
  carries `sm:min-h-9`, the same value `registry/ui` has, so the row matches;
- the `text-[0.625rem]` line heights (badge in an Item, kbd, xs button in an Alert, `<option>`) — maia writes
  all of those as `text-xs`, which carries a line height of its own, so nothing inherits a unitless ratio.

Foundation's dark row also covers open triggers' background colours; maia's outline button is filled in both
modes, so those pair equal here and only the checkbox needed the row.

## Not measured

Nothing. The coverage template renders all 62 `registry/ui` components and the comparison pairs every one that
carries a `data-slot`; everything the comparison could not decide is an exclusion above, with a reason.

## Fonts and icons

- **Figtree.** The reference app loads it through `next/font/google` (`Figtree({subsets:['latin'],variable:'--font-sans'})`);
  the preview loads `@fontsource-variable/figtree`, already a devDependency of `apps/preview`, through
  `virtual:tyohnn-fonts`. The layer-1 stack names both families
  (`"Figtree", "Figtree Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif`), so the two pages
  measure the same glyph advances — the only text difference left is ⌘, which is in neither build.
- **hugeicons.** `system.json` sets `icons.library: hugeicons` and the preview was started with `SYSTEM=maia`,
  so both sides draw the same glyphs. The comparison measures an `<svg>` by its box only, and every icon box
  pairs equal, so the icon sizes in layer 2 and layer 3 are right.

## Foundation slot candidates

maia needed twelve system-only names because foundation has one value where maia wants two. Axis contract v4
adopted every one of them under the same name; the table is kept as the record of why. The foundation default that
reproduces mira is written next to each name in `styles/tokens.css` / `styles/globals.css`.

| Name | Layer | Foundation would be | Why maia needs it |
|---|---|---|---|
| `--badge-height` | 2 | `var(--control-height-xs)` | maia's xs button grew to `h-6` while the badge stayed `h-5` |
| `--badge-radius` | 2 | `9999px` | the badge is `rounded-4xl`, not a pill |
| `--badge-padding-x` · `--badge-padding-x-icon` · `--badge-icon-size` | 2 | the xs control values | the badge keeps `px-2` / `pl-1.5` / `size-3` while the xs button moved to `px-2.5` / `pl-2` / `size-3` |
| `--kbd-height` | 2 | `var(--control-height-xs)` | a keycap is not an xs button; maia proves the two only shared a number in mira |
| `--avatar-font-size` · `--avatar-line-height` | 2 | `var(--ui-text-lg)` / `var(--ui-line-height-lg)` | the fallback is `text-sm` while maia's lg UI step is `text-base` |
| `--bubble-radius` | 2 | `var(--surface-radius)` | the chat bubble is `rounded-3xl`, one step above the card |
| `--chart-tooltip-radius` | 2 | `var(--surface-radius)` | the tooltip stays at `rounded-lg` while cards and popovers moved to `rounded-2xl` |
| `--empty-radius` | 2 | `var(--surface-radius-lg)` | the empty state is `rounded-lg`, below every other surface |
| `--toggle-group-joined-radius` | 2 | `var(--control-radius)` | a joined group rounds `rounded-3xl` while its buttons are `rounded-4xl` |
| `--command-item-radius` | 2 | `var(--menu-item-radius)` | the palette row is `rounded-lg` against the menu row's `rounded-xl` |
| `--menu-narrow-min-width` | 2 | `var(--menu-min-width)` | select · combobox · sub-menus are `min-w-36` against the dropdown's `min-w-48` |
| `--sidebar-part-radius` | 2 | `var(--sidebar-item-radius)` | the sidebar's menu button is `rounded-lg` and every other part `rounded-md` |
| `--card-ring` | 1 | `var(--ring-subtle)` | the card keeps `ring-foreground/10` while the floating surfaces went to `/5` |
| `--menu-ring` | 1 | `var(--ring-subtle)` | the Dropdown Menu and the Menubar keep `ring-foreground/10` in **dark** only |
| `--field-label-checked-border` | 1 | `transparent` | a checked field card takes `border-primary/30` (dark `/20`), a colour that differs by mode |

Four places still needed a layer-3 edit that no slot expresses, each marked with a `maia:` comment:

- **the sidebar's local `--radius`** — maia scopes `[--radius:var(--radius-xl)]` to the header and the
  scroller, so `.cn-sidebar-header, .cn-sidebar-content` re-declare `--radius` (and the sidebar radius slots,
  because a `:root` `calc()` has already resolved). This is structure, not a value.
- **the Context Menu's item indicator** — maia deletes mira's `flex items-center justify-center` box; the
  rule now sets `display: initial` and the upstream `right-2` inset.
- **the joined toggle group** — maia only rounds `data-spacing="0"` + `data-variant="outline"`, where mira
  rounded the group at every spacing; the selector had to change, not a value.
- **the vertical line tab** — maia has no line variant, so upstream both vertical lists are the plain trigger;
  a scoped rule gives the vertical line trigger the plain vertical padding.

## Axis contract v4 slot migration (stage 2, 2026-09-17)

`tooling/preset/slot-migration.md` listed **28 rows** for maia (105 declaration sites, 77 adopting foundation's
rule unchanged). Each layer-3 file was rebuilt as foundation's current rule plus maia's remaining edits (a
three-way merge from foundation at `ab3c807`), and the values moved into `styles/tokens.css`, next to the
component slots maia had already proposed (the block's header now says they are v4 slots). **24 rows were
applied; the 4 card rows were not** (below).

| Slot | maia value |
|---|---|
| `--menu-label-padding-y` | `10px` |
| `--bubble-padding-x` · `-padding-y` · `-line-height` | `14px` · `10px` · `22.75px` |
| `--control-padding-y-field` | `4px` |
| `--item-gap` | `8px` |
| `--sidebar-input-height` · `-surface-gap` · `-surface-padding` · `-item-padding-y` · `-separator-margin-inline` | `32px` · `8px` · `8px` · `8px` · `8px` |
| `--slider-track-thickness` | `12px` |
| `--tabs-list-height` · `--tabs-trigger-padding-x` · `-padding-y` | `var(--control-height-md)` · `8px` · `4px` |
| `--toggle-gap` | `4px` |

The accordion (×2) and badge-border rows carry foundation's default and needed no token. One slot the list did
not name also took maia's value: `--command-item-gap: 8px`, so `command.css` no longer re-declares the palette
row's radius and gap (only the dialog-scoped `rounded-2xl` stays, as `.cn-command-item:where([data-slot="dialog-content"] *)`).

**Not applied — slot collisions.** Two v4 slots are read by more elements than maia gives one value:

- `--card-radius`: the list asked for `14px` on `.cn-card-header` / `.cn-card-footer`, but foundation's
  `.cn-card` and its images read the same slot, and maia's card is `rounded-2xl` (18, the `--surface-radius`
  default). The header and footer keep `14px` in `card.css` (`rounded-t-xl` / `rounded-b-xl`, one step below
  the card).
- `--menu-ring`: maia sets it to `foreground/10` in dark for the Dropdown Menu and the Menubar only. v4's
  foundation reads it on every floating menu surface (the shared `_menu-family.css` rule, `select.css`,
  `context-menu.css`), which moved the Select, Context Menu (and its sub-menu), Command and Combobox rings in
  dark. Those three places keep `var(--ring-subtle)` (a `maia:` comment each); maia's own narrower rule for the
  two menus stays.

**Check.** Computed values of every coverage section (2530 elements) and of the component sheet (307) were
dumped before and after in both modes: **0 differences**. Against the reference app (3122, preview 5191):
**light 0 mismatches / 28 excluded · dark 0 / 32** — the same as before the migration.

**Layer 3 against foundation:** 24 of 62 files are byte-identical (15 before; `_control-family.css`,
`badge.css`, `button.css`, `input.css`, `kbd.css`, `label.css`, `radio-group.css`, `sheet.css` and
`switch.css` joined). 38 still differ:

- **Slot collisions (above):** `card.css` (with the sm card's `--spacing(4)`), `context-menu.css` (its only
  difference), `select.css` and `_menu-family.css` in part.
- **Structure (DESIGN.md §5's four shapes):** the sidebar's local `--radius`, the joined toggle group's
  `[data-spacing="0"][data-variant="outline"]` selector, the Context Menu indicator without its flex box, the
  vertical line tab rule, and declarations foundation never makes (the dialog and alert-dialog title type, the
  slider thumb's `shadow-sm`, the widened menubar · combobox labels, sub-trigger and check-row gaps, the
  Dropdown Menu · Menubar ring rule, the palette separator without `-mx-1`, the dialog-scoped palette row
  radius, the select indicator span's `gap-2`, the input-group textarea's `py-2`, the sm Item split).
- **Values with no v4 slot**, where foundation writes a literal or reads a shared axis step maia does not
  share: paddings · gaps · radii · type in `_surface-family` (header gaps per surface, the tooltip, the popover
  gap) · accordion · alert · alert-dialog · attachment · avatar · breadcrumb · bubble (`ring-3`) · calendar ·
  chart · combobox · command · drawer · empty · field · input-group · item · menubar · message ·
  message-scroller · native-select · navigation-menu · pagination · progress · questionnaire · resizable ·
  sidebar · skeleton · slider · table · tabs · textarea · toggle. None of these is a slot today; they stay
  maia's own rules.
