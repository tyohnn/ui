# vega

The classic shadcn look: calm neutral greys, comfortable 36px controls with 14px text, and depth drawn
with hairline rings and the faintest shadow rather than with colour steps. It is the everyday product UI
that most shadcn apps start from — forms, settings, tables and dialogs that should read clearly and stay
out of the way.

vega ports the shadcn create preset `base-vega` (shadcn 4.21.0): style vega, base colour and theme
neutral, chart colours neutral, lucide icons, Inter, radius default. `reference/README.md` records the
sources, the reference app and the comparison results.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Declarations that differ from foundation's mira values
carry a `vega:` comment with the shadcn utility they reproduce; older comments that cite mira describe the
rule's origin.

## Character

- **Mode: both.** Light and dark are the shadcn neutral theme; neither is primary.
- **Planes and depth.** White (light) or neutral-950 (dark) page; cards and popovers keep the page colour
  in light and step to neutral-900 in dark. Surfaces are separated by a 1px `foreground/10` ring, not a
  border colour step. Outlined controls, cards, switches and checkboxes add `shadow-xs`
  (`0 1px 2px rgb(0 0 0 / 5%)`); menus and popovers use `shadow-md`, submenus and sheets `shadow-lg`.
  Dialogs draw only the ring, over a light 10% black backdrop.
- **Density: comfortable.** Controls 24 · 32 · 36 · 40px (xs · sm · default · lg) with 14px text (xs 12px),
  16px icons (xs 12px). Menu rows are 32px (py-1.5 on 20px text), sidebar items 32px, table rows size to
  content with 8px cell padding, badges and kbd 20px, avatars 24 · 32 · 40px.
- **Shape.** `--radius` 10px: controls, menus, selects and popovers 8px, menu items 6px, cards and dialogs 14px,
  alerts and tab lists 10px, badges and tags a pill.
- **Accents.** None beyond the neutral ramp. `--primary` is neutral-900 (light) / neutral-200 (dark) for
  the one primary action; selection (checked checkboxes) uses the same pair. Destructive is red, drawn as
  a tint with red text, never a solid fill. Focus is a 3px ring at 50% of `--ring`.
- **Type.** Inter with the platform's own spacing (letter-spacing `normal` everywhere; only the empty-state
  title is `tracking-tight`). Card titles 16/24, alert-dialog and empty titles 18/28, dialog titles 14px
  at line-height 1.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` · dark `oklch(0.145 0 0)` / `oklch(0.985 0 0)` | page and text |
| `--primary` | `oklch(0.205 0 0)` · dark `oklch(0.922 0 0)` | primary action, checked controls |
| `--ring-focus` | `--ring` at 50% | focus ring colour (width `--focus-ring-width` 3px) |
| `--input-fill` | transparent · dark `input/30` | inputs, selects, checkboxes, OTP slots |
| `--button-outline-fill` · `--button-outline-hover-fill` | `--background` · `--muted` (dark `input/30` · `input/50`) | vega-only: outline button |
| `--shadow-control` · `--shadow-card` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | shadow-xs under outlined controls and cards |
| `--overlay-backdrop` | `oklch(0 0 0 / 10%)` | modal backdrop (with a 4px blur) |
| `--chart-1…5` | neutral ramp `0.87 → 0.269` | charts are grey, not coloured |
| `--control-height-md` · `--control-font-size-md` | 36px · 14px | default control |
| `--menu-item-radius` · `--menu-min-width` | 6px · 144px | menu rows (dropdown menus 128px) |
| `--sidebar-item-spacing` · `--sidebar-group-label-foreground` | 4px · `sidebar-foreground/70` | sidebar rhythm and section labels |
| `--tag-radius` · `--tag-*-bg` | `radius × 2.6` · transparent | tone tags look like the outline badge |

## Combination rules

- One primary button per region; everything else is outline, secondary or ghost. Secondary is flat;
  outline is the one that carries `shadow-xs`.
- `data-tone` tags and toned avatars render exactly like the plain outline badge and fallback. vega has no
  product colours; if a screen needs tone, fork vega and give the tag slots values.
- `data-shape` buttons keep their size radius (8px). vega has no round or pill buttons.
- Cards are `rounded-xl` with 24px padding (16px for `data-size="sm"`); do not nest a card in a card, use
  an `Item` or a bordered section instead.
- Dark mode needs `.dark` on `<html>` (layer-2 compositions resolve on `:root`).

## Do not

- Do not add colour accents, gradients or clay shadows: vega's depth is the ring plus shadow-xs.
- Do not tighten letter-spacing or drop text to 12px in controls; vega's size ladder is height and padding
  at 14px text.
- Do not give dialogs a drop shadow or a dark backdrop (the preset uses a 10% backdrop and a ring only).
- Do not draw destructive actions as solid red fills.
- Do not change the layer-1 neutral values without re-running `tooling/snapshot/compare-shadcn.mjs`.

## Files

- `system.json` — name, description, `forkedFrom`, fonts (Inter, heading inherit, system mono, Pretendard
  for Hangul), icons (lucide), tags, `source` (shadcn preset, version, commit).
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — `README.md` (sources, method, iteration results, exclusions), `preset.json` (the shadcn
  preset config) and `compare-exclusions.json` (read by `tooling/snapshot/compare-shadcn.mjs`).
