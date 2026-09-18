# cirrus — reference

There is no reference app for this system: it was not ported from a shadcn preset, so
`compare-shadcn.mjs` has nothing to compare against. Its checks are the render checks
(`check-coverage.mjs --system cirrus` in both modes, `check-templates.mjs`) and, for any later change,
an A/B of the computed values against the build before it (`compare-computed.mjs --dump` / `--diff`).

## Source material

Screens of a Korean startup-legal marketing site, shared by the owner on 2026-09-18 (a hero with
frosted message chips over a photograph, a diagnostic dashboard on a pale sky gradient, a three-card
carousel of chat vignettes, and a section band of icon/label/description).

**What was taken**: design values only.

- the frosted, translucent chips floating over photographs — the material this system is built around
- the pale blue-to-white gradients that make the page read as daylight rather than as a grey app shell
- wide, low-opacity shadows under white cards, with no border at all
- the near-black pill CTA beside white pill buttons
- the blue-and-mint pairing in the progress bars and score charts
- Pretendard as the single text voice, with headings carried by weight rather than by a second family

**What was not taken**: no marks or wordmarks, no product or feature names, no screen layouts, no copy,
no photographs, no component anatomy. Nothing in `styles/` reproduces a screen from the reference; the
components are `registry/ui`'s, the same set every system renders.

## Values that are ours, not read off a screen

The screenshots are images, not source, so no number in this system was measured from them. Every value
was chosen deliberately in that register and is documented in `DESIGN.md`:

- the palette is authored in oklch (`registry/themes/cirrus.json`), cool throughout (hue 240–258 for the
  neutrals, 250 for the blue, 158–182 for the mint), and passes AA on every pair `checkContrast` tests;
- the glass axis (`--glass-fill`, `--glass-filter`) and its four contracts are ours: the reference shows
  *that* the chips are frosted, not at what opacity, blur radius, or with which layers excluded.
