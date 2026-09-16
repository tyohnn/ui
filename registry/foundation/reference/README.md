# foundation — reference

`registry/foundation` holds the shadcn **mira** preset values. This folder records the run that proved it:
the reference app, the comparison results and every place foundation was corrected against it.

Nothing from the sources is copied here; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Mira / Hugeicons / Inter` |
| `base` | `base` |
| `style` | `mira` |
| `baseColor` | `neutral` |
| `theme` | `neutral` |
| `chartColor` | `neutral` |
| `iconLibrary` | `hugeicons` |
| `font` | `inter` |
| `fontHeading` | `inherit` |
| `item` | `Item` |
| `rtl` | `false` |
| `menuAccent` | `subtle` |
| `menuColor` | `default` |
| `radius` | `default` |

## Sources

shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`, tag `shadcn@4.21.0`.

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-mira.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Reference app: `node tooling/preset/make-reference.mjs mira` — `npx shadcn@4.21.0 init -t next -b base -p mira -n mira`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

Two notes on the app itself:

- Its `components/ui/spinner.tsx` spreads `React.ComponentProps<"svg">` into `HugeiconsIcon`, whose `strokeWidth`
  is number-only — a shadcn 4.21.0 / hugeicons typing bug in the generated source. It does not change what the page
  renders, so the production build runs with `typescript.ignoreBuildErrors` rather than editing the answer key.
- A preset app's `globals.css` carries **no `.cn-*` rules at all**. `style-mira.css` is a separate distribution that
  `shadcn init` does not install, so wherever the style file and the rendered app disagree, the app wins
  (`tooling/preset/README.md` §2, "Baked components").

## Comparison

```sh
node tooling/snapshot/compare-shadcn.mjs --system foundation \
  --reference http://localhost:3101 --preview http://localhost:5181 --mode light|dark \
  --exclusions registry/foundation/reference/compare-exclusions.json
```

`--system foundation` only picks the preview URL, so the exclusions file must be passed explicitly (foundation
does not live under `registry/systems`). The template is `coverage`: 57 sections, each opened alone so its popups
render open, 2514 paired elements over 60 components.

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | foundation as it stood (mira values, but never compared against a mira app) | 3688 | — |
| 1 | letter-spacing `normal` on the control and ui axes; control line heights 19.5 / 15; the button's own type on `.cn-button` | 1963 | — |
| 2 | ui line heights 19.5 / 15; toggle reads the ui type axis; input `py-0.5`; avatar fallback `text-sm` / `text-xs` | 1075 | — |
| 3 | toggle border only on the outline variant; calendar `text-[0.8rem]` weekdays and no caption-label box; skeleton = muted; outline button fill slot; radio fill = checkbox fill; neutral chart ramp | 715 | — |
| 4 | menu item vertical padding (`--menu-item-padding-y{,-check}`), command item padding, combobox item without `pr-8`, kbd radius slot, checkbox fill transparent in light, select/native-select vertical padding | 514 | — |
| 5 | input and select trigger take a fixed `height` (mira's `h-7 py-*` puts the padding inside the height) | 446 | — |
| 6 | switch thumb sizes, sheet shadow slot, menu shortcut line height, checkbox/radio item `text-xs`, command palette without shadow and with its own paddings, field label specificity over `.cn-label` | 261 | — |
| 7 | button sizes take `height` (so the calendar's `size-(--cell-size)` nav buttons win); vertical separator `h-full`; calendar dropdown root without a border; menubar trigger `py-[0.85]`; questionnaire indicator fill | 200 | — |
| 8 | dialog/alert-dialog ring without a shadow (`--dialog-shadow`); alert dialog inherits the page type; context-menu sub-content `shadow-lg` (`--menu-sub-shadow`); navigation menu viewport/popup shadows split; menu indicators without a box; sidebar group label `foreground/70`, separator margins, sub-rail offsets; sonner keeps its own type; empty title `tracking-tight`; chart tooltip border and `shadow-xl` | 135 | — |
| 9 | sub-trigger open state (`data-popup-open`) and `text-xs`; `cn-menu-translucent`'s trigger utilities removed; navigation menu link `p-2` with the trigger style winning on specificity; native select `pr-6`; questionnaire shortcut `bg-background/80`; invalid **and** checked checkbox keeps its ring; Input inherits its text colour | 55 | — |
| 10 | message header/footer line height; questionnaire input `py-0.5`; exclusions written | **0** | 24 |
| 11 | dark: button group separator specificity over `.cn-separator`, chart tooltip `bg-background`, slider thumb `bg-white` (`--slider-thumb-fill`) | 0 | 15 |
| 12 | dark exclusion written (Tailwind's `dark:` ordering) | **0** | **0** |

Final: **light 0 mismatches / 55 excluded · dark 0 / 70**.

## What foundation was corrected on

Everything below was foundation's own value before this run and is now mira's.

| Item | mira | foundation was | Adopted / kept | Why |
|---|---|---|---|---|
| `--control-letter-spacing` · `--ui-letter-spacing` | `normal` | `-0.01em` | adopted | The value was Pretendard's, kept after the font moved to Inter. It moved every text element in the template. A Pretendard system lowers the slot. |
| control line heights | 19.5 / 15 (12px × 1.625, 10px × 1.5) | 20 / 16 | adopted | They had been rounded to integers "to keep the axis tidy"; the rounding is a visible 0.5px per line. |
| `.cn-button` type | `text-xs/relaxed` on the base class | only on the size classes | adopted | Icon buttons carry no size type, so they inherited the page's 16px. |
| toggle type | `text-xs` (12/16), `sm` `text-[0.625rem]` | the control type axis | adopted | mira's Toggle is UI text, not control text; the values are exactly the ui axis's `sm` and `xs`. |
| toggle border | outline variant only | a transparent border on every toggle | adopted | mira's Toggle base class has no border at all. |
| avatar fallback type | `text-sm`, `text-xs` when small | inherited | adopted | registry/ui drops the utility, so layer 3 has to carry it (`tooling/preset/README.md`). |
| `--skeleton` | `--muted` | one step darker (neutral-200) | adopted, **slot kept** | The darker step came from a contrast measurement in an earlier product. The axis stays so a system can lower it; foundation is the starting point, so its value is mira's. |
| chart colours | the neutral ramp (`chartColor: neutral`) | the pre-4.21 coloured ramp (orange/teal/cyan…) | adopted | A leftover from an older preset generation; every 4.21 preset uses `chartColor` of its base colour. |
| outline button fill | none in light, `bg-input/30` in dark | `--input-fill` in both | adopted, **new slot** `--button-outline-fill` | The button's fill is not the Input's; the two only looked alike in light. |
| checkbox / radio / questionnaire indicator fill | none in light, `bg-input/30` in dark | `--input-fill` in both | adopted | Same shape as the button; `--checkbox-fill` now carries it and the radio and the questionnaire indicator read it. |
| menu item vertical padding | `py-1`, `py-1.5` on check/radio/palette rows | none (height only) | adopted, **new slots** `--menu-item-padding-y{,-check}` | The padding is what grows a row whose text wraps; `--menu-item-height` only sets the floor. |
| kbd radius | `rounded-xs` (2px) | the indicator radius (4px) | adopted, **new slot** `--kbd-radius` | A keycap is not a checkbox; the two only shared a number. |
| button · input · select trigger height | `height` (`h-7` with the padding inside) | `min-height` | adopted | `min-height` beats a caller's `size-(--cell-size)`, so the calendar's nav buttons were 28px instead of 24, and the padding pushed inputs to 30px. The growth-with-content the deviation bought is not worth a control that ignores its call site. |
| vertical separator | `h-full` | `height: 16px; align-self: center` (2026-09-11) | adopted | The 2026-09-11 problem was `align-self: stretch` failing once a caller set a height; `height: 100%` fills the parent in that case too, so the reason no longer holds. |
| sheet shadow | `shadow-lg` | `--shadow-float` (md) | adopted, **new slot** `--sheet-shadow` | The family had been collapsed to one shadow when `--shadow-raised` was renamed. |
| dialog · alert-dialog shadow | ring only | ring + `--shadow-float` | adopted, **new slot** `--dialog-shadow` (foundation: none) | It was knowingly kept as "invisible over an 80% scrim"; as a slot it costs nothing and a system can still add one. |
| context menu sub-content | `shadow-lg` | nothing (the rule never matched the typo'd class) | adopted, **new slot** `--menu-sub-shadow` | Reachable again now that `cn-context-menu-sub-content` is spelled correctly. |
| `.cn-toast` type | sonner's own defaults (13px / 1.5) | pinned to `--ui-text-sm` (12/16) | adopted | `style-mira.css` says nothing about the toast's type, so the preset's real output is sonner's default. Pinning it was a value mira does not have. |
| `cn-menu-translucent` trigger utilities | — | `**:…-trigger:focus:bg-foreground/10` and an `!important` `aria-expanded` variant | adopted (removed) | They never reach a preset app (no `.cn-*` rules in its globals.css), and here they beat the menu family's own `--accent` at (0,3,0) + `!important`. |
| sidebar group label colour | `sidebar-foreground/70` | opaque `--sidebar-icon` | adopted | |
| sidebar separator margins · sub-rail offsets | `mx-2` (no block margin) · `mx-3.5 px-2.5` | `8px` · `16px/16px` | adopted | |
| navigation menu shadows | viewport `shadow-md`, popup `shadow-sm` | one `--shadow-float` for both | adopted | |
| Input text colour | inherited | `var(--foreground)` | adopted | An invalid Field sets `text-destructive` on itself; an explicit colour blocked it. |
| Button `min-height` | — | — | **kept where it does not show** | Only the size classes moved to `height`; nothing else in foundation relies on `min-height` for a control. |

Two slots were added for the same shape of problem (a colour mira gives only in dark) rather than splitting
layer 3 by `.dark`: `--button-outline-fill` and `--slider-thumb-fill`. `foundation.json`'s
`axisContractVersion` is **3**; graphite and vega were backfilled with values that keep their current look.

## Exclusions

`compare-exclusions.json`, 55 rows in light and 70 in dark, one reason each:

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu shortcut widths | ⌘ is in neither Inter build and the two font stacks fall back differently (~0.5px) |
| questionnaire action row height | mira's generated TSX carries `sm:min-h-7` where the shadcn base component (which registry/ui follows) carries `sm:min-h-9`; a utility, so no layer-3 rule can reach it |
| `text-[0.625rem]` line heights (badge in an Item, kbd, xs button in an Alert, `<option>`) | mira lets these inherit a unitless ratio, so the same element is 15px tall on the page and 16.25px inside a `text-xs/relaxed` container; foundation fixes line heights in px per axis |
| dark state colours on open triggers and the invalid checked checkbox | Tailwind sorts mira's `dark:` colours after state utilities that have no dark counterpart, so upstream those states lose their colour in dark |

Not covered by the comparison: nothing. The coverage template renders all 62 `registry/ui` components and the
comparison pairs every one that carries a `data-slot`.
