# nova

Geist on the shadcn neutral ramp, one step roomier and one step softer than mira: 32px controls with 14px
text, 10px corners on every control and 14px on cards and dialogs, and a 3px focus ring at 50%. Depth is a
hairline `foreground/10` ring plus a `muted/50` band under card and dialog footers — no drop shadows on the
page itself. It is the friendly product default: forms, dialogs and dashboards that read comfortably at a
normal reading distance.

nova ports the shadcn create preset `nova` (shadcn 4.21.0): style nova, base colour and theme neutral,
chart colours neutral, lucide icons, Geist, radius default, `menuAccent` subtle, `menuColor` default,
`rtl` false. `reference/README.md` records the sources, the reference app and the comparison results.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Declarations that differ from foundation's mira values
carry a `nova:` comment with the shadcn utility they reproduce; older comments that cite mira describe the
rule's origin.

## Character

- **Mode: both.** Light and dark are the shadcn neutral theme; `defaultMode` is light.
- **Planes and depth.** White (light) or neutral-950 (dark) page; cards and popovers keep the page colour
  in light and step up in dark. Surfaces are separated by a 1px `foreground/10` ring. Menus and popovers
  carry `shadow-md`, submenus and sheets `shadow-lg`, the selected tab of a default tab list `shadow-sm`;
  dialogs draw only the ring over a 10% black backdrop with a 4px blur. Card and dialog **footers** are
  their own `muted/50` band with a top border, bleeding to the surface's bottom corners.
- **Density: comfortable.** Controls 24 · 28 · 32 · 36px (xs · sm · default · lg) with 14px text
  (sm 12.8px, xs 12px) and 16px icons (sm 14, xs 12). Menu rows are py-1 on 20px text, palette rows py-1.5,
  sidebar items 32px, table rows size to content with 8px cell padding, badges and kbd 20px, avatars
  24 · 32 · 40px.
- **Shape.** `--radius` 10px: controls, menus, popovers, alerts and tab lists 10px; the sm control step,
  menu rows, tab triggers and the calendar cell 8px; cards, dialogs, drawers, bubbles and attachments 14px;
  the command palette 14px; toasts 18px; badges `rounded-4xl` (26px); progress, slider and switch pills.
- **Accents.** None beyond the neutral ramp. `--primary` is neutral-900 (light) / neutral-200 (dark) for
  the one primary action and for checked controls. Destructive is red drawn as a tint with red text, never
  a solid fill. Focus is a 3px ring at 50% of `--ring` plus a `--ring` border.
- **Type.** Geist with the platform's own spacing (letter-spacing `normal`; only the empty-state title is
  `tracking-tight`). Body and controls 14/20, small UI 12/16. Card, dialog, sheet, drawer and questionnaire
  titles 16px (dialog at line-height 1, card and questionnaire `leading-snug`); the popover title stays at
  14/20.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` · dark `oklch(0.145 0 0)` / `oklch(0.985 0 0)` | page and text |
| `--primary` | `oklch(0.205 0 0)` · dark `oklch(0.922 0 0)` | primary action, checked controls |
| `--radius` | `0.625rem` (10px), scale `× 0.6 · 0.8 · 1 · 1.4 · 1.8 · 2.2 · 2.6` | every corner in the system |
| `--ring-focus` | `--ring` at 50% (width `--focus-ring-width` 3px) | focus ring |
| `--input-fill` · `--input-fill-disabled` | transparent · dark `input/30` · disabled `input/50` (dark `input/80`) | inputs, selects, OTP slots |
| `--button-outline-fill` · `--button-outline-border` | `--background` · `--border` (dark `input/30` · `--input`) | outline button |
| `--overlay-backdrop` | `oklch(0 0 0 / 10%)` with a 4px blur | modal backdrop |
| `--border-subtle` | `var(--border)` | separators are the full border colour |
| `--control-height-md` · `--control-font-size-md` | 32px · 14px | default control |
| `--control-radius` · `--control-radius-sm` | 10px · 8px | control corners; the sm step is one lower |
| `--menu-item-radius` · `--menu-min-width` · `--menu-item-gap` | 8px · 144px · 6px | menu rows |
| `--command-item-radius` · `--command-item-gap` | 6px · 8px | palette rows (Command · Combobox) |
| `--badge-height` · `--badge-radius` · `--kbd-height` | 20px · 26px · 20px | badges and keycaps sit below the xs control |
| `--tabs-trigger-active-shadow` | `shadow-sm` | selected tab of the default list |
| `--chart-1…5` | neutral ramp | charts are grey, not coloured |

## Combination rules

- One primary button per region; everything else is outline, secondary or ghost. Outline is the variant
  that carries a fill (`--background` in light, `input/30` in dark).
- Card and dialog footers are bands: put actions in them and nothing else; they bleed to the surface edge.
- `data-tone` tags and toned avatars render exactly like the plain outline badge and fallback. nova has no
  product colours; if a screen needs tone, fork nova and give the tag slots values.
- `data-shape` buttons keep their size radius. nova has no round or pill buttons.
- Inside a `ButtonGroup` the xs and sm buttons take the group's 10px radius, not their own 8px.
- Dark mode needs `.dark` on `<html>` (layer-2 compositions resolve on `:root`).

## Do not

- Do not add colour accents, gradients or clay shadows: nova's depth is the ring, the footer band and the
  menu shadows.
- Do not drop control text to 12px to save space; nova's size ladder is height and padding at 14px text
  (only the sm step steps down, to 12.8px).
- Do not give dialogs a drop shadow or a dark backdrop (the preset uses a 10% backdrop and a ring only).
- Do not draw destructive actions as solid red fills.
- Do not round badges to a full pill; nova's badge is `rounded-4xl` (26px), which reads round only at the
  badge's own height.
- Do not change the layer-1 neutral values or the radius scale without re-running
  `tooling/snapshot/compare-shadcn.mjs`.

## Files

- `system.json` — name, description, `forkedFrom`, fonts (Geist, heading inherit, system mono, Pretendard
  for Hangul), icons (lucide), tags, `source` (shadcn preset, version, commit).
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — `README.md` (sources, method, iteration results, exclusions), `preset.json` (the shadcn
  preset config) and `compare-exclusions.json` (read by `tooling/snapshot/compare-shadcn.mjs`).
