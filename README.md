# tyohnn

**Design systems you can swap, not just themes you can recolour.**

shadcn components on [Base UI](https://base-ui.com) primitives, with every visual decision — colour,
density, shape, material, motion — pulled out of the TSX and into three layers of plain CSS. Twelve complete
systems ship with the registry. A CLI copies one into your project, source and all.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Components](https://img.shields.io/badge/components-61-black.svg)](registry/ui/components)
[![Systems](https://img.shields.io/badge/systems-12-black.svg)](registry/systems)

> **Status: pre-release.** The registry, the CLI and the site are working; the CLI is not on npm yet, so
> run it from a clone (see [Quick start](#quick-start)). Expect the occasional breaking change until 1.0.

---

## Why

This started as a list of things that were nearly right.

**shadcn got the hard part right.** Component anatomy, accessible behaviour, and the code in *your*
repository instead of a dependency you cannot reach into. That is the foundation, and tyohnn keeps it —
same `cn-*` class contract, same component names, so upstream components port over with little work.

**Colour was already solved.** A theme swaps `--primary` and the whole app follows; services like
[tweakcn](https://tweakcn.com) made that a pleasure. Call it **layer 1**.

**But a design system is not a palette.** Two apps with identical colours can feel nothing alike. What
separates them is *density* (how tall a control is, how much air a table row has), *material* (flat, or
raised with a gradient and an inner highlight), *shape* (hairline rings versus 26px corners) and *motion*
(how fast anything responds). None of that is a colour, and none of it was themeable.

**shadcn's `create` presets fixed density — beautifully.** Suddenly you could pick a feel, not just a hue.
That was the real unlock.

**But the values came out baked into the components.** Heights, paddings and radii landed inline on the
button, the chip, the table. You can edit them, of course — in fifty files, and again next time. What
should have been one variable was fifty literals.

**So we made that a layer too.** **Layer 2** holds the density, shape and motion tokens
(`--control-height-md`, `--table-row-height`, `--motion-base`), and **layer 3** holds one CSS file per
component that assembles layers 1 and 2 into rules. Change one token; every component that reads it moves
together, by construction.

**Then the details that still had nowhere to live.** A clay button's inner highlight. A tag's seven tones.
An avatar's initials colour. Those are not in anyone's token set, so we opened slots for them — and hit the
opposite problem: a slot one system wanted became a line of filler in every other system. The fix is that a
slot's default lives in the rule that reads it (`var(--sidebar-item-border, var(--border))`), so a system
that does not care declares nothing.

**The result is that changing CSS is enough.** No component edits, no cascade archaeology. Touch a token
and the whole system moves with it, consistently, because every component was already reading it.

**And the interesting part is what that makes possible next.** If a system is just CSS values, it can be
edited in a browser, saved, shared, exported into a project — or generated from a screenshot you liked.
See [Roadmap](#roadmap).

---

## Quick start

```sh
git clone https://github.com/tyohnn/ui.git && cd ui
npm install
npm run build -w tyohnn

# scaffold into your app
node packages/cli/dist/index.js init --system vega --cwd ../my-app
```

`init` detects the project (Next.js App Router, Vite, or an npm/pnpm/yarn/bun workspace monorepo with or
without Turborepo), copies the components and one system, installs what it needs and wires the entry CSS.
**There is no runtime package** — after `init` the code is yours.

Look around first instead:

```sh
SYSTEM=graphite npm run dev -w @tyohnn/preview
# http://localhost:5173/?system=graphite&mode=dark
```

---

## How it works

Every component element carries a stable hook class (`cn-button`, `cn-sidebar-menu-badge`, …). The TSX
holds **no visual values**. Everything visible is decided by CSS, in layers:

| Layer | File | Holds | Example |
|---|---|---|---|
| **1 — colours** | `styles/theme.css` (generated) | the palette: 72 colours a theme fills, light and dark | `--primary`, `--tag-blue-bg`, `--checked` |
| **1 — formulas** | `styles/globals.css` | what is derived from the palette, the system's own colours and material | `--primary-soft: color-mix(in oklab, var(--primary) 5%, transparent)` |
| **2 — tokens** | `styles/tokens.css` | density, shape, type, motion, composed shadows | `--control-height-md`, `--table-row-height`, `--motion-base` |
| **3 — rules** | `styles/components/*.css` | `cn-*` rules assembling layers 1 and 2 | `.cn-badge[data-tone="blue"] { background-color: var(--tag-blue-bg) }` |

Layer 3 is imported into `layer(base)`, so utilities you pass through `className` still win.

**Colour and feel are separate axes.** A *theme* is 72 colour values; a *system* is the feel — density,
shape, material, motion, and the formulas that derive hover · soft · ring colours from the palette. Any
theme goes on any system. Seven of the eight ported shadcn presets have no colour of their own at all:

```json
{ "name": "sera", "extends": { "base": "taupe" }, "light": {}, "dark": {} }
```

---

## The systems

| System | Feel | Default mode |
|---|---|---|
| `mira` | Inter · 28px controls · hairline rings | light |
| `vega` | Inter · 36px controls · shadow-xs | light |
| `nova` | Geist · 32px controls · 10px corners | light |
| `luma` | Inter · borderless · 26px corners | light |
| `rhea` | Inter · filled fields · 16px corners | light |
| `maia` | Figtree · 36px controls · round | light |
| `lyra` | JetBrains Mono · square · rings | light |
| `sera` | Playfair Display · square · uppercase labels | light |
| `graphite` | Pretendard · dense · clay controls | dark |
| `nocturne` | Geist · pill controls · one lavender signal | dark |
| `vellum` | Source Serif 4 · paper ground · dense tables | light |
| `cirrus` | Pretendard · frosted layers · pill buttons | light |

The first eight are ports of shadcn's `create` presets; `graphite`, `nocturne`, `vellum` and `cirrus` are our own. Each is a
**complete, frozen folder** — all three layers, its own `DESIGN.md`, nothing composed at build time — so
what you copy is what you saw.

## Is it really the same as shadcn?

For the eight ported presets, that is a testable claim, and it is tested. `tooling/preset/make-reference.mjs`
builds a real shadcn app for the preset; `tooling/snapshot/compare-shadcn.mjs` renders every component in
both apps and compares **computed styles element by element**, pairing by `data-slot`.

The standing result: **2,581 element pairs per system, light and dark, 0 mismatches.** Differences that are
deliberate are recorded with a reason in each system's `reference/compare-exclusions.json`.

Colour comparison is done by painting each value to a 1×1 canvas and reading the pixel, so
`oklch(0.205 0 0 / 5%)` and `color-mix(in oklab, var(--primary) 5%, transparent)` are compared as the colours
they are, not as strings.

---

## CLI

```sh
tyohnn init --system vega          # scaffold; in a monorepo, creates packages/ui and wires one app
tyohnn add mira --app apps/admin   # a second system in the same monorepo
tyohnn use nocturne                # switch an app to another system
tyohnn theme stone                 # switch an app's colours, keeping its system (--reset: the system's)
tyohnn fonts --sans geist          # switch fonts (--reset returns to the system's)
tyohnn icons lucide                # switch icon library (six supported, semantic names)
tyohnn list                        # systems, fonts, icon libraries
tyohnn doctor                      # check the project against tyohnn.json
tyohnn diff                        # what changed upstream, locally, or both
```

Every command is idempotent: it edits `tyohnn.json`, then makes the project match it.
Full reference: [packages/cli/README.md](packages/cli/README.md).

---

## Roadmap

- [x] Three-layer architecture, 61 components, 12 systems (the eight ported presets verified against shadcn)
- [x] CLI: scaffold, switch systems, fonts, icons, doctor, diff
- [x] Colour as a separate axis — themes, 7 bases × 17 accents, free-form palettes
- [x] `tyohnn theme` — wear any theme on any system, from the CLI
- [ ] **Web editor** — tune a system in the live preview and take the CSS away with you
- [ ] **Save and share** your own system (including over MCP), and export it into a project
- [ ] **image-to-system** — a screenshot or a reference, turned into a system to start from
- [ ] Material axis: `--surface-{control,raised,overlay,panel}-{fill,filter,edge,shadow}` — clay, glass, paper
  as different values in the same slots
- [ ] npm release

---

## Repository

```
registry/ui                the one set of component TSX (components · hooks · lib · icons for six libraries)
registry/systems/<name>    complete design systems (system.json · styles · DESIGN.md · reference)
registry/themes            colour sets: bases, accents, and one per system
registry/foundation        maintainer master copy of the layers that systems fork
registry/fonts · schema    font catalog · JSON Schemas
packages/cli               the CLI · packages/theme  the palette, composition and contrast
tooling/                   build · scan · validate · snapshot comparison · preset porting · theme extraction
apps/preview               Vite app that renders any template with any system
apps/site                  static site: every system in live iframes, components, compare, docs
examples/multi-system      generated by the CLI: graphite in one app, mira in another
```

```sh
npm install
node tooling/build-system --all      # systems → dist/systems/<name>/compiled.css
node tooling/scan-tokens             # undefined tokens · palette completeness · component stylesheets
node tooling/validate-system         # schemas · fonts · themes · icon libraries
npx turbo typecheck test
```

Read [DESIGN.md](DESIGN.md) before adding a component or a system — it is the contract every system follows.

## Contributing

Issues and pull requests are welcome. A change to a component's look belongs in CSS, not in the TSX; a new
component needs a stylesheet in every system (`tooling/backfill-component` starts that for you), and
`npm run scan` plus `npm run validate` must be clean. For a ported preset, `compare-shadcn` must stay at zero.

## Credits

Built on [shadcn/ui](https://ui.shadcn.com), [Base UI](https://base-ui.com) and
[Tailwind CSS](https://tailwindcss.com) v4. The comparison tooling uses [Playwright](https://playwright.dev).

## License

[MIT](LICENSE)
