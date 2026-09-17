# tyohnn design system contract

This file is the contract every component, design system and tool in the repository follows.

## 1. Hooks: shadcn + Base UI + three CSS layers

tyohnn's **foundation** is the combination of three things, as first established in an earlier product:

1. **shadcn components** — the upstream anatomy and `cn-*` class contract;
2. **Base UI primitives** underneath them (behaviour, accessibility, state attributes);
3. **the three-layer CSS architecture** tyohnn adds on top.

Each component element carries a stable hook class named `cn-*` (`cn-button`,
`cn-button-variant-outline`, `cn-sidebar-menu-badge`, …), the same class contract as upstream shadcn,
so new upstream components port over with little work.

- TSX holds **no visual values**: no colours, sizes, radii or shadows chosen by the component.
  Layout utilities that upstream bakes in stay, and each exception is explained where it lives.
- Everything visible is decided by CSS in three layers.
- Placeholder aliases `@tyohnn/components/*`, `@tyohnn/lib/*`, `@tyohnn/hooks/*` and `@tyohnn/icons` are used for
  internal imports. They are path aliases (tsconfig `paths`, Vite `resolve.alias`), not packages; no workspace is
  named `@tyohnn/components`, `@tyohnn/lib`, `@tyohnn/hooks` or `@tyohnn/icons`. The CLI replaces this alias with
  the consumer's alias.
- Icons come only from `@tyohnn/icons` by semantic name (section 10), never from an icon package.
- Variants that are not props are data attributes forwarded by the component (`data-tone`,
  `data-shape`). They only mean something when a layer-3 rule reads them.

The three layers:

| Layer | Foundation file | Holds | Example |
|---|---|---|---|
| 1 — colours | `styles/globals.css` | semantic colours in `:root` and `.dark`, Tailwind `@theme` mapping, radius foundation, static shadows | `--primary`, `--border-subtle`, `--selection`, `--clay-contact` |
| 2 — tokens | `styles/tokens.css` | density, shape, type, motion and composed shadows in `:root` | `--control-height-md`, `--table-row-height`, `--shadow-control` |
| 3 — rules | `styles/style.css` → `styles/components/*.css` | `cn-*` rules that assemble layer 1/2 values | `.cn-badge[data-tone] { border-radius: var(--tag-radius) }` |

Layer 3 is imported into `layer(base)` (Tailwind's cascade layer) so utilities passed through
`className` still win. Shared rules (`_control-family`, `_menu-family`, `_surface-family`, `_shared`)
load first. Long-form typesetting (`typeset.css` vendor rules + `typeset-preset.css` values) is a
separate axis.

## 2. One set of TSX

`registry/ui` (`@tyohnn/ui`) holds the only copy of `components/`, `hooks/`, `lib/` and `icons/`. Every design
system renders these same files; systems differ only in CSS. `registry/ui/manifest.json` lists the
npm dependencies and files.

## 3. Design systems are snapshots

A design system is a complete folder, frozen once created. Nothing is composed at build or run time.

```
registry/systems/<name>/
  system.json                 name · description · forkedFrom { source, commit } · fonts · icons · defaultMode · tags · source
                              (schema: registry/schema/system.schema.json)
  styles/globals.css          layer 1, complete (:root and .dark)
  styles/tokens.css           layer 2, complete
  styles/typeset.css          long-form typesetting rules
  styles/typeset-preset.css   long-form typesetting values
  styles/style.css            layer-3 barrel
  styles/components/*.css     layer 3, one file per component (plus the shared family files)
  DESIGN.md                   character · key values · combination rules · do-nots
  reference/                  source material
```

The CLI (`packages/cli`, npm `tyohnn`) copies one system folder plus `registry/ui` into a project as they are.

**Why snapshots (2026-09-15).** The first model composed a system at build time: foundation files plus
per-theme override files (`colors.css`, `tokens.css`, replaced layer-3 files). A consumer then received
something assembled from several places, and a foundation change silently changed every theme. A
snapshot is exactly what was reviewed; changes reach a system only when someone copies them in
(see backfill, section 6).

## 4. foundation is the maintainer master copy

`registry/foundation` is shadcn + Base UI + the three layers with the shadcn mira preset values. It holds
only `styles/`, `DESIGN.template.md`, `foundation.json` (file list, `axisContractVersion`, `fonts`, `icons`)
and `reference/` (the mira reference app it was proved against, and the exclusions of that comparison).

Its values are **verified**, not merely intended: `registry/foundation/reference/README.md` records the
comparison against a real `shadcn init -p mira` app (light 0 mismatches, dark 0, exclusions with reasons).
`registry/systems/mira` is the same snapshot published for users, since the CLI does not list foundation;
the two `styles/` folders must stay identical.

- It is for maintainers and the theme-from-image skill; the CLI does not list it.
- It owns the token vocabulary: every name a system must define (section 5).
- New components get their layer-3 stylesheet and token defaults here first.
- It can be built and previewed like a system: `?system=foundation`.

## 5. Forking a system

```sh
node tooling/new-system <name> --from foundation      # or --from <existing system>
```

Systems are named for their design and mood, not their use case (`graphite`, not `crm-dashboard`). The
shadcn create presets keep their own names (`vega` …) and are forked by `node tooling/preset/port.mjs <preset>`,
which runs `new-system` and fills the mechanical parts; `tooling/preset/README.md` is the whole procedure,
including the comparison against a real shadcn app.

This copies the source's `styles/`, writes `DESIGN.md` from `registry/foundation/DESIGN.template.md` and
`system.json` with `forkedFrom` (source and current commit) and the source's `fonts` and `icons`. Then:

1. Tune values **in place** in `styles/globals.css` (both `:root` and `.dark`) and `styles/tokens.css`.
   Do not append override blocks; the file should read as this system's own values.
2. Prefer tuning a slot (below) over editing a layer-3 rule. Edit a rule only for a structural change no
   slot expresses, and consider adding a slot to foundation instead.
3. Fill `system.json` (description, tags, `source` with the origin of the material) and `DESIGN.md`.
   Keep source material in `reference/`. Do not ship another company's name, logo or unique assets.
   A system ported from a shadcn preset records `source { kind: "shadcn-preset", preset, shadcnVersion, commit }`.
4. `node tooling/build-system <name>`, `node tooling/scan-tokens <name>`, `node tooling/validate-system <name>`,
   and check the preview: `SYSTEM=<name> npm run dev -w @tyohnn/preview`, then
   `http://localhost:5173/?system=<name>&mode=dark`.

### Token slots (axis contract version 5)

The names defined in foundation `styles/globals.css` (layer 1) and `styles/tokens.css` (layer 2) are the
whole vocabulary; every system defines all of them. A **slot** is a name a layer-3 rule reads where a
system may want a different look, so a system tunes the value instead of editing the rule.

- Name: `--<component-or-axis>-<part>-<property>` (`--sidebar-group-label-font-size`,
  `--button-outline-border`, `--tabs-line-trigger-radius`, `--badge-padding-x-icon`). The first segment is
  a component when the slot belongs to one and the shared axis when several read it
  (`--control-*`, `--menu-*`, `--surface-*`, `--ui-*`).
- Colours go in layer 1, declared in both `:root` and `.dark`; dimensions, shape and motion go in layer 2.
  The one exception is a **non-colour value that differs by mode**: layer 2 has no `.dark` scope, so it
  lives in layer 1 with a comment saying why (`--radio-indicator-dot-size`, `size-2` in light and
  `size-2.5` in dark for luma).
- The foundation value reproduces mira exactly: an alias of the variable mira reads, `transparent`,
  `0px`, `none`, or `initial`. `initial` means "no value": the declaration becomes invalid at
  computed-value time, so an inherited property (colour, font-weight, font-size, line-height,
  text-transform) keeps inheriting as it does in mira. Do not use `initial` for non-inherited properties.
- A declaration only some systems need is still written in the foundation rule, reading a slot whose
  foundation value changes nothing (for example a border always drawn with
  `--sidebar-item-border-width: 0px`).
- Every slot must be read by a rule.
- **One slot, one meaning.** When several elements read one slot and a system needs different values
  for them, the slot is two slots: split it, alias the new name to the old one, and let each reader take
  its own.

#### What a value changes, and what needs a rule

The line between the two is what the contract is for. Use it before reaching for a layer-3 edit.

**A value gets there** when the difference is a *number, colour, corner, case, weight or shadow on an
element that already has that declaration*. Every such difference is a slot, or should become one. Nine
ports' worth of evidence says this covers almost everything: the badge's box, the keycap's box, a
separator's bleed, a surface's corner, the case of a label band, the fill of a disabled field.

**A rule has to change** in four shapes, and only these:

1. **A declaration the preset adds that foundation never makes** — a border on a side foundation leaves
   bare, a `shadow` on an element foundation draws flat. (Prefer to add the declaration to foundation
   reading a slot whose default is `transparent` · `none` · `0px`, so the next system only sets a value.)
2. **A different selector** — maia rounds a toggle group only at `data-spacing="0"` where mira rounds it
   at every spacing; sera's drawer borders one side per `data-swipe-direction`. No value expresses *which
   elements* a rule reaches.
3. **A box that must disappear** — lyra's and sera's context-menu indicator, where mira's
   `display: flex` blockifies an inline child. Removing a box is not sizing it.
4. **A locally re-declared variable** — maia scopes `[--radius:var(--radius-xl)]` to the sidebar header,
   which a `:root` `calc()` has already resolved past.

Anything else that made you edit a rule is a **missing slot**. Record it under "Foundation slot candidates"
in the system's `reference/README.md` (name · what foundation's default would be · why this system needs
it), and it is considered for the next contract version.

Version 1 was the mira token set plus slots for selection, clay materials, tag and avatar tones, control
shadows and surfaces, and the sidebar, table, tag and line-tab axes. Version 2 added the slots in the last
table below, so the graphite look needs no layer-3 rule edits. Version 3 added the slots the **mira
reference-app correction** needed (`registry/foundation/reference/README.md`), all of them places where the
foundation rule had baked in a value a system may legitimately want elsewhere.

**Version 4 (2026-09-16)** collected the slot candidates of all nine systems and adopted the repeated ones:
**85 layer-2 names and 16 layer-1 names**. `registry/foundation/reference/README.md` has the full table
(name · default · why · which system asked) and a reason for every candidate that was *not* adopted.
A candidate is adopted when two or more systems asked for it, or when one asked and the name completes an
axis foundation already has; a value only one system wants, where no axis is missing, stays that system's
own. Two structural faults were fixed:

- **`--control-height-xs` was three things** (xs button · badge · keycap), so growing the control grew the
  other two. The badge (`--badge-*`, 13 names) and the keycap (`--kbd-*`, 9 names) now have their own axes,
  defaulting to the xs control step.
- **The menu separator's bleed was derived from `--menu-padding`**, so flattening a popup's padding
  silently removed the separator's `-mx-1`. `--menu-separator-margin-inline` and `-margin-block` are slots.

The other v4 areas: the control's `sm` radius, case and grouped padding; a **field sub-axis**
(`--control-*-field`) that splits the input family from the button family; the quiet-label, surface-title,
menu-row, menu-label and table-head type bands; the default tabs bar; per-component radii for card, bubble,
chart tooltip, empty, command row, sidebar parts and joined toggle groups; the sidebar shell's own padding
and gap; and in layer 1 the input edge, the disabled and palette fills, the card and menu rings, the chip,
slider, switch-track and checked-field colours, the invalid + checked Checkbox edge, and the radio dot's
size.

v4 landed in two stages. **Stage 1** added every name to foundation, rewired foundation's rules to read
them, and backfilled the names into every system at foundation's values. `registry/systems/mira` mirrors
foundation byte for byte, so it reads the slots already. sera proposed most of the v4 names under the
spelling foundation adopted and already reads them; what it still writes into its rules (its `--tag-*`
badge names among them) is listed for stage 2 like any other system. The other seven systems (graphite · vega · nova · luma · rhea · maia · lyra)
define the names but still carry their own fork of the layer-3 rules with the value written in the rule, so
their render did not move (checked: 0 computed-value differences in both modes on the coverage template).
**Stage 2** puts each system's value into the slot and takes foundation's rule back;
`tooling/preset/slot-migration.md` lists, per system, which declaration moves into which slot.

**Version 5 (2026-09-17)** split the ten v4 slots that stage 2 found carrying two meanings: one slot read
by several elements while a system gave those elements different values, so the system had to keep a rule
(recorded as "slot-meaning conflicts" in each system's `reference/README.md`). Each split adds the name the
second reader needed, **defaulting to an alias of the slot it came from**, so foundation and mira render
unchanged; the systems that had kept a rule now set a value instead. 14 layer-2 names and 1 layer-1 name:

| v4 slot | Read by | Split into | Why |
|---|---|---|---|
| `--control-padding-x-grouped` | inline addons · block addons · joined toggle item | `--input-group-addon-padding-x` · `--input-group-addon-padding-x-block` · `--toggle-group-item-padding-x` | rhea · nova · lyra · vega keep the block addons at px-2.5 while the rest go to px-2; sera zeroes the addons but not the toggle |
| `--accordion-border-width` | group frame · rule between items | `--accordion-item-border-width` | sera · nova · lyra draw no frame but keep the rules |
| `--badge-height` | plain badge · toned badge | `--tag-height` | luma · sera · lyra keep the tag at the xs step while the badge is h-5 or auto |
| `--card-radius` | card · header/footer · edge image | `--card-part-radius` · `--card-image-radius` | maia rounds header and footer one step below the card; nova gives the image the popover corner |
| `--card-ring` (with no shadow slot) | the card's box-shadow | `--card-shadow` | rhea · sera (and vega · luma) draw a shadow after the ring |
| `--control-padding-x-field` | inputs · select trigger | `--select-trigger-padding-start` · `-end` | rhea's trigger is px-3 against px-2.5 inputs; vega's is `pl-2.5 pr-2` |
| `--control-padding-y-field` | input · native select | `--native-select-padding-y` | sera pads the native select py-2 against the input's py-1 (graphite, which asked too, measured 0 on both) |
| `--control-radius-sm` | sm button · toggle · select trigger · input-group button | `--input-group-button-radius` | luma · nova step the sm control down but not the grouped button |
| `--toggle-group-joined-radius` | group corner · joined item corners | `--toggle-group-item-radius` · `--toggle-group-joined-radius-sm` | rhea squares the group and rounds the items; nova steps only the sm group down |
| `--input-fill-disabled` (layer 1) | input · textarea · native select · select trigger | `--select-fill-disabled` | nova · lyra fill a disabled input and textarea, not a select |

`registry/foundation/reference/README.md` §"Axis contract v5" has the defaults and the per-system values.

Version 3's slots:

| Area | Layer 1 (colours) | Layer 2 (tokens) |
|---|---|---|
| global | `--color-scheme` (read by `@layer base`'s `:root`, so native widgets — scrollbars, the `<option>` list — follow the mode) | — |
| button | `--button-outline-fill` | — |
| slider | `--slider-thumb-fill` | — |
| menu | — | `--menu-item-padding-y` · `--menu-item-padding-y-check` · `--command-item-padding-x` · `--menu-shortcut-line-height` · `--menu-sub-shadow` |
| kbd | — | `--kbd-radius` |
| switch | — | `--switch-thumb-size-md` · `--switch-thumb-size-sm` |
| surfaces | — | `--dialog-shadow` · `--sheet-shadow` |

Version 2's slots:

| Area | Layer 1 (colours) | Layer 2 (tokens) |
|---|---|---|
| button | `--button-secondary-border` · `--button-outline-border` · `--button-ghost-foreground` | `--button-icon-start-padding-start-md` · `--button-icon-start-padding-end-md` · `--button-round-radius` · `--button-pill-radius` |
| checkbox | `--checkbox-fill` · `--checkbox-indeterminate-fill` · `--checkbox-indeterminate-border` · `--checkbox-indeterminate-foreground` | `--checkbox-indeterminate-shadow` |
| badge (tag) | — | `--tag-font-size` |
| avatar | — | `--avatar-line-height-sm` (`--avatar-font-size-sm` · `--avatar-font-weight` now default to `initial` and are read by foundation) |
| table | `--table-row-divider` · `--table-head-foreground` | `--table-checkbox-inset-end` |
| tabs | — | `--tabs-line-divider-width` · `--tabs-line-trigger-padding-x` · `--tabs-line-trigger-padding-x-icon` · `--tabs-line-trigger-border-width` · `--tabs-line-trigger-radius` |
| sidebar | `--sidebar-item-border` · `--sidebar-item-active-border` · `--sidebar-item-hover-background` · `--sidebar-group-label-foreground` · `--sidebar-badge-background` · `--sidebar-badge-active-background` · `--sidebar-badge-hover-foreground` · `--sidebar-badge-active-foreground` | `--sidebar-item-border-width` · `--sidebar-item-font-weight-idle` · `--sidebar-group-label-font-size` · `--sidebar-group-label-line-height` · `--sidebar-group-label-font-weight` · `--sidebar-group-label-text-transform` · `--sidebar-badge-min-width` · `--sidebar-badge-font-size` |

`data-shape` on Button sets the internal `--button-shape-radius` from the round/pill slots; the radius
declarations read it with the size radius as fallback.

Adding a name that systems must define bumps `axisContractVersion` in `foundation.json`; renaming or
removing one always bumps it.

## 6. Adding a component

1. `registry/ui/components/<name>.tsx` with `cn-*` hooks and `@tyohnn/{components,lib,hooks}/*` imports
   only. Update `registry/ui/manifest.json` (files, npm dependencies).
2. `registry/foundation/styles/components/<name>.css`, imported from foundation `styles/style.css`.
3. Foundation defaults for any new layer-1 slot (`:root` and `.dark`) or layer-2 token it reads.

   **A new value goes in a slot, never in the rule.** Every number, colour, corner, case, weight and
   shadow the stylesheet needs gets a name in layer 1 or layer 2, even when the component is the only
   thing that will ever read it — a literal in a `cn-*` rule is a value no system can change without
   editing the rule, which is exactly the debt axis contract 4 was spent paying off (a badge that could
   not stop being an xs button, a separator that could not keep its bleed). Name it
   `--<component-or-axis>-<part>-<property>`, give it the mira value, and let the rule read it.

   Two literals are still allowed, and both must carry a `⚠` comment saying why: a value that is
   **structural rather than stylistic** (`width: 100%`, `inset: -8px` to widen a hit target), and a
   **shared constant no axis owns** that would be actively misleading as a slot. If you are writing the
   comment and it reads like an excuse, add the slot.
4. A section in the `component-sheet` template (`apps/preview/src/templates/component-sheet`).
5. Backfill every system:

   ```sh
   node tooling/backfill-component <name>
   ```

   For each `registry/systems/*` it copies the stylesheet (never overwriting an existing file), adds the
   import to `styles/style.css`, and appends foundation defaults for every token the system lacks as a
   marked block at the end of `globals.css` / `tokens.css`. Then tune those values per system.
6. `node tooling/build-system --all` and `node tooling/scan-tokens` pass.

## 7. Checks

- `npx turbo typecheck` — `@tyohnn/ui` and the preview.
- `node tooling/validate-system [name…]` — `system.json` (foundation: `foundation.json` `fonts`) against
  `registry/schema/system.schema.json`, every `registry/fonts/*.json` against `font.schema.json`, font ids
  that exist in the catalog, a Hangul-capable `hangulFallback`, the three layer-1 font stacks
  (section 8), and icons (section 10): every semantic name exported by all six library files, and no
  icon-package import in `registry/ui` components, hooks or lib.
- `node tooling/scan-tokens [name…]` — for foundation and every system, on its own files:
  1. **fail** — a `var()` (or Tailwind shorthand such as `text-(color:--x)`) read by the system's styles,
     `registry/ui` or the preview that the system's layer-1/2 files do not define and nothing declares
     locally;
  2. **fail** — a token name (per `:root` / `.dark` scope) foundation defines that the system lacks;
  3. **fail** — a `registry/ui` component without `styles/components/<name>.css` or its barrel import
     (skipped when foundation has no stylesheet for it either);
  4. warning — a token only this system defines;
  5. warning — dead tokens, fractional px values, undefined tokens that fall back.
- `node tooling/build-system <name>… | --all` — `dist/systems/<name>/compiled.css` (Tailwind CLI; fixed
  order tailwindcss → globals → tokens → typeset → style.css in `layer(base)`; `@source` registry/ui and
  apps/preview).
- `node tooling/snapshot/compare-computed.mjs --a <url> --system <name> [--mode dark|light] [--preview <origin>]` —
  compares computed visual styles element by element between two renders of the component sheet. The
  preview must have been started for the same system (fonts and icons are chosen at start). `--svg box`
  (default) compares an `<svg>` by its box only and skips its internals, so different icon libraries in the
  same slot compare equal; `--svg full` compares SVG internals too. `--mode-a dark|light` sets the mode on the
  first page only (an app whose default mode differs from the compared preview mode); `--icons` prints which
  glyphs each page draws (lucide class count, first svg's drawing element).
  `--dump <file> --system <name> --mode <mode>` saves one page's values keyed like compare-shadcn (data-slot and
  order, sheet plus the open select · dropdown · dialog); `--diff <before> <after>` compares two dumps by key. Use
  them around a `registry/ui` change: dump every system in both modes before, rebuild, dump again, diff.
- `npx tyohnn doctor [--built]` — a project set up by the CLI, against its `tyohnn.json` (section 11,
  `packages/cli/README.md`).
- `node tooling/snapshot/export-dc.mjs --system <name> --template <template> --out <dir> [--verify <dir>] [--sizes <file>]` —
  exports a preview template rendered with one system as a static Claude Design canvas artboard (`<Name>.dc.html`):
  the template root's markup, the system's `compiled.css` without rules for classes the markup never uses, Google
  Fonts `<link>`s for google-provider fonts and inline woff2 subsets for Pretendard, in the system's default mode.
  `--verify` screenshots the preview and the artboard and compares a few computed values. It starts its own preview
  on port 5199 and stops it.

- `npm run build -w @tyohnn/site` — `apps/site/scripts/build-previews.mjs` builds the preview once per system
  (`--base=/preview/<name>/ --own-css`) into `apps/site/public/preview/<name>/`, then Next exports the site to
  `apps/site/out`. The site reads systems and fonts from the registry at build time and styles itself with mira.

- `node tooling/snapshot/compare-shadcn.mjs --system <name> [--mode light|dark] [--reference <url>] [--preview <origin>]` —
  compares the preview against the shadcn reference app of a preset (`tooling/preset/make-reference.mjs`).
  Elements pair by `data-slot` and order; the sheet plus the open select, dropdown menu and dialog are measured;
  exclusions with reasons live in `registry/systems/<name>/reference/compare-exclusions.json`.

- `node tooling/snapshot/compare-blocks.mjs --system <name> --block sidebar-NN --template <id> [--mode light|dark]` — a block
  template's chrome (every top-level `[data-slot="sidebar"]` subtree and the page header) against the shadcn block in the
  preset's reference app (`make-reference.mjs --blocks`), paired like compare-shadcn; text and text-bearing widths are not
  compared; exclusions in `apps/preview/src/templates/blocks/<id>/compare-exclusions.json` (`tooling/preset/blocks.md`).
- `node tooling/snapshot/check-templates.mjs [--templates all|ids] [--systems all|names] [--modes light,dark]` — every
  template of `apps/preview/src/templates/catalog.ts` at its viewport: console and page errors, an empty `data-template`
  root, horizontal overflow, platform-font fallback; screenshots in `tooling/snapshot/out/templates/`.

⚠ Put `.dark` on `<html>`: layer-2 compositions such as `--shadow-control` resolve on `:root`.

## 8. Typography

### `fonts` in system.json

```json
"fonts": { "sans": "inter", "heading": "inherit", "mono": "system", "hangulFallback": "pretendard" }
```

| Key | Value | Role |
|---|---|---|
| `sans` | catalog id | body and UI text; `html` gets `font-sans` |
| `heading` | `inherit` or catalog id | titles marked `cn-font-heading` (card, dialog, sheet, drawer, alert-dialog, empty, questionnaire) and typeset headings |
| `mono` | `system` or catalog id | `font-mono` (chart values, questionnaire keys) and typeset code; `system` = the platform monospace stack |
| `hangulFallback` | catalog id with `hangul: true` | Hangul glyphs for every role; Latin fonts have none |

Ids name files in `registry/fonts/` (section 9). foundation, mira and vega are `inter`; graphite is `pretendard`
for every role (its reference app used Pretendard). shadcn presets set no mono font, so all three use `system`.

### Stacks (layer 1)

`styles/globals.css` declares the three stacks in `:root`, built from `fonts` and the catalog's `family`
names, and `@theme inline` maps Tailwind's `font-sans` · `font-heading` · `font-mono` to them:

```css
--font-sans: "Inter", "Inter Variable", "Pretendard", ui-sans-serif, system-ui, sans-serif;
--font-heading: var(--font-sans);                         /* heading: inherit */
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", "Pretendard", monospace;
```

1. The role's font: its catalog `family`, then the family its package registers when different
   (`"Inter Variable"` from `@fontsource-variable/inter`), so the stack works whichever way the app installs it.
2. The Hangul fallback, right after (omitted when the role's font is the fallback itself, as in graphite).
3. Platform fallbacks for the font's category: sans/display `ui-sans-serif, system-ui, sans-serif` · serif
   `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` · mono `ui-monospace … monospace`. For
   `mono: system` the Hangul fallback sits before the final `monospace`.
4. `heading: inherit` is `--font-heading: var(--font-sans)`; a heading font gets its own stack.

`tooling/validate-system` rebuilds the stacks and fails on any difference, so edit `fonts` and the three
lines together. Layer 1 names fonts; it never loads them (`@font-face`, `@import`): loading belongs to the app.

### Type ramp axes (layer 2)

Sizes live in `styles/tokens.css`, not in the font choice. When a system changes fonts, re-check these
(letter-spacing values assume the font's own spacing):

- `--ui-text-{xs,sm,md,lg}` · `--ui-line-height-*` · `--ui-font-weight(-regular)` · `--ui-letter-spacing` —
  short UI text in non-control components (badges, table cells, sidebar labels).
- `--heading-font-size-{sm,md,lg,xl}` · `--heading-line-height-*` · `--heading-letter-spacing` — section,
  panel, route and shell-less screen titles.
- `--typeset-{doc,tool}-{size,leading,measure,flow,scale-h1..h3}` · `--typeset-space-*` · `--typeset-tracking` —
  long-form reading rhythm; `typeset-preset.css` points `--typeset-font-{body,heading,mono}` at the three stacks.

## 9. Fonts: catalog and installation

`registry/fonts/<id>.json` (schema `registry/schema/font.schema.json`) describes one font once:

```json
{
  "id": "inter", "family": "Inter", "category": "sans", "provider": "google",
  "next": { "import": "Inter", "variable": "--font-sans-inter" },
  "fontsource": { "package": "@fontsource-variable/inter", "variable": true, "css": "@fontsource-variable/inter", "family": "Inter Variable" },
  "weights": [400, 500, 600, 700], "axes": ["wght", "opsz"], "subsets": ["latin"], "hangul": false,
  "license": { "name": "OFL-1.1", "url": "https://openfontlicense.org" }
}
```

- `provider: google` fonts carry `fontsource` (a `@fontsource-variable/*` package when one exists, otherwise
  `@fontsource/*` with `staticWeights`). `provider: local` fonts (Pretendard) carry `npm` (package, CSS entry,
  registered family) and `local.files` (woff2 paths inside the package, per weight).
- `license` is one line: name and URL. Licence texts stay in the packages.
- Seeded with the preset fonts and Pretendard: `geist`, `inter`, `figtree`, `jetbrains-mono`, `noto-sans`,
  `playfair-display`, `pretendard`. Add a font by adding a file; a system may only name catalog ids.

Fonts are always self-hosted. Nothing in the repository or the preview loads `fonts.googleapis.com` or
`fonts.gstatic.com`. The preview (`apps/preview`) imports the CSS entries of the fonts its started system
names (`SYSTEM=<name>`), through the `virtual:tyohnn-fonts` module.

**How the CLI installs fonts** (`packages/cli/src/project/fonts.ts`):

- **Next.js**
  - `provider: google` — `import { <next.import> } from "next/font/google"` in the root `layout`, configured
    with `variable: <next.variable>`, `subsets` (and `weights` for static fonts; variable fonts load the default
    `wght` axis like the fontsource entry); the variable class goes on `<html>`.
  - `provider: local` — `next/font/local` with `local.files`, as paths into the installed package, found from the app
    folder upwards (no assumption that workspaces hoist it to the root; pnpm's `node_modules/<name>` link works too).
  - `adjustFontFallback: false`, so the variable holds the font and not a metric-adjusted Arial between it and the
    Hangul fallback. (Next 16.3: webpack honours it; Turbopack still appends `"Inter Fallback"` for Google fonts, a
    local Arial with no Hangul, so Hangul still reaches the fallback font and computed styles are unaffected.)
  - The family next/font registers is not the catalog `family` (Next 16 names local fonts after the declaring
    identifier, e.g. `fontPretendard`; older releases hashed names), so the app's `globals.css` redeclares the three
    layer-1 stacks after the system imports, with each `var(<next.variable>)` in place of the family names and
    the same order and fallbacks. The system's own files stay identical to the snapshot.
- **Everything else (Vite and others)** — install the `fontsource.package` / `npm.package` and add
  `@import "<css>"` to the entry CSS. The layer-1 stack works as written.
- `init --font <id> --font-heading <id> --font-mono <id>` (and `tyohnn fonts --sans --heading --mono` later) overrides
  the system's `fonts` for one app; the entry CSS redeclares the three layer-1 stacks with the same rules.
- Not implemented yet: `--vendor-fonts` (copy the woff2 files into `public/fonts` and generate `@font-face` rules named
  with the catalog `family`, instead of depending on the packages).

## 10. Icons

Components never import an icon package. They import semantic names from `@tyohnn/icons`:

```tsx
import { ChevronDown } from "@tyohnn/icons"

<ChevronDown data-slot="accordion-trigger-icon" className="cn-accordion-trigger-icon" />
```

```
registry/ui/icons/
  names.ts                    ICON_NAMES (the semantic set) · IconProps · IconComponent
  libraries/<library>.tsx     one per library; exports every name as a component
  index.ts                    export * from "./libraries/<library>"   (the alias target; lucide in the repo)
  check.ts                    type-level check that every library exports every name
```

**Libraries** — the six shadcn supports, chosen per system by `system.json` `icons.library`:
`lucide` (lucide-react) · `tabler` (@tabler/icons-react) · `hugeicons` (@hugeicons/react `HugeiconsIcon` +
@hugeicons/core-free-icons) · `phosphor` (@phosphor-icons/react) · `remixicon` (@remixicon/react) · `radix`
(@radix-ui/react-icons). `registry/ui/manifest.json` `iconLibraries` lists each library's file and packages.
foundation and mira use hugeicons; graphite and vega use lucide.

Every icon takes SVG props (`className`, `data-*`, `aria-*`, and `strokeWidth` where the library draws
strokes) and renders a 24px box with lucide's stroke weight; CSS sizes it (`size-*`, `[&_svg]` rules), so the
box default never shows. Library defaults that differ are passed explicitly: hugeicons `strokeWidth={2}`,
tabler `stroke={2}`, phosphor `size={24}`, radix `width`/`height` 24.

**Names** say what the icon means at its call site. Mappings follow shadcn's `IconPlaceholder` attributes in
`apps/v4/registry/bases/base` (components) and its examples/blocks (the preview template's icons). A separate
name exists only where shadcn draws the same lucide glyph differently per library: `SelectIndicator` (select
and native-select triggers: tabler `IconSelector`, hugeicons `UnfoldMoreIcon`) and `CalendarChevron*`
(hugeicons `Arrow*Icon` instead of `Arrow*01Icon`).

| Name | Meaning | lucide | tabler | hugeicons | phosphor | remixicon | radix |
|---|---|---|---|---|---|---|---|
| `Account` | account / verified profile (user menu) | BadgeCheckIcon | IconRosetteDiscountCheck | CheckmarkBadgeIcon | CheckCircleIcon | RiCheckboxCircleLine | CheckCircledIcon* |
| `Activity` | activity feed / recent events | ActivityIcon | IconActivity | Activity01Icon | ActivityIcon | RiPulseLine | ActivityLogIcon* |
| `Archive` | archive an item | ArchiveIcon | IconArchive† | Archive02Icon† | ArchiveBoxIcon† | RiInboxArchiveLine† | ArchiveIcon* |
| `ArchiveX` | junk / archived mail | ArchiveXIcon | IconArchiveOff | ArchiveIcon | ArchiveIcon | RiArchiveLine | ArchiveIcon* |
| `ArrowDown` | scroll to the latest message | ArrowDownIcon | IconArrowDown | ArrowDown02Icon | ArrowDownIcon | RiArrowDownLine | ArrowDownIcon* |
| `ArrowLeft` | previous page / back | ArrowLeftIcon | IconArrowLeft† | ArrowLeft02Icon† | ArrowLeftIcon† | RiArrowLeftLine† | ArrowLeftIcon* |
| `ArrowRight` | next page / continue | ArrowRightIcon | IconArrowRight† | ArrowRight02Icon† | ArrowRightIcon† | RiArrowRightLine† | ArrowRightIcon* |
| `ArrowUp` | import / send upwards (submit a prompt) | ArrowUpIcon | IconArrowUp | ArrowUpIcon | ArrowUpIcon | RiArrowUpLine | ArrowUpIcon* |
| `ArrowUpDown` | sortable column | ArrowUpDownIcon | IconArrowsSort† | ArrowUpDownIcon† | ArrowsDownUpIcon† | RiArrowUpDownLine† | CaretSortIcon* |
| `AtSign` | mention | AtSignIcon | IconAt† | AtIcon† | AtIcon† | RiAtLine† | EnvelopeClosedIcon* |
| `Bell` | notifications | BellIcon | IconBell | NotificationIcon | BellIcon | RiNotificationLine | BellIcon* |
| `Blocks` | templates / building blocks | BlocksIcon | IconCube | CubeIcon | CubeIcon | RiBox3Line | CubeIcon* |
| `Bold` | bold text | BoldIcon | IconBold† | TextBoldIcon† | TextBIcon† | RiBold† | FontBoldIcon* |
| `BookOpen` | documentation / guides | BookOpenIcon | IconBook | BookOpen02Icon | BookOpenIcon | RiBookOpenLine | ReaderIcon* |
| `Bookmark` | bookmark / saved | BookmarkIcon | IconBookmark† | Bookmark01Icon† | BookmarkSimpleIcon† | RiBookmarkLine† | BookmarkIcon* |
| `Bot` | models / assistant | BotIcon | IconRobot | RoboticIcon | RobotIcon | RiRobotLine | FaceIcon* |
| `Braces` | API / JSON / method | BracesIcon | IconBraces† | BracesIcon† | BracketsCurlyIcon† | RiBracesLine† | CodeIcon* |
| `BrandMark` | the product's mark in an app header | ApertureIcon | IconAperture | ApertureIcon | ApertureIcon | RiCameraLensLine | ComponentInstanceIcon* |
| `Briefcase` | business unit / segment | BriefcaseIcon | IconBriefcase | Briefcase01Icon | BriefcaseIcon | RiBriefcaseLine | BackpackIcon* |
| `Bug` | bug / defect | BugIcon | IconBug† | Bug01Icon† | BugIcon† | RiBugLine† | ExclamationTriangleIcon* |
| `Building` | company / organisation | Building2Icon | IconBuilding | Building03Icon | BuildingsIcon | RiBuilding2Line | HomeIcon* |
| `Calendar` | date / scheduled event | CalendarIcon | IconCalendar | CalendarIcon | CalendarIcon | RiCalendarLine | CalendarIcon* |
| `CalendarChevronDown` | calendar caption dropdown | ChevronDownIcon | IconChevronDown | ArrowDownIcon | CaretDownIcon | RiArrowDownSLine | ChevronDownIcon* |
| `CalendarChevronLeft` | calendar previous month | ChevronLeftIcon | IconChevronLeft | ArrowLeftIcon | CaretLeftIcon | RiArrowLeftSLine | ChevronLeftIcon* |
| `CalendarChevronRight` | calendar next month | ChevronRightIcon | IconChevronRight | ArrowRightIcon | CaretRightIcon | RiArrowRightSLine | ChevronRightIcon* |
| `ChartBar` | bar chart / volume | ChartColumnIcon | IconChartBar† | ChartHistogramIcon† | ChartBarIcon† | RiBarChartLine† | BarChartIcon* |
| `ChartLine` | reports / analytics | ChartLineIcon | IconChartLine | ChartIcon | ChartLineIcon | RiLineChartLine | BarChartIcon* |
| `Check` | checked item or box | CheckIcon | IconCheck | Tick02Icon | CheckIcon | RiCheckLine | CheckIcon* |
| `ChevronDown` | disclosure open / scroll down | ChevronDownIcon | IconChevronDown | ArrowDown01Icon | CaretDownIcon | RiArrowDownSLine | ChevronDownIcon* |
| `ChevronLeft` | previous | ChevronLeftIcon | IconChevronLeft | ArrowLeft01Icon | CaretLeftIcon | RiArrowLeftSLine | ChevronLeftIcon* |
| `ChevronRight` | next / submenu / breadcrumb separator | ChevronRightIcon | IconChevronRight | ArrowRight01Icon | CaretRightIcon | RiArrowRightSLine | ChevronRightIcon* |
| `ChevronUp` | disclosure close / scroll up | ChevronUpIcon | IconChevronUp | ArrowUp01Icon | CaretUpIcon | RiArrowUpSLine | ChevronUpIcon* |
| `ChevronsUpDown` | switcher trigger (team · user · version) | ChevronsUpDownIcon | IconSelector | UnfoldMoreIcon | CaretUpDownIcon | RiArrowUpDownLine | CaretSortIcon* |
| `Circle` | open / to do status | CircleIcon | IconCircle† | CircleIcon† | CircleIcon† | RiCircleLine† | CircleIcon* |
| `CircleCheck` | success status | CircleCheckIcon | IconCircleCheck | CheckmarkCircle02Icon | CheckCircleIcon | RiCheckboxCircleLine | CheckCircledIcon* |
| `CircleDashed` | backlog / draft status | CircleDashedIcon | IconCircleDashed† | DashedLineCircleIcon† | CircleDashedIcon† | RiLoader5Line† | CircleBackslashIcon* |
| `CircleHelp` | help / support docs | CircleHelpIcon | IconHelpCircle | HelpCircleIcon | QuestionIcon | RiQuestionLine | QuestionMarkCircledIcon* |
| `Clock` | time / duration / pending | ClockIcon | IconClock† | Clock01Icon† | ClockIcon† | RiTimeLine† | ClockIcon* |
| `Code` | code block / source | CodeIcon | IconCode† | SourceCodeIcon† | CodeIcon† | RiCodeLine† | CodeIcon* |
| `Columns` | column visibility / layout | Columns3Icon | IconLayoutColumns† | LayoutThreeColumnIcon† | ColumnsIcon† | RiLayoutColumnLine† | ColumnsIcon* |
| `Contact` | contacts / address book | ContactIcon | IconAddressBook | ContactBookIcon | AddressBookIcon | RiContactsBook2Line | IdCardIcon* |
| `Copy` | copy / duplicate | CopyIcon | IconCopy | Copy01Icon | CopyIcon | RiFileCopyLine | CopyIcon* |
| `Cpu` | compute / model size | CpuIcon | IconCpu† | CpuIcon† | CpuIcon† | RiCpuLine† | MixIcon* |
| `CreditCard` | billing / payment method | CreditCardIcon | IconCreditCard | CreditCardIcon | CreditCardIcon | RiBankCardLine | CardStackIcon* |
| `Database` | database / storage | DatabaseIcon | IconDatabase† | Database01Icon† | DatabaseIcon† | RiDatabase2Line† | StackIcon* |
| `DeletedPages` | show deleted pages / trash view | TrashIcon | IconTrash | DeleteIcon | TrashIcon | RiDeleteBinLine | TrashIcon* |
| `DollarSign` | revenue / price | DollarSignIcon | IconCurrencyDollar† | DollarCircleIcon† | CurrencyDollarIcon† | RiMoneyDollarCircleLine† | TokensIcon* |
| `Download` | download / export | DownloadIcon | IconDownload | Download01Icon | DownloadIcon | RiDownloadLine | DownloadIcon* |
| `Export` | export (page actions menu) | ArrowDownIcon | IconArrowDown | ArrowDownIcon | ArrowDownIcon | RiArrowDownLine | ArrowDownIcon* |
| `ExternalLink` | open elsewhere / external link | ArrowUpRightIcon | IconArrowUpRight | ArrowUpRightIcon | ArrowUpRightIcon | RiArrowRightUpLine | ExternalLinkIcon* |
| `Eye` | view / visible | EyeIcon | IconEye† | ViewIcon† | EyeIcon† | RiEyeLine† | EyeOpenIcon* |
| `File` | file / draft | FileIcon | IconFile | FileIcon | FileIcon | RiFileLine | FileIcon* |
| `FileText` | document / wiki page | FileTextIcon | IconFileText | File01Icon | FileTextIcon | RiFileTextLine | FileTextIcon* |
| `Filter` | filter a list | ListFilterIcon | IconFilter† | FilterIcon† | FunnelIcon† | RiFilter3Line† | MixerHorizontalIcon* |
| `Flag` | priority / flagged | FlagIcon | IconFlag† | Flag01Icon† | FlagIcon† | RiFlagLine† | DrawingPinFilledIcon* |
| `Folder` | folder / project | FolderIcon | IconFolder | FolderIcon | FolderIcon | RiFolderLine | ArchiveIcon* |
| `Forward` | share onwards / forward | ArrowRightIcon | IconArrowForward | ArrowRightIcon | ShareFatIcon | RiShareForwardLine | ArrowRightIcon* |
| `Frame` | design project / frame | FrameIcon | IconFrame | CropIcon | CropIcon | RiCropLine | FrameIcon* |
| `GitBranch` | branch | GitBranchIcon | IconGitBranch† | GitBranchIcon† | GitBranchIcon† | RiGitBranchLine† | Share2Icon* |
| `GitCommit` | commit | GitCommitHorizontalIcon | IconGitCommit† | GitCommitIcon† | GitCommitIcon† | RiGitCommitLine† | CommitIcon* |
| `GitMerge` | merge | GitMergeIcon | IconGitMerge† | GitMergeIcon† | GitMergeIcon† | RiGitMergeLine† | Share1Icon* |
| `GitPullRequest` | pull request | GitPullRequestIcon | IconGitPullRequest† | GitPullRequestIcon† | GitPullRequestIcon† | RiGitPullRequestLine† | Share2Icon* |
| `Globe` | language & region / public | GlobeIcon | IconWorld | Globe02Icon | GlobeIcon | RiGlobalLine | GlobeIcon* |
| `Hash` | channel / tag / number | HashIcon | IconHash† | HashtagIcon† | HashIcon† | RiHashtag† | FrameIcon* |
| `Heading` | heading text | HeadingIcon | IconHeading† | Heading01Icon† | TextHIcon† | RiHeading† | HeadingIcon* |
| `Headset` | support team / calls | HeadsetIcon | IconHeadset | HeadsetIcon | HeadsetIcon | RiCustomerService2Line | ChatBubbleIcon* |
| `History` | history / versions | HistoryIcon | IconHistory† | WorkHistoryIcon† | ClockCounterClockwiseIcon† | RiHistoryLine† | CountdownTimerIcon* |
| `Home` | home | HomeIcon | IconHome | HomeIcon | HouseIcon | RiHomeLine | HomeIcon* |
| `Image` | image / media | ImageIcon | IconPhoto† | Image01Icon† | ImageIcon† | RiImageLine† | ImageIcon* |
| `Inbox` | inbox | InboxIcon | IconInbox | InboxIcon | TrayIcon | RiInboxLine | EnvelopeOpenIcon* |
| `Info` | info status | InfoIcon | IconInfoCircle | InformationCircleIcon | InfoIcon | RiInformationLine | InfoCircledIcon* |
| `Italic` | italic text | ItalicIcon | IconItalic† | TextItalicIcon† | TextItalicIcon† | RiItalic† | FontItalicIcon* |
| `Kanban` | board view | SquareKanbanIcon | IconLayoutKanban | KanbanIcon | KanbanIcon | RiKanbanView | ColumnsIcon* |
| `Key` | API key / secret | KeyRoundIcon | IconKey† | Key01Icon† | KeyIcon† | RiKey2Line† | LockOpen1Icon* |
| `Keyboard` | keyboard / accessibility | KeyboardIcon | IconKeyboard | KeyboardIcon | KeyboardIcon | RiKeyboardLine | KeyboardIcon* |
| `Layers` | layers / environments | LayersIcon | IconStack2† | Layers01Icon† | StackIcon† | RiStackLine† | LayersIcon* |
| `LayoutDashboard` | dashboard | LayoutDashboardIcon | IconLayoutDashboard† | DashboardSquare01Icon† | SquaresFourIcon† | RiDashboardLine† | DashboardIcon* |
| `LayoutGrid` | overview / grid view | LayoutGridIcon | IconLayoutGrid | GridIcon | GridFourIcon | RiGridLine | DashboardIcon* |
| `LifeBuoy` | support | LifeBuoyIcon | IconLifebuoy | ChartRingIcon | LifebuoyIcon | RiLifebuoyLine | QuestionMarkCircledIcon* |
| `Link` | link / copy link / connected accounts | LinkIcon | IconLink | LinkIcon | LinkIcon | RiLinksLine | Link2Icon* |
| `List` | bulleted list / list view | ListIcon | IconList† | LeftToRightListBulletIcon† | ListBulletsIcon† | RiListUnordered† | ListBulletIcon* |
| `ListOrdered` | numbered list | ListOrderedIcon | IconListNumbers† | LeftToRightListNumberIcon† | ListNumbersIcon† | RiListOrdered† | ListBulletIcon* |
| `Loader` | loading (spins) | Loader2Icon | IconLoader | Loading03Icon | SpinnerIcon | RiLoaderLine | ReloadIcon* |
| `Lock` | privacy / locked | LockIcon | IconLock | ShieldIcon | LockIcon | RiLockLine | LockClosedIcon* |
| `LogOut` | log out | LogOutIcon | IconLogout | LogoutIcon | SignOutIcon | RiLogoutBoxLine | ExitIcon* |
| `LogoCommand` | a team or workspace logo (command glyph) | TerminalIcon | IconCommand | CommandIcon | CommandIcon | RiCommandLine | CodeIcon* |
| `LogoGallery` | a product or team logo (stacked rows glyph) | GalleryVerticalEndIcon | IconLayoutRows | LayoutBottomIcon | RowsIcon | RiGalleryLine | RowsIcon* |
| `LogoWaveform` | a team logo (waveform glyph) | AudioLinesIcon | IconWaveSine | AudioWave01Icon | WaveformIcon | RiPulseLine | SpeakerLoudIcon* |
| `Mail` | email | MailIcon | IconMail | Mail01Icon | EnvelopeSimpleIcon | RiMailLine | EnvelopeClosedIcon* |
| `Map` | travel / map | MapIcon | IconMap | MapsIcon | MapTrifoldIcon | RiMapLine | SewingPinIcon* |
| `MapPin` | location | MapPinIcon | IconMapPin† | Location01Icon† | MapPinIcon† | RiMapPinLine† | SewingPinIcon* |
| `Megaphone` | announcement / release | MegaphoneIcon | IconSpeakerphone† | Megaphone01Icon† | MegaphoneIcon† | RiMegaphoneLine† | SpeakerLoudIcon* |
| `Menu` | navigation menu | MenuIcon | IconMenu | Menu09Icon | ListIcon | RiMenuLine | HamburgerMenuIcon* |
| `MessageCircle` | messages & media / chat | MessageCircleIcon | IconMessageQuestion | MessageIcon | ChatCircleIcon | RiChat1Line | ChatBubbleIcon* |
| `MessageCircleQuestion` | help chat | MessageCircleQuestionIcon | IconMessageQuestion | MessageQuestionIcon | ChatCircleIcon | RiQuestionLine | QuestionMarkCircledIcon* |
| `MessageSquare` | comment / comment thread | MessageSquareIcon | IconMessage† | Comment01Icon† | ChatTeardropIcon† | RiMessage2Line† | ChatBubbleIcon* |
| `Mic` | voice input | MicIcon | IconMicrophone† | Mic01Icon† | MicrophoneIcon† | RiMicLine† | SpeakerModerateIcon* |
| `Minus` | separator between OTP groups | MinusIcon | IconMinus | MinusSignIcon | MinusIcon | RiSubtractLine | MinusIcon* |
| `Monitor` | desktop device | MonitorIcon | IconDeviceDesktop† | ComputerIcon† | MonitorIcon† | RiComputerLine† | DesktopIcon* |
| `Moon` | dark appearance | MoonIcon | IconMoon† | Moon02Icon† | MoonIcon† | RiMoonLine† | MoonIcon* |
| `MoreActions` | more actions on a sidebar item | MoreHorizontalIcon | IconDots | MoreHorizontalCircle01Icon | DotsThreeOutlineIcon | RiMoreLine | DotsHorizontalIcon* |
| `MoreHorizontal` | more items / overflow | MoreHorizontalIcon | IconDots | MoreHorizontalCircle01Icon | DotsThreeIcon | RiMoreLine | DotsHorizontalIcon* |
| `MoreVertical` | row actions (vertical dots) | EllipsisVerticalIcon | IconDotsVertical† | MoreVerticalCircle01Icon† | DotsThreeVerticalIcon† | RiMore2Line† | DotsVerticalIcon* |
| `MoveTo` | move to / redo | CornerUpRightIcon | IconCornerUpRight | RedoIcon | ArrowBendUpRightIcon | RiCornerUpRightLine | ArrowTopRightIcon* |
| `OctagonX` | error status | OctagonXIcon | IconAlertOctagon | MultiplicationSignCircleIcon | XCircleIcon | RiCloseCircleLine | CrossCircledIcon* |
| `Package` | product / order package | PackageIcon | IconPackage† | PackageIcon† | PackageIcon† | RiBox3Line† | CubeIcon* |
| `Paintbrush` | appearance / theme | PaintbrushIcon | IconPalette | PaintBoardIcon | PaletteIcon | RiPaletteLine | BlendingModeIcon* |
| `PanelLeft` | toggle the sidebar | PanelLeftIcon | IconLayoutSidebar | SidebarLeftIcon | SidebarIcon | RiSideBarLine | ViewVerticalIcon* |
| `Paperclip` | attachment | PaperclipIcon | IconPaperclip† | Attachment01Icon† | PaperclipIcon† | RiAttachment2† | Link2Icon* |
| `Pencil` | edit | PencilIcon | IconPencil† | PencilEdit01Icon† | PencilSimpleIcon† | RiPencilLine† | Pencil1Icon* |
| `Phone` | phone / call | PhoneIcon | IconPhone† | Call02Icon† | PhoneIcon† | RiPhoneLine† | MobileIcon* |
| `PieChart` | sales & marketing / share of a whole | PieChartIcon | IconChartPie | PieChartIcon | ChartPieIcon | RiPieChartLine | PieChartIcon* |
| `Pin` | pin to top | PinIcon | IconPin† | PinIcon† | PushPinIcon† | RiPushpinLine† | DrawingPinIcon* |
| `Plus` | add / create | PlusIcon | IconPlus | PlusSignIcon | PlusIcon | RiAddLine | PlusIcon* |
| `Quote` | quote / callout | QuoteIcon | IconQuote† | QuoteDownIcon† | QuotesIcon† | RiDoubleQuotesL† | QuoteIcon* |
| `Receipt` | invoice / receipt | ReceiptIcon | IconReceipt† | Invoice01Icon† | ReceiptIcon† | RiBillLine† | FileTextIcon* |
| `RefreshCw` | regenerate / refresh | RefreshCwIcon | IconRefresh† | RefreshIcon† | ArrowsClockwiseIcon† | RiRefreshLine† | ReloadIcon* |
| `Reply` | reply | ReplyIcon | IconArrowBackUp† | MailReply01Icon† | ArrowBendUpLeftIcon† | RiReplyLine† | ResetIcon* |
| `ReplyAll` | reply to all | ReplyAllIcon | IconArrowBackUpDouble† | MailReplyAll01Icon† | ArrowBendDoubleUpLeftIcon† | RiReplyAllLine† | DoubleArrowLeftIcon* |
| `Rocket` | launch / release | RocketIcon | IconRocket† | Rocket01Icon† | RocketIcon† | RiRocketLine† | RocketIcon* |
| `Search` | search field | SearchIcon | IconSearch | SearchIcon | MagnifyingGlassIcon | RiSearchLine | MagnifyingGlassIcon* |
| `SelectIndicator` | select trigger (opens a list) | ChevronDownIcon | IconSelector | UnfoldMoreIcon | CaretDownIcon | RiArrowDownSLine | CaretSortIcon* |
| `Send` | send / sent mail / feedback | SendIcon | IconSend | SentIcon | PaperPlaneTiltIcon | RiSendPlaneLine | PaperPlaneIcon* |
| `Settings` | settings (navigation section) | Settings2Icon | IconSettings | Settings05Icon | GearIcon | RiSettingsLine | GearIcon* |
| `SettingsAdvanced` | advanced settings | SettingsIcon | IconSettings | SettingsIcon | GearIcon | RiSettingsLine | MixerVerticalIcon* |
| `Share` | share | ShareIcon | IconShare2 | Share03Icon | ShareIcon | RiShareLine | Share1Icon* |
| `ShieldCheck` | security / verified | ShieldCheckIcon | IconShieldCheck† | SecurityCheckIcon† | ShieldCheckIcon† | RiShieldCheckLine† | LockClosedIcon* |
| `ShoppingCart` | cart / checkout | ShoppingCartIcon | IconShoppingCart† | ShoppingCart01Icon† | ShoppingCartIcon† | RiShoppingCartLine† | ArchiveIcon* |
| `SiteHeaderSidebarToggle` | toggle the sidebar from a site header (sidebar-16) | PanelLeftIcon | IconLayoutSidebar | SidebarLeftIcon | SidebarIcon | RiLayoutLeftLine | ViewVerticalIcon* |
| `SlidersHorizontal` | parameters / adjust | SlidersHorizontalIcon | IconAdjustmentsHorizontal† | SlidersHorizontalIcon† | SlidersHorizontalIcon† | RiEqualizerLine† | MixerHorizontalIcon* |
| `Smartphone` | mobile device | SmartphoneIcon | IconDeviceMobile† | SmartPhone01Icon† | DeviceMobileIcon† | RiSmartphoneLine† | MobileIcon* |
| `Smile` | emoji / reaction | SmileIcon | IconMoodSmile† | SmileIcon† | SmileyIcon† | RiEmotionLine† | FaceIcon* |
| `Sparkles` | AI / upgrade | SparklesIcon | IconSparkles | SparklesIcon | SparkleIcon | RiSparklingLine | StarIcon* |
| `Square` | stop (generation) | SquareIcon | IconSquare† | StopIcon† | SquareIcon† | RiStopLine† | StopIcon* |
| `SquareCheck` | task done / checklist | SquareCheckIcon | IconSquareCheck† | CheckmarkSquare02Icon† | CheckSquareIcon† | RiCheckboxLine† | CheckboxIcon* |
| `Star` | favourite / starred | StarIcon | IconStar | StarIcon | StarIcon | RiStarLine | StarIcon* |
| `StarOff` | remove from favourites | StarOffIcon | IconStarOff | StarOffIcon | StarIcon | RiStarOffLine | StarFilledIcon* |
| `Sun` | light appearance | SunIcon | IconSun† | Sun03Icon† | SunIcon† | RiSunLine† | SunIcon* |
| `Table` | table view | TableIcon | IconTable† | Table01Icon† | TableIcon† | RiTable2† | TableIcon* |
| `Tag` | label / tag | TagIcon | IconTag† | Tag01Icon† | TagIcon† | RiPriceTag3Line† | BookmarkIcon* |
| `Terminal` | playground / console | TerminalSquareIcon | IconTerminal2 | ComputerTerminalIcon | TerminalIcon | RiTerminalBoxLine | CodeIcon* |
| `ThumbsDown` | bad response | ThumbsDownIcon | IconThumbDown† | ThumbsDownIcon† | ThumbsDownIcon† | RiThumbDownLine† | CrossCircledIcon* |
| `ThumbsUp` | good response | ThumbsUpIcon | IconThumbUp† | ThumbsUpIcon† | ThumbsUpIcon† | RiThumbUpLine† | CheckCircledIcon* |
| `Trash` | delete / move to trash | Trash2Icon | IconTrash | Delete02Icon | TrashIcon | RiDeleteBinLine | TrashIcon* |
| `TrendingDown` | declining metric | TrendingDownIcon | IconTrendingDown | TrendingDownIcon | TrendDownIcon | RiArrowRightDownLine | ArrowBottomRightIcon* |
| `TrendingUp` | growing metric / forecast | TrendingUpIcon | IconTrendingUp | TrendingUpIcon | TrendUpIcon | RiArrowRightUpLine | ArrowTopRightIcon* |
| `TriangleAlert` | warning status | TriangleAlertIcon | IconAlertTriangle | Alert02Icon | WarningIcon | RiErrorWarningLine | ExclamationTriangleIcon* |
| `Truck` | shipping / delivery | TruckIcon | IconTruck† | DeliveryTruck01Icon† | TruckIcon† | RiTruckLine† | RocketIcon* |
| `Undo` | undo | CornerUpLeftIcon | IconCornerUpLeft | UndoIcon | ArrowBendUpLeftIcon | RiCornerUpLeftLine | ResetIcon* |
| `Upload` | upload / import a file | UploadIcon | IconUpload† | Upload01Icon† | UploadIcon† | RiUploadLine† | UploadIcon* |
| `UserPlus` | invite a person | UserPlusIcon | IconUserPlus | UserAdd01Icon | UserPlusIcon | RiUserAddLine | PlusCircledIcon* |
| `Users` | people / team | UsersIcon | IconUsers | UserGroupIcon | UsersIcon | RiGroupLine | PersonIcon* |
| `Video` | audio & video / meeting | VideoIcon | IconVideoPlus | RecordIcon | VideoIcon | RiVideoLine | VideoIcon* |
| `Webhook` | webhook / integration | WebhookIcon | IconWebhook† | WebhookIcon† | WebhooksLogoIcon† | RiWebhookLine† | Link2Icon* |
| `X` | close / clear | XIcon | IconX | Cancel01Icon | XIcon | RiCloseLine | Cross2Icon* |
| `Zap` | fast / usage / automation | ZapIcon | IconBolt† | FlashIcon† | LightningIcon† | RiFlashlightLine† | LightningBoltIcon* |

\* shadcn maps no radix icons; the radix column is tyohnn's closest choice (shadcn's v3 new-york style used
several of them: `Cross2Icon`, `DotsHorizontalIcon`, `CaretSortIcon`, `ViewVerticalIcon`). `Activity`, `Bell`, `BrandMark`, `Briefcase`,
`Building`, `Contact`, `CreditCard`, `Download`, `Headset`, `Kanban`, `LayoutGrid`, `Mail`,
`Plus`, `TrendingDown`, `TrendingUp`, `UserPlus` and `Users` were added with the `crm-dashboard` template; their tabler · hugeicons ·
phosphor · remixicon glyphs are the closest names in each package, since shadcn has no IconPlaceholder for them.

**Sidebar blocks (2026-09-17).** The names from `Account` to `Video` marked "sidebar blocks" in `names.ts` are every
`IconPlaceholder` of shadcn's `apps/v4/registry/bases/base/blocks/sidebar-01` … `sidebar-16` (4.21.0): all five library names
are upstream's. Where a block draws a glyph an existing name already draws in every library, the existing name is used
(`Bell`, `Check`, `ChevronDown`, `ChevronRight`, `CreditCard`, `Minus`, `Plus`, `Search`); where one library differs, the
block's use got its own name (`ChevronsUpDown` next to `SelectIndicator`, `MoreActions` next to `MoreHorizontal` — phosphor
`DotsThreeOutlineIcon`, `SiteHeaderSidebarToggle` next to `PanelLeft` — remix `RiLayoutLeftLine`, `Export` next to `ArrowDown`,
`Settings` / `SettingsAdvanced` and `Trash` / `DeletedPages` for lucide's two glyphs). Team logos are named for their glyph
(`LogoCommand`, `LogoGallery`, `LogoWaveform`). `Calendar` and `ChartLine`, whose non-lucide glyphs had been guesses, now take
the blocks' upstream mapping (hugeicons `CalendarIcon` · phosphor `CalendarIcon`; hugeicons `ChartIcon`).

† The names marked "block templates" in `names.ts` (`Archive` … `Zap`) are for the product screens the block templates
draw (code, API, orders, charts, AI, mail, editor, git, devices …). shadcn has no IconPlaceholder for them, so every
non-lucide glyph is the closest name in that package (marked †), like the crm names above. The block templates may use
only names that exist here; a missing one is reported, not added in a template change.

**Adding an icon**

1. Find the call site's `IconPlaceholder` in shadcn's sources (or the closest shadcn usage of that lucide
   icon) and take all five names from it; choose a radix glyph and note it.
2. Add the semantic name to `names.ts` (sorted, with its meaning) and one export to each of the six
   `libraries/*.tsx`.
3. Use it from `@tyohnn/icons`. `npx turbo typecheck` and `node tooling/validate-system` fail until all six
   files export it; `?template=icons` in the preview shows every name (`ICONS=<library>` for a trial build).

**Resolution.** tsconfig `paths` points `@tyohnn/icons` at `icons/index.ts` (lucide), and `check.ts` typechecks
all six libraries. The preview's Vite alias points it at `libraries/<icons.library>.tsx` of the system it was
started for. The CLI installs only the chosen libraries' packages, copies their library files and writes
`icons/index.ts` to re-export the default; `tyohnn icons <library>` switches an app. In a monorepo each app's
tsconfig `paths` points the specifier at its own library (section 11).

## 11. One monorepo, several systems

A monorepo keeps **one `packages/ui`** with the TSX once and a folder per system; each app imports exactly one
system. The CLI builds it:

```sh
npx tyohnn init --system graphite --app apps/crm --scope @acme     # packages/ui + graphite + apps/crm
npx tyohnn add mira --app apps/admin --icons hugeicons              # a second system for a second app
npx tyohnn use nova --app apps/admin                                # switch that app's system (TSX unchanged)
npx tyohnn icons lucide --app apps/admin                            # switch its icon library
npx tyohnn doctor --built
```

`examples/multi-system` is generated by the first two commands (its README has them) and verified against the preview:
its two Next apps compare equal, element by element, to `?system=graphite` and `?system=mira`. `packages/cli/e2e`
runs the whole flow on a Turborepo fixture, plus a Next.js and a Vite single app.

```
packages/ui/src/components hooks lib     registry/ui, @tyohnn/{components,lib,hooks}/* → <scope>/ui/…
packages/ui/src/icons/libraries/*.tsx    only the libraries some app uses; index.ts re-exports the most used one
packages/ui/src/systems/<name>/          styles + DESIGN.md + system.json, exported as ./systems/*
apps/<app>/src/app/globals.css           block `system`: tailwindcss → globals → tokens → typeset → typeset-preset → style.css layer(base)
                                         block `theme`: @source packages/ui/src (not src/systems) · font stacks on next/font variables
apps/<app>/src/app/layout.tsx            block `fonts`: next/font · <html className={tyohnnHtmlClassName}> ([dark] font-sans <variables>)
apps/<app>/tsconfig.json                 paths "<scope>/ui/icons" → packages/ui/src/icons/libraries/<library>.tsx
apps/<app>/next.config.ts                block `transpile`: transpilePackages ["<scope>/ui"]
tyohnn.json                              source commit · per-app system, icons, fonts, mode, entry CSS · added packages · copied-file hashes
```

- **Never two systems in one app.** Every system defines the same `cn-*` rules and token names globally; the
  later import silently wins. The built CSS of each app contains no token value only the other system declares.
- **Default mode** comes from `system.json` `defaultMode` (inferred from a `dark` tag when absent). `dark` goes on
  `<html>` (section 7).
- **Icons per app.** Components import `<scope>/ui/icons`. packages/ui's own typecheck resolves it to `index.ts` (the
  default library). Each app points that exact specifier at `libraries/<library>.tsx` with **tsconfig `paths` only**:
  Next 16 honours tsconfig `paths` for transpiled workspace packages in both bundlers. No bundler alias is written:
  ⚠ a Turbopack `resolveAlias` whose target does not resolve (targets resolve from the app directory, not
  `turbopack.root`) is ignored without an error, and the app silently draws the default library. A Vite app in the
  monorepo also gets an exact-match `resolve.alias`, since Vite does not read tsconfig `paths`.
  One icon library per monorepo remains the simpler choice; `tyohnn add` asks when a second one would be added.
- **doctor** fails on two systems in one app, import order or a missing `layer(base)`, a missing `@source`, font
  variables the layout does not declare, an icon path that disagrees with `tyohnn.json` or does not exist, a missing
  `transpilePackages` entry, or a mode class that differs from `tyohnn.json`; it warns when icon libraries diverge and
  when CLI-owned files were edited. `--built` checks the isolation above in `.next/static` CSS.
- Start one preview at a time when comparing (or pass `--force`): two Vite servers share the dependency cache and
  the second invalidates the first.
