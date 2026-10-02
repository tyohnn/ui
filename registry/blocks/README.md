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

## Layout

    registry/blocks/<name>.tsx     one block (kebab-case file, PascalCase export)
    registry/blocks/lib/           what blocks share (text recipes)

Blocks import each other and their helpers as `@tyohnn/blocks/*`, and components as `@tyohnn/components/*`.

## Blocks

| Block | File | What it is |
|---|---|---|
| `PageHeading` | `page-heading.tsx` | A page body's title, one meta line, and the page actions on the other side |
| `MetricCards` | `metric-cards.tsx` | A row of small cards: label, figure, change as a trend badge, one line of context |
| `DataTableCard` | `data-table-card.tsx` | A table in a card that scrolls inside: tabs with counts, toolbar controls, a bulk-action bar while rows are selected, summary and pages in the footer |
| `TableSearch` · `TableFilter` | `table-filters.tsx` | The search field and one select filter of a table toolbar |
| `RowMenu` | `row-menu.tsx` | One row's actions behind a "more" button, in groups |
| `Person` | `person.tsx` | A small avatar with a name and one line of detail |

The CLI does not install blocks yet.
