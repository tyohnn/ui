# registry/blocks

Blocks: screen pieces composed from the components of `registry/ui` — a page heading, a row of metric cards, a
table in a card. The preview's templates (`apps/preview/src/templates`) are built from them, so the template
gallery is the proof that every block renders with every design system.

## Rules

1. **Only the system changes.** A block reads system tokens and `registry/ui` components and decides no colour,
   radius, type size or density of its own. Token reads go through utilities
   (`text-[length:var(--ui-text-sm)]`, `text-muted-foreground`, `border-border`); shared text recipes are in
   `lib/text.ts`. A value no token expresses is a missing token in the systems, not a literal in the block.
   `node tooling/scan-tokens` fails when a block reads a token a system does not define.
2. **The template is the quality bar.** A block is cut out of a template and has to draw the same picture. Shoot the
   template before and after with `tooling/snapshot/check-templates.mjs --shots <dir>` and compare the folders with
   `tooling/snapshot/diff-shots.mjs`: every system, both modes, zero differing pixels.
3. **One block, one shape.** A concept may have several blocks (a table in a card with tabs and bulk actions is
   one; a members table with inline role selects is another). Do not grow one block's props to cover another
   shape — cut a second block.
4. **Data and words come from the caller.** A block fetches nothing and knows no domain type: rows, labels,
   accessible names and callbacks are props. What belongs to the product (which statuses exist, which columns,
   which actions) stays in the screen that uses the block.

## Cutting a block out of a template

A template's own stylesheet (`XX_STYLE`, rules under `[data-template="…"]`) becomes utilities on the block's
elements; the template keeps no stylesheet. Translate each declaration literally, so the picture does not move:

- A token read stays the same token: `font-size: var(--ui-text-sm)` → `text-[length:var(--ui-text-sm)]`,
  `border-radius: var(--radius-md)` → `rounded-[var(--radius-md)]`. Do not swap it for a named utility that looks
  equal (`rounded-md` is not `var(--radius-md)` in every system). Semantic colours do have utilities
  (`text-muted-foreground`, `bg-muted`, `border-border`, `bg-success`), and so do `font-heading` · `font-mono` ·
  `font-semibold` · `tabular-nums`.
- A weight from a token goes in `style` (`style={{ fontWeight: "var(--ui-font-weight)" }}`): `font-[…]` cannot
  tell a weight from a family.
- A rule on descendants (`.x svg { width: 14px }`) becomes a variant on the parent (`[&_svg]:size-[14px]`).
- A rule keyed on a data attribute (`[data-tone="warning"]`) becomes a class picked in the component from a
  lookup table, so every class is a whole string Tailwind can read.
- The geometry of a data graphic (tick, bar and dot sizes) may stay literal; it is not a look a system tunes.
- Keep the DOM the template had: the same elements in the same order, text in the same text nodes
  (`{a} of {b}` and `` `${a} of ${b}` `` kern differently), the same classes on the same `registry/ui` components.

Then prove it: `check-templates.mjs --shots` before and after, `diff-shots.mjs`, zero differing pixels in every
system and both modes. (cirrus light shows a one-level difference on the antialiased edge of the Orders
avatars since more utilities were compiled in; nothing else is known to differ.)

## Layout

    registry/blocks/<name>.tsx     one block (kebab-case file, PascalCase export)
    registry/blocks/lib/           what blocks share (text recipes)

Blocks import each other and their helpers as `@tyohnn/blocks/*`, and components as `@tyohnn/components/*`.

## Blocks

| Block | File | What it is |
|---|---|---|
| `PageHeading` | `page-heading.tsx` | A page body's title, one meta line, and the page actions on the other side |
| `PageBar` | `page-bar.tsx` | The bar at the top of a page in an app window: title, status badge, global actions, a divider |
| `MetricCards` | `metric-cards.tsx` | A row of small cards: label, figure, change as a trend badge, one line of context |
| `DataTable` | `data-table.tsx` | The bare table from columns and rows: typed cells, sortable headers, column widths, a checkbox column |
| `DataTableCard` | `data-table-card.tsx` | A DataTable in a card that scrolls inside: filter tabs with counts, toolbar controls, a bulk-action bar while rows are selected, summary and pages in the footer |
| `TabCard` | `tab-card.tsx` | A card of panels behind tabs: tabs and controls in the toolbar, the open panel scrolling inside, summary and an action in the footer |
| `FilterBar` | `filter-bar.tsx` | The band over a table: filters on one side, actions on the other |
| `SummaryBar` | `summary-bar.tsx` | The band under a table: equal cells with a figure or an icon and a label |
| `TableSearch` | `table-search.tsx` | The search field of a table toolbar |
| `CompactSelect` | `compact-select.tsx` | A small select for a toolbar filter or a cell, with an optional visible label or icon |
| `RowMenu` | `row-menu.tsx` | One row's actions behind a "more" button, in groups |
| `Person` | `person.tsx` | An avatar with a name and one line of detail; presence badge, badges after the name, avatar tone |
| `InfoCard` | `info-card.tsx` | A small titled card for a side column: title, description, corner action, content, footer buttons |
| `UsageMeter` | `usage-meter.tsx` | A progress bar with what it measures and the percentage |
| `FigureRow` | `figure-row.tsx` | A few figures side by side, each over its label |
| `SwitchField` | `switch-field.tsx` | One setting as a switch with its name and description |
| `ActionItemList` | `action-item-list.tsx` | A short list of outlined items with an icon, title, description, an extra line and stacked actions |
| `IconMeta` | `icon-meta.tsx` | One line of meta text behind a small icon |
| `SegmentMeter` | `segment-meter.tsx` | A percentage as a row of ticks running destructive → warning → success, with the figure |
| `ActivityBars` | `activity-bars.tsx` | A trend as a row of small bars at levels 0–4 |
| `ToneDot` | `tone-dot.tsx` | A dot in a status colour, small in a badge or in place of an icon |
| `InlineFacts` | `inline-facts.tsx` | A few short facts on one line behind an icon, with hairlines between |
| `TwoLineLabel` | `two-line-label.tsx` | A name over a caption, each on one line |

Shared: `lib/text.ts` (title, meta, figure and code text recipes) · `lib/bands.ts` (a card's toolbar and footer bands).

The CLI does not install blocks yet.
