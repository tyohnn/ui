# Frames — how blocks sit on a page

**Status (2026-10-02): the frames are built and 16 of the 17 templates stand on them.** `page.tsx`,
`page-split.tsx` and `lib/frame.ts` are in this folder; the README lists them with their tokens. This file is the
evidence they were drawn from, what moved when they went in, and what is still open. The axis contract in the root
`DESIGN.md` did not change: the tokens carry their defaults in the read.

## Where this sits

    registry/ui        components          a button, a table, a card
    registry/blocks    blocks              a page heading, metric cards, a table in a card
    (this proposal)    frames              where the blocks stand: gutter, gap, what scrolls, what sits beside what
    apps/preview       templates           a frame filled with blocks and a product's data

Once the templates were cut into blocks, what a template still wrote by hand was exactly the frame. Counted in
the template sources before the frames went in:

- **the content root**: 15 templates, 10 different class strings
  (`flex h-[calc(100svh-4rem)] min-h-0 flex-col gap-4 p-4 [contain:inline-size]`, the same with `pt-0`, with
  `overflow-y-auto`, without `flex-col`, with `5rem`, with `var(--header-height)` …);
- **the reading column**: five strings, three widths (`max-w-3xl` twice, `52rem` twice, `64rem`), four different
  block paddings;
- **the second pane**: `w-72` five times, `w-80` three, `26rem` twice, `30rem` once, and `2fr 1fr` twice;
- **the bar**: eleven `<header className="…">` strings.

Every one of these was a decision about room, made again in each file. The first three are frames now; the bar
is left as it is (below).

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
wearing vellum (measured before and after the templates moved onto blocks: the same at 1440, 768 and 390; the
crm-dashboard row is from after it became a page that fills its viewport):

| Screen | Shell | Bar | Gutter | Gap | Title | Scroll | Split / measure | At 390px |
|---|---|---|---|---|---|---|---|---|
| crm-dashboard | left 246 | 53 ruled · title · actions | 16 | 0 | 17 heading | regions | — | fits |
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
3. **Two ways to scroll.** Ten screens pin the content to the viewport and scroll a region; seven scroll the page.
4. **Six screens are the same split.** A main column and an aside of 288–480px: team, project, code-review,
   ai-playground, api-reference, help-center. It is the most repeated arrangement, and each template wrote it again.
5. **Three screens read at a measure.** A centred column of 768–832px (editor, meeting-notes, changelog).
6. **Narrow widths have no rule.** Four templates overflow at 390px, and where a split survives the aside simply
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
takes everything else from the caller, like every block. The headings, sections, toolbars and tab strips this
proposal first sketched as "regions" are blocks already (`PageHeading` · `DetailHeading` · `RecordHeading` ·
`DocumentTitle` · `SectionHeading` · `FilterBar` · `CardToolbar` · `PageTabs`); a frame does not repeat them.

| Frame | What it is | What the screen chooses |
|---|---|---|
| `Page` | the content under the bar | `scroll` page · regions — `gutter` — `gap` — `flush` under a bar without a rule |
| `PagePane` | a region of a pinned page that scrolls by itself | `gutter` — `gap` — `flush` |
| `PageContent` | a column of blocks inside something that scrolls | `gutter` — `gap` — `measure` (centred or at the start) — `document` padding — the element (`as="article"`) |
| `PageSplit` | two panes side by side | `gap` — `stack` below `xl` |
| `PageMain` · `PageAside` | the pane that takes the room · the narrower one | aside `width` — `gap` — `stack` — `scroll` |

A block that is itself the aside (a settings panel, a record's side column, a table of contents) takes its width
from `ASIDE_WIDTH` in `lib/frame.ts`, and a block that is itself the reading column takes `MEASURE`.

What a frame owns:

- **The space between** the blocks it holds, and between them and the edge. Never the inside of a block.
- **Who scrolls.** `Page` with `scroll="regions"` pins the height; a `PagePane`, an aside or a card inside is the
  scroll owner. The audit now reports them by name (`page`, `page-pane`, `page-aside`) where it used to say `div`.
- **Its height, without knowing the bar.** `Page` is `min-h-0 flex-[1_1_0px]` in the inset's column, so it takes
  what the bar leaves. Three `calc(100svh - …)` forms — 4rem, 5rem for the inset variant, `--header-height` plus
  a pixel — are gone, and the pictures did not move.

What a frame never holds: data, a domain type, a heading, or a component it chose for you.

The bar inside the inset is not a frame. Its markup is upstream's sidebar-block shell, kept as it is so
`compare-blocks.mjs` can pair it with the reference app.

### Which templates

| Frame use | Templates |
|---|---|
| `Page scroll="regions"` with gutter and gap | orders, team, roadmap, project, ai-playground |
| `Page scroll="regions"`, bare, with a `PagePane` | code-review, inbox, crm-dashboard; calendar (bare, its grid scrolls) |
| `Page` scrolling with gutter and gap | analytics |
| `Page` scrolling around a `PageContent` | editor, meeting-notes, changelog (measured documents) · docs, api-reference, help-center (full width) |
| `PageSplit` | team, project, ai-playground, code-review, docs, api-reference, help-center |

Not on a frame: settings-dialog (a dialog over upstream's placeholder page).

### What moved, and what did not

A block is cut out of a template without moving a pixel. A frame exists to make screens agree, so it may move the
ones that disagreed — but every value the templates had turned out to fit a step, except one:

- **A document's own padding.** Above and below the column it was 40/40 (editor), 24/48 (meeting-notes), 32/64
  (changelog, docs, api-reference) and 32/48 (help-center). It is now `--page-document-padding-start` · `-end`,
  2rem and 4rem. Editor's title sits 8px higher, meeting-notes' 8px lower; the rest of the change is below the fold.

- **A pinned page in a system that draws the inset as a panel.** loam gives the inset a margin, so
  `calc(100svh - 4rem)` was 16px taller than the panel and the roadmap's board ran past its bottom edge. `Page`
  takes the height the inset has, and the board ends inside the panel with its gutter. This one is a fix.

Everything else is where it was. `check-templates.mjs --shots` before and after, the 15 templates in all 15
systems and both modes, compared with `diff-shots.mjs`: of 450 pairs, 375 are identical, 60 are editor and
meeting-notes (the padding above), 2 are loam's roadmap (the fix above), and 13 differ by one or two levels of one
channel on at most 191 pixels — the raster noise the blocks' README describes. crm-dashboard went onto the
frames after it became a page: shot in four systems and both modes, six of eight pairs identical and two with the
same noise.

Below `xl` the splits stack as before (the row wraps). Layout facts at 768 and 390 are unchanged, which also means
the templates that overflowed at 390px still do.

## Values: the frame picks the step, the system gives the value

The frame reads a token with its default written in the read — `p-[var(--page-gutter-sm,1rem)]` — the way the
root contract hoists a slot's default into the rule that reads it. No system declares anything and the axis
contract does not change; a system, or a product in its own CSS, declares a name only when it wants another value.

| Token | Default | Stands for |
|---|---|---|
| `--page-gutter-sm` · `-md` · `-lg` · `-xl` | 1 · 1.5 · 2 · 2.5rem | app screens · inbox and code-review · api-reference and help-center · docs and changelog |
| `--page-gap-xs` · `-sm` · `-md` · `-lg` · `-xl` | 0.75 · 1 · 1.5 · 2 · 2.5rem | the room between blocks |
| `--page-measure-sm` · `-md` · `-lg` | 48 · 52 · 64rem | editor and meeting-notes · docs and changelog · the inbox reader |
| `--page-aside-xs` · `-sm` · `-md` · `-lg` · `-xl` | 14 · 18 · 20 · 26 · 30rem | a table of contents · code-review · team and ai-playground · project and help-center · api-reference |
| `--page-document-padding-start` · `-end` | 2 · 4rem | above and below a document |

"This page stands at the large gutter" is the frame's choice and belongs to the screen. "The large gutter is
32px" is the value. Declared on `:root` in the preview — every gutter step up by 1rem, the asides 4rem wider, the
measures 8rem narrower — the templates follow without a change to any of them: orders' gutter 16 → 32, inbox's
24 → 40, api-reference's 32 → 48, editor's column 768 → 640, team's aside 320 → 384, project's 416 → 480.

Five steps of gutter and five of aside is what it took to cover the templates as they are. That is decided: the
steps stay, so no template has to move to fit a shorter scale.

The title is the same question one layer down, and the blocks already name it: their README lists the large
titles derived from `--ui-text-lg` (×1.25 to ×2.5) as values the systems have no token for. Title steps belong
with that list, not with the frames.

## Recipes and screens

A recipe is a named row of the three choices with the regions it uses, written down once:

| Recipe | Scroll · width · split | Screens that are instances today |
|---|---|---|
| Collection | regions · full · none | orders, crm-dashboard, team (with an aside) |
| Overview | page or regions · full · none | analytics, project (with an aside) |
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

Still open. Four templates overflow at 390px (team, project, code-review, settings-dialog), and
where a split survives the aside drops under the main column or off the screen. The product's 18 screens never
overflow, because they all pass through one shell. `PageSplit` is now the one place to give this a rule: stack on
the frame's own width (a container query) rather than the viewport's `xl`, and say what a pinned page becomes when
its panes stack — today the wrapped row keeps each pane's height and the page overflows.

## Checks

- `audit-layout.mjs` before and after, at 1440 · 768 · 390: every number stays or lands on a step.
- `check-templates.mjs --shots` before and after and `diff-shots.mjs`: differences only where a move was announced.
- `scan-tokens`: the frame tokens are reported as "undefined, falls back", which is what they are.

## Open decisions

Decided: the steps stay as many as the templates use (gutter 0 · 16 · 24 · 32 · 40, gap five, measure three,
aside five). Collapsing them would move pictures for the sake of a shorter list.

1. **The narrow rule** for `PageSplit`, above.
2. **Whether a system should declare these.** They work undeclared. A dense system and a roomy one would want
   different numbers, and then the names belong in `tokens.css` with the axis contract's next version.
3. **A product's shell.** The first product's own shell and page-header components do what `Page` and
   `PageHeading` do. Replacing them is the test that matters, and it waits for the CLI to install blocks.
4. **Recipes as code.** Recommended: no. A recipe is documentation plus a screen.
