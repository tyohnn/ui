# Finding a pattern

From `SKILL.md`. Patterns are tyohnn's worked compositions: real screens and screen pieces built from tyohnn
components by the rules in `SKILL.md`. They show how to compose, not what to import: the repo never imports a
pattern, it copies or adapts one into its own blocks.

## 1. Look it up

Call `list_patterns` on the tyohnn MCP server with words for the job ("a list with filters and a record sheet",
"settings page with a form", "chat with tool calls"). Each entry says what it is for and which components it
composes. Pick by the job, not by the name.

Without the MCP server, read `patterns-index.md` beside this file: the same entries, without the code.

## 2. Read the one you need

Call `get_pattern` with its name. It returns the source (TSX) with the patterns and helper modules it builds on, and
the components it composes; the data shape is its props. Read only what the screen needs; the index is there so
the rest stays unread.

## 3. Copy, adapt or write

| The pattern | Then |
|---|---|
| does the job as is | copy it into `<ui>/blocks/<name>/` with what it builds on, rewrite its imports to the repo's paths, and fetch any component it composes with `get_primitive` |
| does most of it | copy it and change what differs; the copy is the repo's, so change it freely |
| shows the idea but not the shape | write the block yourself, keeping the pattern's composition (which parts, data vs pieces, where the UX decisions sit) |

Only copy into blocks what a screen uses now. Screens that use it once keep it beside them (`SKILL.md` rule 3).

## Keep to

- A copied pattern follows `references/blocks.md` from then on, like any block.
- Do not copy a pattern to have it ready. An unused block is deleted at the next count.
- A pattern that taught something worth keeping (a better split, a missing piece) goes back to tyohnn as a
  suggestion, not as an edit to a file the repo does not own.
