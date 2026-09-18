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

- the warm paper ground under white cards, and the hairline that separates them
- the serif-over-sans pairing for headings, and how large the headings run against 13px body text
- ink as the primary action, with one deep teal for focus, links and the first chart series
- an ink sidebar rail against a paper page
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
