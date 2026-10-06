# luma

The soft end of the shadcn neutral family: nothing is drawn with a line. Inputs, selects, switches and
checkboxes are tinted fills with a transparent border; cards and dialogs are big 26px rounds carried by a
hairline ring and a real shadow; buttons and tab bars are pills. Controls are comfortable — 36px with 14px
text — and the rhythm around them is generous, so a luma screen reads as calm and modern rather than dense.
It suits consumer-facing product surfaces: onboarding, settings, dashboards that should feel friendly.

luma ports the shadcn create preset `base-luma` (shadcn 4.21.0): style luma, base colour and theme neutral,
chart colours neutral, lucide icons, Inter, radius default. `reference/README.md` records the sources, the
reference app and the comparison results.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Declarations that differ from foundation's mira values
carry a `luma:` comment with the shadcn utility they reproduce; older comments that cite mira describe the
rule's origin.

## Character

- **Mode: both.** Light and dark are the shadcn neutral theme; neither is primary.
- **Planes and depth.** White (light) or neutral-950 (dark) page. Surfaces are separated by a 1px
  `foreground/5` ring in light (`/10` in dark) plus a shadow, never by a border colour step: cards carry
  `shadow-md`, menus · popovers · select surfaces · the navigation menu `shadow-lg`, dialogs · drawers ·
  sheets `shadow-xl`. The modal backdrop is a light 30% black with an 8px blur.
- **No borders on inputs.** Input, textarea, select, native select, OTP slot, combobox chips, input group
  and the questionnaire input all draw a transparent border and a `bg-input/50` fill; the unchecked
  checkbox, radio, switch track and slider track are `bg-input/90`. The shape comes from the fill, not a line.
- **Density: comfortable.** Controls 24 · 32 · 36 · 40px (xs · sm · default · lg) with 14px text (xs 12px)
  and 16px icons (xs 12px). Menu rows are `py-2` on 20px text, sidebar items 36px, table heads 48px with
  12px cell padding, badges 20px, kbd 22px, avatars 24 · 32 · 40px.
- **Shape.** `--radius` 10px multiplied, not offset: sm 6 · md 8 · lg 10 · xl 14 · 2xl 18 · 3xl 22 · 4xl 26.
  Buttons, button groups and input groups take 26; inputs, selects, popovers and menus 22; menu rows, items,
  alerts, skeletons and the empty state 18; tooltips and sidebar rows 14. Tab bars, tab triggers, switches,
  sliders, progress bars and the alert-dialog icon are pills.
- **Accents.** None beyond the neutral ramp. `--primary` is neutral-900 (light) / neutral-200 (dark) for the
  one primary action and for checked controls. Destructive is red, drawn as a tint with red text. Focus is a
  3px ring at 30% of `--ring`, and the focused control's own border turns to `--ring`.
- **Type.** Inter with the platform's own spacing (letter-spacing `normal`; only the empty-state title is
  `tracking-tight`). Body and control text 14/20; badges, kbd, shortcuts, chart labels, table-adjacent meta
  and sidebar group labels 12/16; card · dialog · sheet · drawer · popover titles 16/24; alert-dialog and
  empty titles 18/28. The dialog title alone is `leading-none`.

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` · dark `oklch(0.145 0 0)` / `oklch(0.985 0 0)` | page and text |
| `--primary` | `oklch(0.205 0 0)` · dark `oklch(0.922 0 0)` | primary action, checked controls |
| `--input-fill` | `input/50` in both modes | inputs, selects, OTP slots, chips, the sidebar search |
| `--checkbox-fill` · `--slider-track-fill` | `input/90` | unchecked checkbox · radio · switch track · slider track |
| `--input-border` | `transparent` | luma-only: the input family draws no line |
| `--ring-subtle` | `foreground/5` · dark `foreground/10` | the hairline ring under every surface |
| `--ring-focus` | `--ring` at 30% (width `--focus-ring-width` 3px) | focus ring |
| `--shadow-card` · `--shadow-float` · `--dialog-shadow` | shadow-md · shadow-lg · shadow-xl | the three depths |
| `--overlay-backdrop` | `oklch(0 0 0 / 30%)` with an 8px blur | modal backdrop |
| `--chart-1…5` | neutral ramp `0.87 → 0.269` | charts are grey, not coloured |
| `--control-height-md` · `--control-font-size-md` | 36px · 14px | default control |
| `--control-radius` · `--control-radius-sm` · `--card-radius` · `--surface-radius` | 26 · 22 · 26 · 22 | the button family · the input family · cards · popovers |
| `--menu-item-radius` · `--menu-min-width` · `--menu-item-padding-y` | 18px · 192px · 8px | menu rows (select and combobox surfaces are 144px) |
| `--sidebar-item-height` · `--sidebar-item-radius` | 36px · `calc(--radius × 1.4)` | the sidebar raises its own `--radius` to 14, so its rows round to 19.6 |
| `--tag-radius` · `--tag-*-bg` | 22px · transparent | tone tags look like the outline badge |

## Combination rules

- One primary button per region; everything else is outline, secondary or ghost. The outline button is the
  only one with a visible line, and in dark it is transparent rather than filled.
- `data-tone` tags and toned avatars render exactly like the plain outline badge and fallback. luma has no
  product colours; if a screen needs tone, fork luma and give the tag slots values.
- `data-shape` buttons keep their size radius (26px). luma has no round or pill buttons — the default
  already reads as a pill at control height.
- Cards are 26px rounds with 24px padding (16px for `data-size="sm"`) and a `shadow-md`; do not nest a card
  in a card, use an `Item` or a bordered section instead.
- Keep the fills. A luma control without its `bg-input/*` fill has no shape at all, because there is no
  border to fall back on.
- Dark mode needs `.dark` on `<html>` (layer-2 compositions resolve on `:root`).

## Do not

- Do not give inputs, selects or checkboxes a border: `--input-border` is transparent on purpose and the
  fill carries the shape.
- Do not flatten the shadows to one step. The md → lg → xl ladder is how luma separates a card from a menu
  from a dialog; with a 5% ring that is the only depth cue.
- Do not tighten the radii toward mira's 8px. The 26/22/18 ladder is the preset's identity, and the sidebar's
  larger local `--radius` depends on the multiplied scale.
- Do not add colour accents, gradients or clay shadows.
- Do not change the layer-1 neutral values without re-running `tooling/snapshot/compare-shadcn.mjs`.

## Files

- `system.json` — name, description, `forkedFrom`, fonts (Inter, heading inherit, system mono, Pretendard
  for Hangul), icons (lucide), tags, `source` (shadcn preset, version, commit).
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — `README.md` (sources, method, iteration results, exclusions, foundation slot candidates),
  `preset.json` (the shadcn preset config) and `compare-exclusions.json` (read by
  `tooling/snapshot/compare-shadcn.mjs`).
