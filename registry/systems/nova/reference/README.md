# nova — reference

This system ports the shadcn create preset `base-nova` (shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`,
tag `shadcn@4.21.0`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Nova / Lucide / Geist` |
| `base` | `base` |
| `style` | `nova` |
| `baseColor` | `neutral` |
| `theme` | `neutral` |
| `chartColor` | `neutral` |
| `iconLibrary` | `lucide` |
| `font` | `geist` |
| `fontHeading` | `inherit` |
| `item` | `Item` |
| `rtl` | `false` |
| `menuAccent` | `subtle` |
| `menuColor` | `default` |
| `radius` | `default` |

## Sources

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-nova.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs nova` — `npx shadcn@4.21.0 init -t next -b base -p nova -n nova`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## Comparison

`node tooling/snapshot/compare-shadcn.mjs --system nova --mode light` (and `--mode dark`). Exclusions live in
`compare-exclusions.json` with a reason each.

The reference app type-checks against `registry/ui` with **0 errors** (no API difference between the shadcn
4.21.0 components and ours) and builds for production (`next build`, 2026-09-16). As for every preset, its
generated `globals.css` carries **no `.cn-*` rules**: `style-nova.css` is a separate distribution that
`shadcn init` does not install, so wherever the style file and the rendered app disagree, the app wins.

## Results — coverage template (2026-09-16)

`compare-shadcn.mjs --system nova --reference http://localhost:3110 --preview http://localhost:5181`
(the default `coverage` template), viewport 1440×900, DPR 1: 57 sections, each opened alone so its popups
render open, 2514 paired elements over 60 components (2097 slots; `direction` and `sonner` render no
`data-slot` of their own). Iterations were run with `--max-shots 0`.

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | `port.mjs` only (foundation/mira values, nova's radius scale and Geist stack) | 3970 | — |
| 1 | layer-2 control · menu · ui-text · surface · sidebar · table axes for nova (heights 24/28/32/36, 14px text, radius 10, focus ring 3px/50%), `--control-radius-sm`, layer-1 ring/backdrop/input-fill | 1804 | — |
| 2 | badge · kbd · avatar · chart · calendar (`--cell-size` 28, cell radius 8), card/bubble/attachment radius, item axes, input `py-1`, input-group addon | 1194 | — |
| 3 | menu label · palette row · select trigger and item · message · slider/progress pills · tabs trigger radius · radio group · attachment sizes · nav-menu radius | 794 | — |
| 4 | accordion without its outer frame, alert padding, sheet paddings, separators at full `--border`, native select, questionnaire shortcut, field axes, command palette search box (`--input-fill-strong`) | 689 | — |
| 5 | dialog/alert-dialog footer bands, drawer flush against its edge, menu labels and shortcuts, empty · popover · menubar · sidebar values, combobox chip | 359 | — |
| 6 | sub-menu shadows, button-group radius, tooltip type, disabled fills (`--input-fill-disabled`), field-label checked border, context-menu indicator, sidebar sm type | 125 | — |
| 7 | the last size and colour gaps; exclusions written | **0** | 268 |
| 8 | dark: outline border `--input`, sidebar search box fill, outline badge unfilled, questionnaire choice fill (`--questionnaire-choice-fill`), checked choice border/fill | 0 | 23 |
| 9 | dark exclusions written (Tailwind's `dark:` ordering) | **0** | **0** |

Final: **light 0 mismatches / 46 excluded · dark 0 / 69**.

`check-coverage.mjs --system nova` passes in light and dark: 57 sections, 62 components, 23 with popups, no
console errors, no page errors, no empty sections, every popup present.

## Slots this port needed

nova wanted values where foundation's rule had baked in mira's. Each is declared in nova's own layer 1 or 2
and read by a nova layer-3 rule (`scan-tokens` lists them as system-only tokens); all of them are
**foundation slot candidates**:

| Token | nova | mira (why foundation has no slot) |
|---|---|---|
| `--control-radius-sm` | 8px | mira's sm control shares `--control-radius`; nova steps it down (`rounded-[min(var(--radius-md),12px)]`) |
| `--badge-height` · `--kbd-height` | 20px | both are `h-5` in mira **and** in nova, but nova's xs control grew to `h-6`, so they can no longer read `--control-height-xs` |
| `--badge-radius` | 26px | mira's badge is `rounded-full`; nova's is `rounded-4xl` |
| `--item-gap` | 8px | Item's `gap-2` equals mira's `--menu-item-gap`; nova's menu row is `gap-1.5` |
| `--command-item-radius` · `--command-item-gap` | 6px · 8px | the palette row equals the menu row in mira; nova splits them |
| `--tabs-trigger-active-shadow` | `shadow-sm` | mira's selected tab is flat |
| `--input-fill-strong` | `input/30` | the command palette's search box has its own fill step; mira reuses `--input-fill` |
| `--input-fill-disabled` | `input/50` · dark `input/80` | mira leaves a disabled control its normal fill |
| `--field-label-checked-border` | `primary/30` · dark `/20` | mira's checked field label changes only its background |
| `--questionnaire-choice-fill` | transparent · dark `input/20` | mira's choice has no fill of its own |

## Layer-3 rules that had to change

Where no slot could express the difference (a declaration nova adds, or a rule that reads a different step):
`accordion` (no outer frame, `py-2.5` trigger with no side padding), `card` · `dialog` · `alert-dialog`
(the `muted/50` footer band with its own border and bleed), `drawer` (the panel sits flush and borders only
the entering side, per `data-swipe-direction` / `data-vaul-drawer-direction`), `button` (xs/sm take the
group radius inside a `ButtonGroup`; the icon-sm button keeps the base glyph size), `_menu-family` (the
check rows take the plain item's padding, the context-menu indicator has no rule upstream, sub-menus all
take `--menu-sub-shadow`, the combobox label keeps palette padding), `input-group` (the disabled control
stays transparent, at (0,2,1) so it beats `input.css`), `select` (asymmetric trigger padding, the check
gutter on every item), `tabs` (the selected default tab's shadow), `navigation-menu` (surfaces one radius
step lower), and the per-component gaps and paddings that have no axis (`message`, `empty`, `sidebar`
header/footer, `questionnaire`). Each carries a `nova:` comment naming the utility it reproduces.

## Exclusions

`compare-exclusions.json`, 46 rows in light and 69 in dark, one reason each:

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream (foundation's) |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical (foundation's) |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference (foundation's) |
| menu shortcut widths | the command glyph is in neither Geist build and the two font stacks fall back differently (~0.5px) (foundation's) |
| questionnaire action row height | nova's generated TSX carries `sm:min-h-8` where the shadcn base component (which `registry/ui` follows) carries `sm:min-h-9`; a utility, so no layer-3 rule can reach it (foundation's, with nova's number) |
| the sm button's line height inside a card or item | nova's `text-[0.8rem]` carries no line height, so upstream it inherits the container's ratio (1.42857 in a `text-sm` card, 1.5 on the page); foundation fixes line heights in px per axis — the same shape as foundation's unitless line-height exclusion |
| dark state colours: open triggers, the focused outline Cancel, the invalid checked checkbox | Tailwind sorts nova's `dark:` colours after state utilities that have no dark counterpart, so upstream those states lose their colour in dark (foundation's) |

No exclusion is a `registry/ui` difference of ours: the TSX was not touched in this port, and the one
component difference that remains (disabled Checkbox · Radio) is upstream's own.

Not covered by the comparison: nothing. The coverage template renders all 62 `registry/ui` components and
the comparison pairs every one that carries a `data-slot`.
