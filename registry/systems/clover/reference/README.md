# clover — reference

Design values only. No product's marks, names, wording, icons or screen layouts are reproduced, and no
screenshots or assets are stored here.

There is no reference app for this system: it was not ported from a shadcn preset, so
`compare-shadcn.mjs` has nothing to compare against. Its checks are the render checks
(`check-coverage.mjs --system clover` in both modes, `check-templates.mjs --systems clover`) and, for any
later change, an A/B of the computed values against the build before it (`compare-computed.mjs --dump` /
`--diff`).

## Source

**Seven screens of an HR and back-office workspace, shared by the owner on 2026-10-01**: a profile sheet,
a document list, a permission popover, a calibration table, a report builder, a year-end settlement
table and an expense table. They are images, not a running page, so colours were sampled from the pixels
and sizes were chosen in the same register rather than measured.

Sampled from the images:

- ink `#242a30` for titles and the active tab, `#3c4651` for row text, `#8d96a1` for secondary text,
  `#cdd2d6` for a switched-off title;
- hairlines between `#e5e5e5` and `#ebebeb`, row rules between `#f2f2f2` and `#f6f6f7`, a `#fdfdfd`
  filter bar, quiet fills `#f1f3f4` and `#f6f6f7`, an unchecked box edged `#d9d9d9`;
- the green: `#09bb1b` on a checked box and a solid button, `#00a606` at its edge, a focused field edged
  `#00b508` with `#8bdf94` outside it, and a header action running `#0bc609` → `#06c8bb` left to right;
- tinted labels with ink of their own hue: blue `#e0effc` / `#102a5c`, red `#fde9e2` / `#6a1905`, green
  `#e1f6e3` / `#085010`, gray `#eaecee` / `#242a30`;
- a popup ringed about `#e8e8e9` under a wide soft shadow.

Read from the images without numbers: outlined controls that sit as white chips with a faint shadow
under them, small bold labels with 4–6px corners, rounded-square avatars and tiles, underline tabs over
a full-width rule, tables without a card around them, popups with corners larger than the controls'.

## Values that are ours

- **The green is one step deeper than the source.** `#09bb1b` under a white label is 2.58:1. clover's
  `oklch(0.645 0.215 143)` (about `#03ac13`) is 3.05:1 — still below AA, which `validate-system` reports
  and `DESIGN.md` says in "Do not". The hue and chroma are the source's.
- **Secondary text is darker than the source.** `#8d96a1` is 3.0:1 on white; `--muted-foreground` is
  `#666f7a` (5.1:1 on white, 4.6:1 on `--secondary`). The source's lighter greys became
  `--foreground-subtle`.
- **The gradient is a formula.** `--primary-gradient-end` turns `--primary` 44° toward cyan at 56% of its
  chroma, which reproduces the source's green → teal for this theme and gives any other theme a gradient
  of its own. It is laid over `--primary` from `transparent`, so the rule's hover (a `background-color`
  change) still shows.
- **Sizes** (controls 24 · 28 · 36 · 40, 48px rows, 12 · 16px surfaces, the type ramp) are chosen, not
  measured. They are listed in `DESIGN.md` → Key values.
- **Dark mode** has no source at all.

## Why foundation

clover needed no rule that foundation does not already have — every difference is a value in a slot,
with the two exceptions below. Forking foundation rather than a tuned system keeps layer 3 identical to
the master copy, so a later backfill applies cleanly.

## Foundation slot candidates

Two rules had a literal, or a shared name, where clover needed its own value. clover's copy of each rule
reads a new name; foundation and the other systems are unchanged.

| Name | Layer | What foundation's default would be | Read by | Why clover needs it |
|---|---|---|---|---|
| `--avatar-radius` | 2 | `9999px` (the literal in `avatar.css`, five places) | `.cn-avatar` and its `::after` · `.cn-avatar-fallback` · `.cn-avatar-image` · `.cn-avatar-group-count` | avatars are rounded squares (`32%`) |
| `--tag-font-weight` | 2 | `var(--ui-font-weight-regular)` | `.cn-badge[data-tone]` | a slot-meaning conflict: the tag shares `--ui-font-weight-regular` with the table head and the line tab, which clover keeps at 500 while its 11px tags need 600 |

## Names clover adds

| Name | Layer | Read by | Why |
|---|---|---|---|
| `--primary-gradient-end` | 1 | `--surface-primary` (layer 2) | the far end of the primary button's gradient, derived from `--primary` |
| `--control-shadow-color` | 1 | `--shadow-control` · `--shadow-control-pressed` · `--tabs-trigger-active-shadow` (layer 2) | the 1px shadow under white chips differs by mode, and layer 2 has no `.dark` scope |

clover also declares slots foundation leaves to the rule's fallback: `--primary-hover`,
`--foreground-subtle` (its fallback is `--ring`, which is green here), `--border-subtle`,
`--table-row-divider`, `--table-head-foreground`, `--ring-focus`, `--button-outline-hover-fill`,
`--checkbox-indeterminate-fill` · `-border`, `--overlay-backdrop`.

## What a slot could not say

Left as foundation has them; candidates if a second system asks.

- **The line tab's type.** `.cn-tabs-trigger` reads `--ui-text-sm`, so a page's section tabs cannot be a
  step larger than body text without growing every small label.
- **The checked item's mark in a menu.** It inherits the row's ink; the source draws it in green.
