---
name: craft-component
description: Builds a component the design system does not have (a mixtape recorder, a pricing toggle, a timeline, a game HUD) so it takes the system's feel and keeps it when the system changes. Takes behaviour from Base UI and the look from tyohnn's roles (data-role), never from literal colours, radii, shadows or sizes. Use when the person asks for any new UI piece in a repo with tyohnn.json, or for something the primitives (button, card, menu …) do not cover.
---

# Craft a component that wears the system

A component has two halves that come from different places:

- **Behaviour** (focus, keyboard, selection, dragging, opening and dismissing, ARIA) comes from Base UI
  (`@base-ui/react`), or from a tyohnn primitive that already wraps it.
- **Look** (colour, density, depth, texture, type) comes from the system: each part says which **role** it plays
  with `data-role`, and the system's role rules and tokens dress it.

Nothing in the component decides a colour, corner, shadow, height or font size. That is why the same component
looks native in graphite, loam or a system made yesterday, without a change.

This file is the route. Read a reference only when you reach its step.

## 1. Read the system

Open `tyohnn.json` and the system's `concept.md`. If the repo has no tyohnn.json, run the **setup** skill first.
Say in one line how the concept shapes this component ("a dense dark tool, so the deck is compact and flat").

## 2. Take the primitives you can

Call `list_primitives` with the component's purpose. If a primitive does the job (button, slider, tabs, menu,
dialog …), use it as is; read it with `get_primitive` if it is not in the app yet and copy it into the components
folder. Craft only what no primitive covers.

## 3. Split into parts, give each a behaviour

List the component's parts and what each must do. Pick the Base UI part for every interactive one:
`references/behaviour.md` maps behaviours to parts (a transport bar is a Toolbar, a position bar is a Slider, a
level is a Meter, play is a Toggle …). Never hand-roll keyboard handling Base UI already has.

## 4. Give each part a role

Read `references/roles.md`. Put `data-role` (and its `data-variant`, `data-size`, `data-level` …) on each part:
the deck's body is a `surface`, its window an inset `surface`, buttons are `control`s in a `track`, the counter an
`indicator`, the tape title a `label` with a `meta` under it.

## 5. Lay it out with utilities, dress the rest from tokens

Utilities do layout only: `flex`, `grid`, `gap-*`, `items-*`, widths, positions. Colour comes from theme names
(`bg-muted`, `text-muted-foreground`, `border-border`). A part no role covers (a tape reel, a VU needle, a slider
thumb) reads role tokens by meaning: `references/beyond-roles.md`.

## 6. Prove it travels

Run the swap test in `references/swap-test.md`: render the component in the app's system and in two very different
systems, both modes. If anything looks off in one of them, the component decided something it should not have;
fix the component, not the system.

`references/example-mixtape.md` is a whole worked component (a mixtape recorder) to copy patterns from.

## Keep to

- No literal colours, radii, shadows, font sizes or control heights. The repo's `check:design` script, if present,
  enforces it; run it.
- Do not edit the system's CSS to make one component look right. If a look recurs and no role or token says it,
  follow "When a role step is missing" in `references/beyond-roles.md`.
- Keep ARIA from Base UI; add labels for icon-only controls (`aria-label`).
- Use the app's icon set the way its other components do.
