# <ui folder>/blocks

Loads when a block is read or edited. This file belongs to tyohnn and is replaced when setup runs again. Blocks are
the repo's own compositions of tyohnn components: patterns copied as they are, adapted, or written here. They are
the repo's to change.

## When a block is made

- **Only past the thresholds** in `promote` of `screen-rules.config.json` (default: two apps and three places). One
  screen's composition stays in its `_components/`, one app's in `(app)/_components/`. A block with one user sets
  its props to that screen.
- **Look for a pattern first** (`list_patterns`, `get_pattern` on the tyohnn MCP server): copy or adapt it rather
  than starting blank. Show a new block's shape to the person before making it.
- **When a block falls a little short, widen the block** (a prop or variant), never patch it on the screen.

## What a block may do

- It fetches no data: rows as props, changes as callbacks.
- It knows no domain type, only "a record with an id". A block that needs one is an app component.
- ❌ `apps/*`, domain packages, database clients, `server-only`, `next/*`.
- It never edits a component to get its shape. It composes; when that fails, the token changes.

## Conventions

1. **The number of pieces decides the shape.** Rows of one shape: a data array and config props, with `ReactNode`
   props only for slots that vary. Compound only when the caller must arrange the pieces; sub-components read one
   context with `use()`. Do not make a config block compound in advance.
2. **Form fields are placed by the screen.** A block holds the frame around them, one field's place (`FormFields`,
   `FormField`) and single input parts, never a branch per field kind.
3. **Values are tokens.** A block adds no token; a missing one goes back to the system.
4. **Copy goes in `<Name>Labels`** with defaults the caller can partly override.
5. **A block that takes space has a `loading` face** that stands without context and keeps the filled size.
6. **`.ts` is pure (unit tested), `.tsx` is the `"use client"` component.** `index.ts` exports a grouped object
   without a directive.
7. In a package, a new block adds `./blocks/<name>` to `exports`.

## Tests

Pure modules get unit tests; interactions are covered by the e2e of the app that uses the block, on its screen. A
change here changes every screen that uses the block: after a wide one, compare with `node scripts/visual/run.mjs`.
