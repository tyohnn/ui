# loam

A workspace for makers, lit like a garden at night. The ground is near-black, the sidebar and panes sit one
shade up, and every quieter surface is a thin veil of white laid over whatever is under it, so depth reads as
light rather than as colour. The main action is a white pill, titles and body are both Geist, labels speak
quietly in sentence case, and one sage green says "this is moving", "this has focus" or "this one is checked".

Forked from `nocturne` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Tune values in place.

## Character

- **Mode:** dark first (`defaultMode: dark`). Light is a designed counterpart from the same source, not an
  inversion: a `#f6f6f6` page, white panes and cards, warm ink `#272523`, an ink pill and the sage darkened to
  `#3a7854` for contrast.
- **Planes and depth:** ground `#111111` → sidebar `#171717` → card `#1c1c1c` → raised `#222222` →
  hover-strong `#2a2a2a`. Quieter surfaces are veils of white: fields 6%, the muted fill 3%, chips 8%, the
  selected sidebar row `#262626` (8% white over the sidebar). Hairlines are 8% white, the strong edge 14%.
  Resting cards are flat; popups, dialogs and sheets cast one soft shadow, `0 14px 32px rgb(0 0 0 / 32%)`
  (`rgb(39 37 35 / 12%)` in light).
- **Light from the top left:** panes and cards are lit, not flat. A pane (the floating sidebar, the main area
  beside it) carries `--pane-sheen` — a 4% white ellipse above its top-left corner and a 1.5% one past its
  bottom right — and every card a 3.5% white wash at 135° that fades by 45%. In light the same shapes are a
  faint ink shade.
- **Small floating layers are glass:** menus, selects, comboboxes, the command palette, popovers, hover cards
  and the navigation menu fill at 72% of `--popover` over a 32px blur, so the thumbnail or card behind them
  bleeds through softened, and catch the top-left light a little stronger than a card (6% white). Dialogs,
  sheets and drawers are reading surfaces and stay opaque, and so does a submenu inside a glass menu.
- **Panels on a ground:** with a floating sidebar the workspace is two panels on the `#111` ground, each with
  an edge — the sidebar at 10% white on 12px corners, the main pane at 6% on 18px corners with an 8px gap.
- **Density:** 36px controls with 14px Geist text; pills at 24 · 30 · 36 · 40; compact 30px sidebar rows on
  12px corners; 26px group labels.
- **Accents:** sage `#73b490` (light `#3a7854`) is the signal: focus rings, progress, the slider range, the
  line-tab underline, a checked selection card's edge and chart-1. Hover and highlighted rows stay on the white
  veils. Charts and tags take the rest of the orchard: blueberry `#6e96b8`, gooseberry `#d4a83a`,
  acai `#9b8bb8`, cloudberry `#e5737a`.

## Key values

| Slot | Dark · light | Meaning |
|---|---|---|
| `--background` / `--foreground` | `#111111` / `#d9dcd8` · `#f6f6f6` / `#272523` | the ground and a soft ink; titles go to white through `--card-foreground` weight, not a new colour |
| `--sidebar` · `--card` · `--popover` · `--secondary` | `#171717` · `#1c1c1c` · `#222222` · `#2a2a2a` (light `#fafafa` · `#fff` · `#fff` · `#f0f0f0`) | one shade up at a time |
| `--border` · `--input` | 8% · 14% white (light 10% · 18% of `#272523`) | hairline · fields, outline pills, popup edges |
| `--muted-foreground` · `--foreground-subtle` | `#919191` · `#6e6e6e` (light `#686764` · `#9a9894`) | secondary text · disabled and placeholders only |
| `--primary` / `--primary-foreground` | `#ffffff` / `#111111` · `#2a2a2a` / `#ffffff` | the white (light: ink) pill |
| `--ring` | `#73b490` · `#3a7854` | the sage signal |
| `--bubble-fill` | `var(--secondary)` | the person's chat bubble is a quiet plane, not the pill |
| `--pane-sheen` · `--card-sheen` | white 4% ellipse · white 3.5% at 135° (ink in light) | light from the top left on panes and cards |
| `--glass-fill` · `--glass-filter` · `--glass-sheen` | `--popover` at 72% · `blur(32px) saturate(1.6)` · white 6% at 135° (white 45% in light) | menus, selects, popovers, hover cards and the navigation menu |
| `--card-emphasis-sheen` · `--card-emphasis-radius` | sage 16% glowing down from the top · 24px | a card marked `data-emphasis` |
| `--sidebar-pane-ring` · `--sidebar-pane-gap` · `--sidebar-floating-shadow` | 6% white · 8px · none | the main pane beside a floating sidebar, and the sidebar without a shadow |
| `--sidebar-foreground` · `--sidebar-active-foreground` | `#bdbdbd` · `#ffffff` | idle rows at 72% white, the active row white on its veil |
| `--control-height-md` · `--control-font-size-md` | 36px · 14px | the control |
| `--control-radius` · `--control-radius-field` | 9999px · 12px | pills · fields |
| `--sidebar-item-height` · `--sidebar-item-radius` | 30px · 12px | compact rows |
| `--surface-radius` · `--card-radius` · `--surface-radius-lg` | 12px · 16px · 18px | popups and tooltips · cards · dialogs, drawers, sheets and panes |
| `--title-font-weight` · `--title-letter-spacing` | 600 · -0.01em | Geist surface titles |
| `--typeset-heading-weight` · `--typeset-heading-tracking` | 600 · -0.03em | long-form headings |

## The radius ladder

**pill · 8 · 12 · 16 · 18**, and 24 for the one hero card a page may have.

| Step | Where |
|---|---|
| pill (9999px) | buttons of every variant and size, badges and tags, toggles, toggle-group / segmented items, the default tabs bar and its triggers, switches, sidebar count badges |
| 8px | menu rows and command rows inside a popup |
| 12px | input, textarea, select trigger, native select, combobox, input group, OTP cells, field choice cards; popover, hover card, menus, select and combobox content, tooltip; sidebar items |
| 16px | card, empty state, chat bubble |
| 18px | dialog, alert dialog, command palette, drawer, sheet — and an app's panes |

## Combination rules

- **Emphasis is a glow, not a colour.** The one card a view leads with (a hero, a call to act) takes
  `data-emphasis`: a 24px corner and a sage glow from its top edge. One per view, like the white pill.
- **Use the floating sidebar.** `<Sidebar variant="floating">` turns the main area into a bordered pane beside
  it; that pair is loam's workspace. The plain sidebar still works and draws no panes.
- **One white pill per view.** The primary pill is the one action the view is for; the rest are secondary
  (`#2a2a2a`), outline (the 14% edge, no fill) or ghost pills.
- **Veils, not colours, make depth.** A section inside a pane is the card plane with a hairline; a list of
  things inside a section is one card split by hairlines, each row with a small icon tile, a title and a quiet
  second line, and a small outline pill for its action.
- **Sage marks, it never fills.** Focus is a sage ring; a highlighted menu row is the `#2a2a2a` veil.
  Checked checkboxes, radios and switches take the pill pair, and buttons and badges never go green.
- **The active sidebar row** is its veil (`#262626`) with white text. No bar, no weight change.
- **Geist throughout.** Titles are Geist 600; page-level headings are Geist 600 tracked to -0.03em. Labels
  (sidebar groups, table heads, menu groups) are Geist in sentence case at 13px in the quiet label colour.
- Tags are soft tints of the orchard hues with a slightly stronger edge; status colours (info · success ·
  warning · destructive) are text on a soft fill and read on both grounds.

## Do not

- **Fill anything with sage** — not buttons, badges, checked controls or highlighted rows. Sage is focus,
  progress and indicators.
- **Shadow a resting card.** Cards are veils with a hairline; the soft shadow is for floating surfaces.
- Draw the active sidebar row with a bar or a border. Its fill and its white text are the whole mark.
- Set labels in mono or uppercase. That is nocturne's voice, not loam's.
- Round a field like a pill, or a button like a field: pills act, 12px boxes take input.
- Use `--foreground-subtle` for readable text; it is below AA on purpose.
- Put glass under text people read at length, or stack glass on glass. Dialogs and submenus are opaque.

## Files

- `system.json` — name, description, `forkedFrom`, fonts, tags, source.
- `styles/globals.css` (layer 1) · `styles/theme.css` (generated from `registry/themes/loam.json`) ·
  `styles/tokens.css` (layer 2) · `styles/typeset*.css` · `styles/style.css` + `styles/components/*.css`
  (layer 3).
- `reference/` — what the values were taken from, and the one name loam adds (`--bubble-fill`).
