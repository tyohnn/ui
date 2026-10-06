# mira

mira is the quiet, compact system: neutral greys, small controls, no colour of its own. It is the shadcn
`mira` preset ported whole, and it is also what `registry/foundation` holds — so it is the system to reach
for when a product wants shadcn's own look with nothing added, and the one to fork when a new system should
start from a neutral baseline rather than from another design's opinions.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- **Mode**: both, light first (`defaultMode: "light"`). The dark palette is neutral-950 ground with
  neutral-900 cards, so a card is *lighter* than the page in dark and the same white in light.
- **Planes and depth**: depth is drawn with hairlines, not shadows. Dialogs, alert dialogs and the command
  palette carry a 1px `--ring-subtle` ring and **no** drop shadow (`--dialog-shadow: 0 0 #0000`); cards have
  a ring and no shadow either. Only the genuinely floating surfaces cast anything — popovers and menus
  `shadow-md`, a menu's sub-list `shadow-lg`, the sheet `shadow-lg`, the navigation-menu popup `shadow-sm`.
- **Density**: compact. Controls are 20 / 24 / 28 / 32px (`--control-height-*`, default 28), menu rows have a
  28px floor with 4px of padding, table rows and sidebar items follow the same 28px step. Text is small and
  even: 12px at 19.5px leading across controls and UI text, 10px at 15px for badges, keycaps and shortcuts,
  14px at 20px for titles.
- **Accents**: there is no accent colour. `--primary` is neutral-900 (neutral-200 in dark) and carries every
  emphasis — filled buttons, checked boxes, the selected row (`--checked` is `--primary`). Links use
  `--link`; status colour appears only through `--destructive` and the six status tokens. Charts are the
  neutral ramp (`chartColor: neutral`), five steps of grey, not five hues.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` (dark: `0.145` / `0.985`) | page ground and body text |
| `--primary` | `oklch(0.205 0 0)` (dark: `oklch(0.922 0 0)`) | every emphasis; there is no second accent |
| `--checked` | `var(--primary)` | checked, selected, active — the same weight as a filled button |
| `--control-height-md` | `28px` | the default control step; inputs, selects, toggles and buttons all sit on it |
| `--radius` / `--control-radius` / `--surface-radius` | `0.625rem` (10px) / `8px` / `10px` | controls are one step tighter than surfaces |
| `--control-font-size-md` / `--control-line-height-md` | `12px` / `19.5px` | mira's `text-xs/relaxed`; the fractional leading is the preset's and must not be rounded |
| `--dialog-shadow` | `0 0 #0000` | modals are a ring, not a shadow |
| `--skeleton` | `var(--muted)` | the loading placeholder is the muted plane, nothing darker |

## Combination rules

- **One emphasis per view.** Because `--primary` and `--checked` are the same neutral, a filled button next
  to a selected row reads as two equal claims. Give a screen one filled button and let everything else be
  outline or ghost.
- **Depth by ring, not by shadow.** When a new surface needs separating, add `--ring-subtle` or step the
  background (`--canvas` → `--background` → `--card`). Reaching for a shadow puts it in a different family
  from every other panel in the system.
- **Tags and avatar tones are deliberately colourless.** `--tag-*-bg` all resolve to `--input-fill` and the
  avatar tones to `--muted`, so `data-tone` changes nothing here. That is mira's answer, not an omission: a
  system that wants coloured tags fills those slots.
- **Small text is an axis, not a choice.** Badges, keycaps, shortcuts and `<option>` rows all read
  `--ui-text-xs` / `--ui-line-height-xs`. Do not set a one-off size on one of them.

## Do not

- Do not round the fractional values. `19.5px`, `16.25px`, `15px` and the switch's `16.6px` are what the
  preset renders; each rounding shows up as a half-pixel drift in every row that inherits it.
- Do not give a control `min-height` instead of `height`. Callers size controls with utilities
  (the calendar's `size-(--cell-size)` nav buttons), and `min-height` beats them.
- Do not add a drop shadow to a dialog, an alert dialog, the command palette or a card. Fill
  `--dialog-shadow` in a fork instead.
- Do not introduce an accent hue. A system that needs one is a different system; fork mira and set
  `--primary`, `--checked`, `--ring` and the chart ramp together.
- Do not edit layer-3 rules to change a value. Every difference this system needed from upstream is a slot;
  `registry/foundation/reference/README.md` lists them.

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — the shadcn preset this system was ported from and the comparison record.
