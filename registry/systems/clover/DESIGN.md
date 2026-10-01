# clover

A bright back-office system: the screens people keep open all day to approve, file and check. The page
is white paper, the text is a cool grey ink, and one vivid green does every job a signal has — it is the
action, the focus ring and the checked box. Controls are white chips on a hairline, labels are small
tinted rectangles with bold ink of their own hue, people are rounded squares, and tables run 48px rows
under the faintest rule. It suits work that is mostly lists, statuses and forms: people, documents,
approvals, payroll, expenses.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- **Mode**: light first. Dark is a designed counterpart, not an inversion — cool charcoal planes
  (`#15171a` page, `#1c1f23` cards, `#212529` popups) and a brighter green that carries dark ink.
- **Planes and depth**: one white plane. The shell (`--sidebar #fafafa`) and quiet fills
  (`--secondary #f1f3f4`, `--muted #f5f6f7`) are a breath darker, and everything else is separated by a
  hairline (`--border #e8e9eb`) or, between table rows, half of one (`--border-subtle`). Shadows appear
  in exactly two places: 1px under an outlined control, and a wide soft one under anything that floats.
- **Density**: 36px controls with 14px text, 28px for filter chips and buttons inside a row, 40px for
  the one action in a page header. Table rows are 48px under a 44px head; menu rows are 36px.
- **White chips**: inputs, outline buttons, select triggers and unchecked boxes are filled with
  `--background`, not left transparent, so they stay white on the grey bars they usually sit on.
- **Accents**: green is `--primary`, `--ring` and `--checked` at once. The primary button runs from that
  green into teal (`--surface-primary`); nothing else is a gradient. Links and information are blue.
  Status is said with tags.
- **Type**: Inter with Pretendard for Hangul, tracked at -0.01em. Labels on controls and titles are 600;
  the quiet variants, table heads and idle rows are 500. Tags are 11px at 600.

## Key values

| Slot | Value (light) | Meaning |
|---|---|---|
| `--background` / `--foreground` | `#ffffff` / `#242a30` | paper, cool ink |
| `--muted-foreground` · `--foreground-subtle` | `#666f7a` · `#aab1b8` | secondary text; placeholders and switched-off titles |
| `--primary` · `--ring` · `--checked` | `oklch(0.645 0.215 143)` | the one green |
| `--primary-gradient-end` | `oklch(from var(--primary) calc(l + 0.03) calc(c * 0.56) calc(h + 44) / 0.92)` | where the primary button's gradient ends: the primary turned 44° toward cyan |
| `--surface-primary` | `linear-gradient(to right, transparent, var(--primary-gradient-end))` | laid over `--primary`, so hover still shows through |
| `--border` · `--border-subtle` · `--input` | `#e8e9eb` · 55% of it · `#dcdfe2` | hairline, row rule, control edge |
| `--shadow-control` | `0 1px 2px 0 var(--control-shadow-color)` | under outline · secondary buttons and the select trigger |
| `--shadow-float` | `0 12px 32px -8px` at 16% + `0 2px 8px -2px` at 8% | menus, popovers, selects |
| `--control-height-{xs,sm,md,lg}` | `24` · `28` · `36` · `40` | `md` is the default; inputs and selects share it |
| `--control-radius` · `--control-radius-sm` | `8px` · `6px` | buttons and fields; chips |
| `--surface-radius` · `--surface-radius-lg` | `12px` · `16px` | menus, popovers and cards; dialogs |
| `--table-head-height-default` · `--table-cell-padding-y-default` | `44px` · `14px` | a 48px row with 14/20 text |
| `--badge-radius` · `--tag-radius` · `--tag-height` | `5px` · `5px` · `20px` | a label is a small rounded rectangle |
| `--tag-font-weight` | `600` | clover's own slot (see `reference/README.md`) |
| `--avatar-radius` | `32%` | clover's own slot: a rounded square at every size |
| `--control-indicator-size` · `-radius` | `18px` · `5px` | checkbox and radio |
| `--switch-track-width-md` × `-height-md` | `32px` × `18px` | a 14px thumb with a 2px inset |
| `--focus-ring-width` | `3px` | a green edge plus 28% green outside it |

## Combination rules

- **One filled green per view.** The primary button is the page's one action — put it in the header at
  `lg`. Inside rows, toolbars and dialogs' secondary actions use `outline`; reach for `secondary` only for
  a control that adds to a set (a "+ add filter" at the end of a row of chips).
- **Filter chips are `outline` buttons at `sm`** with a leading icon; the bar they sit on is `--sidebar`
  or `--muted`, which is why the chip's fill is white.
- **Tags say status and kind.** The seven tones are a tinted plate, a hairline one step darker and bold
  ink of the same hue. Blue is in progress, green is done, red is rejected, gray is cancelled or neutral;
  purple, orange and yellow are yours to assign, and stay assigned. A plain `secondary` badge is a count.
- **Avatars are rounded squares**, for people and for things alike. A toned fallback
  (`<AvatarFallback data-tone>`) is a pastel plate with one shared ink; use it for a document or category
  tile as well as for initials.
- **Line tabs under a page title** carry the title's sections; the default (segmented) tabs switch views
  inside a card.
- **Tables stay on the page.** No card around a full-width table: the head's rule and the row rules are
  the frame. Selection is a green checkbox and a `--muted` row.

## Do not

- Do not use the gradient anywhere but the primary button. A second gradient makes the action ambiguous.
- Do not fill a second button with green in the same view, and do not use green as a tag's meaning for
  anything but "done" — it already means "act here" and "checked".
- Do not turn labels or avatars back into pills and circles. The 5px rectangle and the rounded square
  are the system's two most recognisable shapes.
- Do not lift cards with a shadow. Shadows mean "this floats above the page"; a card is on the page.
- Do not set long text in white on the green. The pair is 3.05:1 — enough for a bold 14px label on a
  button, below AA for anything else (`validate-system` reports it). A product that needs AA on the
  button wears a deeper theme: colour is a separate axis, and `--primary-gradient-end` follows whatever
  primary it is given.
- Do not put `.dark` below `<html>`: `--shadow-control` and `--surface-primary` resolve on `:root`.

## Files

- `system.json` — name, theme, description, `forkedFrom`, fonts, tags, source.
- `registry/themes/clover.json` — the 72 colours; `styles/theme.css` is generated from it
  (`node tooling/theme/write-css.mjs clover`). Any other theme can be worn on this system.
- `styles/globals.css` (layer 1 formulas and materials) · `styles/tokens.css` (layer 2) ·
  `styles/typeset*.css` · `styles/style.css` + `styles/components/*.css` (layer 3). The rules equal
  foundation's except `avatar.css` and `badge.css`, which read one slot each where foundation has a
  literal.
- `reference/` — the source material is described, not stored.
