# vellum — reference

There is no reference app for this system: it was not ported from a shadcn preset, so
`compare-shadcn.mjs` has nothing to compare against. Its checks are the render checks
(`check-coverage.mjs --system vellum` in both modes, `check-templates.mjs`) and, for any later change,
an A/B of the computed values against the build before it (`compare-computed.mjs --dump` / `--diff`).

## Source material

Screens of a legal AI workspace, shared by the owner on 2026-09-18 (a matter workspace with a task
panel, an admin command centre with usage charts, a review queue, a first-pass review panel, a shared
client connection and a wide review table).

**What was taken**: design values only.

- the warm parchment shell (the rail and the inset's gutter) around a white document surface, and the
  hairline that separates what sits on it
- the serif-over-sans pairing for headings, and how large the headings run against 13px body text
- ink as the primary action, with one deep teal for focus, links and the first chart series
- small rounded-rectangle labels rather than pills
- the table rhythm: a short head, tight cells, many rows visible at once

**What was not taken**: no marks or wordmarks, no product or feature names, no screen layouts, no copy,
no component anatomy. Nothing in `styles/` reproduces a screen from the reference; the components are
`registry/ui`'s, the same set every system renders.

## Values that are ours, not read off a screen

The screenshots are images, not source, so no number in this system was measured from them. Every value
was chosen deliberately in that register and is documented in `DESIGN.md`:

- the palette is authored in oklch (`registry/themes/vellum.json`), warm-tinted throughout
  (hue 70–85 for the neutrals, 192 for the teal), and passes AA on every pair `checkContrast` tests;
- the density and shape steps are named in `DESIGN.md` → Key values, each with what it replaced in mira.
- the chart colours are one ordinal ramp, checked as one (2026-10-02): a single hue, lightness in
  order, steps at least 0.06 L apart, and the faintest step at least 2:1 on the page and on a card, in
  both modes. The first set (three teals and two warm greys) was neither a ramp nor a categorical
  palette: its neighbours measured ΔE 11 against a floor of 15, and in dark its lightness ran out of
  order. `DESIGN.md` → Combination rules says what to draw when series have to be told apart.

## The field edge: tried at 3:1, kept at the hairline (2026-10-02)

The first product built on vellum measured the field edge at 1.23:1 against the page and the fill at
1.04:1, below the 3:1 WCAG 1.4.11 asks of a component's boundary. The edge was raised to
`color-mix(in oklab, var(--foreground) 50%, var(--background))` — 3.8:1 on the page, 3.9 on a card, 3.7
on the shell in light; 4.0 · 3.7 · 4.2 in dark — with the Checkbox, the Radio and the off Switch on the
same colour, and the dark invalid edge at the full `--destructive`.

It was taken back the same day. In a toolbar the dark-edged search field and selects sat next to
hairline outline buttons and no longer read as one family, and darkening the buttons to match would have
made every screen heavy. The owner chose the convention: fields and outline buttons share the hairline.
`DESIGN.md` → Known deviation records the shortfall and how a product opts in.

What the 3:1 version needed beyond a value, for whoever opts in. These rules read `--input` directly in
foundation, so `--input-border` · `--checkbox-border` do not reach them:

| Rule | Reads | Would read |
|---|---|---|
| `.cn-radio-group-item` (rest, and inside a focused field label) | `--input` | `--checkbox-border` (rhea makes this edit) |
| `.cn-questionnaire-choice-indicator` | `--input` | `--checkbox-border` |
| `.cn-input-otp-slot` (block, inline-end, first child's inline-start) | `--input` | `--input-border` |
| `.cn-combobox-chips` | `--input` | `--input-border` |
| `.cn-questionnaire-input` | `--input` | `--input-border` |
| `.cn-sidebar-input` | `--input` | `--input-border` |

They are foundation slot candidates: with the fallback `var(--input-border, var(--input))` the
foundation render does not move.
