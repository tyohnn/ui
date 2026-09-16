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

## Axis contract v4 — the slots the nine ports asked for (2026-09-16)

Eight preset ports (`vega` · `nova` · `maia` · `lyra` · `luma` · `rhea` · `sera`, plus `mira` which is this
folder's own run) and one screenshot system (`graphite`) each recorded, in their `reference/README.md`, the
places where **foundation had no slot and a layer-3 rule had to be edited**. Version 4 lifts the repeated ones
into foundation: **85 layer-2 names and 15 layer-1 names**, every default an alias of what the rule already
read, `initial`, `transparent`, `none`, or the literal the rule carried.

Adoption rule: a candidate is adopted when **two or more systems asked for it**, or when one system asked and
the name completes an axis foundation already has (a missing size step, a second half of an existing pair).
A value only one system wants and that no axis is missing stays that system's own.

**Proof it changes nothing:** foundation and `registry/systems/mira` both compare **0 mismatches in light and
0 in dark** against the mira reference app after the change, with the same 55 / 70 exclusions as before, and
the seven systems not yet migrated (`graphite` · `vega` · `nova` · `luma` · `rhea` · `maia` · `lyra`) dump
**0 computed-value differences** against their pre-change dumps in both modes
(`compare-computed.mjs --dump` / `--diff`).

### The two structural problems v4 solves

1. **`--control-height-xs` was three things at once** — the xs button, the badge and the keycap. Every port
   that grew its xs control grew badges and keycaps with it, and had to edit `badge.css` and `kbd.css` to put
   them back (lyra · maia · nova; sera rewrote the badge box entirely). The badge and the keycap now have
   **their own axes** (`--badge-*`, `--kbd-*`), whose foundation defaults alias the xs control step — so mira
   is unchanged and the three components are free of one another.
2. **The menu separator's bleed was derived from `--menu-padding`** (`calc(var(--menu-padding) * -1)`). lyra
   flattened its popup padding to 0 and lost the separator's `-mx-1` with it, because one value carried two
   meanings. `--menu-separator-margin-inline` and `--menu-separator-margin-block` are now slots of their own
   (defaults: exactly the two expressions the rule carried), in `_menu-family.css` **and** `select.css`.

### Layer 2 (`styles/tokens.css`) — 85 names

| Area | Slots | Default | Why · who asked |
|---|---|---|---|
| badge | `--badge-height` · `-padding-x` · `-padding-x-icon` · `-padding-y` · `-gap` · `-icon-size` · `-border-width` · `-radius` · `-font-size` · `-line-height` · `-letter-spacing` · `-font-weight` · `-text-transform` | the xs control step; `2px`; `9999px`; the xs UI type; `initial` | the badge was the xs control's twin — lyra · maia · nova (height · radius · paddings · glyph), sera (the whole box, which it strips to plain text) |
| kbd | `--kbd-height` · `-min-width` · `-padding-x` · `-gap` · `-font-size` · `-line-height` · `-letter-spacing` · `-font-weight` · `-icon-size` | the xs control step; `4px`; the xs UI type | a keycap is not an xs button — lyra · maia · nova · sera. `--kbd-letter-spacing` also closes sera's last keycap mismatch (upstream the keycap *inherits* its tracking) |
| control | `--control-radius-sm` · `--control-text-transform` · `--control-padding-x-grouped` · `--control-icon-button-icon-size-sm` | `--control-radius`; `initial`; the md padding; the sm glyph | nova · luma split the sm corner; sera uppercases every control; lyra keeps `px-2` inside a group while the standalone control grows, and keeps `size-4` on the sm icon button |
| control · field sub-axis | `--control-padding-x-field` · `-padding-y-field` · `-font-size-field` · `-line-height-field` · `-letter-spacing-field` | the md step; `2px` | the input family and the button family stop sharing one step — rhea · sera · lyra |
| toggle | `--toggle-gap` · `--toggle-group-joined-radius` | the md gap; `--control-radius` | lyra (Toggle keeps `gap-1`), maia (a joined group rounds one step below its buttons) |
| switch | `--switch-thumb-width-md` · `-width-sm` · `--switch-radius` | the thumb sizes; `9999px` | luma's thumb is not square; sera squares the track |
| ui text | `--label-font-weight` · `--ui-label-text-transform` · `--ui-label-letter-spacing` · `--title-text-transform` · `--title-letter-spacing` | the UI weight; `initial`; `--ui-letter-spacing` | lyra's Label carries no weight; sera uppercases the quiet label band and the surface titles as two separate bands |
| table | `--table-head-text-transform` · `--table-head-letter-spacing` | `initial`; `--ui-letter-spacing` | sera's head is uppercase and tracked |
| menu | `--menu-separator-margin-inline` · `-margin-block` · `--menu-label-padding-y` · `-text-transform` · `-letter-spacing` · `--menu-item-text-transform` · `-letter-spacing` · `-font-weight` · `--menu-narrow-min-width` | the expressions the rule carried; the check row's 6px; `initial` | structural problem 2 (lyra); the command heading's `py-1.5` (lyra · sera); sera's uppercase rows and labels; maia's narrow select · combobox · sub-menus |
| command · select · menubar | `--command-item-radius` · `--command-item-gap` · `--select-item-gap` · `--menubar-padding` · `--menubar-gap` · `--menubar-item-padding-inset` | the menu row's values; `normal` | maia · nova split the palette row from the menu row; sera the select row; lyra's menubar bar keeps `p-1` where the popups went to 0 |
| surfaces | `--card-radius` · `--bubble-radius` · `-padding-x` · `-padding-y` · `-line-height` · `--chart-tooltip-radius` · `--empty-radius` · `--sheet-padding` · `--accordion-border-width` | the `--surface-*` step the rule read; `6px` | luma (card ≠ popover), maia (bubble · chart tooltip · empty each one step off), lyra (the sheet's own `p-4`; a borderless accordion group), sera (the bubble box) |
| tabs (default variant) | `--tabs-list-height` · `-list-padding` · `--tabs-trigger-gap` · `-padding-x` · `-padding-y` · `-active-shadow` | the lg control height; `3px`; `6px`; `6px`; `2px`; `none` | the line variant already had an axis; sera's bar is `h-10 p-1` with `px-4 py-1.5` triggers, and nova's selected tab carries `shadow-sm` |
| item · slider · avatar | `--item-gap` · `--item-media-icon-size` · `--slider-track-thickness` · `--avatar-font-size` · `--avatar-line-height` | the menu row's gap; the lg glyph; `4px`; the lg UI type | nova splits Item from the menu row; sera moves the media glyph and the track; maia's lg UI step is `text-base` while the fallback stays `text-sm` |
| sidebar | `--sidebar-surface-padding` · `-surface-gap` · `--sidebar-input-height` · `--sidebar-item-padding-y` · `--sidebar-separator-margin-inline` · `--sidebar-badge-font-weight` · `--sidebar-part-radius` | the menu axis; the lg control height; the item's side padding; the UI weight; the item radius | sera keeps the shell at 8 while the menu row grows to 12; rhea gives the separator its own inset; maia rounds the menu button one step above every other part |

### Layer 1 (`styles/globals.css`, `:root` **and** `.dark`) — 15 names

| Slot | Default | Why · who asked |
|---|---|---|
| `--input-border` · `--input-border-bottom` | `var(--input)` · `var(--input-border)` | luma draws no edge on the input family, sera draws only the bottom one, rhea gives it a colour of its own (3 systems) |
| `--input-fill-disabled` | `var(--input-fill)` | a disabled field takes a fill mira does not give it — lyra · nova |
| `--command-input-fill` | `var(--input-fill)` | the palette's search box splits from the sidebar's — lyra · nova |
| `--button-outline-hover-fill` | `var(--input-fill-hover)` | vega: the outline button's hover is not the Input's |
| `--card-ring` · `--menu-ring` | `var(--ring-subtle)` | maia · sera keep the card at `foreground/10` while the floating surfaces drop to `/5` (maia only in dark) |
| `--combobox-chip-fill` | `var(--chip)` | luma · rhea · sera fill the chip themselves |
| `--slider-track-fill` | `var(--muted)` | luma · sera |
| `--switch-track-border-off` · `-on` | `transparent` | sera draws the track's edge |
| `--field-label-checked-border` | `var(--border)` | a checked selection card outlines in `primary/30` (dark `/20`) — maia · nova · sera · lyra. ⚠ It is read inside `:has(> [data-slot="field"])` and **before** the focus rule, so the focus ring still wins |
| `--questionnaire-choice-fill` · `--questionnaire-shortcut-border` | `transparent` · `var(--input)` | nova's choice has a dark fill of its own; rhea gives the shortcut keycap its own edge |
| `--radio-indicator-dot-size` | `var(--control-indicator-dot-size)` | luma's dot is `size-2` in light and `size-2.5` in dark. **A size in layer 1**: layer 2 has no `.dark` scope, and a value that differs by mode has no other home |

### Candidates not adopted

| Candidate | Asked by | Why not |
|---|---|---|
| `--control-height-2xs` | rhea | A fifth height step below `xs` that **no foundation rule reads** — rhea uses it only for its own input-group buttons. Every slot must be read by a rule (§5); a system wanting a smaller grouped control sizes it in its own layer 3. |
| `--surface-radius-xl` | rhea | Same shape: a fourth surface step no foundation rule reads. foundation's surfaces use three. |
| `--ui-line-height-relaxed` | lyra | The split is real (rows `text-xs` against descriptions `text-xs/relaxed`), but adopting it means deciding, for ~20 rules that read `--ui-line-height-md` today, which of them are "descriptions". That judgement belongs to the port that wants the split, not to the contract. lyra keeps it as a system-only name. |
| `--input-fill-strong` | nova | Introduced and then removed: `--command-input-fill` is the only place nova used it, and two names for one fill is worse than one. |
| `--sidebar-rail-size` | sera | foundation's rail carries **no size declaration** — its width is an upstream utility in `sidebar.tsx`. There is no rule to read the slot. |
| `--button-outline-hover-fill` beyond the outline button | vega | Adopted as written (the outline button only); vega asked for nothing wider. |
| sera's `--tag-height` · `-padding-y` · `-gap` · `-border-width` · `-icon-size` · `-padding-x-icon` | sera | **Adopted under other names.** foundation's `--tag-*` axis is the *toned* badge (`[data-tone]`); the plain badge box is `--badge-*`. sera's names were the plain badge's, so they merged into the badge axis and `.cn-badge[data-tone]` now reads `--badge-height` too. |
| lyra's `--field-checked-border` | lyra | **Adopted as `--field-label-checked-border`** — the name maia · nova · sera all used for the same element. |
| luma's `--radio-indicator-dot-size` / rhea's `--radio-dot-size` | luma · rhea | **Adopted as `--radio-indicator-dot-size`**, matching the existing `--control-indicator-dot-size`. |

### `registry/ui` — checked, nothing to fix

The three ports that blamed the shared TSX (`sera` · `lyra` · `rhea`) were re-checked against the shadcn 4.21.0
generated sources (`~/projects/shadcn-ref/*/components/ui/*.tsx`):

- **Structure is identical.** Across all 62 components, the set of literal `data-*` attributes (the contract
  layer 3 selects on) is the same on both sides — no additions, no omissions.
- **`InputGroupButton`** already matches upstream exactly: `size` goes to `inputGroupButtonVariants` and
  `data-size`, never to `Button`. (`tooling/preset/README.md`'s pitfall list said the opposite; the list was
  stale and is corrected.) sera's `input-group/button#3` residue is sera's own layer 3, not drift.
- **The Switch thumb's `ring-0`** is upstream's own utility, kept deliberately. It composes an empty
  `box-shadow` in the *utilities* layer, so no layer-3 rule can put a shadow on the thumb — which is rhea's
  exclusion. Ours does not differ from the base component, so it is not drift and was not changed.
- The three items an earlier pass fixed (`cn-context-menu-sub-content`, `FieldDescription`'s
  `[[data-variant=legend]+&]:-mt-1.5`, `QuestionnaireActions`' `sm:min-h-9`) are all still in place.
