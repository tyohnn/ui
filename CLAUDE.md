# tyohnn — read this first

**Enough with color tweaks, build your own taste.** tyohnn is shadcn with the *feel* pulled out into tokens:
density, depth and texture, not just colour. This file holds the concept and the voice. The engineering
contract (hooks, layers, slots, icons, strings) is [DESIGN.md](DESIGN.md); the long-form pitch is the
**Why** section of [README.md](README.md).

## The story (keep every piece of writing consistent with it)

1. **Everything is shadcn now.** The AI era made it the default: Tailwind components whose code you own,
   on bare primitives (Radix, Base UI). The libraries before it were compiled, props-driven and hard to change.
2. **Then everything looked the same.** The one lever was colour — `globals.css`, tweakcn.
3. **Colour was not enough.** A design system is also **density** (how much air), **depth** (how far
   surfaces lift), **texture** (corners, edges, gradients, materials) and **type**. None of it was themeable.
4. **shadcn's [create](https://ui.shadcn.com/create) page proved it.** Mira, Nova and the other styles set
   those axes differently, and shadcn apps finally felt different — more than a recolour.
5. **But create bakes the values into the components.** They come out of the CLI as literals across fifty
   files. There is no `globals.css` for feel.
6. **So tyohnn pulled them out.** The values that make density, depth, texture and type became shared
   tokens (layer 2) read by per-component rules (layer 3). Change a token; every component follows.

## Vocabulary

| Word | Means | Lives in (tokens.css / globals.css) |
| --- | --- | --- |
| Density | control heights, paddings, gaps, row rhythm | `--control-height-*`, `--control-padding-*`, `--surface-padding-*`, `--table-*` |
| Depth | how far a surface sits off the ground: outer shadows, rings, steps between planes | `--card-shadow`, `--shadow-control*`, `--dialog-shadow`, `--clay-contact`, `--clay-ambient` |
| Texture | what a surface is made of: fills, gradients and sheens, inner highlights, blur, radii, edges | `--card-sheen`, `--surface-primary`, `--surface-control`, `--clay-highlight`, `--glass-*`, `--control-radius` |
| Type | font stacks, weights, tracking, how labels speak | `--font-sans`, `--font-heading`, `--title-*`, `--sidebar-group-label-*`, `--control-font-*` |
| Colour | the palette, layer 1 — the part everyone already had | `theme.css`, derived colours in `globals.css` |

Lead with **density, depth, texture** (the tagline's three). Type is the fourth axis: it has its own row on
the home page; name it when the context has room. A material that mixes two axes splits by this rule —
graphite's clay highlight is texture, its contact shadow is depth; loam's sheen is texture. Icons (one of six
libraries per system) and motion (`--motion-*`, the same in every system today) are real but not headline axes.
Say *taste* or *feel* for all of them together, never *theme* (a theme is colour only).

## Voice

- **The site home is short.** Headline, one sentence, then *show* it: the specimens in
  `apps/site/src/components/taste.tsx` and the live screens. The story above belongs in the README, docs and
  posts, not in home-page paragraphs.
- Show, don't claim. Every visual on the site is drawn from real registry tokens, never hand-tuned to look good.
  Each system appears in its own colours. The site is dark, and so is every preview on the home page; the system,
  components and compare pages start dark and keep a light/dark switch that turns everything on them together.
- Show tyohnn's own systems (graphite, loam, cirrus, halo, nocturne, vellum, clover) first. The ones
  ported from shadcn create presets (mira, vega, nova, maia, lyra, luma, sera, rhea) prove the port, not the taste.
- Credit shadcn, Base UI and tweakcn plainly. tyohnn builds on them; it is not against them.
- Site copy lives in `apps/site/src/lib/i18n/en.tsx` and `ko.tsx`; change both together. Korean follows the
  rules at the top of `ko.tsx` (해요체, 「토큰」, 「층」).

## Headline copy

- EN: **Enough with color tweaks, / Build your own taste** — *Colour is where everyone stops. Go further — density, depth
  and texture, as tokens you own.*
- KO: **색 놀음은 이제 그만, / 나만의 취향을 만드세요** — *다들 색에서 멈춰요. 밀도, 깊이, 질감까지 내 토큰으로 바꿔 보세요.*
