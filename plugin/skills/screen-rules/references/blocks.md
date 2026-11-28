# Making and changing blocks

From `SKILL.md`. Blocks are the repo's compositions in `<ui>/blocks/`; changing one changes every screen that uses
it.

## Order of choice

1. A block that does the job. If its shape falls a little short, add a prop or variant to the block instead of
   patching it on the screen. A prop added to an existing block is confirmed with photos of the screens that use it.
2. A pattern that does the job (`references/patterns.md`): copy it into blocks, as is or adapted.
3. Neither: compose from components on the screen.
4. When the same composition repeats past the thresholds (`promote` in `screen-rules.config.json`), promote it.
5. A missing component is the `craft-component` skill's work. Never run a generator (`npx shadcn add`): what it
   writes does not follow the `cn-*` contract.

## What a block may do

- It fetches no data. Rows arrive as props; changes leave as callbacks.
- It knows no domain type (`Order`, `Deal`), only "a record with an id". A composition that needs a domain type is
  an app component.
- It imports no framework module (`next/*`, `server-only`) and no database client.
- It never edits a component to get its shape. It composes; when that fails, the token changes (`create-system`).
- Its values come from tokens. It adds no token of its own; a missing one goes back to the system.

## How a block is built

- The number of pieces decides the shape (`SKILL.md` rule 5). A block that draws rows is config-shaped: a data
  array and config props, with `ReactNode` props only for the slots that vary. It becomes compound only when the
  caller has to arrange the pieces; then sub-components read one context with `use()`.
- Copy goes in `<Name>Labels` with defaults; the caller overrides some of it.
- A block that takes space has a `loading` face in the same component (or a `<Name>Skeleton` beside it) that stands
  without context and keeps the filled state's height and width.
- Files: `<name>.ts` holds pure decisions and calculations (unit tested), `<name>.tsx` the `"use client"`
  component, `index.ts` a grouped object without a directive (`export const DataTable = { Root, Toolbar }`). An
  object exported from a `"use client"` module cannot be dotted into from a server component.
- In a package, a new block adds `./blocks/<name>` to `exports` in `package.json`.
- A block needs no preview page of its own. The e2e of the app that uses it covers its interactions on that screen.

## Variants

A new meaning is one variant value, never a boolean prop:

1. one value in the block's (or component's) variant map, as a `cn-*` class or a `data-*` attribute;
2. its rule in layer 3 CSS, reading a layer 2 token;
3. a token the system lacks goes back through `create-system`.

## Icons

Screens and blocks use semantic names (`IconDelete`, `IconSortAsc`) from the icons module. A missing meaning gets a
name there. The same meaning never gets two pictures, and changing the library touches one folder.

## After a change

Every app that uses the block changed. Run `node scripts/visual/run.mjs` against the baseline and show the person
the screens that changed.
