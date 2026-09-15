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
- Placeholder aliases `@tyohnn/components/*`, `@tyohnn/lib/*`, `@tyohnn/hooks/*` are used for internal imports.
  They are path aliases (tsconfig `paths`, Vite `resolve.alias`), not packages; no workspace is named
  `@tyohnn/components`, `@tyohnn/lib` or `@tyohnn/hooks`. The CLI replaces this alias with the consumer's alias.
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

`registry/ui` (`@tyohnn/ui`) holds the only copy of `components/`, `hooks/` and `lib/`. Every design
system renders these same files; systems differ only in CSS. `registry/ui/manifest.json` lists the
npm dependencies and files.

## 3. Design systems are snapshots

A design system is a complete folder, frozen once created. Nothing is composed at build or run time.

```
registry/systems/<name>/
  system.json                 name · description · forkedFrom { source, commit } · fonts · tags · source
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

The CLI (a later phase) copies one system folder plus `registry/ui` into a project as they are.

**Why snapshots (2026-09-15).** The first model composed a system at build time: foundation files plus
per-theme override files (`colors.css`, `tokens.css`, replaced layer-3 files). A consumer then received
something assembled from several places, and a foundation change silently changed every theme. A
snapshot is exactly what was reviewed; changes reach a system only when someone copies them in
(see backfill, section 6).

## 4. foundation is the maintainer master copy

`registry/foundation` is shadcn + Base UI + the three layers with the shadcn mira preset values. It holds
only `styles/`, `DESIGN.template.md` and `foundation.json` (file list, `axisContractVersion`, `fonts`).

- It is for maintainers and the theme-from-image skill; the CLI does not list it.
- It owns the token vocabulary: every name a system must define (section 5).
- New components get their layer-3 stylesheet and token defaults here first.
- It can be built and previewed like a system: `?system=foundation`.

## 5. Forking a system

```sh
node tooling/new-system <name> --from foundation      # or --from <existing system>
```

Systems are named for their design and mood, not their use case (`graphite`, not `crm-dashboard`).

This copies the source's `styles/`, writes `DESIGN.md` from `registry/foundation/DESIGN.template.md` and
`system.json` with `forkedFrom` (source and current commit) and the source's `fonts`. Then:

1. Tune values **in place** in `styles/globals.css` (both `:root` and `.dark`) and `styles/tokens.css`.
   Do not append override blocks; the file should read as this system's own values.
2. Prefer tuning a slot (below) over editing a layer-3 rule. Edit a rule only for a structural change no
   slot expresses, and consider adding a slot to foundation instead.
3. Fill `system.json` (description, tags, `source` with the origin of the material) and `DESIGN.md`.
   Keep source material in `reference/`. Do not ship another company's name, logo or unique assets.
4. `node tooling/build-system <name>`, `node tooling/scan-tokens <name>`, `node tooling/validate-system <name>`,
   and check the preview: `SYSTEM=<name> npm run dev -w @tyohnn/preview`, then
   `http://localhost:5173/?system=<name>&mode=dark`.

### Token slots (axis contract version 2)

The names defined in foundation `styles/globals.css` (layer 1) and `styles/tokens.css` (layer 2) are the
whole vocabulary; every system defines all of them. A **slot** is a name a layer-3 rule reads where a
system may want a different look, so a system tunes the value instead of editing the rule.

- Name: `--<component>-<part>-<property>` (`--sidebar-group-label-font-size`, `--button-outline-border`,
  `--tabs-line-trigger-radius`). Colours go in layer 1, declared in both `:root` and `.dark`;
  everything else goes in layer 2.
- The foundation value reproduces mira exactly: an alias of the variable mira reads, `transparent`,
  `0px`, `none`, or `initial`. `initial` means "no value": the declaration becomes invalid at
  computed-value time, so an inherited property (colour, font-weight, font-size, line-height,
  text-transform) keeps inheriting as it does in mira. Do not use `initial` for non-inherited properties.
- A declaration only some systems need is still written in the foundation rule, reading a slot whose
  foundation value changes nothing (for example a border always drawn with
  `--sidebar-item-border-width: 0px`).
- Every slot must be read by a rule.

Version 1 was the mira token set plus slots for selection, clay materials, tag and avatar tones, control
shadows and surfaces, and the sidebar, table, tag and line-tab axes. Version 2 added the slots below, so
the graphite look needs no layer-3 rule edits:

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
  that exist in the catalog, a Hangul-capable `hangulFallback`, and the three layer-1 font stacks
  (section 8).
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
  preview must have been started for the same system (fonts are chosen at start).

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

Ids name files in `registry/fonts/` (section 9). foundation (mira) is `inter`; graphite is `pretendard` for
every role (its reference app used Pretendard). shadcn presets set no mono font, so both use `system`.

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

**How the CLI will install fonts** (a later phase; recorded here so the catalog carries what it needs):

- **Next.js**
  - `provider: google` — `import { <next.import> } from "next/font/google"` in the root `layout`, configured
    with `variable: <next.variable>`, `weights`, `subsets`; the variable class goes on `<html>`.
  - `provider: local` — `next/font/local` with `local.files`.
  - The layer-1 stack then reads the next/font variable in place of the family names (next/font hashes them).
- **Everything else (Vite and others)** — install the `fontsource.package` / `npm.package` and add
  `@import "<css>"` to the entry CSS. The layer-1 stack works as written.
- `--vendor-fonts` — copy the woff2 files into `public/fonts` and generate `@font-face` rules named with the
  catalog `family`, instead of depending on the packages.
- `init --font <id> --font-heading <id> --font-mono <id>` overrides the system's `fonts` and rewrites the three
  layer-1 stacks with the same rules.

