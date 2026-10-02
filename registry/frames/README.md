# Frames — the layer above the components

**Status: proposal (2026-10-02). Nothing in this folder is built.** This file is the evidence and the design to
argue with. The contract in the root `DESIGN.md` does not change until a slice of this is adopted.

## Why

A system makes every component the same wherever it is used. It does not make two screens feel the same.

The first product built on a system here was put next to the preview and measured. The components were
identical — control heights, type steps, table rhythm, every token. What differed was everything between them:

| | Preview (Orders) | The product |
|---|---|---|
| Page title | 14px, heading font | 24px, sans |
| Section title | 14px | 20px |
| Gutter | 16px | 32px |
| Gap between parts | 16px | 24px |

Neither is wrong. Nothing in the registry says what a page title is or how far a page stands from its edge, so
each side decided for itself: the preview in each template's own classes, the product in its own shell and
page-header components. The purpose of this axis is that a product does not have to decide, and that two products
on the same system come out with the same room around things.

## What the screens are made of today

`node tooling/snapshot/audit-layout.mjs` measures the layer no system owns: the shell, the gutter, the title, what
scrolls, what sits side by side, and what happens when the screen gets narrow. The 17 screen templates, at 1440px,
wearing vellum:

| Screen | Shell | Bar | Gutter | Gap | Title | Scroll | Split / measure | At 390px |
|---|---|---|---|---|---|---|---|---|
| crm-dashboard | left 246 | 53 ruled · title · actions | 16 | 8 | 17 heading | document | — | overflows |
| orders | left 256 | 64 ruled | 16 | 16 | 14 heading | regions | — | fits |
| analytics | left 256 | 64 ruled | 16 | 16 | 14 heading | regions | — | fits |
| roadmap | left 304 | 64 | 16 | 16 | 14 heading | regions | four columns (a board) | fits |
| team | left 256 | none | 16 | 16 | 14 heading | regions | 816 \| 320 | overflows |
| project | left 256 | 64 | 16 | 16 | 18 sans | page | 712 \| 416 | overflows |
| code-review | left 256 | 64 ruled | 24 | 16 | 18 sans | regions | 896 \| 288 | overflows |
| ai-playground | left 256 | 64 | 16 | 16 | — | regions | 816 \| 320 | fits |
| settings-dialog | none | none | 0 | 0 | — | regions | 240 \| 1200 | overflows |
| inbox | left 350 (rail + list) | 59 ruled | 24 | 0 | 18 heading | regions | list in the shell | fits |
| editor | left 256 | 56 · actions | centred | 0 | 28 heading | page | measure 768 | fits |
| calendar | left 256 | 64 ruled | — | 0 | 14 heading | regions | seven columns (a time grid) | fits |
| meeting-notes | two sidebars | 56 | centred | 0 | 28 heading | page | measure 768 | fits |
| docs | left 256 | 64 ruled | 40 | 0 | 29 heading | page | — | fits |
| api-reference | left 256 | 64 ruled | 32 | 0 | 25 heading | page | 608 \| 480 | fits |
| help-center | left 256 | 64 ruled | centred | 0 | 25 heading | page | 680 \| 416 | fits |
| changelog | right 256 | 64 ruled | centred | 0 | 29 heading | page | measure 832 | fits |

"Scroll: regions" means the content is as tall as the viewport and something inside it scrolls; "page" means the
whole content scrolls under the bar. Gutter is the distance from the inset's edge to the title.

The product, measured the same way: 18 screens in a shell, one arrangement. Sidebar 256, a ruled 56px bar with trigger and
breadcrumb, gutter 32, title 24, one column, the page scrolls, and no screen overflows at 390px — because every
screen goes through the same shell and page-header component.

What the numbers say:

1. **Spacing is a template constant.** Five of these templates under eight systems: gutter 16 and gap 16 in
   every one (`p-4 gap-4` in the template). A system changes what is inside a card, never the room around it.
2. **The title is half and half.** The template picks a step, the system gives the step its size and family.
   Under one system the titles still run from 14 to 29px, in three bands: 14 (dashboards), 17–18 (workspaces),
   25–29 (documents).
3. **Two ways to scroll.** Nine screens pin the content to the viewport and scroll a region; seven scroll the page.
4. **Six screens are the same split.** A main column and an aside of 288–480px: team, project, code-review,
   ai-playground, api-reference, help-center. It is the most repeated arrangement, and each template wrote it again.
5. **Three screens read at a measure.** A centred column of 768–832px (editor, meeting-notes, changelog).
6. **Narrow widths have no rule.** Five templates overflow at 390px, and where a split survives the aside simply
   drops under the main column or off the screen. The templates were drawn at 1440 and nothing says what a split
   becomes on a phone. This is the part of the layer that takes work.
7. **The bar is copied markup.** `flex h-16 shrink-0 items-center gap-2 border-b px-4` appears in the template
   files with small differences (64, 59, 56, 53; ruled or not).

## The finding: three choices, not nine archetypes

The first sketch of this axis listed named archetypes — collection, overview, list and detail, board, document,
workbench, settings. The measurements do not support building those as components. Sorted by what they actually
do, the screens differ in three independent choices:

| Choice | Values | What it decides |
|---|---|---|
| **Scroll** | `page` · `regions` | whether the content scrolls under the bar, or is pinned and a region scrolls |
| **Width** | `full` · `measure` | whether the content fills the inset or reads in a centred column |
| **Split** | none · `aside` (main + a narrower pane) · `list` (a list pane + detail) | whether there is a second pane, and which is primary |

A collection page is `regions · full · none`. A workbench is `regions · full · aside`. A document is
`page · measure · none`, or with `aside` for a table of contents. An archetype is a row of this table with a
name on it — a recipe, not a component. A board and a time grid are not frames at all: their columns are the
content (they belong with the composites, below).

This is what keeps the axis general. A frame built as "the collection page" has to know about toolbars, tables and
pagination, and then every product that needs one more thing forks it. A frame built from three choices knows
nothing about what is inside.

## Regions

A region is a box with a job and slots — the page-scale equivalent of `Card` with `CardHeader` and
`CardContent`. It would live in `registry/ui` under the same contract as every component: `cn-*` hooks, no visual
values in the TSX, values in layer 2, rules in layer 3. Working names:

| Region | Parts | Variants (data attributes) |
|---|---|---|
| `AppBar` | the bar inside the inset: leading (trigger · breadcrumb), trailing (actions) | `data-size` (64 · 56), ruled or not |
| `Page` | the content under the bar | `data-scroll` · `data-width` · `data-gutter` |
| `PageHeader` | `PageTitle` · `PageDescription` · `PageActions` | `data-size` sm · md · lg (the three bands) |
| `PageSection` | `PageSectionHeader` · `PageSectionTitle` · `PageSectionActions` · body | — |
| `PageToolbar` | leading (filters) · trailing (view controls) | — |
| `PageSplit` | `PageMain` · `PageAside` | aside `data-width` step · `data-collapse` stack · sheet · hide |

What a region owns:

- **The space between** its parts and its neighbours. Never the inside of a child.
- **Who scrolls.** `Page` with `data-scroll="regions"` is the one place that pins the height; `PageMain` and
  `PageAside` are the scroll owners. A table or a list inside does not have to know.
- **What it becomes when narrow.** A region sits inside the inset, so it reacts to its own width (a container
  query), not to the viewport: the same page works with the sidebar open or collapsed.
- **Its meaning.** `Page` is the `main` landmark, `PageTitle` the one `h1`, `PageSectionTitle` an `h2`,
  `PageAside` a `complementary` region with a name; the skip link lands on `Page`.
- **Its waiting face.** A header takes `loading` and draws the same box with a placeholder where the text goes, so
  nothing moves when the value arrives.

What a region never holds: data, a domain type, a fetch, a link component of one framework, or a component it
chose for you. Slots take elements, not arrays.

## Values: the frame picks the step, the system gives the value

New layer-2 names, each defaulting in foundation to what the templates draw today, so no render moves on the day
they land:

| Token | Foundation default | From |
|---|---|---|
| `--page-gutter-sm` · `-md` · `-lg` | 16 · 24 · 32 | dashboards · inbox and code-review · documents and the product |
| `--page-gap` | 16 | every app screen |
| `--page-measure` | 768 | editor, meeting-notes |
| `--page-title-font-size-sm` · `-md` · `-lg` | `--ui-text-lg` · 18 · `--heading-font-size-lg` | the three bands |
| `--page-title-font-family` | `--font-heading` | 13 of 15 titles |
| `--page-aside-width-sm` · `-md` · `-lg` | 288 · 320 · 416 | the six splits |
| `--appbar-height` · `--appbar-height-compact` | 64 · 56 | the bars |

"This page's title is the large step" is the frame's choice and belongs to the screen. "The large step is 28px
in a serif" is the system's value. A product that wants more room moves to a larger step; a system that is dense
gives every step a smaller number. Two products on one system then agree by default.

This also settles a loose end: `--heading-font-size-md/lg/xl` exist in every system and `scan-tokens` reports them
dead, because no rule reads them. The page title would.

## Recipes and screens

A recipe is a named row of the three choices with the regions it uses, written down once:

| Recipe | Scroll · width · split | Screens that are instances today |
|---|---|---|
| Collection | regions · full · none | orders, team (with an aside) |
| Overview | page or regions · full · none | analytics, crm-dashboard, project (with an aside) |
| Workbench | regions · full · aside | code-review, ai-playground |
| List and detail | regions · full · list | inbox, settings |
| Document | page · measure · none or aside | editor, meeting-notes, changelog, docs, api-reference, help-center |
| Focus | page · measure · none, no shell | (none in the preview; the product's sign-in) |

The 17 templates stay what they are — screens: a recipe with example content. They become the proof. If a
template cannot be rebuilt on the regions without overriding a gap, the region is wrong.

## What is not a frame

- **Composites.** A table driven by a column config, a stat card, an item list: these know the shape of data.
  They are components of a third kind and need their own contract. Out of scope here.
- **Board and time grid.** Their columns are content.
- **The sidebar.** It is already a component; the 16 upstream sidebar blocks are its variants. `AppBar` is the only
  shell part this proposal adds.

## Adoption and checks

- A region or a recipe is adopted when two or more screens use it, the rule the slot contract already follows.
- Rebuilding a template on regions must not move it: `audit-layout.mjs` before and after reports the same
  gutter, gap, title and split at 1440.
- Every rebuilt template fits at 390px (`check-templates.mjs` already reports horizontal overflow; it would run at
  a second width).
- The regions get a sheet in the preview like the components' coverage: each region, each variant, empty boxes for
  content, at three container widths.
- The CLI copies regions with the rest of `registry/ui`. A product's own shell and page-header components are
  replaced by them, which is the test that matters.

## Open decisions

1. **Where regions live.** In `registry/ui` as components (recommended: the three-layer contract, the backfill
   tool and the token scan all apply unchanged), or in a separate folder a product opts into.
2. **Whether recipes are code.** Recommended: no. A recipe is documentation plus a screen; the regions are the
   only code. Revisit if a recipe turns out to need behaviour the regions cannot express.
3. **First slice.** Recommended: `AppBar`, `Page`, `PageHeader` and `PageSplit`, proved by rebuilding three
   templates that between them use every value of the three choices — orders (regions · full · none),
   code-review (regions · full · aside, and it overflows at 390 today), editor (page · measure).
4. **Names.** `Page*` reads naturally in TSX, but a Next.js project already has files called `page.tsx`. `Frame*`
   or `Screen*` are the alternatives.
5. **Step names for the title.** `sm · md · lg`, or by role (`dense · standard · document`).
