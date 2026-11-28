# The rule file

`.claude/rules/design-system.md` is one file with two halves: parts and tokens, then screens. It belongs to tyohnn: its hash goes in `tyohnn.json` and setup replaces it. Fill the
placeholders and nothing else. Repo-specific numbers live in `screen-rules.config.json`; the person's own screen
rules go in the repo's `.claude/rules/screens.md`, which tyohnn never touches.

Widen `paths` to every folder that holds UI. Keep it: the file loads only when those files are read or edited.

````markdown
---
paths:
  - "<ui folder>/**"
  - "<app folder>/**/*.{ts,tsx,css}"
---

# Design system: <system name>

This file belongs to tyohnn and is replaced when setup runs again; do not edit it. The repo's own screen rules are
in `.claude/rules/screens.md`, its numbers in `screen-rules.config.json`.

The apps wear the tyohnn system **<system name>**. Its CSS is in `<ui folder>/systems/<system name>/styles/`; what
it is for is in `concept.md` beside it. Read that before designing a screen. Before building or changing a screen,
a form or a block, read the tyohnn `screen-rules` skill.

## Parts

- Use the components in `<ui folder>/components/` for what they are. A missing one comes from `get_primitive`; a
  new kind of part follows the `craft-component` skill: behaviour from UI SDK (`@ui-sdk/react`), look from
  `data-role` roles.
- Components hold no visual values. They carry `cn-*` classes for style and `data-*` attributes for state and
  variants (`data-open`, `data-shape`, `data-tone`). Never hang a style or a screen name on `data-slot`; screen
  names go on `data-panel`.
- Utilities are for layout only: flex, grid, gap, width, position. Colour comes from the theme's names
  (`bg-card`, `text-muted-foreground`, `border-border`). Corners, shadows, heights, paddings and type sizes come
  from the part or `var(--<token>)`.
- Do not edit `components/` or `systems/`. The feel changes through `create-system` and a fresh export.

## Screens

- Build a screen from `<ui folder>/blocks/` first, then from tyohnn's patterns (`list_patterns`, `get_pattern`:
  copy or adapt one into blocks), and from components only when neither fits.
- Choose a shape with a part's variants and write only layout inline. A new meaning is a new variant, never a
  boolean prop and never an override on the screen.
- Fields of a form are placed by the screen as pieces; never pass them as an array.
- A combination moves up by the thresholds in `promote` of `screen-rules.config.json`: beside the screen, then the
  app's `(app)/_components/`, then blocks. Show a new block's shape to the person first.
- A new screen starts as a copy of the exemplar of its kind (`exemplars` in `screen-rules.config.json`).
- `check:screens` stops written radii, shadows, colours, type sizes, px, z-index, `space-*`, hand-drawn SVG and
  direct icon-library imports; its messages say why and what to use instead. The ledger
  (`screens-baseline.json`) only shrinks: fix the screen, never the ledger or `allow`.
- When a screen decision arrives, put it in code, then the check, then an exemplar, and only then prose
  (`.claude/rules/screens.md`, dated). Say in one line where it went.
````

## The CLAUDE.md and AGENTS.md line

Add under the section about UI, or at the end. `AGENTS.md` gets it only when the repo has one or uses Codex.

```markdown
- UI follows the tyohnn system in `tyohnn.json` and the screen rules in `.claude/rules/design-system.md`: blocks, then patterns, then components; no written colours, radii, shadows or sizes (`check:screens`).
```
