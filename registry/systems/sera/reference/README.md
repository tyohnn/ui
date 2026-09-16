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

Final: **light 24 mismatches / 22 excluded · dark 28 / 22**. The port did **not** reach zero; the residue is
listed under "Not resolved" below and each item is a single element.

## Exclusions

`compare-exclusions.json`, 22 rows in each mode, one reason each. All four are foundation's, kept for the
same reasons, with the shortcut row rewritten for Noto Sans.

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu · command · menubar shortcut widths | ⌘ is in neither Noto Sans build and the two font stacks fall back differently (0.3–1.8px) |

Of foundation's seven rows, three do not apply to sera and were dropped rather than carried: the
questionnaire action row (sera's generated TSX carries `sm:min-h-10`, and the system reproduces it with a
value), the `text-[0.625rem]` line-height row (sera writes those types as `text-xs`), and the dark
`dark:`-ordering row (sera's dark colours do not sit after the state utilities the way mira's do — the dark
run has no state-colour mismatch at all).

## Not resolved

24 light / 28 dark, all single elements, all measured but not yet traced to a rule:

| Where | What |
|---|---|
| `field/field-label#5` | `letter-spacing` 0.3px upstream, normal here — the peer rule that gives a control's label sentence case also clears its track on one label the reference does not treat as a peer |
| `item/badge#0` | the badge inherits a unitless line height inside a `text-sm` Item (14.28px) while the system fixes it in px (15px) — the same shape as foundation's `text-[0.625rem]` row |
| `input-group/button#3` | one `InputGroupButton` is `h-8 text-sm` upstream; `inputGroupButtonVariants` sizes it as a utility, and the two sizes the system can express do not split there |
| `context-menu/{checkbox,radio}-item#0>span#1` | the empty indicator box is `auto` upstream and 14px here |
| `avatar/avatar-group-count#1>svg#0` | one of the two group counts wants a 14px glyph and the other 12px |
| `sidebar/skeleton#0` | one placeholder bar is 14px upstream, 16px here |
| `kbd-spinner-separator/kbd#4` | one keycap inherits the control track instead of `normal` |
| `navigation-menu/root1` | the viewport-less panel carries `shadow-md` upstream and `shadow-sm` here |

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

Three layer-3 rules could not be reached by a value and were changed directly, each marked with a `sera:`
comment: the split focus/invalid rules for the input family in `_control-family.css` (foundation draws a
ring; sera moves one edge and draws none — this is a rule shape, not a value), the `.cn-menubar-item`
step back up to `text-sm` in `menubar.css` (MenubarItem renders `cn-dropdown-menu-item cn-menubar-item`, so
the four-family rule reaches it and the barrel order decides), and the drawer's per-`data-swipe-direction`
edge in `drawer.css` (one border side per direction has no token form).

## Not measured

Nothing. The coverage template renders all 62 `registry/ui` components and the comparison pairs every one
that carries a `data-slot`.
