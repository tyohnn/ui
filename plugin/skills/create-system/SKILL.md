---
name: create-system
description: Makes a design system from a concept or a visual reference. Reads what the person wants ("Apple's glass meets a forest", a screenshot, a site they like) into five axes (colour, density, depth, texture, typography), starts from the closest tyohnn system, shapes it with the tyohnn MCP tools, checks it and keeps it. Use when the person asks for a new look, a design system, a theme "that feels like …", wants to restyle an app beyond colours, or attaches images of a UI they want to resemble.
---

# Make a system from a concept

A tyohnn system is a base system plus a short list of changes: a palette and colours, and tokens for density,
depth, texture and typography. Every primitive and every `data-role` component reads those tokens, so the system
reaches components nobody has written yet. Your job is to turn words or pictures into that list and leave a concept
the next agent can read.

This file is the route. Read a reference only when you reach its step; do not read them all up front.

## 1. Read the request into a concept

Write the concept before touching a tool: the person's words, then one line per axis saying how the system answers
them. `references/concept.md` shows how to read moods and metaphors into axes, with worked examples. Do not ask
the person to choose axes; choose, and say what you chose in the first line of your reply.

If they attached images or named a site, read `references/visual-references.md` first: measure the reference before
you describe it.

## 2. Pick the base

Call `search_systems` with the concept's axis words (e.g. "dark dense glass", "warm paper serif"), then
`read_system` on the best two or three. Pick the one closest on **density, depth and texture**: those take the most
tokens to move. Colour is the cheapest axis to change, so do not pick a base for its colours.

## 3. Draft

Call `draft_system` with a kebab-case name, the concept and the base. It opens the System view on real screens.
Tell the person in one line what they are looking at.

## 4. Shape, one axis at a time

Go axis by axis in this order, reading that axis's reference just before you do it:

1. Colour: `references/axes/colour.md` (`set_colours`)
2. Density: `references/axes/density.md` (`set_tokens`)
3. Depth: `references/axes/depth.md`
4. Texture: `references/axes/texture.md`
5. Typography: `references/axes/typography.md`

Set **role tokens** (`--control-*`, `--surface-*`, `--item-*`, `--indicator-*`, `--field-*`, `--popup-*`, the type
ramp), not component slots (`--card-*`, `--sidebar-*`, `--badge-*`). A role token moves every component that plays
the role, including ones the person will write later with `data-role`; a slot moves one component. Set a slot only
when one component should differ on purpose, and say why.

After each axis, say in one short line what moved ("rows went from 32 to 36px and surfaces lift with a soft
shadow"). The person may also drag the view's controls; `get_system` returns their changes too.

## 5. Check

Call `check_system` and fix every finding: contrast below AA, a slot set where its role token would carry the
change, a thin concept. `references/checking.md` says how to fix each kind and what to look at on the screens
beyond the findings.

## 6. Keep it

- To use it in the person's app now: hand over to the **setup** skill (it calls `export_system`).
- To share it so others can start from it: call `publish_system`, but ask first. Publishing shares the system.
- To come back to it later without publishing: `export_system` without `dir` returns the files and the
  `tyohnn.json` whose `source` holds every change.

End with the concept in two or three lines and where the system now lives.

## Keep to

- Never point the person at the tyohnn CLI or a `--preset` code. The plugin is the whole path.
- A value you set comes from the concept or the reference. Do not tune a value to look good on one screen; check it on
  the other screens in the view.
- Keep each mode readable: a dark-mode change is a colour edit under `dark`, never a token.
- Rewrite the concept with `draft_system` and `keep: true` when the direction changes; without `keep` it starts over
  from the base. Small tweaks do not need a new concept.
