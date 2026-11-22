# Checking a system

`check_system` reports three kinds of finding.

| Kind | Means | Fix |
|---|---|---|
| contrast | a palette pair is below WCAG AA (4.5:1) in one mode; under 3:1 it blocks publishing | darken or lighten the foreground of that pair in that mode with `set_colours` (`light` or `dark`), keeping the hue; do not change the background unless the whole palette is off |
| reach | a component slot is set where, in the base, it only points at a role token | set the role token the finding names instead, and pass `null` for the slot. Keep the slot only if this one component should differ on purpose |
| concept | no draft, or a concept of a line or less | `draft_system` again with the full concept and `keep: true`, which keeps every change made so far |

Beyond the findings, look at the System view's screens:

- **Every screen, both modes.** A token that looks right on the dashboard may crowd a form. Switch screens and modes.
- **The quietest surface.** Settings and forms show density and field texture; menus show item rows and popup depth.
- **Focus.** Tab through a form in the view: the focus ring must be visible on every surface colour.
- **Nothing doubled.** Glass with a heavy shadow and a thick border reads as three ideas. One material per depth step.
