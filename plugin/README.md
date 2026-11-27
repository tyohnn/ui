# tyohnn plugin

Shape a design system in words and have every component you write take its feel.

- **create-system**: a concept ("Apple's glass, but in a forest") or a reference image becomes a system across
  colour, density, depth, texture and typography, shaped on real screens in the System view.
- **setup**: puts the system into a repo as files it owns, plus `tyohnn.json`, then hands over to screen-rules so
  the repo keeps it.
- **screen-rules**: how screens are built from the system and how screen decisions stay kept. Writes the
  design-system rule, the repo's `blocks/` folder, a check with a ledger that only shrinks (`check:screens`, run with
  the tests) and a hook that reports written values right after an edit.
- **craft-component**: new components, even ones no system ships, take behaviour from UI SDK and their look from
  `data-role` roles, so they keep working when the system changes.

Words: **components** are tyohnn's parts, copied in and never edited. **Patterns** are tyohnn's compositions of
them, a reference read through the MCP server and never installed. **Blocks** are the repo's own compositions, a
pattern copied or adapted, or one written there.

The skills talk to the tyohnn MCP server (`search_systems`, `read_system`, `draft_system`, `set_colours`,
`set_tokens`, `check_system`, `publish_system`, `export_system`, the primitive tools and `list_patterns` ·
`get_pattern`).

## Install

```
/plugin marketplace add tyohnn/ui
/plugin install tyohnn@tyohnn
```

`.mcp.json` points at the hosted server, `https://tyohnn.vercel.app/api/mcp` (the site's route,
`apps/site/src/app/api/mcp/route.ts`). The hosted server writes no files: `export_system` returns them for the agent
to write. With a database (`SITE_DATABASE_URL`, `supabase/README.md`) it publishes systems and keeps each connection's
work across requests; without one `publish_system` is closed. It never publishes over a published system, since it
cannot tell who published it. To run the server from a checkout instead (it can then write exports straight into a
folder and publish to `.tyohnn/published`, over its own systems too):

```
npm install && npm run build -w @tyohnn/mcp
claude mcp add tyohnn -- node packages/mcp/dist/index.js
```
