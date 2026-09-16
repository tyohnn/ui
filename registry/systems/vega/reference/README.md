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
| 5 | `registry/ui` drift fixed (see below); `.cn-input-group-button-size-sm` dropped, since `style-vega.css` has no such selector and Button's own size now reaches the element | 0 | 0 |

Exclusions (`compare-exclusions.json`), 28 rows in light and 52 in dark, with one reason each:

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu shortcut widths | ⌘ is in neither Inter build and the two font stacks fall back differently (0.5px) |
| dark state colours on open triggers, the focused outline button, the invalid checked checkbox and the sidebar search box | Tailwind sorts the preset's `dark:` colours after state utilities that have no dark counterpart, so upstream those states lose their colour in dark |

Four exclusions of the 2026-09-16 run were `registry/ui` drift, not vega values, and are **gone** since that
pass fixed the components against shadcn 4.21.0: the `cn-context-menu-subcontent` typo, the missing
`[[data-variant=legend]+&]:-mt-1.5` on `FieldDescription`, the missing `sm:min-h-9` on `QuestionnaireActions`,
and `InputGroupButton` passing `size` to `Button`. Only the disabled Checkbox · Radio opacity row remains a
`registry/ui` difference, and that one is upstream's own (Base UI renders a span).

Not covered by the comparison: nothing. The coverage template renders all 62 `registry/ui` components and the
comparison pairs every one that carries a `data-slot`.

## Axis contract v4, stage 2 — layer-3 literals moved into slots (2026-09-17)

`tooling/preset/slot-migration.md` listed 43 declarations where vega wrote a value into a rule that foundation
now reads from a v4 slot. 42 moved: the rule is foundation's again and the value sits in layer 1 or 2.

| Slot | vega value | Layer |
|---|---|---|
| `--badge-height` · `--badge-radius` | `20px` · `var(--tag-radius)` | 2 |
| `--kbd-height` | `20px` (`--kbd-min-width` follows it) | 2 |
| `--bubble-radius` · `-padding-x` · `-padding-y` · `-line-height` | `var(--surface-radius-lg)` · `12px` · `8px` · `1.625` | 2 |
| `--card-radius` · `--empty-radius` · `--sheet-padding` | `var(--surface-radius-lg)` · `var(--surface-radius)` · `var(--surface-padding-md)` | 2 |
| `--control-padding-x-grouped` · `--control-padding-y-field` | `8px` · `4px` | 2 |
| `--menubar-gap` · `--slider-track-thickness` · `--sidebar-input-height` | `4px` · `6px` · `var(--control-height-sm)` | 2 |
| `--tabs-list-height` · `--tabs-trigger-padding-x` · `-padding-y` · `--tabs-trigger-active-shadow` | `var(--control-height-md)` · `8px` · `4px` · `var(--shadow-chip)` | 2 |
| `--combobox-chip-fill` · `--command-input-fill` | `var(--muted)` · `color-mix(in oklab, var(--input) 30%, transparent)`, both modes | 1 |

Rows whose value already equalled foundation's default (the menu label's 6px, the accordion item's border, the
avatar's 14/20 initials, the badge border and icon, the keycap's min width) took foundation's rule with no token.

**Not moved (1):** `.cn-select-trigger[data-size="default"]` `padding-inline: var(--control-padding-x-md) 8px`.
The table offered `--control-padding-x-field`, but that slot is also read by `.cn-input` and as the longhand
`padding-inline-start` of `.cn-native-select`; a two-value shorthand there would give the input an 8px end and
make the native select's declaration invalid. The trigger keeps its literal (its type now reads the field
sub-axis). A `--select-trigger-padding-end` slot would express it.

Beyond the table (vega was ported before foundation was corrected to mira, so its layer 3 carried more forks):

- Every other v4 slot foundation reads is now read by vega too — `scan-tokens vega` reports no v4 name as dead
  (98 were before). The ones with a vega value: `--field-label-checked-border`
  (`primary/30`, dark `/20`, replacing a `.dark &` nest in `field.css`), `--questionnaire-choice-fill`
  (`transparent`, dark `input/20`, same), and the v3 `--sidebar-input-fill` set to `var(--background)` (it was
  still mira's value and unread). `--button-outline-hover-fill`'s comment no longer calls it vega-only.
- Title and label bands (`--title-*`, `--ui-label-*`), switch, textarea, item, the menu ring and separator,
  the sidebar parts, the sm control radius, the joined toggle-group radius and the disabled field fill all read
  their slots; the dropdown and menubar sub-menus read `--menu-ring` · `--menu-sub-shadow` instead of the literal.
- Comment-only forks were dropped.

Layer 3 against foundation: **12 of 62 files byte-identical** (was 6: `_shared` · `kbd` · `label` · `radio-group` ·
`separator` · `sonner` joined), differing lines 1552 → 933. The 50 that still differ carry declarations no slot
expresses — vega's `shadow-xs` on outline controls composed into the focus ring through `--control-shadow`,
its own sizes and gaps (dialog close offset, hover-card width, empty and item boxes, field and questionnaire
gaps, calendar cell, progress, pagination, navigation menu), text-sm where mira is text-xs, the accordion
without a frame, the context-menu indicator box, selectors vega narrows or widens (sub-trigger highlight,
checkbox-item end padding on the combobox) — the DESIGN.md §5 shapes.

Check: a keyed dump of every coverage section in both modes before and after — **0 computed-value
differences**; `compare-shadcn.mjs` light 0 mismatches · 28 excluded, dark 0 · 52 excluded (unchanged).