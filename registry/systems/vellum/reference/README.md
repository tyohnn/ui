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

## Foundation slot candidates

Rules this system edited because foundation has no slot there (root `DESIGN.md` §5, "What a value
changes, and what needs a rule"). Each reads `--input` directly in foundation, so a system that gives
its fields an edge other than `--input` (`--input-border`, `--checkbox-border`) cannot reach them with a
value. vellum points them at the slot the matching control already reads; the fallback keeps the
foundation value.

| Rule | Foundation reads | vellum reads | Candidate |
|---|---|---|---|
| `.cn-radio-group-item` (rest, and inside a focused field label) | `--input` | `--checkbox-border` | `--radio-border`, default `var(--checkbox-border, var(--input))` — rhea already made the same edit |
| `.cn-questionnaire-choice-indicator` | `--input` | `--checkbox-border` | the same slot as the Checkbox it imitates |
| `.cn-input-otp-slot` (block, inline-end, first child's inline-start) | `--input` | `--input-border` | read `--input-border` like Input |
| `.cn-combobox-chips` | `--input` | `--input-border` | read `--input-border` like Input |
| `.cn-questionnaire-input` | `--input` | `--input-border` | read `--input-border` like Input |
| `.cn-sidebar-input` | `--input` | `--input-border` | `--sidebar-input-border`, default `var(--input-border, var(--input))` |

Why (2026-10-02): the first product built on vellum measured the field edge at 1.23:1 against the page
and the field fill at 1.04:1, below the 3:1 WCAG 1.4.11 asks of a component's boundary. The edge is now
`color-mix(in oklab, var(--foreground) 50%, var(--background))`; measured in the preview on every field
of the coverage template, it is 3.8:1 on the page, 3.9 on a card and 3.7 on the shell in light, and
4.0 · 3.7 · 4.2 in dark. The fill is unchanged — with the edge drawn, the fill no longer has to say
where the field is.
