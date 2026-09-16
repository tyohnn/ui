# rhea — reference

This system ports the shadcn create preset `base-rhea` (shadcn 4.21.0, shadcn-ui/ui commit `7c9eaba1c0a6404c990c144a654792e3313c650d`,
tag `shadcn@4.21.0`). Nothing from the sources is copied into this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Rhea / Lucide / Inter` |
| `base` | `base` |
| `style` | `rhea` |
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

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-rhea.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs rhea` — `npx shadcn@4.21.0 init -t next -b base -p rhea -n rhea`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## Comparison

`node tooling/snapshot/compare-shadcn.mjs --system rhea --mode light` (and `--mode dark`). Exclusions live in
`compare-exclusions.json` with a reason each.

The app builds and type-checks clean: all 62 `registry/ui` components exist in shadcn 4.21.0, the copied
coverage and component-sheet templates type-check against the shadcn components (no API differences), and
`next build` succeeds without `typescript.ignoreBuildErrors`.

`data-tone` (Badge, AvatarFallback) and `data-shape` (Button) are **kept** on both sides. shadcn ignores
them; rhea's slots make a toned tag look exactly like the plain badge and a shaped button keep its size
radius, so the comparison checks that the attributes change nothing.

## Results (2026-09-16)

```sh
node tooling/snapshot/compare-shadcn.mjs --system rhea \
  --reference http://localhost:3112 --preview http://localhost:5183 --mode light|dark
```

Template `coverage`, viewport 1440×900, DPR 1: 57 sections, each opened alone so its popups render open,
2514 paired elements over 60 components (2 render no `data-slot` of their own).

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | `port.mjs` only (foundation/mira values, rhea colours and radius scale) | 10318 | — |
| 1 | layer 2 moved one step up: control heights · paddings · gaps · type · icon sizes · radii, 3px focus rings, the surface and menu axes, `--ui-text-*`, `--tag-radius` | 4022 | — |
| 2 | layer 1 fills (`--input-fill` 50%, `--checkbox-fill` and `--switch-track-off` 90%, `--button-outline-fill`, 30% overlay); new `--input-border`, `--control-height-2xs`, `--control-padding-x-{field,y-field}`; badge · kbd · skeleton · progress · field boxes | 3321 | — |
| 3 | the surface radius family split four ways (new `--surface-radius-xl`); card · alert · empty · item · accordion · chart · avatar boxes | 2568 | — |
| 4 | calendar `--cell-size`, sidebar radius scope, tabs bar height, select label and item, carousel · resizable · popover radii | 1795 | — |
| 5 | `--shadow-float` to shadow-lg and `--ring-subtle` to foreground/5; menu labels; card shadow; dialog · drawer · tooltip · input-group · sidebar values | 1614 | — |
| 6 | toggle · toggle-group · native select · breadcrumb · pagination · chart · empty · slider · switch · field · sidebar | 1220 | — |
| 7 | bubble · combobox · attachment · message · questionnaire · menubar · navigation-menu · radio · badge | 839 | — |
| 8 | `--border-subtle`, `--primary-soft` (a checked field row), input-group button, popover and close buttons, alert-dialog media | 713 | — |
| 9–13 | the per-component tail: attachment and sidebar type per size, combobox chips, menu label ordering, command · context-menu · navigation-menu · avatar · tabs · input-group details | 120 | — |
| 14 | the radius tail: toggle group, menubar trigger, alert-dialog media, command item in a dialog, the sidebar radius scope written out | 50 | — |
| 15 | exclusions written | **0** | 54 |
| 16 | dark: `--radio-dot-size` and `--combobox-chip-fill` (values rhea gives only in dark), `--sidebar-input-fill`, `--questionnaire-shortcut-border`, chart tooltip `bg-popover`, tabs trigger `border-transparent!` | 0 | 15 |
| 17 | dark exclusion written (Tailwind's `dark:` ordering) | **0** | **0** |

Final: **light 0 mismatches / 50 excluded · dark 0 / 65**.

`check-coverage.mjs --system rhea` passes in both modes: no console errors, no page errors, no empty
sections, every popup present.

## Exclusions

`compare-exclusions.json`, 50 rows in light and 65 in dark, one reason each. The first five are
foundation's, kept for the same reasons; the sixth is rhea's own.

| What | Why |
|---|---|
| disabled Checkbox · Radio opacity | Base UI draws them as a span, so shadcn's `disabled:opacity-50` never matches upstream |
| the whole `direction` section | the preset is generated with `rtl:false`, so its paddings and radii are physical |
| `input-otp` group gaps | a preset app's `globals.css` carries no `.cn-*` rules, so `.cn-input-otp { gap-2 }` never reaches the reference |
| menu shortcut widths | ⌘ is in neither Inter build and the two font stacks fall back differently (~0.5px) |
| questionnaire action row height | rhea's generated TSX carries `sm:min-h-8` where the shadcn base component (which `registry/ui` follows) carries `sm:min-h-9`; a utility, so no layer-3 rule can reach it |
| **switch thumb shadow** | rhea's own `switch.tsx` carries `shadow-sm` next to `ring-0` as utilities, so Tailwind composes both into one `box-shadow`. `registry/ui` keeps `ring-0` but holds no visual values, and `ring-0` alone composes an empty shadow in the **utilities** layer, which beats any layer-3 rule in `layer(base)`. The cause is the shared TSX; this run does not change `registry/ui`. |
| dark state colours on open triggers and the invalid checked checkbox | Tailwind sorts rhea's `dark:` colours after state utilities that have no dark counterpart, so upstream those states lose their colour in dark |

## Values the style file has but the app does not render

`style-rhea.css` styles `.cn-calendar-dropdown-root` and `.cn-calendar-caption-label`, which shadcn's
`calendar.tsx` never applies, so those rules do nothing upstream; the reference app is the answer key and
rhea follows it. Conversely `input-otp.tsx` and `sonner.tsx` keep `cn-*` names for which a preset app has
no rules at all (see the `input-otp` exclusion).

## Not measured

Nothing. The coverage template renders all 62 `registry/ui` components and the comparison pairs every one
that carries a `data-slot`; everything the comparison could not decide is an exclusion above, with a reason.

## Axis contract v4, stage 2 (2026-09-17)

`tooling/preset/slot-migration.md` § rhea: the layer-3 rules were taken back from foundation and rhea's
values moved into the v4 slots. 131 declaration sites read a v4 slot in foundation and were written
differently here (the 126 of the list plus the menu ring, the invalid checked checkbox edge and the
separator insets); 27 declarations foundation gained in v4 (label and title case, the field's bottom
edge, the command row's radius and gap, the disabled field fill, the checked field-card edge, the
active tab shadow …) were added at foundation's defaults.

**Values now in slots** — layer 2 (`tokens.css`, in the axis block each name belongs to):
`--control-padding-x-grouped` `var(--menu-item-padding-x)` · `--toggle-gap` `var(--control-gap-sm)` ·
`--kbd-height` `var(--control-height-2xs)` · `--switch-radius` `var(--control-radius)` ·
`--card-radius` `var(--surface-radius-lg)` · `--chart-tooltip-radius` `var(--surface-radius-sm)` ·
`--empty-radius` / `--bubble-radius` `var(--surface-radius-xl)` · `--bubble-padding-x` 12px ·
`--bubble-padding-y` 10px · `--bubble-line-height` 22.75px · `--menubar-padding` 3px ·
`--menu-label-padding-y` 4px · `--sidebar-item-padding-y` 8px · `--sidebar-input-height`
`var(--control-height-md)` · `--badge-height` `var(--control-height-2xs)` · `--badge-padding-x` 8px ·
`--badge-padding-x-icon` 6px · `--badge-radius` `var(--control-radius)` · `--tabs-list-height`
`var(--control-height-md)` · `--avatar-font-size` / `--avatar-line-height` the sm UI step.
Layer 1 (`globals.css`, both scopes): `--switch-track-border-on` `var(--primary)` ·
`--slider-track-fill` `var(--switch-track-off)` · `--radio-indicator-dot-size` 8px / 10px.
The other listed rows (accordion and badge borders, badge and kbd icon sizes, `--item-gap`,
`--sidebar-surface-padding`, `--kbd-min-width`) already equal foundation's default, so the backfilled
value stays.

**Rename:** `--radio-dot-size` → `--radio-indicator-dot-size` (readers: `radio-group.css`,
`questionnaire.css`). `--questionnaire-shortcut-border` was already the v4 name.
`--control-height-2xs` and `--surface-radius-xl` stay rhea's own.

**Rows not moved**, because one slot cannot hold two values or the rule is a different shape (DESIGN.md §5):

| Where | Why it stays a rule |
|---|---|
| `input-group.css` block-start/-end addon `padding-inline: 10px` | the inline addons and the grouped toggle are px-2 (8) and share `--control-padding-x-grouped`; the block addons are px-2.5 |
| `toggle-group.css` `.cn-toggle-group` `border-radius: 0` | rhea rounds the group only at `data-spacing=0` + `data-variant=outline` (a selector); that rule now reads `--toggle-group-joined-radius`, whose default keeps the joined items' corners |
| `select.css` default trigger `padding-inline: var(--control-padding-x-md)` | rhea's select trigger is px-3 while the inputs' field sub-axis (`--control-padding-x-field`) is px-2.5 |
| `card.css` `box-shadow` | reads `--card-ring`, plus rhea's `shadow-sm` — a declaration mira does not make |
| `switch.css` `border` | reads `--switch-track-border-off`, but the 2px width has no slot (and the padding is 0) |
| `sidebar.css` header/content scope | rhea re-declares the radius scope (`[--radius:var(--radius-xl)]`), so the scope now sets `--sidebar-part-radius: 19.6px` beside `--sidebar-item-radius` |
| `_menu-family.css` labels | foundation's rule is taken back; which label is text-xs or text-sm and which keeps py-1.5 is a selector, kept as two small rules after it |

**Layer-3 files:** 22 of 62 are now byte-identical to foundation (14 before). The other 40 still differ
by values v4 has no slot for (progress `h-2`, calendar `--cell-size`, breadcrumb · pagination · field ·
message · alert · drawer spacing, avatar group count, slider thumb, tabs vertical padding, command and
popup radii …) or by the rule shapes above.

**Check:** `compare-computed` dumps of the coverage template (every section opened alone) before and
after: **0 differences** in light and dark. `compare-shadcn` against the reference app: light **0
mismatches / 50 excluded**, dark **0 / 65** — unchanged. `scan-tokens` · `validate-system` pass.
