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
only `styles/`, `DESIGN.template.md` and `foundation.json` (file list, `axisContractVersion`).

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
`system.json` with `forkedFrom` (source and current commit). Then:

1. Tune values **in place** in `styles/globals.css` (both `:root` and `.dark`) and `styles/tokens.css`.
   Do not append override blocks; the file should read as this system's own values.
2. Prefer tuning a slot (below) over editing a layer-3 rule. Edit a rule only for a structural change no
   slot expresses, and consider adding a slot to foundation instead.
3. Fill `system.json` (description, tags, `source` with the origin of the material) and `DESIGN.md`.
   Keep source material in `reference/`. Do not ship another company's name, logo or unique assets.
4. `node tooling/build-system <name>`, `node tooling/scan-tokens <name>`, and check the preview:
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
- `node tooling/snapshot/compare-computed.mjs --a <url> --system <name> [--mode dark|light]` — compares
  computed visual styles element by element between two renders of the component sheet.

⚠ Put `.dark` on `<html>`: layer-2 compositions such as `--shadow-control` resolve on `:root`.
