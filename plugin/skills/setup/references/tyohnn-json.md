# tyohnn.json

One file at the repo root says which system the apps wear, where its files are and which files tyohnn owns. Agents,
the screen check and setup read it; nothing runs it.

```json
{
    "schema": 2,
    "system": "forest-glass",
    "styles": "packages/ui/src/systems/forest-glass/styles",
    "imports": [
        "packages/ui/src/systems/forest-glass/styles/globals.css",
        "packages/ui/src/systems/forest-glass/styles/theme.css",
        "packages/ui/src/systems/forest-glass/styles/tokens.css",
        "packages/ui/src/systems/forest-glass/styles/typeset.css",
        "packages/ui/src/systems/forest-glass/styles/typeset-preset.css",
        "packages/ui/src/systems/forest-glass/styles/style.css layer(base)"
    ],
    "source": {
        "kind": "mcp",
        "base": "clover",
        "palette": "clover",
        "accent": "green",
        "chart": null,
        "colours": { "light": {}, "dark": { "primary": "oklch(0.7 0.1 150)" } },
        "tokens": { "--surface-shadow": "none" }
    },
    "files": {
        ".claude/rules/design-system.md": "sha256:…",
        "packages/ui/src/CLAUDE.md": "sha256:…",
        "packages/ui/src/blocks/CLAUDE.md": "sha256:…",
        "scripts/check-screens.mjs": "sha256:…",
        "scripts/report-screens.mjs": "sha256:…"
    }
}
```

| Field | Means |
|---|---|
| `schema` | Always 2 |
| `system` | The system's own name (a published id, or a base system's name) |
| `styles` | The styles folder, relative to this file |
| `imports` | The same folder's files in import order, relative to this file. The CSS entry's `@import` lines are these, made relative to the entry |
| `source` | What the system is made of: the base system and every change over it. Pass it back to `draft_system`'s base (by publishing it) to reshape the system later |
| `files` | The files tyohnn owns and replaces when setup runs again, each with its SHA-256 (screen-rules `references/setup.md` step 6) |

`export_system` writes the file with paths relative to the CSS entry. When you move it to the repo root, rewrite
`styles` and every `imports` entry to start from the root, as above. `source` stays as is.

A hash in `files` that no longer matches its file means someone edited a tyohnn file. Before replacing it, say so,
and move the change into the repo's own config (`screen-rules.config.json`) or its own rule file
(`.claude/rules/screens.md`), which tyohnn never touches.
