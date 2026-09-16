# sera — reference

This system ports the shadcn create preset `base-sera` (shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`,
tag `shadcn@4.21.0`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Sera / Lucide / Noto Sans + Playfair Display` |
| `base` | `base` |
| `style` | `sera` |
| `baseColor` | `taupe` |
| `theme` | `taupe` |
| `chartColor` | `taupe` |
| `iconLibrary` | `lucide` |
| `font` | `noto-sans` |
| `fontHeading` | `playfair-display` |
| `item` | `Item` |
| `rtl` | `false` |
| `menuAccent` | `subtle` |
| `menuColor` | `default` |
| `radius` | `default` |

## Sources

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-sera.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs sera` — `npx shadcn@4.21.0 init -t next -b base -p sera -n sera`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## Comparison

`node tooling/snapshot/compare-shadcn.mjs --system sera --mode light` (and `--mode dark`). Exclusions live in
`compare-exclusions.json` with a reason each.

The run used the reference app on **3115** (`npx next start` after `npm run build` — the production build
compiles with no errors) and the preview on **5186**:

```sh
node tooling/snapshot/compare-shadcn.mjs --system sera \
  --reference http://localhost:3115 --preview http://localhost:5186 --mode light|dark --max-shots 0
```

**Rebuild before every comparison** (`node tooling/build-system sera`) — the preview serves the built CSS,
and a comparison run against a stale build sends you chasing values that are already right (the lesson from
the luma port).

## Reference app

`make-reference.mjs` reported **no component missing from shadcn 4.21.0** and **0 type errors** in the copied
Specimen and coverage templates, so there is no API difference between `registry/ui` and the shadcn
components for this preset. `next build` succeeds without `typescript.ignoreBuildErrors`.

`data-tone` (Badge, AvatarFallback) and `data-shape` (Button) are **kept** on both sides; sera has no tones
or shapes, and the comparison confirms the attributes change nothing.

### The two fonts

This is the only preset so far with a heading font of its own. Before the first comparison both stacks were
checked on both pages by measuring the same string at the same size and weight:

| | `--font-heading` 400 / 600 | `--font-sans` 400 / 600 |
|---|---|---|
| reference app (next/font) | 284.61 / 289.91 | 299.53 / 311.27 |
| preview (fontsource) | 284.61 / 289.91 | 299.53 / 311.27 |

Identical, so every width difference the comparison reports afterwards is a value, not a font. Playfair
Display and Noto Sans both report `loaded` in `document.fonts` on both pages; the preview installs them
through `virtual:tyohnn-fonts` from `system.json` `fonts`, which already names `playfair-display`.

## Results (2026-09-16)

Template `coverage`, viewport 1440×900, DPR 1: 57 sections, each opened alone so its popups render open,
2514 paired elements over 60 components, 0 unpaired on either side.

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | `port.mjs` only (foundation/mira values, sera's taupe colours and radius scale) | 12120 | — |
| 1 | layer 2 across every axis: controls 28 · 36 · 40 · 44 with 12/16 uppercase text, 12–32px paddings, 14px icons, radius 0 everywhere, the 12/14/14/18 UI ramp, menu rows at 12px | 6184 | — |
| 2 | the caps axis (five system-only bands) wired into layer 3; the badge stripped to text; calendar `--cell-size` 32 | 4667 | — |
| 3 | **layer 1 recomputed from taupe** (44 literals) and the field sub-axis: `--input-border`, `--input-border-bottom`, `--control-*-field` | 3799 | — |
| 4–9 | chart · avatar · toggle · tabs · card · table · bubble · sidebar · item · message · field per-component values | 2313 | — |
| 10–20 | menus (row gap 10 vs Command/Select 8), questionnaire, surfaces (dialog `p-6`, sheet `p-8`, Empty `p-12`), shadows and the ring split (`--ring-subtle` 10% vs `--card-ring` 5%) | 1300 | — |
| 21–33 | attachment · breadcrumb · accordion · alert-dialog media · drawer · combobox chips · pagination · navigation-menu · slider · progress | 419 | — |
| 34–45 | the field/label bands, the sidebar surface paddings and the collapsed icon rail, input-group text and buttons, the underline focus/invalid rules | 99 | — |
| 46–52 | the tail: tooltip arrow, indicators, sub-triggers, skeleton rows, drawer edge per swipe direction | 24 | 28 |
| 53 | exclusions written | **24** (22 excluded) | **28** (22 excluded) |
| 54 (2026-09-16) | the residue closed against **axis contract v4**: the keycap and the FieldTitle moved onto their v4 slots, four layer-3 rules were corrected against the reference app's own TSX (input-group icon-sm · input-group textarea · avatar group count glyph · sidebar skeleton icon · navigation-menu popup shadow), the context-menu indicator dropped its flex box, and the invalid+checked checkbox border became a mode-split layer-1 token | **0** (25 excluded) | **0** (25 excluded) |

Final: **light 0 mismatches / 25 excluded · dark 0 / 25**. Nothing is left unexplained.

## Exclusions

`compare-exclusions.json`, 25 rows in each mode, one reason each. Four are foundation's, kept for the
same reasons, with the shortcut row rewritten for Noto Sans; the fifth is sera's own.

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| `item/badge#0` height · line-height · rect-height (2026-09-16) | Upstream the Badge declares no line height, so inside a `text-sm` Item it inherits the unitless 1.0204… and resolves to 14.2857px; sera fixes line heights in px per type step (`--badge-line-height` = `--ui-line-height-xs`, 15px). Layer 3 cannot win: the only way to reproduce the inherited value is to drop the declaration (`initial`), which would make **every** badge take its container's leading instead of the axis's. The same shape as foundation's `text-[0.625rem]` row |
| menu · command · menubar shortcut widths | ⌘ is in neither Noto Sans build and the two font stacks fall back differently (0.3–1.8px) |

Of foundation's seven rows, two do not apply to sera and were dropped rather than carried: the
questionnaire action row (sera's generated TSX carries `sm:min-h-10`, and the system reproduces it with a
value) and the dark `dark:`-ordering row. The `text-[0.625rem]` line-height row was dropped as written (sera
writes those types as `text-xs`) and came back in 2026-09-16 as the `item/badge#0` row above — the same
cause at a different type step.

⚠ The `dark:`-ordering shape **does** reach sera in one place, and it is a value, not an exclusion: the
invalid + checked Checkbox. Upstream's `aria-invalid:aria-checked:border-primary` wins in light, and
`dark:aria-invalid:border-destructive/50`, which Tailwind emits after it, wins in dark. Layer 2 has no
`.dark` scope, so the two values live in a system-only layer-1 token (below).

## The residue, closed (2026-09-16, iteration 54)

The eight items the port left open were each traced to a rule or a slot. Nothing here needed a change to
`registry/foundation`, `registry/ui` or another system; the reference app's own `components/ui/*.tsx` was the
answer key in every case.

| Where | Cause | What changed |
|---|---|---|
| `kbd-spinner-separator/kbd#4` `letter-spacing` | upstream `Kbd` declares no tracking, so a keycap **inherits** it from wherever it sits; sera pinned `normal` in `kbd.css` | `styles/tokens.css`: `--kbd-letter-spacing: initial` (and `--kbd-font-weight: var(--ui-font-weight-regular)`). `kbd.css` now reads the whole v4 `--kbd-*` axis instead of the xs control axis |
| `field/field-label#5` · `#7` `letter-spacing` | the two elements are **`FieldTitle`**, not a peer label. sera's `.cn-field-title` read `--ui-letter-spacing` (normal) while reading `--ui-label-text-transform` for its case — half of the quiet label band | `field.css`: `.cn-field-title` reads `--ui-label-letter-spacing`, the v4 slot foundation's own rule reads |
| `input-group/button#3` | the element is `<InputGroupButton size="icon-sm" variant="outline">`, not the `sm` one. Upstream `inputGroupButtonVariants` gives it `size-8 p-0 text-sm` — a fixed 32px square that does **not** follow the group's height, plus the variants' base `text-sm` | `input-group.css`: `.cn-input-group-button-size-icon-sm` is `32px` square and reads the field type step. (`registry/ui`'s `InputGroupButton` matches upstream; nothing in the TSX changed) |
| `input-group/input-group-control#5` padding | `InputGroupTextarea` is `py-2.5` (10px) upstream, while `.cn-textarea`'s `--control-padding-y-multiline` (12px) reached it inside the group | `input-group.css`: `.cn-input-group .cn-input-group-textarea { padding-block: 10px }` — written as a descendant so it beats `textarea.css`, which the barrel reads later |
| `avatar/avatar-group-count#1>svg#0` | upstream splits the glyph per group size (`[&>svg]:size-4`, `…size=sm…:size-3`, `…size=lg…:size-5`); sera's sm branch read the 14px icon step | `avatar.css`: 16 · 12 · 20 per group size |
| `sidebar/skeleton#0` | the element is the **skeleton icon**, `size-3.5` upstream; sera sized it with `--sidebar-item-icon-size` (16), the menu button's glyph | `sidebar.css`: `.cn-sidebar-menu-skeleton-icon` reads `--control-icon-size-sm` (14) |
| `context-menu/{checkbox,radio}-item#0>span#1` | `display: flex` on the indicator **blockifies** the `<span>` inside it, which upstream stays `inline`. The fix is to drop the box, not resize it (the trap lyra and maia recorded) | `_menu-family.css`: `.cn-context-menu-item-indicator` alone goes `display: block` with `width/height: auto`. Dropdown and combobox keep their flex box |
| `navigation-menu/root1` | upstream's `NavigationMenuPopup` carries `shadow-md`, not mira's `shadow` — sera does not split the viewport from the panel the way mira does | `navigation-menu.css`: `.cn-navigation-menu-popup` reads `--shadow-float` |
| `item/badge#0` | see the exclusions table — the badge's inherited unitless line height | **excluded**, with the reason |

The dark run then showed its own four (the invalid + checked Checkbox border, `checkbox#6`), which the light
run cannot see: upstream emits `dark:aria-invalid:border-destructive/50` after
`aria-invalid:aria-checked:border-primary`, so the red edge wins in dark and the primary edge in light. Layer 2
has no `.dark` scope, so this is a **system-only layer-1 token** in both scopes, as the porting procedure
prescribes, read by `_control-family.css`:

```css
:root  { --checkbox-invalid-checked-border: var(--selection); }
.dark  { --checkbox-invalid-checked-border: var(--border-invalid); }
```

It was adopted into axis contract v4 as a foundation slot the same day (foundation: `var(--selection)` in both
scopes), so `scan-tokens` no longer warns about it; sera's two values are the system's own.

## Values the style file has but the app does not render

`style-sera.css` styles `.cn-calendar-dropdown-root` and `.cn-calendar-caption-label`, which shadcn's
`calendar.tsx` never applies, so those rules do nothing upstream; the reference app is the answer key and
sera follows it. Conversely `input-otp.tsx` and `sonner.tsx` keep `cn-*` names for which a preset app has
no rules at all (see the `input-otp` exclusion).

## Foundation slot candidates

sera needed system-only names in fifteen places where foundation has one value and sera wants two. Each is a
candidate for the next axis-contract version; **foundation was not changed in this run**.

| Name | Foundation would be | Why sera needs it |
|---|---|---|
| `--control-text-transform` | `none` | every button · toggle · tab is uppercase |
| `--menu-item-text-transform` · `--menu-item-letter-spacing` · `--menu-item-font-weight` | `none` · `normal` · `inherit` | the four menu families' rows are uppercase `tracking-wider` `font-medium` while Command and Combobox rows are not |
| `--menu-label-text-transform` · `--menu-label-letter-spacing` · `--menu-label-padding-y` | `none` · `normal` · `6px` | menu · select · combobox · command group labels |
| `--title-text-transform` · `--title-letter-spacing` | `none` · `var(--ui-letter-spacing)` | card · dialog · sheet · drawer · alert-dialog · empty titles |
| `--ui-label-text-transform` · `--ui-label-letter-spacing` | `none` · `normal` | the quiet label band (label, field title/legend, item title, popover title, progress label, marker, breadcrumb, message header/footer, questionnaire title) |
| `--tag-text-transform` · `--tag-letter-spacing` · `--tag-height` · `--tag-padding-y` · `--tag-gap` · `--tag-border-width` · `--tag-icon-size` · `--tag-padding-x-icon` | `none` · `normal` · `var(--control-height-xs)` · `2px` · `var(--control-gap-xs)` · `var(--control-border-width)` · `var(--control-icon-size-xs)` · `var(--control-padding-x-icon-xs)` | sera's badge is text with no box at all |
| `--table-head-text-transform` · `--table-head-letter-spacing` | `none` · `var(--ui-letter-spacing)` | the table head is uppercase `tracking-wider` |
| `--input-border` · `--input-border-bottom` (layer 1) | `var(--input)` · `var(--input)` | the whole input family is one underline |
| `--control-padding-x-field` · `--control-padding-y-field` · `--control-font-size-field` · `--control-line-height-field` · `--control-letter-spacing-field` | the `-md` step | the field family is sentence case, a step larger and without side padding, while the button family is uppercase and smaller |
| `--card-ring` (layer 1) | `var(--ring-subtle)` | the card's ring is `foreground/5` while menus are `foreground/10` |
| `--field-label-checked-border` (layer 1) | `var(--border)` | a checked selection card's edge is `primary/30` (dark `/20`) |
| `--combobox-chip-fill` · `--slider-track-fill` · `--switch-track-border-{off,on}` · `--switch-radius` (layer 1/2) | `var(--input)` · `var(--muted)` · `transparent` · `9999px` | sera fills the chip with `--muted`, the slider track with `input/50`, and draws the switch track's edge |
| `--tabs-list-height` · `--tabs-list-padding` · `--tabs-trigger-{gap,padding-x,padding-y}` | the control axis | the tab bar is `h-10 p-1` with `px-4 py-1.5` triggers |
| `--sidebar-surface-padding` · `--sidebar-surface-gap` · `--sidebar-input-height` · `--sidebar-rail-size` · `--sidebar-item-padding-y` · `--sidebar-badge-font-weight` | the menu axis | the sidebar's own 8px shell padding stays while the menu row padding grows to 12 |
| `--item-media-icon-size` · `--slider-track-thickness` · `--bubble-padding-{x,y}` · `--bubble-line-height` · `--kbd-height` · `--kbd-padding-x` · `--select-item-gap` | literals in foundation | one-place values sera moves |

Most of that table was adopted into **axis contract v4** (see `registry/foundation/reference/README.md`); sera
now reads those slots, and iteration 54 moved two more of its rules onto them (`--kbd-*`,
`--ui-label-letter-spacing`). One candidate was new, and was adopted into v4 after this run:

| Name | Foundation would be | Why sera needs it |
|---|---|---|
| `--checkbox-invalid-checked-border` (layer 1) | `var(--selection)` | upstream's `dark:aria-invalid:border-destructive/50` is emitted after `aria-invalid:aria-checked:border-primary`, so an invalid + checked Checkbox outlines in primary in light and in `destructive/50` in dark. A value that differs by mode has no home in layer 2 — the same argument v4 used for `--radio-indicator-dot-size`. **Adopted** (2026-09-16): every 4.21 preset carries the same ordering, and the other seven exclude it instead of reproducing it, so a slot lets any of them choose |

Layer-3 rules that could not be reached by a value and were changed directly, each marked with a `sera:`
comment: the split focus/invalid rules for the input family in `_control-family.css` (foundation draws a
ring; sera moves one edge and draws none — this is a rule shape, not a value), the `.cn-menubar-item`
step back up to `text-sm` in `menubar.css` (MenubarItem renders `cn-dropdown-menu-item cn-menubar-item`, so
the four-family rule reaches it and the barrel order decides), the drawer's per-`data-swipe-direction`
edge in `drawer.css` (one border side per direction has no token form), and the five of iteration 54 listed
under "The residue, closed" (the input-group icon-sm square and textarea padding, the avatar group count's
per-size glyph, the sidebar skeleton icon, the navigation-menu popup shadow, and the context-menu
indicator's dropped flex box — a rule shape, like lyra's and maia's).

## Not measured

Nothing. The coverage template renders all 62 `registry/ui` components and the comparison pairs every one
that carries a `data-slot`.

## Axis contract v4, stage 2 (2026-09-17)

`tooling/preset/slot-migration.md` § sera, continuing from iteration 54. The layer-3 rules were taken back
from foundation wherever they read a v4 slot: 76 declaration sites (of 86 where foundation reads a slot and
sera wrote something else — the list's 81 plus the menu rings and separator insets; the ten below stay
rules) and 15 declarations foundation gained in v4 (the field's bottom edge on input · textarea · select ·
native select · input group, the command row's radius and gap, the button and select-trigger `sm` corner,
the menubar gap, the questionnaire choice fill, the disabled field fill, the active tab shadow).

**Renames** (in place in `tokens.css`, backfilled defaults deleted): `--tag-height` → `--badge-height` ·
`--tag-padding-y` → `--badge-padding-y` · `--tag-gap` → `--badge-gap` · `--tag-border-width` →
`--badge-border-width` · `--tag-icon-size` → `--badge-icon-size` · `--tag-padding-x-icon` →
`--badge-padding-x-icon` · `--tag-text-transform` → `--badge-text-transform` · `--tag-letter-spacing` →
`--badge-letter-spacing`. The "Foundation slot candidates" table above keeps the names sera proposed.

**Values now in slots:** `--badge-padding-x` · `--badge-radius` · `--badge-font-size` ·
`--badge-line-height` alias the tone tag's `--tag-padding-x` · `--tag-radius` · `--tag-font-size` ·
`--tag-line-height` (the plain badge wears the tag's box) · `--control-padding-x-grouped`
`var(--control-padding-x-field)` · `--item-gap` 8px · `--menubar-padding` 4px ·
`--sidebar-separator-margin-inline` `var(--sidebar-surface-padding)` · `--avatar-font-size` /
`--avatar-line-height` the sm UI step. The other listed rows equal foundation's default once the renames
are in (`--bubble-radius`, `--card-radius`, the radio dot, the questionnaire keycap edge …).

A `border-block-end-color` that duplicated foundation's new `border-bottom-color: var(--input-border-bottom)`
was removed from input · textarea · select · native select · input group.

**Rows not moved:**

| Where | Why it stays a rule |
|---|---|
| `accordion.css` `.cn-accordion` `border: 0 solid` | the item divider reads the same `--accordion-border-width` at 1px; sera's list has no outer frame — **resolved in v5** (`--accordion-item-border-width`) |
| `badge.css` `.cn-badge[data-tone]` `height: var(--control-height-xs)` | the plain badge's `--badge-height` is `auto`; the tone tag keeps the xs height — **resolved in v5** (`--tag-height`) |
| `card.css` `box-shadow` | reads `--card-ring` plus `--shadow-card`, a declaration mira does not make — **resolved in v5** (`--card-shadow`, whose default reads `--shadow-card`) |
| `toggle-group.css` joined item `padding-inline: var(--control-padding-x-md)` | `--control-padding-x-grouped` is the input-group addon's 0 — **resolved in v5** (`--toggle-group-item-padding-x`) |
| `native-select.css` `padding-block: 8px` | `--control-padding-y-field` is the input's 4px — **resolved in v5** (`--native-select-padding-y`) |
| `select.css` `.cn-select-item` `gap: var(--menu-item-gap)` | `--select-item-gap` is the 8px of Command and Item rows; the select row keeps the menu's 10 |
| `_menu-family.css` row case · tracking · weight | sera's rows are uppercase in the four menu families only, not in Command and Combobox (a selector) |
| field legend · popover title `letter-spacing: var(--ui-letter-spacing)` | the rest of the quiet label band tracks at `--ui-label-letter-spacing` (0.025em); these two do not |

**Layer-3 files:** 15 of 62 are byte-identical to foundation (10 before). The rest differ by values v4
has no slot for or by the rule shapes recorded above ("Layer-3 rules that could not be reached by a value").

**Check:** coverage-template dumps before and after, **0 differences** in light and dark. `compare-shadcn`:
light **0 mismatches / 25 excluded**, dark **0 / 25** — unchanged. `scan-tokens` · `validate-system` pass.

## Axis contract v5 (2026-09-17)

Five of the rows above became values: `--accordion-border-width: 0px` with `--accordion-item-border-width:
var(--surface-border-width)` · `--tag-height: var(--control-height-xs)` · `--toggle-group-item-padding-x:
var(--control-padding-x-md)` · `--native-select-padding-y: 8px`; the card reads `--card-shadow` at its default
(sera's own `--shadow-card`). `toggle-group.css` is now byte-identical to foundation. **Not adopted, and kept as
sera's rules:** the select row's gap, the menu rows' case · tracking · weight, and the legend / popover title
tracking.

**Check:** coverage dumps before and after, **0 differences** in light and dark. `compare-shadcn` against the reference app: light **0 mismatches / 25 excluded**, dark **0 / 25** —
unchanged. `scan-tokens` · `validate-system` pass.
