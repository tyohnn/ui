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
