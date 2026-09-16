# lyra — reference

This system ports the shadcn create preset `base-lyra` (shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`,
tag `shadcn@4.21.0`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Lyra / Tabler / JetBrains Mono` |
| `base` | `base` |
| `style` | `lyra` |
| `baseColor` | `neutral` |
| `theme` | `neutral` |
| `chartColor` | `neutral` |
| `iconLibrary` | `phosphor` |
| `font` | `jetbrains-mono` |
| `fontHeading` | `inherit` |
| `item` | `Item` |
| `rtl` | `false` |
| `menuAccent` | `subtle` |
| `menuColor` | `default` |
| `radius` | `default` |

## Sources

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-lyra.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs lyra` — `npx shadcn@4.21.0 init -t next -b base -p lyra -n lyra`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## Comparison

`node tooling/snapshot/compare-shadcn.mjs --system lyra --mode light` (and `--mode dark`). Exclusions live in
`compare-exclusions.json` with a reason each.

The run used the reference app on **3114** (`npx next start` after `npm run build` — the production build
compiles and type-checks clean) and the preview on **5185**:

```sh
node tooling/snapshot/compare-shadcn.mjs --system lyra \
  --reference http://localhost:3114 --preview http://localhost:5185 --mode light|dark --max-shots 0
```

⚠ `node tooling/build-system lyra` before every run. Skipping it compares the preview against the
previous build's CSS (the lesson from the luma port).

## Reference app

`make-reference.mjs` reported **no component missing from shadcn 4.21.0** and **0 type errors** in the
copied Specimen and coverage templates, so there is no API difference between `registry/ui` and the
shadcn components for this preset. `next build` succeeds without `typescript.ignoreBuildErrors`.
`data-tone` and `data-shape` stay on both sides; lyra has no tones or shapes, and the comparison
confirms the attributes change nothing.

Two things about this preset specifically:

- **The preset's own `description` string is `Lyra / Tabler / JetBrains Mono`, but its `iconLibrary` is
  `phosphor`** and the generated app imports `@phosphor-icons/react` in all 26 component files that use
  an icon. The description is a stale label upstream; the config field and the rendered app agree on
  phosphor, so `system.json` records phosphor.
- **The font wiring is not what `fonts.sans` suggests.** The generated `layout.tsx` leaves the Next
  template's Geist on `--font-sans` and puts `font-mono` on `<html>`, with `--font-heading` and
  `--font-mono` both pointing at the JetBrains Mono variable. Every role in the rendered app is
  therefore the one monospace family, which is why `system.json` sets **`mono: "jetbrains-mono"`, not
  `system`** — `font-mono` is read by the chart values and the questionnaire keys, and the platform
  stack would have differed there. Verified before the first comparison: both pages load JetBrains Mono
  (the reference through `next/font`, the preview through `@fontsource-variable/jetbrains-mono`) and the
  two builds measure the same advance width to within 0.02px over 16 characters, so no text width in
  this comparison is a font artefact.

The one place the two `--font-sans` values still differ is `Kbd`, whose `font-sans` utility resolves to
Geist upstream and to JetBrains Mono here. lyra's layer 3 keeps `font-sans` so the keycap follows the
system's own sans; the preset's Geist is a leftover of the Next template, not a value lyra declares.

## Results (2026-09-16)

Template `coverage`, viewport 1440×900, DPR 1: 57 sections, each opened alone so its popups render open,
2514 paired elements over 62 components, 0 unpaired on either side.

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | `port.mjs` only (foundation/mira values, lyra's colours and radius scale) | 7822 | — |
| 1 | layer 2 across every axis: controls one step up (24 · 28 · 32 · 36, px-2.5, gap-1.5, size-4), the type flattened to a single text-xs (12/16), every radius to 0, 1px focus rings, menu rows at py-2, the switch track, the UI ramp without its 10px step | 3042 | — |
| 2 | layer 1 fills (transparent field, bg-background outline button, `--switch-track-off` = input, a 10% scrim); the axes lyra splits from `--control-height-xs` (badge · kbd stay h-5), the field's own py-1, the sm icon button's size-4 glyph, the 28px calendar cell | 2011 | — |
| 3 | `--ui-line-height-md` to 16 with `--ui-line-height-relaxed` (19.5) for the reading surfaces; 32px menu rows; the toggle's own gap; the combobox row joining the menu family | 1731 | — |
| 4 | the label weight slot (400), the command heading's py-1.5, square sidebar and attachment corners, card and bubble on the relaxed step | 1403 | — |
| 5 | `--menu-padding` to 0 (lyra's popup surfaces have no padding) with the menubar and sidebar group keeping theirs; the borderless accordion group; radio group gap-2; the menubar bar at h-8 | 1221 | — |
| 6–8 | menu labels at py-2, the shortcut line height, alert's 10/8 box, separators at full strength with their own −4 inset, select and menubar rows, `--ring-focus` to 50%, the relaxed step across the description surfaces | 881 | — |
| 9–11 | grouped-control padding (px-2 inside a group), native select pr-8, marker and breadcrumb glyphs at 14, the flush sidebar list, the 8px calendar, the command palette's h-8 fill-only search box, field and toggle details | 575 | — |
| 12–14 | square carousel · scrollbar · tooltip arrow · reaction row, the sheet's own p-4, the banded card footer with the card's dropped bottom padding, the disabled field fill, message and questionnaire type | 425 | — |
| 15–17 | the flush drawer with a rule only on the edge facing the page, accordion panel px-0 pb-2.5, questionnaire and alert-dialog boxes, pagination px-1.5, popover gap-2.5, the size-10 alert-dialog media | 262 | — |
| 18–21 | the per-element line-height split (rows text-xs, descriptions text-xs/relaxed), the menubar's deeper inset, combobox chips, the submenu shadow step, drawer and sheet header gaps | 128 | — |
| 22 | exclusions written; dark: `--button-outline-border` = input, the 10% scrim in dark, the outline badge and questionnaire indicator without a dark fill, the sidebar search box fill | **128** | **123** |

**This run did not reach 0.** Light stands at 128 mismatches over 38 exclusions and dark at 123 over 61.
The two counts are now almost the same set: only 31 of dark's were dark-only before the layer-1 pass
above, so what remains is one shared geometry tail, not a mode problem. See "What is left" below.

## Exclusions

`compare-exclusions.json`, 38 rows in light and 61 in dark, one reason each. The first four are the same
four foundation carries; the fifth and sixth are foundation's shapes with lyra's numbers.

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu · command · menubar shortcut widths | ⌘ is in no JetBrains Mono build and the two stacks fall back differently |
| questionnaire action row height | lyra's generated TSX carries `sm:min-h-8` where the shadcn base component (which `registry/ui` follows) carries `sm:min-h-9`; a utility, so no layer-3 rule can reach it |
| dark state colours on open triggers, the alert-dialog cancel button and the invalid checked checkbox | Tailwind sorts lyra's `dark:` colours after state utilities that have no dark counterpart, so upstream those states lose their colour in dark |

Two of foundation's seven rows do not apply and were dropped rather than carried: the `text-[0.625rem]`
line heights (lyra has no 10px step — badges, keycaps and shortcuts are all `text-xs`, which carries its
own line height, so nothing inherits a unitless ratio).

**The ⌘ exclusion was measured, not assumed.** foundation sees ~0.5px there in Inter. In lyra the gap is
**4.3px to 20.3px** — the menubar row, which carries the longest shortcut, is the worst case. A
monospace body font makes this worse rather than better: every other glyph on the row has an identical
advance on both sides, so the one non-monospace glyph carries the entire difference instead of it being
spread over the string. The two sides fall back differently (next/font's "JetBrains Mono Fallback"
against the preview's Pretendard), which is a font-stack fact and not a lyra value.

## What is left

128 mismatches in light, 123 in dark, over roughly 98 unique element/property signatures. They are a
long tail of single-component values, not a missing axis — the largest cluster is 4 elements. Known
groups, with what each needs:

| Where | What |
|---|---|
| `input-group` | the button sizes inside a group (24 / 28 against our 28 / 32), the addon's block height and its −2.4px end margin, and the control keeping the group's disabled fill instead of staying transparent |
| `menubar` | the checkbox/radio rows (`pr-28 pl-8`, and the wrapped 80px height that follows), and the content height that follows from them |
| `alert-dialog-sm` | the `sm` size's title and description type — the title is `text-sm`, not the heading step |
| `field` | the checked row's border (`foreground/30`, currently `--border-strong`) |
| `drawer` | the remaining popup height/margin deltas after the flush inset |
| `context-menu` | the checkbox and radio indicators still draw a box where lyra leaves them `auto` |
| `combobox` · `questionnaire` · `avatar` | the clear button box, the number keycap's 10px type and opaque fill, the overflow chip's size-3 glyph |

None of these needs a new axis; each is one declaration in the component's layer-3 file, checkable
against the reference app the same way the rest were.

## Foundation slot candidates

Twelve places needed a system-only layer-2 name because foundation has one value where lyra wants two.
Each is a candidate for the next axis-contract version; foundation is not changed by this run.

| Name | Foundation would be | Why lyra needs it |
|---|---|---|
| `--badge-height` | `var(--control-height-xs)` | the badge stays `h-5` while the xs button grows to `h-6` |
| `--kbd-height` | `var(--control-height-xs)` | same, for the keycap |
| `--badge-radius` | `9999px` | the plain badge's corner was a literal in layer 3, and lyra squares it |
| `--control-padding-y-field` | `2px` | the field family carries a real `py-1`; the control axis has no vertical step |
| `--control-icon-button-icon-size-sm` | `var(--control-icon-size-sm)` | the sm icon button keeps `size-4` while the sm label button drops to `size-3.5` |
| `--control-padding-x-grouped` | `var(--control-padding-x-md)` | a control inside a group (toggle group item, select trigger end, input-group addon) keeps `px-2` while the standalone control moved to `px-2.5` |
| `--toggle-gap` | `var(--control-gap-md)` | Toggle keeps `gap-1` at every size while the button family moved to `gap-1.5` |
| `--ui-line-height-relaxed` | `var(--ui-line-height-md)` | lyra splits rows (`text-xs`) from descriptions (`text-xs/relaxed`); foundation has one value for both |
| `--label-font-weight` | `var(--ui-font-weight)` | the Label and the command group heading carry no weight utility while the rest of the UI text is `font-medium` |
| `--menu-label-padding-y` | `var(--menu-item-padding-y-check)` | a command group heading is `py-1.5` where a check row is `py-2` |
| `--menu-separator-margin-inline` · `--menu-separator-margin-block` | `calc(var(--menu-padding) * -1)` · `var(--menu-padding)` | the separator keeps its `-mx-1` although the surface padding went to 0, so the two no longer derive from one another |
| `--menubar-padding` · `--menubar-gap` · `--menubar-item-padding-inset` | `var(--menu-padding)` · `0px` · `var(--menu-item-padding-inset)` | the menubar bar keeps `p-1` and `gap-0.5` where the popup surfaces went to 0, and indents one step further (`pl-8`) |
| `--sheet-padding` | `var(--surface-padding-lg)` | the sheet header and footer are `p-4` while empty and the command panel keep `p-6` |
| `--accordion-border-width` | `var(--surface-border-width)` | lyra draws no box around an accordion group, only the per-item bottom rule |
| `--input-fill-disabled` | `transparent` | a disabled field takes a fill (`input/50` light, `input/80` dark) that no existing name carries |

## Not measured

Nothing. The coverage template renders all 62 `registry/ui` components and the comparison pairs every one
that carries a `data-slot`. `check-coverage.mjs --system lyra` passes in both modes: no console errors,
no page errors, no empty sections, every popup present.
