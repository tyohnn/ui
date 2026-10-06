# maia

The round, roomy end of the shadcn neutral family. Every control is a 26px round — buttons, inputs, selects,
switches, the OTP box, the progress bar — so at 36px control height they read as soft capsules rather than
boxes; the surfaces behind them step down to 18px cards and menus with a 14px menu row inside. Controls carry
14px text and 16px icons, the focus ring is three pixels wide, and the spacing around everything is generous:
24px dialogs, `py-2` menu rows, 48px table heads. maia is the friendly, legible default — marketing surfaces,
settings, consumer dashboards — where mira is the compact one.

maia ports the shadcn create preset `base-maia` (shadcn 4.21.0): style maia, base colour and theme neutral,
chart colours neutral, **hugeicons**, **Figtree**, radius default. `reference/README.md` records the sources,
the reference app and the comparison results.

Forked from `foundation` (see `system.json` → `forkedFrom`). This folder is a complete, frozen snapshot:
every file under `styles/` belongs to this system. Declarations that differ from foundation's mira values
carry a `maia:` comment with the shadcn utility they reproduce; older comments that cite mira describe the
rule's origin.

## Character

- **Mode: both.** Light and dark are the shadcn neutral theme; neither is primary.
- **Planes and depth.** White (light) or neutral-950 (dark) page. A surface is a 1px `foreground/5` ring plus
  `shadow-2xl` — one deep, wide shadow for menus, popovers, select surfaces, hover cards and the navigation
  menu. The card is the exception: it keeps `foreground/10` and no shadow. Dialogs and alert dialogs carry the
  ring alone over an 80% backdrop with a 4px blur. Only two surfaces sit outside the family: the Command
  palette (no shadow) and the chart tooltip (`shadow-xl`).
- **Density: comfortable.** Controls 24 · 32 · 36 · 40px (xs · sm · default · lg) with 14px text (xs 12px) and
  16px icons (xs 12px). Menu rows are `py-2` on 20px text with a 192px minimum, sidebar items 36px, table
  heads 48px with 12px cell padding, badges 20px, kbd 20px, avatars 24 · 32 · 40px.
- **Shape.** `--radius` 10px multiplied, not offset: sm 6 · md 8 · lg 10 · xl 14 · 2xl 18 · 3xl 22 · 4xl 26.
  The whole control family takes 26 — buttons, inputs, selects, native selects, OTP slots, combobox chips and
  chip boxes, toggles, input groups, the questionnaire choice and input, the badge; dialogs · drawers · the
  Command palette 26; cards · menus · popovers · items · the navigation menu · toasts · attachments 18; the
  chat bubble 22; menu rows, tab triggers, textareas, the field card, attachment media 14; the empty state and
  the Command row drop back to 10. Switches, sliders, progress bars, avatars and the questionnaire keycap are
  pills. **The sidebar raises its own `--radius` to 14** (`[--radius:var(--radius-xl)]` on the header and the
  scroller), so its menu buttons round to 14 and everything else inside to 11.2.
- **Accents.** None beyond the neutral ramp. `--primary` is neutral-900 (light) / neutral-200 (dark) for the
  one primary action, for checked controls and for the slider thumb's border. Destructive is red, drawn as a
  tint with red text. Focus is a **3px** ring at 50% of `--ring` and the control's own border turns to
  `--ring`; the slider thumb alone takes a 4px ring.
- **Type.** Figtree with the platform's own spacing (letter-spacing `normal`). Body and control text 14/20;
  badges, kbd, shortcuts, chart labels, menu labels, message meta, sidebar group labels and the sidebar's sm
  rows 12/16; card · dialog · sheet · drawer · popover · questionnaire titles 16/24; alert-dialog and empty
  titles 18/28. The dialog title alone is `leading-none`; the chat bubble is `leading-relaxed` (22.75px).

## Key values

| Slot | Value | Meaning |
|---|---|---|
| `--background` / `--foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` · dark `oklch(0.145 0 0)` / `oklch(0.985 0 0)` | page and text |
| `--primary` | `oklch(0.205 0 0)` · dark `oklch(0.922 0 0)` | primary action, checked controls, slider thumb border |
| `--input-fill` · `--button-outline-fill` | `input/30` in **both** modes | inputs, selects, OTP slots, chip boxes, the outline button |
| `--sidebar-input-fill` | `--background` | maia's sidebar search is the page colour, not a tint |
| `--ring-subtle` · `--card-ring` · `--menu-ring` | `foreground/5` · `foreground/10` · `/5`, dark `/10` | the hairline under a floating surface · under a card · under the Dropdown Menu and Menubar |
| `--ring-focus` | `--ring` at 50% (width `--focus-ring-width` **3px**) | focus ring |
| `--shadow-float` | `shadow-2xl` | every floating surface |
| `--overlay-backdrop` | `oklch(0 0 0 / 80%)` with a 4px blur | modal backdrop |
| `--chart-1…5` | neutral ramp `0.87 → 0.269` | charts are grey, not coloured |
| `--control-height-md` · `--control-font-size-md` · `--control-icon-size-md` | 36px · 14px · 16px | default control |
| `--control-radius` | 26px | the whole control family, and the badge (`--badge-radius`) |
| `--surface-radius` · `--surface-radius-lg` | 18px · 26px | cards · menus · popovers · items ‖ dialogs · drawers · Command |
| `--menu-item-radius` · `--menu-min-width` · `--menu-item-padding-y` · `--menu-item-gap` | 14px · 192px · 8px · 10px | menu rows (select · combobox · sub-menus are 144px wide) |
| `--sidebar-item-height` · `--sidebar-item-radius` · `--sidebar-part-radius` | 36px · 10px (14 in the scroller) · 8px (11.2 in the scroller) | the sidebar's two radius steps |
| `--tag-radius` · `--tag-*-bg` | 9999px · transparent | tone tags look like the outline badge |

## Combination rules

- One primary button per region; everything else is outline, secondary or ghost. maia's outline button is
  filled (`bg-input/30`) in **both** modes, so it reads as a real second-rank action, not a ghost.
- `data-tone` tags and toned avatars render exactly like the plain outline badge and fallback. maia has no
  product colours; if a screen needs tone, fork maia and give the tag slots values.
- `data-shape` buttons keep their size radius (26px). maia has no round or pill buttons — the default already
  reads as a capsule at control height.
- Cards are 18px rounds with 24px padding (16px for `data-size="sm"`), a `foreground/10` ring and no shadow;
  do not nest a card in a card, use an `Item` (also 18px) or a bordered section.
- Icons are **hugeicons**. They draw on a 24px box like every library in `@tyohnn/icons`, and CSS sizes them;
  do not pass a size at the call site.
- Dark mode needs `.dark` on `<html>` (layer-2 compositions resolve on `:root`).

## Do not

- Do not collapse the 26 / 18 / 14 ladder toward one radius. The capsule control against the softer surface
  against the tighter menu row is maia's whole shape language, and the sidebar's local `--radius` depends on
  the multiplied scale.
- Do not narrow the focus ring to 2px. Three pixels at 50% is the preset's only strong signal on a page with
  no accent colour.
- Do not flatten `--shadow-float`. `shadow-2xl` under a 5% ring is what separates a menu from the page; with
  a lighter shadow the hairline is not enough.
- Do not swap Figtree for a metrically different face without re-checking `--control-*` and `--ui-*`: every
  box in the comparison is measured against its glyph advances.
- Do not add colour accents, gradients or clay shadows.
- Do not change the layer-1 neutral values without re-running `tooling/snapshot/compare-shadcn.mjs`.

## Files

- `system.json` — name, description, `forkedFrom`, fonts (Figtree, heading inherit, system mono, Pretendard
  for Hangul), icons (hugeicons), tags, `source` (shadcn preset, version, commit).
- `styles/globals.css` (layer 1) · `styles/tokens.css` (layer 2) · `styles/typeset*.css` ·
  `styles/style.css` + `styles/components/*.css` (layer 3).
- `reference/` — `README.md` (sources, method, iteration results, exclusions, foundation slot candidates),
  `preset.json` (the shadcn preset config) and `compare-exclusions.json` (read by
  `tooling/snapshot/compare-shadcn.mjs`).
