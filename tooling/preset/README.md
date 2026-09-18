# Porting a shadcn create preset

This procedure turns one shadcn create preset (`nova` · `vega` · `maia` · `lyra` · `mira` · `luma` · `sera` ·
`rhea`) into a tyohnn design system, `registry/systems/<preset>`, and proves it against the real shadcn
output. It was first run for **vega** on 2026-09-15 (`registry/systems/vega/reference/README.md` has that
run's record). Every command takes the preset name; nothing else changes between presets.

The pinned shadcn version is `SHADCN_VERSION` in `shared.mjs` (4.21.0). Bump it for all presets together.

## Tools

| File | Does |
|---|---|
| `make-reference.mjs <preset>` | the reference Next app (the answer key): `shadcn init` with the preset on Base UI, `shadcn add` of every `registry/ui` component, the component sheet **and the coverage template** copied in, type-check |
| `port.mjs <preset>` | `new-system` from foundation plus everything mechanical: `system.json` fonts · icons · source, layer-1 shadcn colours and radius scale from the reference app, `reference/` |
| `style-diff.mjs <from> <to>` | utility-level difference of two `style-<name>.css` files, per `cn-*` selector |
| `specimen-text.json` | the component sheet's Korean strings in English (see Text) |
| `slot-migration.md` | stage 2 of the v4 slot cleanup: per system, which layer-3 rule's value moves into which slot |
| `../snapshot/compare-shadcn.mjs --system <preset>` | computed-style comparison of the tyohnn preview against the reference app (default template `coverage`) |
| `../snapshot/check-coverage.mjs --system <name>` | render check only: does a system draw the coverage template without console errors, page errors or empty sections |
| `make-reference.mjs <preset> --variant <baseColor>-<accent>` | the same preset with another colour pair, e.g. `--variant stone-blue`, in `<workdir>/<preset>--<variant>`: the answer key for a tyohnn theme worn on that system |
| `../snapshot/compare-shadcn.mjs --system <preset> --theme <base>+<accent>` | the same comparison with the preview wearing that theme (`?theme=stone+blue`) |
| `make-reference.mjs <preset> --blocks sidebar-01,… \| all` | installs shadcn's sidebar blocks into the reference app, one route (`/blocks/sidebar-NN`) and component folder each |
| `port-block.mjs sidebar-NN` | the mechanical port of one block's sources (imports, IconPlaceholder → `@tyohnn/icons`) for a block template |
| `blocks.md` | how the sixteen block templates are ported, filled, compared and render-checked |
| `../snapshot/compare-blocks.mjs --system <name> --block sidebar-NN --template <id>` | a block template's sidebar and header against the shadcn block |
| `../snapshot/check-templates.mjs` | render check of every catalog template × system × mode |

Downloads and generated apps live in a work directory outside the repository: `--workdir <dir>`, else
`TYOHNN_PRESET_WORKDIR`, else `<os tmpdir>/tyohnn-preset`. Use the same one for every step.

```sh
export TYOHNN_PRESET_WORKDIR=/path/to/scratch/shadcn-ref
PRESET=sera
```

## 1. Reference app

```sh
node tooling/preset/make-reference.mjs $PRESET
(cd $TYOHNN_PRESET_WORKDIR/$PRESET && npm run dev -- -p 3100)   # keep running (second terminal)
```

The script:

1. sparse-checks out `shadcn-ui/ui` at tag `shadcn@<version>` (`apps/v4/registry/*.ts` and `styles/`) into
   `<workdir>/ui-<version>`;
2. runs `npx shadcn@<version> init -t next -b base -p <preset> -n <preset> --no-monorepo -y` (a Next app with
   the preset's style, base colour, theme, icon library, fonts through `next/font`, radius);
3. runs `npx shadcn@<version> add <every registry/ui component> --overwrite -y`;
4. copies `apps/preview/src/templates/component-sheet` and `.../coverage` to `components/<template>` with
   `@tyohnn/components/*` → `@/components/ui/*`, `@tyohnn/icons` → a copy of `registry/ui/icons` for the
   preset's icon library, Korean → English, comments removed, `"use client"` added; `app/page.tsx` reads the
   same query the preview does and renders the Specimen or `?template=coverage[&section=<name>]`;
5. type-checks the app and prints any error: an error is an API difference between `registry/ui` and the
   shadcn component. Record it in the system's `reference/README.md` and exclude that part (step 4);
6. writes `<app>/tyohnn-reference.json` (config, version, commit, command, missing components, type errors).

`data-tone` and `data-shape` stay in the copy. shadcn ignores them, and the comparison then checks that the
system's slots make them change nothing (a preset has no tones or shapes) — or record their removal.

## 2. Rules (the sources)

Read, do not paste: the sources are third-party. Take values with `style-diff.mjs` and grep.

- **Style rules** — `apps/v4/registry/styles/style-<style>.css`. foundation is mira, so the port is the
  difference: `node tooling/preset/style-diff.mjs mira $PRESET` (add `--only .cn-button,.cn-card` to narrow).
  To see a whole rule of either style, grep the file in `<workdir>/ui-<version>`.
- **Colours** — the reference app's `app/globals.css` is the generated answer (base colour + theme + chart
  colours + radius); `base-colors.ts` / `themes.ts` are the source.
- **Baked components** — `<app>/components/ui/*.tsx` hold the utilities as the CLI wrote them, including
  what the style file leaves to the component (layout, sizes the style does not override).
- `port.mjs` writes the source URLs pinned to the commit into `reference/README.md`.

## 3. System

```sh
node tooling/preset/port.mjs $PRESET
node tooling/build-system $PRESET
```

`port.mjs` does, and may be re-run (it only rewrites what it owns):

- `node tooling/new-system <preset> --from foundation` when the folder does not exist;
- `system.json`: `fonts` (`font` · `fontHeading` as catalog ids, mono `system`, `hangulFallback` `pretendard`),
  `icons.library`, `tags` + `shadcn-preset`, `source { kind: "shadcn-preset", preset, shadcnVersion, commit }`,
  a placeholder description;
- layer 1 in place: the three font stacks, every shadcn standard colour of the reference `globals.css` in
  `:root` and `.dark`, the `@theme inline` radius scale; it prints the non-standard tokens that hold literal
  colours — those are derived from the style's alpha utilities and must be reviewed by hand;
- `reference/README.md`, `reference/preset.json`, an empty `reference/compare-exclusions.json`.

A preset font missing from `registry/fonts` stops the script: add `registry/fonts/<id>.json` first.

Then by hand (or by an agent), in this order:

1. **Layer 1 derived colours** — the tokens `port.mjs` listed (`--primary-hover`, `--input-fill`,
   `--ring-focus`, `--border-subtle`, `--overlay-backdrop`, `--sidebar-group-label-foreground`, tag and
   avatar tones …): recompute each from the preset's utilities and base colour, in `:root` and `.dark`.
2. **Layer 2 values** — the axes the diff moves as a whole: control heights · paddings · gaps · font sizes ·
   icon sizes · radii, `--focus-ring-width`, `--ui-text-*`, `--menu-*`, `--sidebar-*`, `--table-*`,
   `--tabs-line-*`, `--shadow-*`, `--avatar-*`, `--switch-*`, letter-spacing.
3. **Layer 3 rules** — only where no value gets there. **Since axis contract 4 this step should be nearly
   empty.** Work it in this order, and do not skip to the last one:

   1. **Look for the slot.** v4 added 85 layer-2 and 16 layer-1 names (v5 split ten of them into 15 more), and the areas the last nine ports
      kept editing by hand are now values: the badge box (`--badge-*`), the keycap box (`--kbd-*`), the
      menu separator's margins, the field sub-axis (`--control-*-field`), the control's `sm` radius, case
      and grouped padding, the label · title · menu-row · menu-label · table-head type bands, the default
      tabs bar, the per-component radii (card · bubble · chart tooltip · empty · command row · sidebar
      parts · joined toggle group), the sidebar shell's padding and gap, and in layer 1 the input edge, the
      disabled and palette fills, the card and menu rings, the chip · slider · switch-track · checked-field
      colours, and the invalid + checked Checkbox edge. `grep -n '<the-property>' registry/foundation/styles/components/<component>.css`
      shows what the rule actually reads; `registry/foundation/reference/README.md` §"Axis contract v4"
      is the index.
   2. **Decide whether it is a value at all.** DESIGN.md §5 "What a value changes, and what needs a rule"
      lists the only four shapes that genuinely need a rule: a declaration foundation never makes, a
      different selector, a box that must disappear, and a locally re-declared variable. If your difference
      is not one of those four, it is a missing slot, not a rule.
   2a. **The slot exists but its readers need different values?** When one slot is read by several elements
      and this system gives them different values, do not keep a rule and do not bend the value: treat it as a
      **split candidate** — record it under "Foundation slot candidates" as the new name (aliasing the old
      slot as its foundation default) and which readers take it. Axis contract v5 was ten such splits.
   3. **No slot, and it is a value?** Add a **system-only** token in this system's layer 1 or 2 with the
      v4 name shape (`--<component-or-axis>-<part>-<property>`), read it from layer 3, and **record it under
      "Foundation slot candidates"** in `reference/README.md` with three columns: the name, the foundation
      default that would reproduce mira (an alias · `initial` · `transparent` · `0px` · `none`), and why
      this system needs it. `scan-tokens` warns about the system-only name; that warning is the paper
      trail. Do not change foundation during a port.
   4. **Only then edit the rule**, and mark each changed declaration with a `<preset>: <utility>` comment
      saying which upstream utility it reproduces. List every such rule in `reference/README.md`.

   When light and dark need different values and no slot exists, the system-only token goes in **layer 1**,
   declared in both `:root` and `.dark` — never split `.dark` in layer 3.
4. `DESIGN.md` from the template: character, key values, combination rules, do-nots. `system.json`
   description in mood terms, tags.

## 4. Compare

```sh
node tooling/build-system $PRESET
(cd apps/preview && SYSTEM=$PRESET node scripts/vite-system.mjs --port 5190 --strictPort)   # keep running (third terminal)
node tooling/snapshot/compare-shadcn.mjs --system $PRESET --preview http://localhost:5190 --mode light
node tooling/snapshot/compare-shadcn.mjs --system $PRESET --preview http://localhost:5190 --mode dark
```

The default template is **coverage**: `apps/preview/src/templates/coverage` renders every `registry/ui`
component, section by section, at a fixed width with fixed dates and no randomness. Each section declares
`data-coverage-section`, `data-coverage-components` and `data-coverage-portals`; the comparison reads that list
from the reference app, then opens each section **alone** (`&section=<name>`) on both pages, which renders that
section's popups open (`defaultOpen`), and measures the section element together with the popups it declares.
Keys are reported as `<section>/<key>`, so a difference in one section never shifts another. A portal selector
may end in `^<n>` to measure the n-th ancestor of the match (a popup surface that carries no `data-slot`).
`--sections a,b` narrows a run while iterating; `--template component-sheet` runs the older Specimen comparison
(the Specimen's second select, its dropdown menu and its dialog, `--states closed` to skip them).

- Both pages: 1440×900, DPR 1, reduced motion, the same colour scheme and `dark` class on `<html>`.
- Pairs by `data-slot` and order (an element without a slot is keyed under its nearest slotted ancestor),
  so a DOM difference inside one component shifts only that component.
- Compares the properties of `tooling/snapshot/props.mjs` plus box height; `<svg>` by box only.
- Normalises what paints the same: colours as rendered 8-bit pixels, Tailwind's empty ring/shadow layers,
  zero-width border sides, pill radii (`rounded-full` vs 9999px).
- Prints pairs, a **per-component coverage table** (slots compared · mismatches, or `no slots` for a component
  that renders no `data-slot` of its own), mismatches grouped by component and property, exclusions with
  reasons, and a screenshot of both sides of every section that differs, into
  `tooling/snapshot/out/shadcn-<preset>-<template>-<mode>/` (gitignored).
- **A new component belongs in the coverage template first.** `registry/ui/components/*` and the components the
  sections declare must be the same 62 names; nothing else keeps the comparison honest.
- Exits 0 when only exclusions remain. Exclusions go in `registry/systems/<preset>/reference/compare-exclusions.json`:
  `[{ "key": "<regex>", "props": [...] | "*", "reason": "…" }]` — one reason each, never a system value.

## 5. Iterate

Fix → `build-system` → compare, until 0 or only explained exclusions. Record each iteration's count in
`reference/README.md`. Then:

```sh
npx turbo typecheck
node tooling/scan-tokens
node tooling/validate-system
```

The coverage template renders every component, so nothing needs to be ported by reading alone. Record what the
comparison could not decide as an exclusion with its reason, not as "not covered".

Read the reference app's `components/ui/*.tsx`, not only `style-<style>.css`: the style file is a **separate
distribution** and the two disagree in both directions. shadcn's `calendar.tsx` never applies
`.cn-calendar-dropdown-root` or `.cn-calendar-caption-label`, so those rules do nothing upstream; conversely
`input-otp.tsx` keeps `cn-*` names for which a preset app has no rules at all. The rendered app
is the answer key; when the style file says more than the app renders, say so in `reference/README.md`.

Also check the two systems the comparison never touches:

```sh
node tooling/snapshot/check-coverage.mjs --system graphite --preview http://localhost:5190
node tooling/snapshot/check-coverage.mjs --system foundation --preview http://localhost:5190 --mode dark
```

That is a render check, not a value comparison: console errors, page errors, empty sections, missing popups.
Restart the preview with `SYSTEM=<name>` for each one — the preview warns when the query asks for a system
other than the one it was started for, because fonts and icons are chosen at start.

## Text

Korean in the sheet falls back to Pretendard on tyohnn and to a system font in the Next app, so text metrics
would differ for no system reason. `specimen-text.json` maps every Korean string to English:
`make-reference.mjs` writes the reference copy with it, `compare-shadcn.mjs` swaps the same strings on the
tyohnn page before measuring. The tyohnn Specimen itself stays Korean. Both scripts fail on leftover
Hangul — add the new string to the map.

## Pitfalls (from the vega run)

- **Preset flag.** `-p base-vega` is rejected; the preset is `-p vega` and the base is `-b base`.
- **Passing the component list** through a zsh variable sends one argument (`add "accordion alert …"`); the
  script passes an array.
- **Ports.** Another local app may hold 3000 and another session may hold the preview's 5173: run the reference on 3100
  and the preview with `--port`, and pass `--preview` to the comparison.
- **foundation is mira now (2026-09-16).** It used to carry its own deviations — letter-spacing `-0.01em`
  from the Pretendard era, rounded line heights, `min-height` control sizes, the legacy coloured chart ramp,
  a drop shadow under dialogs, menu items without vertical padding, an inherited avatar fallback type, an
  opaque sidebar group label — and "the diff from mira" carried them into every new system. All of them were
  corrected against the mira reference app; `registry/foundation/reference/README.md` has the table.
  A port that starts from foundation today starts from verified mira values, so the diff you apply really is
  the preset's diff. Two consequences: **re-read that table before trusting an older port's notes**, and when
  foundation needed a value a preset does not share, it is now a **slot** (axis contract 3), so tune the slot
  rather than editing the layer-3 rule.
- **Shared tokens move several components.** `--control-height-xs` also sizes badges and kbd,
  `--menu-item-radius` also rounds `Item`, `--surface-radius` is read by a dozen rules, `--ui-text-md` by most
  text. After changing a token, `grep -rl "var(--<token>" registry/systems/$PRESET/styles/components` and
  check each reader against the preset.
- **min-height vs height.** shadcn's `h-9 py-2` select trigger is a fixed height with padding inside;
  tyohnn's `min-height` grows to 38px.
- **Tailwind serialisation.** `border-0` keeps `border-style: solid`; `rounded-full` is `calc(infinity * 1px)`;
  ring and shadow utilities compose into a five-layer `box-shadow`. The comparison normalises these; a
  hand-written rule does not need to imitate them.
- **Fractional values** such as vega's 18.4px switch track are the preset's; scan-tokens' fractional-px
  warning is expected.
- **TSX drift is not a system value.** `registry/ui` follows the shadcn 4.21.0 base sources (synced 2026-09-15)
  except where a visual utility would beat a layer-3 rule: no `text-sm`/`text-xs` on `AvatarFallback`, no
  `text-xs` on `ChartContainer`, `cn-separator` instead of `bg-border h-px …` on `Separator`, `cn-calendar-weekday` ·
  `cn-calendar-week-number` instead of `text-[0.8rem]`, and no `[&_svg]:size-4` on `SidebarMenuButton`.
  A preset reproduces those values in its layer 3. Any other difference from the shadcn component is drift:
  exclude it with the reason and fix it in `registry/ui`.
  - `InputGroupButton` is **not** one of them (this list said the opposite until 2026-09-16, and the code
    never did): it matches upstream exactly — `size` goes to `inputGroupButtonVariants` and `data-size`,
    never to `Button`, and upstream's `sm` variant is the empty string, so a `size="sm"` button takes
    `Button`'s own default size plus `text-sm`. A system reproduces that in `.cn-input-group-button-size-sm`.
  - The Switch thumb's `ring-0` is upstream's own too. It composes an empty `box-shadow` in the
    **utilities** layer, so no layer-3 rule can put a shadow on the thumb — a preset whose own `switch.tsx`
    adds `shadow-sm` (rhea) excludes it with that reason. Matching upstream is not drift, so it is not fixed.
  - How to check quickly: the contract layer 3 selects on is the set of literal `data-*` attributes. Compare
    that set across all 62 components against a generated app's `components/ui/*.tsx` — equal sets mean no
    structural drift, and what remains is class-string drift you read per component (2026-09-16: equal).
- **Regression baselines.** A second checkout of main with a symlinked `node_modules` serves no fonts (Vite
  `server.fs.allow` stops at the checkout), so its text widths differ. Dump the same checkout before and after
  (`compare-computed.mjs --dump` / `--diff`), compare `dist/systems/<name>/compiled.css` hashes, or install that
  checkout's own dependencies.

## Remaining presets

Selectors that differ from mira (`style-diff.mjs mira <preset>`, of 422) give the size of each port; vega was 250.

| Preset | Diff | style · base colour | icons | fonts | Watch for |
|---|---|---|---|---|---|
| nova | 247 | nova · neutral | lucide | geist | h-8 controls; inputs `rounded-lg` while buttons stay `rounded-md` (split the control radius); disabled inputs get a fill |
| maia | 249 | maia · neutral | hugeicons | figtree | h-9 with px-3; cards `rounded-2xl`; hugeicons compare by box only |
| lyra | 245 | lyra · neutral | phosphor | jetbrains-mono (sans) | `rounded-none` nearly everywhere, text-xs controls, 1px focus rings; a monospace **sans**: the sans stack takes the mono platform fallbacks and every text width changes |
| mira | — | mira · neutral | hugeicons | inter | **done** (2026-09-16). `registry/systems/mira` is `new-system mira --from foundation` and nothing else; the porting work is foundation's correction, in `registry/foundation/reference/README.md` |
| luma | 274 | luma · neutral | lucide | inter | h-9 px-3; cards `rounded-4xl` with shadow-md and a `foreground/5` ring (10% in dark) |
| rhea | 272 | rhea · neutral | lucide | inter | h-8 px-3; cards `min(radius-4xl, 24px)` with shadow-sm and `--spacing(5)` |
| sera | 293 | sera · **taupe** | lucide | noto-sans + **playfair-display** heading | the largest diff; every derived layer-1 literal is neutral grey and must be recomputed from taupe; `fonts.heading` is a catalog id, so `--font-heading` gets its own stack and `cn-font-heading` titles change metrics |

## Cross-check: a theme on a system

A tyohnn theme is meant to go on any system, and the way to know it does is the same answer key: build the
shadcn app for the two colour axes the theme carries and compare.

```sh
node tooling/preset/make-reference.mjs vega --variant stone-blue --workdir ~/projects/shadcn-ref
(cd ~/projects/shadcn-ref/vega--stone-blue && npm run dev -- -p 3100)
node apps/site/scripts/build-previews.mjs                  # the previews carry ?theme=
(cd apps/site && node scripts/serve.mjs --port 5292 --dir public)
node tooling/snapshot/compare-shadcn.mjs --system vega --theme stone+blue --mode light \
    --preview http://localhost:5292/preview/vega
```

⚠ Check what the comparison is actually looking at. Two runs were lost to this: a shared `apps/preview` dev
server carries **one system's fonts**, so every non-Inter system reported dozens of width mismatches; and a
stale static server on the port was serving an old `out/`, so fixes looked like they had no effect. Serve the
per-system builds, and curl the file you think you are comparing.

### What it found (2026-09-18)

Two colours followed the wrong source. Both were invisible under the shipped palettes, where the two sources
happen to be equal, and both appeared the moment a theme split them:

- `--skeleton` in vega named `--secondary`; shadcn's Skeleton is `bg-muted`. vega's declaration is gone and
  the rule's fallback (`var(--skeleton, var(--muted))`) says it.
- `--switch-thumb-on` was one alias (`var(--card)`) for both modes, where upstream is `bg-background` in
  light and `dark:data-checked:bg-primary-foreground` in dark. It is declared per mode now.

This is the general hazard of inferring a formula from a value: where two palette colours are equal, the
source is a coin toss. `tooling/theme/classify.mjs` picks by affinity, and a contrasting theme is what
proves the pick.

### A difference that is not ours

`mauve` + `rose`, dark `--sidebar`: the reference app is generated by the **live** ui.shadcn.com service,
which returns `oklch(0.21 0.006 285.885)` (zinc), while `apps/v4/registry/themes.ts` at the pinned tag
4.21.0 — what `tooling/theme/import-shadcn.mjs` reads — says `oklch(0.212 0.019 322.12)` (mauve). Upstream
moved after the tag. We port the tag, so our value stands; the two sidebar rows in that run are expected.
