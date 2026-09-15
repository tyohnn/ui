# {{name}}

One paragraph: what this design system is for and what it feels like.

Forked from `{{from}}` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- Mode: dark first / light first / both.
- Planes and depth: how surfaces are separated (colour steps, borders, shadows).
- Density: control height, table row, sidebar item, tag.
- Accents: which colour means what (primary action, selection, links, status).

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | | |
| `--primary` | | |
| `--selection` | | |
| `--control-height-md` | | |

## Combination rules

How components are meant to be combined in this system (tags, avatars, clay, tones …).

## Do not

- …

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — source material (screenshots are described, not stored, when they are not files).
