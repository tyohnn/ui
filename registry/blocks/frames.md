# Frames — how blocks sit on a page

**Status: proposal (2026-10-02). Nothing here is built.** This file is the evidence and the design to argue with.
The contract in the root `DESIGN.md` does not change until a slice of this is adopted.

## Where this sits

    registry/ui        components          a button, a table, a card
    registry/blocks    blocks              a page heading, metric cards, a table in a card
    (this proposal)    frames              where the blocks stand: gutter, gap, what scrolls, what sits beside what
    apps/preview       templates           a frame filled with blocks and a product's data

Since the templates were cut into blocks, what a template still writes by hand is exactly the frame. Counted in
the template sources:

- **the content root**: 15 templates, 10 different class strings
  (`flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 p-4 [contain:inline-size]`, the same with `pt-0`, with
  `overflow-y-auto`, without `flex-col`, with `5rem`, with `var(--header-height)` …);
- **the reading column**: five strings, three widths (`max-w-3xl` twice, `52rem` twice, `64rem`), four different
  block paddings;
- **the second pane**: `w-72` five times, `w-80` three, `26rem` twice, `30rem` once, and `2fr 1fr` twice;
- **the bar**: eleven `<header className="…">` strings.

Every one of these is a decision about room, made again in each file.

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
wearing vellum (measured before and after the templates moved onto blocks: the same at 1440, 768 and 390):

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
content (`KanbanBoard` and `WeekView` are blocks already).

This is what keeps the axis general. A frame built as "the collection page" has to know about toolbars, tables and
pagination, and then every product that needs one more thing forks it. A frame built from three choices knows
nothing about what is inside.

## Frames are layout blocks

A frame is a block whose only content is slots. It lives in `registry/blocks`, reads tokens through utilities and
takes its data and words from the caller, like every block. The headings, sections, toolbars and tab strips this
proposal first sketched as "regions" exist already as blocks (`PageHeading` · `DetailHeading` · `RecordHeading` ·
`DocumentTitle` · `SectionHeading` · `FilterBar` · `CardToolbar` · `PageTabs`); a frame does not repeat them. What
is missing is small:

| Frame | What it is | Choices (props) |
|---|---|---|
| `Page` | the content under the bar | `scroll` page · regions — `width` full · measure — `gutter` step |
| `PageSplit` · `PageMain` · `PageAside` | two panes side by side | aside width step · which pane leads · what the aside does when narrow (stack · sheet · hide) |

What a frame owns:

- **The space between** the blocks it holds, and between them and the edge. Never the inside of a block.
- **Who scrolls.** `Page` with `scroll="regions"` is the one place that pins the height; the panes are the scroll
  owners. Today three different `calc(100svh - …)` forms do this, each knowing the bar's height by heart.
- **What it becomes when narrow.** A frame sits inside the inset, so it reacts to its own width (a container
  query), not the viewport: the same page works with the sidebar open or collapsed.
- **Its meaning.** `Page` is the `main` landmark and where the skip link lands; `PageAside` is a named
  `complementary` region.

What a frame never holds: data, a domain type, a heading, or a component it chose for you.

The bar inside the inset is not a frame here. Its markup is upstream's sidebar-block shell, kept as it is so
`compare-blocks.mjs` can pair it with the reference app.

### One rule of the blocks does not apply

A block is cut out of a template and must not move a pixel (`registry/blocks/README.md`, rule 2). A frame cannot
promise that, because it exists to make screens agree: adopting `Page` moves every screen that disagreed. What
would move, from the counts above:

- gutter 16 on most app screens, 24 on inbox and code-review, 16 · 32 · 40 on documents → three steps;
- `pt-0` under a bar without a rule against `p-4` under a ruled one → one rule for both;
- a document's block padding (40 · 24/48 · 32/64) → one value;
- the measure (48rem · 52rem · 64rem) → one or two steps;
- the aside (288 · 320 · 416 · 480 · a third) → three steps.

So the proof is different. `audit-layout.mjs` before and after: every number either stays or lands on a step, and
`diff-shots.mjs` differs only on the screens this list names. Each move is a decision to show, not a regression
to hide.

## Values: the frame picks the step, the system gives the value

The frame reads a token with its default written in the read — `p-[var(--page-gutter-sm,1rem)]` — the way the
root contract already hoists a slot's default into the rule that reads it. No system has to declare anything and
the axis contract does not change; a system (or a product, in its own CSS) declares a name only when it wants
another value.

| Token | Default | From |
|---|---|---|
| `--page-gutter-sm` · `-md` · `-lg` | 16 · 24 · 32 | dashboards · inbox and code-review · documents and the product |
| `--page-gap` | 16 | every app screen |
| `--page-measure` · `--page-measure-wide` | 48rem · 52rem | editor and meeting-notes · docs and changelog |
| `--page-aside-width-sm` · `-md` · `-lg` | 288 · 320 · 416 | the splits |

"This page stands at the large gutter" is the frame's choice and belongs to the screen. "The large gutter is
32px" is the system's value. A product that wants more room moves to a larger step; a dense system gives every
step a smaller number. Two products on one system then agree by default.

The title is the same question one layer down, and the blocks already name it: their README lists the large
titles derived from `--ui-text-lg` (×1.25 to ×2.5) and the reading measures as values the systems have no token
for. Title steps belong with that list, not with the frames.

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
template cannot be rebuilt on the frames without overriding a gap, the frame is wrong.

## What is not a frame

- **Board and time grid.** Their columns are content; they are blocks already (`KanbanBoard`, `WeekView`).
- **Headings, sections, toolbars.** Blocks.
- **The sidebar and the bar.** A component and upstream's shell markup.

## Narrow widths

Five templates overflow at 390px (crm-dashboard, team, project, code-review, settings-dialog), and where a split
survives the aside drops under the main column or off the screen. The product's 18 screens never overflow,
because they all pass through one shell. `PageSplit` is where this gets a rule, and it is the part that takes
work: the split in code-review sits inside a tab panel and its aside is a block that draws its own edge and
scrolls by itself.

## Adoption and checks

- A frame is adopted when two or more screens use it, the rule the slot contract already follows.
- `audit-layout.mjs` before and after: numbers stay or land on a step. `diff-shots.mjs` differs only where the
  move was announced.
- Every template on a frame fits at 390px (`check-templates.mjs` reports horizontal overflow; it would run at a
  second width).
- A product's own shell and page components are replaced by blocks and frames, which is the test that matters.

## Open decisions

1. **The steps.** Gutter 16 · 24 · 32, measure 48rem · 52rem, aside 288 · 320 · 416 are read off the templates.
   Fewer is better; say which survive.
2. **Which pictures may move.** The list under "One rule of the blocks does not apply". The alternative is frames
   with enough props to reproduce every template as it is, which is the hand-written class string again.
3. **How `Page` knows its height.** Recommended: the inset is a column of fixed height and `Page` takes the rest
   (`min-h-0 flex-1`), so no frame knows the bar's height. The alternative is a `--page-top` token the bar sets.
4. **First slice.** Recommended: `Page` alone, on every template's content root, with the moves listed and shown
   in before-and-after shots. `PageSplit` second, once the narrow rule is agreed on code-review.
5. **Recipes as code.** Recommended: no. A recipe is documentation plus a screen.
