# tyohnn.json

One file at the app root says which system the app wears and where its files are. Agents and the token check read
it; nothing runs it.

```json
{
    "schema": 2,
    "system": "forest-glass",
    "styles": "src/app/tyohnn/styles",
    "imports": [
        "src/app/tyohnn/styles/globals.css",
        "src/app/tyohnn/styles/theme.css",
        "src/app/tyohnn/styles/tokens.css",
        "src/app/tyohnn/styles/typeset.css",
        "src/app/tyohnn/styles/typeset-preset.css",
        "src/app/tyohnn/styles/style.css layer(base)"
    ],
    "source": {
        "kind": "mcp",
        "base": "clover",
        "palette": "clover",
        "accent": "green",
        "chart": null,
        "colours": { "light": {}, "dark": { "primary": "oklch(0.7 0.1 150)" } },
        "tokens": { "--surface-shadow": "none" }
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

`export_system` writes the file with paths relative to the CSS entry (`./tyohnn/styles`). When you move it to the
app root, rewrite `styles` and every `imports` entry to start from the root, as above. `source` stays as is.

`concept.md` stays inside the system folder, next to `styles/`. It is what the system is for; the rule file points
agents at it.
