# <ui folder>: the design system

Loads when files in this folder are read or edited. This file belongs to tyohnn and is replaced when setup runs
again. Screen rules are in `.claude/rules/design-system.md`.

- `components/` holds tyohnn's parts, `systems/<system>/` the system (`concept.md` and its three CSS layers in `styles/`), `blocks/` the repo's own
  compositions (`blocks/CLAUDE.md`), `icons/` the semantic icon names.
- **Do not edit `components/` or `systems/`.** A missing part comes from `get_primitive`; a new kind of part
  follows the `craft-component` skill. The feel changes through `create-system` and a fresh export.
- **Never run a generator (`npx shadcn add`).** What it writes does not follow the `cn-*` contract, so layer 3 CSS
  does not reach it.
- Parts carry structure and behaviour utilities plus `cn-*` classes; every visible property comes from CSS.
  **`cn-*` names are the contract between a part and layer 3.** Change one side and the part renders unstyled.
- Layers in `systems/<system>/styles/`: `globals.css` and `theme.css` (1) → `tokens.css` and `typeset*.css` (2) →
  `style.css` and `components/*.css` (3). When a value is wrong, change this chain, not a screen. Hover colours are tokens, not `color-mix()` on a screen.
- **A size name is a height.** Pass `size`; never write a number on a screen.
- **Parts sit on UI SDK (`@ui-sdk/react` <version>).** <Write the repo's differences once here, such as "`render`
  instead of `asChild`".> For how to use a part, read `node_modules/@ui-sdk/react/docs/` for the installed version.
- Never hang a style or a screen name on `data-slot`: UI SDK writes it. Layer 3 hangs on `cn-*`, screen names go on
  `data-panel` (`lib-slot` in `check:screens`).
- Icons come from `<icons module>` by semantic name. An icon library is imported only in `icons/`.
- A change here changes every app. After a wide one, compare with `node scripts/visual/run.mjs`.
