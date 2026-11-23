# tyohnn plugin

Shape a design system in words and have every component you write take its feel.

- **create-system**: a concept ("Apple's glass, but in a forest") or a reference image becomes a system across
  colour, density, depth, texture and typography, shaped on real screens in the System view.
- **setup**: puts the system into an app as files it owns, plus `tyohnn.json`, a design-system rule and a line in
  CLAUDE.md, so every agent in the repo builds from it.
- **craft-component**: new components, even ones no system ships, take behaviour from UI SDK or Base UI and their look from
  `data-role` roles, so they keep working when the system changes.

The skills talk to the tyohnn MCP server (`search_systems`, `read_system`, `draft_system`, `set_colours`,
`set_tokens`, `check_system`, `publish_system`, `export_system`, and the primitive tools).

## Install

```
/plugin marketplace add tyohnn/ui
/plugin install tyohnn@tyohnn
```

`.mcp.json` points at the hosted server, `https://tyohnn.vercel.app/api/mcp` (the site's route,
`apps/site/src/app/api/mcp/route.ts`). The hosted server writes nothing: `export_system` returns the files for the
agent to write, and `publish_system` is closed until it has a database. To run the server from a checkout instead
(it can then write exports straight into a folder and publish to `.tyohnn/published`):

```
npm install && npm run build -w @tyohnn/mcp
claude mcp add tyohnn -- node packages/mcp/dist/index.js
```
