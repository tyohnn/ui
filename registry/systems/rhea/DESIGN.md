# rhea

rhea is the shadcn **rhea** preset: a soft, roomy neutral system. Where mira packs a dense
interface into 12px text and 28px controls, rhea gives everything one step more — 14px text,
32px controls, 12px paddings — and rounds it hard: 16px on every control, 24px on a card, 22px
on a popover. Fields are filled and borderless, cards carry a light shadow under a hairline
ring, and focus is a 3px halo. It reads as a calm consumer product rather than a tool.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen
snapshot: every file under `styles/` belongs to this system. Tune values in place.

## Character

- **Mode**: light first, dark complete. `defaultMode` is `light`.
- **Planes and depth**: surfaces separate by radius and shadow, not by borders. A card is a
  hairline `--ring-subtle` (foreground/5 in light, /10 in dark) plus `--shadow-chip`; a menu or
  popover is the same ring plus `--shadow-float` (shadow-lg); a dialog, sheet and drawer add
  `--dialog-shadow` (shadow-xl). The modal scrim is only 30% black with an 8px blur, so the page
  stays visible behind it.
- **Density**: controls are 24 · 28 · 32 · 36 (`--control-height-*`), the menu row 28, the sidebar
  row 32, the badge and keycap 20 (`--control-height-2xs`). Paddings split: buttons and the select
  trigger take 12px (`--control-padding-x-md`), the filled field family 10px
  (`--control-padding-x-field`).
- **Type**: one step above mira everywhere. Control text is 14/20 at every size but xs (12/16).
  UI text runs 12/16 · 14/20 · 14/20 · 16/24. Titles are 16px; the alert dialog and the empty
  state take 18/28 from the heading axis. Letter spacing is `normal`.
- **Accents**: `--primary` is neutral-900 (neutral-200 in dark) — rhea has no hue. Meaning comes
  from fill weight: `--input` at 50% is a field, at 90% a switch track, a checkbox or a slider
  rail. Focus is `--ring-focus` at 3px (`--focus-ring-width`).

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | neutral base, white page |
| `--primary` | `oklch(0.205 0 0)` | neutral-900; the only strong fill |
| `--radius` | `0.625rem` (10px) | rhea's scale is **multiplicative**: `--radius-2xl` is `radius × 1.8`, not `radius + 8px` |
| `--control-radius` | `18px` | `rounded-2xl` — button, input, toggle, switch, badge, skeleton |
| `--surface-radius` | `18px` | menu and select panels |
| `--surface-radius-xl` | `22px` | `rounded-3xl` — popover, hover card, command palette, empty state |
| `--surface-radius-lg` | `24px` | `min(--radius-4xl, 24px)` — card, dialog, drawer |
| `--control-height-md` | `32px` | `h-8`; the input family and the select trigger share it |
| `--input-fill` | `--input` at 50% | every field; `--checkbox-fill` is the same colour at 90% |
| `--input-border` | `transparent` | rhea draws fields with a fill and no border |
| `--focus-ring-width` | `3px` | one halo, no offset |
| `--shadow-float` | shadow-lg | menus, popovers, the navigation-menu viewport |

## Combination rules

- **A field has no border.** Input, textarea, select trigger, native select, input group, combobox
  chips and the sidebar search all read `--input-border: transparent` and sit on `--input-fill`.
  Give a field a border only to signal focus (`--ring`) or invalidity (`--border-invalid`).
- **Radius follows the plane, not the component.** Controls 18, menu rows 14, panels 18, popovers
  22, cards and modals 24. A component that sits *inside* another takes the inner step: a command
  row is 14, the same row inside the command dialog is 18.
- **The sidebar is its own radius scope.** rhea sets `--radius: var(--radius-xl)` on the sidebar
  header and content, so everything inside rounds against 14 rather than 10 — rows are 19.6 and a
  bare Skeleton is 25.2. `sidebar.css` writes that scope out, since tyohnn's radii are px tokens.
- **Tones and shapes change nothing.** rhea has no `data-tone` palette and no `data-shape`: a toned
  badge looks like the outline badge and a shaped button keeps its size radius.

## Do not

- Do not give a field a resting border; the fill is the affordance.
- Do not mix radius steps inside one plane — a 14px control next to an 18px one reads as a bug.
- Do not add a second shadow to a card. The ring plus `--shadow-chip` is the whole depth language;
  anything heavier belongs to a modal.
- Do not lower `--focus-ring-width` below 3px; with no control borders it is the only focus signal.
- Do not reach for `--control-padding-x-md` on a field. Fields take `--control-padding-x-field`.

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — the preset's source links, the comparison record and its exclusions.
