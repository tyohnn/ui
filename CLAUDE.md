# tyohnn — read this first

**Enough color tweak, build your taste.** tyohnn is shadcn with the *feel* pulled out into tokens:
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
| Depth | shadows, rings, raised vs. flat surfaces | `--card-shadow`, `--shadow-control*`, `--shadow-raised`, `--dialog-shadow` |
| Texture | radii, border widths, gradients, materials | `--control-radius`, `--card-radius`, `--surface-primary`, `--surface-control`, `--clay-*` |
| Type | font stacks, weights, tracking | `--font-sans`, `--font-heading`, `--control-font-*` |
| Colour | the palette, layer 1 — the part everyone already had | `theme.css`, derived colours in `globals.css` |

Lead with **density, depth, texture** (the tagline's three). Type is the fourth axis; name it when the
context has room. Say *taste* or *feel* for all of them together, never *theme* (a theme is colour only).

## Voice

- **The site home is short.** Headline, one sentence, then *show* it: the specimens in
  `apps/site/src/components/taste.tsx` and the live screens. The story above belongs in the README, docs and
  posts, not in home-page paragraphs.
- Show, don't claim. Every visual on the site is drawn from real registry tokens, never hand-tuned to look good.
- Credit shadcn, Base UI and tweakcn plainly. tyohnn builds on them; it is not against them.
- Site copy lives in `apps/site/src/lib/i18n/en.tsx` and `ko.tsx`; change both together. Korean follows the
  rules at the top of `ko.tsx` (해요체, 「토큰」, 「층」).

## Headline copy

- EN: **Enough color tweak, / Build your Taste** — *A theme changes the colour. Taste lives in the density,
  depth and texture — and now those are tokens too.*
- KO: **색 놀음은 그만, / 취향을 만드세요** — *테마는 색을 바꿔요. 취향은 밀도, 깊이, 질감에 있어요. 이제 그것도 토큰이에요.*
