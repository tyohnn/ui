# Block templates: shadcn sidebar blocks as product screens

Sixteen preview templates port shadcn's sidebar blocks (`apps/v4/registry/bases/base/blocks/sidebar-01` … `sidebar-16`,
shadcn 4.21.0, commit `7c9eaba`) and fill each body with a product screen. The sidebar and the page header are
upstream's and are **compared** against the real block; the body is ours and is **render-checked** in every system.
`block-ai-playground` (sidebar-07) is the worked example: read its folder before starting another.

## Files

```
apps/preview/src/templates/
  catalog.ts                         one entry per template: id · label · group · block · viewport · built
  index.tsx                          BUILT: id → component (a catalog entry without one renders blocks/placeholder.tsx)
  blocks/
    _shared/                         block files that are byte-identical upstream in several blocks (see below)
    <id>/
      index.tsx                      the block's page.tsx: shell as upstream + `<Body />`, root `data-template="<id>"`
      app-sidebar.tsx · nav-*.tsx …  the block's own components/*, ported
      <body>.tsx · data.ts           the product screen (repo code style) and its fixed data
      compare-exclusions.json        compare-blocks exclusions, each with a reason (optional)
```

To finish a block: build the folder, add it to `BUILT` in `index.tsx`, set `built: true` in `catalog.ts` (the site
then shows it). Do not change other shared files; report what you need.

## 1. Port the sidebar

```sh
export TYOHNN_PRESET_WORKDIR=~/projects/shadcn-ref
node tooling/preset/port-block.mjs sidebar-NN          # → $TYOHNN_PRESET_WORKDIR/blocks-ported/sidebar-NN/
```

`port-block.mjs` changes only imports (`@tyohnn/components/*`, relative block imports) and turns every
`IconPlaceholder` into the `@tyohnn/icons` name with the same five glyphs. It prints what still needs a hand.

Rules for the port:

- **Markup and classes stay exactly as upstream**, including `render={<a href="#" />}`, `data-*` variants, and
  upstream's colour utilities inside the chrome (`bg-sidebar-primary`, `text-sidebar-foreground/70`). Keep the
  upstream formatting (2-space, no semicolons) in ported files so they diff cleanly against the source.
- Start each ported file with a two-line header: the upstream path, "ported with tooling/preset/port-block.mjs", and
  any deliberate change.
- **Data is ours, structure is upstream's.** Replace names, labels, emails with the product's fictional data, but
  keep the nav's item count, nesting, `isActive`/`defaultOpen` and which items have icons, badges or actions. Then
  compare-blocks pairs one to one. "Acme Inc" style generic names may stay.
- **No time, no randomness.** Replace `new Date()` with `BLOCK_TODAY` (`_shared/today.ts`, 2026-01-14) and pass
  `today` / `defaultMonth` to calendars. `Math.random` inside an event handler (sidebar-09's click shuffle) never runs
  during a render and may stay.
- **Avatars:** set `avatar: ""`. Base UI skips an empty `src` without a request, so the fallback renders as it does
  upstream (where `/avatars/*.jpg` 404s) and the page logs no 404.
- **Icons: use only names that exist** in `registry/ui/icons/names.ts` (156 names: every block IconPlaceholder, plus
  product icons — code, API, orders, charts, AI, mail, editor, git, devices …). `?template=icons` shows them all. If
  you need one that is missing, pick the nearest existing name and **report the missing one**; do not edit the icon
  files. A name that shadows a global or an import (`Map`, `File`, `Image`, `Link`, `Calendar`) is imported as
  `<Name>Icon` by port-block.

### `_shared`

A file goes in `_shared` only when upstream ships it **byte-identical** in several blocks. Import it from there
instead of copying; never edit it for one block's content (it has props for the text that differs).

| File | Upstream | Used by |
|---|---|---|
| `search-form-01-02-05.tsx` | `search-form.tsx` (01 · 02 · 05); `placeholder` prop, default upstream's | 01 · 02 · 05 (16 has its own variant) |
| `version-switcher.tsx` | `version-switcher.tsx` (01 · 02); `title` prop, default "Documentation" | 01 · 02 |
| `date-picker.tsx` | `date-picker.tsx` (12 · 15); fixed to `BLOCK_TODAY` | 12 · 15 |
| `nav-workspaces.tsx` | `nav-workspaces.tsx` (10 · 15) | 10 · 15 |
| `nav-main-10-15.tsx` | flat `nav-main.tsx` (10 · 15) | 10 · 15 |
| `nav-projects-08-16.tsx` | `nav-projects.tsx` (08 · 16) | 08 · 16 (07 has its own variant) |
| `nav-secondary-08-16.tsx` | `nav-secondary.tsx` (08 · 16), `size="sm"` rows | 08 · 16 |
| `nav-secondary-10-15.tsx` | `nav-secondary.tsx` (10 · 15), badges | 10 · 15 |
| `today.ts` | — | every block with a date |

Everything else (nav-user, team-switcher, calendars, nav-favorites, the 06/08/16 nav-main variants …) differs by at
least one class between blocks and is ported into the block's own folder.

## 2. The page and the root

`index.tsx` is the block's `page.tsx`: `SidebarProvider > AppSidebar + SidebarInset > header > body`, as upstream,
wrapped in one root:

```tsx
<div data-template="block-xyz">
  <style>{NO_MOTION}</style>          {/* ../../coverage/frame */}
  <style>{XYZ_STYLE}</style>          {/* template CSS, tokens only */}
  <SidebarProvider>…</SidebarProvider>
</div>
```

- The template is a **page that fills the viewport** (1440×900, `min-h-svh` from SidebarProvider). Do not box the
  sidebar: fixed, `h-svh`, inset, floating and icon collapse behave as they do upstream because the preview iframe
  is the viewport.
- Keep the header markup as upstream (only breadcrumb labels change). Put page actions in the body, not in the
  `<header>`: compare-blocks measures every `<header>` outside the sidebar.
- Do not use `<header>` elements in the body.

## 3. Fill the body

A **real product screen**, dense and plausible, English, fictional company and people (no real brands):

- Only `registry/ui` components and **layout utilities** (flex, grid, gap, padding, size, overflow). No colour
  utilities in body code. Anything visual the primitives do not draw goes in the template's `<style>`, scoped under
  `[data-template="<id>"]`, reading **tokens only** (`--border`, `--muted`, `--muted-foreground`, `--ui-text-*`,
  `--radius-*`, `--font-mono` …). Long-form text can use the system's typeset axis (`typeset typeset-tool`).
  The type scale is `--ui-text-xs` · `sm` · `md` · `lg` (each with `--ui-line-height-*`). **`--ui-text-xl` does not
  exist**: a larger heading uses `lg` (or the typeset axis); an `xl` step is only a candidate token to propose, never
  something a template reads.
- **Parts rendered in a portal** (a Dialog, Sheet, Popover or menu content) mount under `<body>`, outside
  `[data-template]`, so rules scoped to the root never reach them. Put `data-template-part="<id>"` on the portalled
  part's own element (the dialog body, the popover content) and scope those rules under
  `[data-template-part="<id>"]`, keeping `[data-template="<id>"]` for everything in the page. See
  `block-settings-dialog/notifications.tsx` (`SETTINGS_STYLE`).
- Real content: realistic numbers, names, states (selected, disabled, badges, empty rows), not lorem ipsum or grey
  boxes. Fill the viewport; let inner panes scroll (`min-h-0 overflow-y-auto`) rather than the page.
- **Why the body scrolls in its own region.** Upstream's page header is `sticky top-0 … bg-background` inside
  `SidebarInset` with **no z-index**. When the page itself scrolls, any body element that makes a stacking context or
  is positioned (a card with a shadow and `relative`, a sticky table head, a chart tooltip, a Select trigger) paints
  over the header as it slides under it. Upstream's placeholder boxes never do; a product screen does. The header
  markup is compared and stays as upstream, so the body is a viewport-high column (`h-svh`/`min-h-0 flex-1` under the
  header) whose panes scroll themselves, and the header never has anything scroll beneath it.
- **Every system must fit.** Controls are 28–44px tall and text 12–18px depending on the system; rows that hold
  many controls must wrap (`flex-wrap`) or give way. Check sera (large, uppercase) and lyra (monospace) early.
- Fixed data in `data.ts`; no `Date.now`, no `Math.random`.

## 4. Check

Reference apps (answer keys) live in `~/projects/shadcn-ref/<preset>` with all sixteen blocks installed:

```sh
node tooling/preset/make-reference.mjs mira --skip-add --blocks all      # once per preset; sera too
(cd ~/projects/shadcn-ref/mira && npm run build && npx next start -p 3150)   # production build, ports 3150–3159
(cd ~/projects/shadcn-ref/sera && npm run build && npx next start -p 3151)
```

Blocks are at `/blocks/sidebar-NN`; their components under `components/blocks/sidebar-NN/`.

**Compare the chrome** (preview started for the system; restart it for each system; never port 5210). Agents working
in parallel each take their own ports: preview `5230 + n`, `check-templates --port 5240 + n`, reference apps shared on 3150/3151.

```sh
node tooling/build-system mira sera
(cd apps/preview && SYSTEM=mira node scripts/vite-system.mjs --port 5230 --strictPort)
node tooling/snapshot/compare-blocks.mjs --system mira --block sidebar-NN --template block-xyz --mode light --reference http://localhost:3150 --preview http://localhost:5230
# … --mode dark; then SYSTEM=sera on 5230 and --reference http://localhost:3151, light and dark
```

⚠ `vite-system.mjs` spawns vite as a child: stop a preview by its port (`kill $(lsof -tiTCP:5230 -sTCP:LISTEN)`), not
by killing the wrapper. Run one preview at a time (DESIGN.md §11: two Vite servers share the dependency cache).

Target: **0 mismatches** for mira and one contrasting system, both modes. Shots and `result.json` land in
`tooling/snapshot/out/blocks-<system>-<id>-<mode>/`.

**Render-check the whole template** (starts its own preview per system on port 5240, builds the CSS first):

```sh
node tooling/snapshot/check-templates.mjs --templates block-xyz --systems all --modes light,dark
```

Target: 0 problems across 9 systems × 2 modes. Look at the screenshots yourself
(`tooling/snapshot/out/templates/<system>-<mode>/<id>.png`), at least mira light, sera light, graphite dark, lyra light.

Also `npx turbo typecheck`, `node tooling/scan-tokens`, `node tooling/validate-system`.

## Exclusion policy

compare-blocks already skips, by rule and without an exclusion (counted in its summary line and `result.json`):

- text content, and the `width` of every element that holds text (labels are fictional);
- **page height**: `height` / `rect-height` of a root (`sidebarN/root`, the in-flow sidebar wrapper) when, on each
  side, it equals that page's document height (`scrollHeight`, never below the 900px viewport). Upstream's
  placeholder body makes the page 1014–1616px tall, a product screen that scrolls in its own region leaves it at 900px;
  the value follows the body, not the sidebar. A root that is not page-high on either side, and everything inside it
  (the fixed `h-svh` container), is still compared;
- **auto margins**: a margin whose computed value is `auto` on both sides (`ml-auto`, `sm:ml-auto`, read with the typed
  OM `computedStyleMap()`, because `getComputedStyle` returns the used px). Its px is the room the neighbours' text
  leaves (the header's right-aligned trigger, a mail row's date, the site header's search form). `auto` on one side
  only is reported, shown as `… (auto)`.

Do not add exclusions for these. Anything else that differs is either a bug in the port (fix it), a system value
(fix the system, see below), or an exclusion.

`blocks/<id>/compare-exclusions.json`:

```json
[{ "key": "<regex on sidebar0/… or header0/…>", "props": ["height"] | "*", "reason": "…", "systems": ["sera"], "modes": ["dark"] }]
```

- One reason per entry, saying **why the difference is not the template's**: a registry-wide difference shared by
  every system, a content-dependent height (a label that wraps because the product's label is longer), an element
  upstream's data has and ours cannot. Never a system value.
- `systems` / `modes` narrow an entry; leave them out when the reason holds everywhere.
- A difference that is a **system's** value is fixed in that system (layer 1/2 first, a layer-3 rule only in the four
  shapes of DESIGN.md §5), rebuilt, and checked with `compare-shadcn --sections <section>` for that system so the
  coverage comparison stays 0. Record it in the system's `reference/README.md`. If it would touch every system or
  foundation, stop and report instead.

## Pitfalls found in the exemplar (sidebar-07)

- **Nested svg size.** Upstream `SidebarMenuButton` sizes every descendant svg (`[&_svg]:size-4`). tyohnn's
  `.cn-sidebar-menu-button` sized direct children only (`& > svg`), so a logo glyph inside the team switcher's
  `div.size-8` stayed 24px; the rule now sizes every descendant svg (colour still direct children only) in foundation
  and all nine systems, and blocks 10 and 15 (`div.size-5`) need no exclusion for it. A nested svg that carries its
  own size utility still keeps it (the rule sits in the base layer), where upstream's `[&_svg]:size-4` would win.
- **sera's local `--radius: 0`.** style-sera zeroes `--radius` on the sidebar header and content, so `rounded-*`
  utilities inside them are square. Fixed in `registry/systems/sera` (sidebar.css) after this comparison; other
  systems with a local `--radius` (maia) already had it.
- **SidebarInset has no `min-w-0` upstream**, so a body whose content is wider than the column widens the inset past
  the viewport (check-templates reports horizontal overflow, typically only in sera or lyra). Put `[contain:inline-size]`
  on the body row and let toolbars wrap.
- **Tailwind classes need a CSS rebuild.** The preview serves `dist/systems/<name>/compiled.css`; new utility classes in
  a template do nothing until `node tooling/build-system <names>` (check-templates does it; compare-blocks does not).
- `typeset` centres its measure with `margin-inline: auto`; inside a chat or card set `margin-inline: 0` in the template CSS.
- Message avatars sit at the bottom of the message (the component's layout); a long assistant reply shows its avatar
  below the fold.
- Dark mode: both tools add `.dark` on `<html>` after load; the reference app's next-themes does not undo it.

## Per-block notes

| Block → template | Sidebar shape | `_shared` | Own files | Cautions |
|---|---|---|---|---|
| 01 → `block-docs` | version switcher · search · grouped links | search-form-01-02-05 · version-switcher | app-sidebar | `isActive` item in the data; keep the group count |
| 02 → `block-api-reference` | collapsible sections (Collapsible groups) | search-form-01-02-05 · version-switcher | app-sidebar | every section is `defaultOpen`; keep the section and link counts |
| 03 → `block-help-center` | sub-menus (always open) | — | app-sidebar | header logo has `size-4` upstream (no nested-svg issue) |
| 04 → `block-roadmap` | `variant="floating"`, `--sidebar-width: 19rem` on the provider | — | app-sidebar | keep the provider style; the kanban body must scroll horizontally inside its pane, not the page |
| 05 → `block-orders` | collapsible sub-menus with +/- icons | search-form-01-02-05 | app-sidebar | only the second section is `defaultOpen` (`index === 1`); Plus/Minus swap by `group-aria-expanded/menu-button` |
| 06 → `block-analytics` | dropdown sub-menus · opt-in card in the footer | — | app-sidebar · nav-main · sidebar-opt-in-form | the opt-in form has an Input and Button inside the sidebar card (compared) |
| 08 → `block-project` | `variant="inset"` · nav-secondary at the bottom | nav-projects-08-16 · nav-secondary-08-16 | app-sidebar · nav-main · nav-user | inset: the body sits in a rounded, shadowed SidebarInset; the header is inside it |
| 09 → `block-inbox` | two nested sidebars: icon rail + mail list, `--sidebar-width: 350px` | — | app-sidebar · nav-user | the outer sidebar contains both (one compared root); the mail list has upstream's mail count — keep it; the click shuffle's `Math.random` may stay |
| 10 → `block-editor` | Notion-like; NavActions popover in the header | nav-main-10-15 · nav-secondary-10-15 · nav-workspaces | app-sidebar · nav-actions · nav-favorites · team-switcher | the header holds NavActions (compared, popover closed); team logo in `div.size-5` is sized by the menu button's descendant-svg rule; emoji in data are text |
| 11 → `block-code-review` | recursive file tree, change badges | — | app-sidebar | the tree's recursion and open folders (`defaultOpen` by folder name) must match upstream's data shape exactly; renaming a folder changes which one opens |
| 12 → `block-calendar` | date picker · calendar lists · user | date-picker | app-sidebar · calendars · nav-user | the reference renders the real date at build time and the frozen clock on hydration; if the calendar keys differ, compare again before excluding |
| 13 → `block-settings-dialog` | sidebar inside a Dialog, `open` by default | — | settings-dialog | the page body behind the dialog is ours; the sidebar and the dialog's `<header>` are compared; pass `--roots '[data-slot=dialog-content]'` to measure the dialog surface too |
| 14 → `block-changelog` | `side="right"` table of contents | — | app-sidebar | the header's trigger is `ml-auto rotate-180` on the right; keep it |
| 15 → `block-meeting-notes` | left and right sidebars (right: calendars + date picker) | date-picker · nav-main-10-15 · nav-secondary-10-15 · nav-workspaces | calendars · nav-favorites · nav-user · sidebar-left · sidebar-right · team-switcher | two roots `sidebar0` / `sidebar1`; the team logo is sized by the menu button's descendant-svg rule; calendars use `rounded-xs` here (`rounded-sm` in 12) |
| 16 → `block-team` | sticky site header above the sidebar (`--header-height`) | nav-projects-08-16 · nav-secondary-08-16 | app-sidebar · nav-main · nav-user · search-form (16 variant) · site-header | the site header is the compared header; its toggle uses `SiteHeaderSidebarToggle` (remix glyph differs from `PanelLeft`) |
