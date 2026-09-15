# tyohnn design system contract

This file is the contract every component, theme and tool in the repository follows.

## 1. Hooks: components carry class names, not looks

Components are Base UI based shadcn components (`registry/base/components`). Each element gets a
stable hook class named `cn-*` (`cn-button`, `cn-button-variant-outline`, `cn-sidebar-menu-badge`, …),
the same class contract as upstream shadcn, so new upstream components port over with little work.

- TSX holds **no visual values**: no colours, sizes, radii or shadows chosen by the component.
  Layout utilities that upstream bakes in stay, and each exception is explained where it lives.
- Everything visible is decided by CSS in three layers.
- Placeholder aliases `@ds/components/*`, `@ds/lib/*`, `@ds/hooks/*` are used for internal imports.
  A consumer (or the future CLI) maps them onto its own layout.
- Variants that are not props are data attributes forwarded by the component (`data-tone`,
  `data-shape`). They only mean something when a layer-3 rule reads them.

## 2. The three layers

| Layer | Base file | Holds | Example |
|---|---|---|---|
| 1 — colours | `styles/globals.css` | semantic colours in `:root` and `.dark`, Tailwind `@theme` mapping, radius base, static shadows | `--primary`, `--border-subtle`, `--selection`, `--clay-contact` |
| 2 — tokens | `styles/tokens.css` | density, shape, type, motion and composed shadows in `:root` | `--control-height-md`, `--table-row-height`, `--shadow-control` |
| 3 — rules | `styles/style.css` → `styles/components/*.css` | `cn-*` rules that assemble layer 1/2 values | `.cn-badge[data-tone] { border-radius: var(--tag-radius) }` |

Layer 3 is imported into `layer(base)` so utilities passed through `className` still win.
Shared rules (`_control-family`, `_menu-family`, `_surface-family`, `_shared`) load first.
Long-form typesetting (`typeset.css` vendor rules + `typeset-preset.css` values) is a separate axis.

## 3. Base and themes

- **Base** (`registry/base`) owns every component, every token name and a default value for each,
  and a layer-3 file for every component. Base alone is a complete, neutral system (the shadcn mira
  preset values).
- **A theme** (`registry/themes/<name>`) is an overlay on base. It contains only what differs:
  `theme.json`, `colors.css`, `tokens.css`, layer-3 files under `styles/` with a `style.css`,
  `DESIGN.md` and `reference/`.
- Product-flavoured slots (selection colour, clay materials, tag and avatar tones, control shadows)
  exist in base with neutral values: either an alias of the colour the rule used before the slot
  existed, `transparent`, or `none`. A theme changes the look by changing those values.

## 4. Composition order

`tooling/compose-theme` builds `dist/themes/<name>/index.css` (imports only) and compiles it with the
Tailwind CLI into `dist/themes/<name>/compiled.css`:

1. `tailwindcss` (with explicit `@source`: base components and the preview app)
2. `base/styles/globals.css` — layer 1
3. `theme/colors.css` — layer 1 overrides
4. `base/styles/tokens.css` — layer 2
5. `theme/tokens.css` — layer 2 overrides
6. `base/styles/typeset.css`, `base/styles/typeset-preset.css`
7. base layer-3 barrel in `layer(base)`, with the theme's replacement files substituted in place
8. theme `style.css` (its added layer-3 files) in `layer(base)`

`base` composes too (steps 3, 5 and 8 are empty). With `extends` chains, each overlay step repeats in
chain order, nearest theme last. A theme that does not know a component still renders it: the base
rule reads the theme's layer-1/2 values.

⚠ Put `.dark` on `<html>`. Layer-2 compositions (for example `--shadow-control` built from
`--clay-*`) resolve on `:root`.

## 5. Theme rules

- **Layers 1 and 2 are variable overrides.** `colors.css` declares only names whose value differs
  from base, in `:root` and/or `.dark`. If a name is overridden in `:root` and base also sets it in
  `.dark`, the theme must declare it in `.dark` too (the later `:root` would otherwise beat base `.dark`).
  `tokens.css` declares only changed layer-2 names.
- **Layer 3 is file replacement, and it is the last resort.** A replaced file is a fork: it stops
  receiving base fixes. First turn each difference into a base slot (section 6). Only a structural
  difference no slot can express stays a theme file. Its first comment must say
  `replaces: base/styles/components/<file>.css@sha256:<hash of the base file it was forked from>`;
  compose-theme loads it instead of that base file at the same barrel position, and scan-tokens warns
  `replacement stale` as soon as the base file's hash differs. State in the header why a slot is not enough.
- A file marked `tyohnn:adds` contains only selectors base does not have. It is imported from the
  theme `style.css` and loads after the whole base barrel.
- Themes never define tokens in layer-3 files.

## 6. Axis contract (version 2)

The names defined in base `styles/globals.css` (layer 1) and `styles/tokens.css` (layer 2) are the
whole vocabulary. `registry/base/manifest.json` records `axisContractVersion`.

### Slots

A slot is a contract name a base rule reads where a theme may want a different look. Rules for slots:

- Name: `--<component>-<part>-<property>` (`--sidebar-group-label-font-size`, `--button-outline-border`,
  `--tabs-line-trigger-radius`). Colours go in layer 1, declared in both `:root` and `.dark`;
  everything else goes in layer 2.
- The base value reproduces mira exactly: an alias of the variable mira reads, `transparent`, `0px`,
  `none`, or `initial`. `initial` means "no value": the declaration becomes invalid at computed-value
  time, so an inherited property (colour, font-weight, font-size, line-height, text-transform) keeps
  inheriting as it does in mira. Do not use `initial` for non-inherited properties.
- A declaration that only a theme needs is still written in base, reading a slot whose base value
  changes nothing (for example a border that is always drawn with `--sidebar-item-border-width: 0px`).
- Every slot must be read by a base rule (no dead slots).

### Version 2 (2026-09-15)

Added so sales-crm needs no replaced layer-3 file:

| Area | Layer 1 (colours) | Layer 2 (tokens) |
|---|---|---|
| button | `--button-secondary-border` · `--button-outline-border` · `--button-ghost-foreground` | `--button-icon-start-padding-start-md` · `--button-icon-start-padding-end-md` · `--button-round-radius` · `--button-pill-radius` |
| checkbox | `--checkbox-fill` · `--checkbox-indeterminate-fill` · `--checkbox-indeterminate-border` · `--checkbox-indeterminate-foreground` | `--checkbox-indeterminate-shadow` |
| badge (tag) | — | `--tag-font-size` |
| avatar | — | `--avatar-line-height-sm` (`--avatar-font-size-sm` · `--avatar-font-weight` now default to `initial` and are read by base) |
| table | `--table-row-divider` · `--table-head-foreground` | `--table-checkbox-inset-end` |
| tabs | — | `--tabs-line-divider-width` · `--tabs-line-trigger-padding-x` · `--tabs-line-trigger-padding-x-icon` · `--tabs-line-trigger-border-width` · `--tabs-line-trigger-radius` |
| sidebar | `--sidebar-item-border` · `--sidebar-item-active-border` · `--sidebar-item-hover-background` · `--sidebar-group-label-foreground` · `--sidebar-badge-background` · `--sidebar-badge-active-background` · `--sidebar-badge-hover-foreground` · `--sidebar-badge-active-foreground` | `--sidebar-item-border-width` · `--sidebar-item-font-weight-idle` · `--sidebar-group-label-font-size` · `--sidebar-group-label-line-height` · `--sidebar-group-label-font-weight` · `--sidebar-group-label-text-transform` · `--sidebar-badge-min-width` · `--sidebar-badge-font-size` |

`data-shape` on Button sets the internal `--button-shape-radius` from the round/pill slots; the radius
declarations read it with the size radius as fallback.

Version 1 (2026-09-15) was the mira token set plus the slots for selection, clay, tags, avatar tones,
control shadows and surfaces, and the sidebar, table, tag and line-tab axes.

### Checks

`tooling/scan-tokens` composes every theme (base included) and fails when:

- a `var()` (or Tailwind shorthand such as `text-(color:--x)`) is read that no layer-1/2 file defines
  and nothing declares locally (undefined);
- a theme `colors.css` defines a name not in base layer 1, or a theme `tokens.css` defines a name not
  in base layer 2;
- a theme sets a `:root` colour that base also sets in `.dark` without setting it in `.dark` (mode leak);
- a theme layer-3 file defines top-level tokens.

It warns about dead tokens (read by nothing in the registry), slots unread in one composition but read
by another theme, fractional px values, and stale replacements.

Adding a contract name bumps `axisContractVersion` when themes depend on it; renaming or removing one
always bumps it.

## 7. Adding a component

A new component lands in base with all of:

1. `registry/base/components/<name>.tsx` with `cn-*` hooks and `@ds/*` imports only.
2. `registry/base/styles/components/<name>.css`, added to `styles/style.css`.
3. Default values for any new layer-2 axis (and layer-1 slot) it reads, in base `tokens.css` /
   `globals.css` (`.dark` too for colours).
4. A section in the `component-sheet` template (`apps/preview/src/templates/component-sheet`).
5. `node tooling/compose-theme --all` and `node tooling/scan-tokens` pass: every theme renders the new
   component without touching theme files.

Update `registry/base/manifest.json` (files, npm dependencies) in the same change.

## 8. Adding a theme

1. Create `registry/themes/<name>/theme.json` (`name`, `description`, `extends`, `fonts`, `tags`,
   `source` with the origin of the material).
2. Write layer-1 overrides (`colors.css`), then changed layer-2 axes (`tokens.css`), then only the
   layer-3 files that values cannot express (`styles/*.css` with a `tyohnn:replaces` or `tyohnn:adds`
   header, plus `style.css`).
3. Write `DESIGN.md`: character, key values, combination rules, what not to do.
4. Keep source material in `reference/`. Do not ship another company's name, logo or unique assets.
5. Run `node tooling/compose-theme <name>` and `node tooling/scan-tokens <name>`, then check the
   template in the preview: `http://localhost:5173/?theme=<name>&mode=dark`.
