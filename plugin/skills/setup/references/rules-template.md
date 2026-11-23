# The rule file and the CLAUDE.md line

## `.claude/rules/design-system.md`

Fill in the four placeholders. Widen `paths` to every folder that holds UI.

````markdown
---
paths:
  - "<components folder>/**"
  - "<app folder>/**/*.tsx"
  - "<app folder>/**/*.css"
---

# Design system: <system name>

This app wears the tyohnn system **<system name>**. Its files are in `<styles path>` and what it is for is in
`<system folder>/concept.md`: read that before designing a screen.

## Building UI

- Use the primitives in `<components folder>` (button, input, card, menu …) for what they are.
- For anything they do not cover (a new widget, a one-off panel, a toy like a tape recorder), take behaviour from
  the app's headless library (UI SDK `@ui-sdk/react` or Base UI `@base-ui/react`: focus, keyboard, selection,
  popups, sliders) and the look from roles: put
  `data-role` on each part.

  | data-role | For | Options |
  |---|---|---|
  | control | something you press | `data-variant` primary · secondary · outline · ghost · destructive, `data-size` xs · sm · md · lg, `data-icon` |
  | field | something you type into or pick from | `data-size` sm · md |
  | surface | a plane that holds content | `data-level` ground · raised · inset, `data-density` compact · tight |
  | popup | a plane that floats | |
  | item | one row of a list | `data-size` sm · md · lg, `data-highlighted`, `data-active` |
  | indicator | a state or a count | `data-shape` pill · square, `data-size` sm · md · lg, `data-variant` |
  | label | names a thing | `data-tone="muted"` |
  | meta | the small text beside it | |
  | separator | divides | `data-orientation` |
  | track | a groove that holds controls (tabs, segments) | |

- Utilities are for layout only: flex, grid, gap, width, position. Colour comes from the theme's names
  (`bg-card`, `text-muted-foreground`, `border-border` …). Corners, shadows, heights, paddings and type sizes come
  from the role or, when you need a raw value, `var(--<role token>)` (e.g. `rounded-[var(--surface-radius)]`).
- Never write a literal colour, radius, shadow, font size or control height in a component. If the system has no
  token for what you need, say so instead of inventing a value.

## Changing the feel

Do not edit `<styles path>`. The feel changes through the tyohnn plugin (create-system: shape the tokens, then
export again), so the next export does not undo a hand edit.
````

## The CLAUDE.md line

Add under the section about UI, or at the end:

```markdown
- UI follows the tyohnn system in `tyohnn.json`: build from its primitives and `data-role` roles, never literal colours, radii, shadows or sizes (`.claude/rules/design-system.md`).
```
