# halo

A system for heads-up interfaces: surfaces that float over something alive — a moving wave, or the user's own
desktop — instead of sitting on a page. Every surface is dark smoked glass that lets the scene behind it glow
through, media sits edge to edge at the top of a card with a bold title and a quiet meta line under it, and one
sky blue is the only signal. It is calm at a distance and readable up close.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- **Mode: dark first.** The HUD lives on a night-navy ground. Light is a designed daylight counterpart with the
  same sky signal and ink-navy actions, not an inverted night.
- **Planes and depth: everything floats, so everything is glass.** Unlike `cirrus` — where only floating layers
  are frosted and cards stay opaque — a halo card is itself a window over a live background. Depth comes from
  the glass (78% fill, 28px blur, 1.5 saturation), a long soft shadow and one line of light on the top edge;
  the edge is a 10% foreground ring, never a solid border.
- **Density: a step larger than mira.** A HUD is read from a distance: controls are 32px, body text 13px,
  card titles 15px at 600, meta lines 11–12px.
- **Accents:** sky blue is the primary action, focus ring, checked state and link. Violet, amber, emerald and
  rose — the board hues of the product it came from — sit beside the sky in charts and tags at the same
  lightness, so no category shouts over another.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(0.13 0.014 255)` / `oklch(0.945 0.012 245)` (dark) | night-navy ground, pale ink |
| `--card` | `oklch(0.19 0.015 255)` (dark) | the glass's colour; drawn at 78% over the scene |
| `--primary` | `oklch(0.85 0.09 232)` (dark) | pale sky — the one signal |
| `--checked` | `oklch(0.83 0.1 230)` (dark) | selection shares the signal |
| `--control-height-md` | `32px` | the HUD's control row |
| `--surface-radius` | `20px` | windows, cards, popovers; groups and dialogs take 22px |
| `--surface-padding-md` | `14px` | a window's inner margin |
| `--glass-card-fill` · `--glass-card-filter` | card 78% · `blur(28px) saturate(1.5)` | the window glass |
| `--glass-fill` · `--glass-filter` | popover 82% · `blur(28px) saturate(1.5)` | menus, popovers, dialogs, sheets |
| `--card-title-font-weight` | `600` | titles read before meta lines |

## Combination rules

- **Media first.** A card whose first child is an `img`, `video`, `picture` or an element with `data-media`
  drops its top padding and runs the media edge to edge (`--card-image-radius` rounds its top corners). Put
  the title (`CardTitle`) and one meta line (`CardDescription`: source · count · when) under it. The media is
  what the card *is*; do not caption it with the same words.
- **A tab above, not a header inside.** Where a card needs a label and actions (which board it belongs to,
  open, dismiss), set them as a small tab floating just above the card rather than a header row inside it, so
  the card still begins with its media.
- **One glass at a time.** A surface floating inside a glass surface (a sub-menu, a popover in a dialog) stays
  opaque — `backdrop-filter` creates a stacking context and two blurs cost repaint for the same picture.
- **Hues are labels, not status.** Board hues mark which collection a card belongs to. Use `info` · `success`
  · `warning` · `destructive` for status.

## Do not

- Do not drop a glass fill below 72%. Behind text, a thinner glass lets the scene cut the contrast.
- Do not give cards a solid border or a coloured edge stripe; the 10% ring and the shadow are the edge.
  A coloured stripe makes a window read as a card in a list.
- Do not use the sky for decoration. If everything is sky, nothing is the signal.
- Do not lay glass on a flat colour and call it done — without something behind it, glass is only a grey. Check
  it over the real scene (a wave, a photograph, a desktop).

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3). Layer 3 differs from foundation in five files:
  `card.css` (glass window, edge media beyond `img`, title weight slot) and `_surface-family.css` ·
  `_menu-family.css` · `select.css` · `navigation-menu.css` (glass floating layers, as in `cirrus`).
- `reference/` — source material (screenshots are described, not stored, when they are not files).
