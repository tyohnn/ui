# Role vocabulary: where every layer-2 token goes

Step 0 of the plugin plan. A new component can only take a system's feel without a rule in this repo when
tokens and rules are named for **roles**, not components. This file maps every name in foundation
`styles/tokens.css` to a role and an axis, and says where each component-named token with a value of its
own will go. Nothing here changes a value; it is the table the next two steps work from.

Generated from `registry/foundation/styles/tokens.css` on 2026-11-22. Regenerate before acting on it.

## Roles

| Role | What | Examples today |
|---|---|---|
| control | something you press | button · toggle · tab trigger · `--control-*` |
| field | something you type into or pick from | input · select trigger · textarea · `--control-*-field` |
| surface | a plane that holds content; steps ground · raised · inset | card · sidebar shell · `--surface-*` |
| popup | a plane that floats | menu · dialog · sheet · tooltip · toast |
| item | one row of a list | menu item · table row · sidebar item · command item |
| indicator | shows a state or a count | checkbox · switch · badge · tag · avatar · keycap · slider track |
| label | names or annotates | menu label · group label · table head · surface title |
| separator | divides | menu separator · sidebar separator |

Colour stays in layer 1 and is not split by role. The type ramp (`--ui-*`, `--typeset-*`, headings),
motion and the focus ring are shared by every role.

## Counts

| | Tokens |
|---|---|
| All names in `tokens.css` | 317 |
| Named for a role or a shared axis | 158 |
| Named for a component, value is a `var()` of a role token | 89 |
| Named for a component, value is neutral (`initial` · `0` · `none` …) | 19 |
| Named for a component, holds a value of its own | 51 |

Role × axis (all names):

| Role | density | depth | texture | type | motion |
|---|---|---|---|---|---|
| control | 33 | 4 | 16 | 13 | 4 |
| field | 8 |  | 1 | 3 |  |
| surface | 21 | 3 | 16 | 1 |  |
| popup | 7 | 3 | 3 |  |  |
| item | 31 |  | 4 | 11 |  |
| indicator | 33 | 2 | 7 | 19 |  |
| label | 5 |  |  | 12 |  |
| separator | 4 |  |  |  |  |
| type ramp |  |  |  | 42 |  |
| shared |  |  | 2 |  | 7 |
| layout | 2 |  |  |  |  |

## The component-named tokens with a value of their own

51 names. Each goes one of three ways:

- **A · alias now (10).** A role token with the same value already exists. The name becomes a `var()` of it; no render moves.
- **B · new role step (23).** The value is a step every component of that role could use (an item height, an indicator size, a control inside a track). Add the role step, alias the name to it.
- **C · stays (18).** The shape of one widget (a switch track, a tree rail, a column width, the questionnaire). These remain component slots on purpose.

| Token | Value | Role · axis | Way | Goes to |
|---|---|---|---|---|
| `--kbd-radius` | `2px` | indicator · texture | B | `--indicator-radius-sm` 2px |
| `--switch-track-width-md` | `28px` | indicator · density | C | switch geometry |
| `--switch-track-height-md` | `16.6px` | indicator · density | C | switch geometry |
| `--switch-track-width-sm` | `24px` | indicator · density | C | switch geometry |
| `--switch-track-height-sm` | `14px` | indicator · density | C | switch geometry |
| `--switch-thumb-inset` | `1px` | indicator · density | C | switch geometry |
| `--switch-thumb-size-md` | `14px` | indicator · density | C | switch geometry |
| `--switch-thumb-size-sm` | `12px` | indicator · density | C | switch geometry |
| `--sheet-shadow` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | popup · depth | A | `--popup-shadow-lg` (today `--menu-sub-shadow`, identical) |
| `--command-item-padding-x` | `10px` | item · density | B | `--item-padding-x-lg` 10px |
| `--sidebar-item-height` | `32px` | item · density | B | `--item-height-md` 32px |
| `--sidebar-item-radius` | `8px` | item · texture | A | `--item-radius` (today `--menu-item-radius`, 8px) |
| `--sidebar-item-padding-x` | `8px` | item · density | A | `--item-padding-x` (today `--menu-item-padding-x`, 8px) |
| `--sidebar-item-gap` | `8px` | item · density | A | `--item-gap` (today `--menu-item-gap`, 8px) |
| `--sidebar-item-icon-size` | `16px` | item · density | A | `--control-icon-size-lg` (16px) |
| `--sidebar-item-spacing` | `1px` | item · density | B | `--item-spacing` 1px (the gap between rows of one list) |
| `--sidebar-item-font-weight` | `500` | item · type | A | `--ui-font-weight` (500) |
| `--sidebar-badge-padding-x` | `4px` | indicator · density | B | `--indicator-padding-x` 4px |
| `--sidebar-badge-inset-end` | `4px` | indicator · density | B | `--indicator-inset` 4px (an indicator pinned inside an item) |
| `--sidebar-sub-rail-offset` | `14px` | item · density | C | tree geometry: where the rail stands under the parent icon |
| `--sidebar-sub-item-indent` | `18px` | item · density | C | tree geometry |
| `--sidebar-sub-item-height` | `28px` | item · density | B | `--item-height-sm` 28px (= `--menu-item-height`) |
| `--sidebar-item-action-size` | `20px` | item · density | A | `--control-height-xs` (20px): the action is a control |
| `--sidebar-item-action-icon-size` | `16px` | item · density | A | `--control-icon-size-lg` (16px) |
| `--table-head-height-default` | `40px` | label · density | B | `--item-height-lg` 40px |
| `--table-head-height-compact` | `32px` | label · density | B | `--item-height-md` 32px |
| `--table-cell-padding-y-default` | `8px` | item · density | B | `--item-padding-y-lg` 8px |
| `--table-cell-padding-y-compact` | `4px` | item · density | B | `--item-padding-y-sm` 4px (= `--menu-item-padding-y`) |
| `--tabs-line-trigger-padding-x` | `6px` | control · density | B | `--control-nested-padding-x` |
| `--tabs-line-trigger-padding-x-icon` | `4px` | control · density | B | `--control-nested-padding-x-icon` 4px |
| `--table-meta-column-width` | `32px` | (배치) · density | C | column layout |
| `--table-actions-column-width` | `40px` | (배치) · density | C | column layout |
| `--avatar-size-sm` | `24px` | indicator · density | B | `--indicator-size-sm` 24px |
| `--avatar-size-md` | `32px` | indicator · density | B | `--indicator-size-md` 32px |
| `--avatar-size-lg` | `40px` | indicator · density | B | `--indicator-size-lg` 40px |
| `--badge-padding-y` | `2px` | indicator · density | B | `--indicator-padding-y` 2px |
| `--badge-radius` | `9999px` | indicator · texture | A | `--indicator-radius-pill` (9999px, shared with `--tag-radius`) |
| `--kbd-padding-x` | `4px` | indicator · density | B | `--indicator-padding-x` 4px |
| `--switch-radius` | `9999px` | indicator · texture | A | `--indicator-radius-pill` |
| `--bubble-padding-y` | `6px` | surface · density | B | `--surface-padding-xs` 6px |
| `--questionnaire-choice-padding-x` | `12px` | surface · density | C | questionnaire (one component's own form) |
| `--questionnaire-choice-padding-y` | `10px` | surface · density | C | questionnaire |
| `--questionnaire-choice-gap` | `10px` | surface · density | C | questionnaire |
| `--questionnaire-choice-min-height` | `44px` | surface · density | C | questionnaire (44px touch target) |
| `--questionnaire-gap` | `16px` | surface · density | C | questionnaire |
| `--questionnaire-item-gap` | `12px` | surface · density | C | questionnaire |
| `--tabs-list-padding` | `3px` | surface · density | B | `--control-track-padding` 3px (a track that holds controls: tabs, segmented toggle) |
| `--tabs-trigger-gap` | `6px` | control · density | B | `--control-nested-gap` 6px |
| `--tabs-trigger-padding-x` | `6px` | control · density | B | `--control-nested-padding-x` 6px (a control inside a track) |
| `--tabs-trigger-padding-y` | `2px` | control · density | B | `--control-nested-padding-y` 2px |
| `--slider-track-thickness` | `4px` | indicator · density | C | slider geometry |

New role names B introduces: `--item-height-sm|md|lg`, `--item-padding-y-sm|lg`, `--item-padding-x-lg`,
`--item-spacing`, `--indicator-size-sm|md|lg`, `--indicator-padding-x|y`, `--indicator-inset`,
`--indicator-radius-sm`, `--indicator-radius-pill`, `--control-track-padding`, `--control-nested-padding-x|y`,
`--control-nested-padding-x-icon`, `--control-nested-gap`, `--surface-padding-xs`, `--popup-shadow-lg`.
The existing `--menu-item-*` names become aliases of `--item-*`, the way component slots alias role tokens today.

Component slots stay. DESIGN.md §5's rule ("one slot, one meaning") still holds: a system that wants the
sidebar item taller than the menu item sets `--sidebar-item-height`. What changes is the default: it reads a role
step, so a component that has no slot of its own reads the same step and follows.

Systems are snapshots, so this changes the *form* of foundation's defaults only. In each of the 15 systems a
name keeps its current value wherever it differs from the role step; where it equals it, the name becomes the
alias. Either way the render must not move (step ②'s check: 0 pixel difference, both modes).

## Not covered yet

- Layer 1 (`globals.css`, colours) has component-named slots too (`--sidebar-item-border`, `--slider-thumb-fill` …).
  Colour is not split by role, but those names get the same alias treatment in step ②.
- Layer 3 (6,169 lines; 810 in the `_control`/`_menu`/`_surface`/`_shared` family files) is step ③.

## All names

| Token | Value | Role | Axis | Kind |
|---|---|---|---|---|
| `--control-height-xs` | `20px` | control | density | role |
| `--control-height-sm` | `24px` | control | density | role |
| `--control-height-md` | `28px` | control | density | role |
| `--control-height-lg` | `32px` | control | density | role |
| `--control-padding-y-multiline` | `8px` | field | density | role |
| `--control-padding-x-xs` | `8px` | control | density | role |
| `--control-padding-x-sm` | `8px` | control | density | role |
| `--control-padding-x-md` | `8px` | control | density | role |
| `--control-padding-x-lg` | `10px` | control | density | role |
| `--control-padding-x-icon-xs` | `6px` | control | density | role |
| `--control-padding-x-icon-sm` | `6px` | control | density | role |
| `--control-padding-x-icon-md` | `6px` | control | density | role |
| `--control-padding-x-icon-lg` | `8px` | control | density | role |
| `--control-gap-xs` | `4px` | control | density | role |
| `--control-gap-sm` | `4px` | control | density | role |
| `--control-gap-md` | `4px` | control | density | role |
| `--control-gap-lg` | `4px` | control | density | role |
| `--control-font-size-xs` | `10px` | control | type | role |
| `--control-font-size-sm` | `12px` | control | type | role |
| `--control-font-size-md` | `12px` | control | type | role |
| `--control-font-size-lg` | `12px` | control | type | role |
| `--control-line-height-xs` | `15px` | control | type | role |
| `--control-line-height-sm` | `19.5px` | control | type | role |
| `--control-line-height-md` | `19.5px` | control | type | role |
| `--control-line-height-lg` | `19.5px` | control | type | role |
| `--control-icon-size-xs` | `10px` | control | density | role |
| `--control-icon-size-sm` | `12px` | control | density | role |
| `--control-icon-size-md` | `14px` | control | density | role |
| `--control-icon-size-lg` | `16px` | control | density | role |
| `--control-radius` | `8px` | control | texture | role |
| `--control-radius-xs` | `6px` | control | texture | role |
| `--control-border-width` | `1px` | control | texture | role |
| `--control-font-weight` | `500` | control | type | role |
| `--control-font-weight-regular` | `var(--control-font-weight)` | control | type | role |
| `--control-letter-spacing` | `normal` | control | type | role |
| `--motion-fast` | `100ms` | shared | motion | role |
| `--motion-base` | `150ms` | shared | motion | role |
| `--motion-slow` | `200ms` | shared | motion | role |
| `--motion-ease` | `var(--ease-out)` | shared | motion | role |
| `--motion-enter-scale` | `0.95` | shared | motion | role |
| `--motion-enter-blur` | `0px` | shared | motion | role |
| `--motion-enter-ease` | `ease` | shared | motion | role |
| `--control-duration` | `var(--motion-base)` | control | motion | role |
| `--control-ease` | `var(--motion-ease)` | control | motion | role |
| `--control-press-offset` | `1px` | control | motion | role |
| `--control-press-scale` | `1` | control | motion | role |
| `--control-icon-button-size-md` | `var(--control-height-md)` | control | density | role |
| `--control-icon-button-icon-size-md` | `var(--control-icon-size-md)` | control | density | role |
| `--button-icon-start-padding-start-md` | `var(--control-padding-x-icon-md)` | control | density | alias |
| `--button-icon-start-padding-end-md` | `var(--control-padding-x-md)` | control | density | alias |
| `--button-round-radius` | `initial` | control | texture | neutral |
| `--button-pill-radius` | `initial` | control | texture | neutral |
| `--shadow-control` | `none` | control | depth | role |
| `--shadow-control-primary` | `none` | control | depth | role |
| `--shadow-raised` | `none` | surface | depth | role |
| `--shadow-control-pressed` | `none` | control | depth | role |
| `--shadow-recessed` | `none` | surface | depth | role |
| `--checkbox-indeterminate-shadow` | `var(--shadow-recessed)` | indicator | depth | alias |
| `--surface-control` | `none` | control | texture | role |
| `--surface-primary` | `none` | control | texture | role |
| `--surface-control-hover` | `var(--surface-control)` | control | texture | role |
| `--surface-primary-hover` | `var(--surface-primary)` | control | texture | role |
| `--tag-shadow` | `none` | indicator | depth | role |
| `--control-indicator-size` | `16px` | indicator | density | role |
| `--control-indicator-radius` | `4px` | indicator | texture | role |
| `--control-indicator-icon-size` | `14px` | indicator | density | role |
| `--control-indicator-dot-size` | `8px` | indicator | density | role |
| `--kbd-radius` | `2px` | indicator | texture | own value |
| `--switch-track-width-md` | `28px` | indicator | density | own value |
| `--switch-track-height-md` | `16.6px` | indicator | density | own value |
| `--switch-track-width-sm` | `24px` | indicator | density | own value |
| `--switch-track-height-sm` | `14px` | indicator | density | own value |
| `--switch-thumb-inset` | `1px` | indicator | density | own value |
| `--switch-thumb-size-md` | `14px` | indicator | density | own value |
| `--switch-thumb-size-sm` | `12px` | indicator | density | own value |
| `--focus-ring-width` | `2px` | shared | texture | role |
| `--focus-ring-width-strong` | `3px` | shared | texture | role |
| `--surface-radius` | `10px` | surface | texture | role |
| `--surface-radius-sm` | `8px` | surface | texture | role |
| `--toast-radius` | `var(--surface-radius-sm)` | popup | texture | alias |
| `--dialog-shadow` | `0 0 #0000` | popup | depth | neutral |
| `--menu-sub-shadow` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | popup | depth | role |
| `--sheet-shadow` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | popup | depth | own value |
| `--surface-radius-lg` | `14px` | surface | texture | role |
| `--surface-padding-md` | `16px` | surface | density | role |
| `--surface-padding-sm` | `10px` | surface | density | role |
| `--surface-padding-lg` | `24px` | surface | density | role |
| `--surface-panel-width` | `384px` | surface | density | role |
| `--surface-gap` | `4px` | surface | density | role |
| `--surface-gap-lg` | `16px` | surface | density | role |
| `--surface-icon-gap` | `6px` | surface | density | role |
| `--surface-border-width` | `1px` | surface | texture | role |
| `--overlay-backdrop-blur` | `4px` | popup | texture | role |
| `--menu-padding` | `4px` | popup | density | role |
| `--menu-min-width` | `128px` | popup | density | role |
| `--menu-item-height` | `28px` | item | density | role |
| `--menu-item-radius` | `8px` | item | texture | role |
| `--menu-item-padding-x` | `8px` | item | density | role |
| `--menu-item-padding-end` | `32px` | item | density | role |
| `--menu-item-gap` | `8px` | item | density | role |
| `--menu-item-padding-y` | `4px` | item | density | role |
| `--menu-item-padding-y-check` | `6px` | item | density | role |
| `--command-item-padding-x` | `10px` | item | density | own value |
| `--menu-item-padding-inset` | `30px` | item | density | role |
| `--menu-shortcut-letter-spacing` | `0.1em` | item | type | role |
| `--menu-shortcut-line-height` | `16.25px` | item | type | role |
| `--menu-list-max-height` | `288px` | popup | density | role |
| `--sidebar-item-height` | `32px` | item | density | own value |
| `--sidebar-item-radius` | `8px` | item | texture | own value |
| `--sidebar-item-padding-x` | `8px` | item | density | own value |
| `--sidebar-item-gap` | `8px` | item | density | own value |
| `--sidebar-item-icon-size` | `16px` | item | density | own value |
| `--sidebar-item-spacing` | `1px` | item | density | own value |
| `--sidebar-item-font-weight` | `500` | item | type | own value |
| `--sidebar-item-height-active` | `var(--sidebar-item-height)` | item | density | alias |
| `--sidebar-item-font-size` | `var(--ui-text-sm)` | item | type | alias |
| `--sidebar-item-line-height` | `var(--ui-line-height-sm)` | item | type | alias |
| `--sidebar-item-border-width` | `0px` | item | texture | neutral |
| `--sidebar-item-font-weight-idle` | `initial` | item | type | neutral |
| `--sidebar-badge-height` | `var(--sidebar-item-action-size)` | indicator | density | alias |
| `--sidebar-badge-padding-x` | `4px` | indicator | density | own value |
| `--sidebar-badge-radius` | `var(--control-indicator-radius)` | indicator | texture | alias |
| `--sidebar-badge-inset-end` | `4px` | indicator | density | own value |
| `--sidebar-badge-line-height` | `var(--ui-line-height-sm)` | indicator | type | alias |
| `--sidebar-badge-min-width` | `var(--sidebar-item-action-size)` | indicator | density | alias |
| `--sidebar-badge-font-size` | `var(--ui-text-sm)` | indicator | type | alias |
| `--sidebar-group-label-height` | `var(--sidebar-item-height)` | label | density | alias |
| `--sidebar-group-label-padding-x` | `var(--sidebar-item-padding-x)` | label | density | alias |
| `--sidebar-group-label-letter-spacing` | `var(--ui-letter-spacing)` | label | type | alias |
| `--sidebar-group-label-font-size` | `var(--ui-text-sm)` | label | type | alias |
| `--sidebar-group-label-line-height` | `var(--ui-line-height-sm)` | label | type | alias |
| `--sidebar-group-label-font-weight` | `initial` | label | type | neutral |
| `--sidebar-group-label-text-transform` | `initial` | label | type | neutral |
| `--sidebar-separator-margin-block` | `0` | separator | density | neutral |
| `--sidebar-sub-rail-offset` | `14px` | item | density | own value |
| `--sidebar-sub-item-indent` | `18px` | item | density | own value |
| `--sidebar-sub-item-height` | `28px` | item | density | own value |
| `--sidebar-item-action-size` | `20px` | item | density | own value |
| `--sidebar-item-action-icon-size` | `16px` | item | density | own value |
| `--ui-text-xs` | `10px` | type ramp | type | role |
| `--ui-text-sm` | `12px` | type ramp | type | role |
| `--ui-text-md` | `12px` | type ramp | type | role |
| `--ui-text-lg` | `14px` | type ramp | type | role |
| `--ui-line-height-xs` | `15px` | type ramp | type | role |
| `--ui-line-height-sm` | `16px` | type ramp | type | role |
| `--ui-line-height-md` | `19.5px` | type ramp | type | role |
| `--ui-line-height-lg` | `20px` | type ramp | type | role |
| `--ui-font-weight` | `500` | type ramp | type | role |
| `--ui-font-weight-regular` | `var(--ui-font-weight)` | type ramp | type | role |
| `--ui-letter-spacing` | `normal` | type ramp | type | role |
| `--heading-font-size-sm` | `16px` | type ramp | type | role |
| `--heading-font-size-md` | `18px` | type ramp | type | role |
| `--heading-font-size-lg` | `20px` | type ramp | type | role |
| `--heading-font-size-xl` | `30px` | type ramp | type | role |
| `--heading-line-height-sm` | `24px` | type ramp | type | role |
| `--heading-line-height-md` | `28px` | type ramp | type | role |
| `--heading-line-height-lg` | `28px` | type ramp | type | role |
| `--heading-line-height-xl` | `36px` | type ramp | type | role |
| `--heading-letter-spacing` | `-0.02em` | type ramp | type | role |
| `--table-head-height-default` | `40px` | label | density | own value |
| `--table-head-height-compact` | `32px` | label | density | own value |
| `--table-cell-padding-y-default` | `8px` | item | density | own value |
| `--table-cell-padding-y-compact` | `4px` | item | density | own value |
| `--table-row-height` | `auto` | item | density | neutral |
| `--table-cell-padding-x` | `var(--menu-item-padding-x)` | item | density | alias |
| `--table-checkbox-inset` | `var(--table-cell-padding-x)` | item | density | alias |
| `--table-font-size` | `var(--ui-text-sm)` | item | type | alias |
| `--table-line-height` | `var(--ui-line-height-sm)` | item | type | alias |
| `--table-head-font-size` | `var(--table-font-size)` | label | type | alias |
| `--table-head-line-height` | `var(--table-line-height)` | label | type | alias |
| `--table-checkbox-inset-end` | `0px` | item | density | neutral |
| `--tag-radius` | `9999px` | indicator | texture | role |
| `--tag-padding-x` | `var(--control-padding-x-xs)` | indicator | density | role |
| `--tag-line-height` | `var(--ui-line-height-xs)` | indicator | type | role |
| `--tag-font-size` | `var(--ui-text-xs)` | indicator | type | role |
| `--tabs-line-height` | `var(--control-height-lg)` | control | type | alias |
| `--tabs-line-divider-width` | `0px` | control | texture | neutral |
| `--tabs-line-trigger-padding-x` | `6px` | control | density | own value |
| `--tabs-line-trigger-padding-x-icon` | `4px` | control | density | own value |
| `--tabs-line-trigger-border-width` | `var(--control-border-width)` | control | texture | alias |
| `--tabs-line-trigger-radius` | `var(--control-radius)` | control | texture | alias |
| `--table-meta-column-width` | `32px` | layout | density | own value |
| `--table-actions-column-width` | `40px` | layout | density | own value |
| `--avatar-size-sm` | `24px` | indicator | density | own value |
| `--avatar-font-size-sm` | `var(--ui-text-sm)` | indicator | type | alias |
| `--avatar-font-weight` | `initial` | indicator | type | neutral |
| `--avatar-line-height-sm` | `var(--ui-line-height-sm)` | indicator | type | alias |
| `--avatar-size-md` | `32px` | indicator | density | own value |
| `--avatar-size-lg` | `40px` | indicator | density | own value |
| `--typeset-doc-size` | `18px` | type ramp | type | role |
| `--typeset-doc-leading` | `1.8` | type ramp | type | role |
| `--typeset-doc-flow` | `0.9em` | type ramp | type | role |
| `--typeset-doc-measure` | `720px` | type ramp | type | role |
| `--typeset-doc-scale-h1` | `1.9em` | type ramp | type | role |
| `--typeset-doc-scale-h2` | `1.556em` | type ramp | type | role |
| `--typeset-doc-scale-h3` | `1.222em` | type ramp | type | role |
| `--typeset-tool-size` | `16px` | type ramp | type | role |
| `--typeset-tool-leading` | `1.75` | type ramp | type | role |
| `--typeset-tool-flow` | `1em` | type ramp | type | role |
| `--typeset-tool-measure` | `672px` | type ramp | type | role |
| `--typeset-tool-scale-h1` | `1.8em` | type ramp | type | role |
| `--typeset-tool-scale-h2` | `1.5em` | type ramp | type | role |
| `--typeset-tool-scale-h3` | `1.2em` | type ramp | type | role |
| `--typeset-space-h1` | `1.8` | type ramp | type | role |
| `--typeset-space-h2` | `2.2` | type ramp | type | role |
| `--typeset-space-h3` | `1.8` | type ramp | type | role |
| `--typeset-tracking` | `-0.01em` | type ramp | type | role |
| `--badge-height` | `var(--control-height-xs)` | indicator | density | alias |
| `--badge-padding-x` | `var(--control-padding-x-xs)` | indicator | density | alias |
| `--badge-padding-x-icon` | `var(--control-padding-x-icon-xs)` | indicator | density | alias |
| `--badge-padding-y` | `2px` | indicator | density | own value |
| `--badge-gap` | `var(--control-gap-xs)` | indicator | density | alias |
| `--badge-icon-size` | `var(--control-icon-size-xs)` | indicator | density | alias |
| `--badge-border-width` | `var(--control-border-width)` | indicator | texture | alias |
| `--badge-radius` | `9999px` | indicator | texture | own value |
| `--badge-font-size` | `var(--ui-text-xs)` | indicator | type | alias |
| `--badge-line-height` | `var(--ui-line-height-xs)` | indicator | type | alias |
| `--badge-letter-spacing` | `var(--ui-letter-spacing)` | indicator | type | alias |
| `--badge-font-weight` | `var(--ui-font-weight)` | indicator | type | alias |
| `--badge-text-transform` | `initial` | indicator | type | neutral |
| `--kbd-height` | `var(--control-height-xs)` | indicator | density | alias |
| `--kbd-min-width` | `var(--kbd-height)` | indicator | density | alias |
| `--kbd-padding-x` | `4px` | indicator | density | own value |
| `--kbd-gap` | `var(--control-gap-xs)` | indicator | density | alias |
| `--kbd-font-size` | `var(--ui-text-xs)` | indicator | type | alias |
| `--kbd-line-height` | `var(--ui-line-height-xs)` | indicator | type | alias |
| `--kbd-letter-spacing` | `var(--ui-letter-spacing)` | indicator | type | alias |
| `--kbd-font-weight` | `var(--ui-font-weight)` | indicator | type | alias |
| `--kbd-icon-size` | `var(--control-icon-size-sm)` | indicator | density | alias |
| `--control-radius-sm` | `var(--control-radius)` | control | texture | role |
| `--control-text-transform` | `initial` | control | type | role |
| `--control-padding-x-grouped` | `var(--control-padding-x-md)` | control | density | role |
| `--control-icon-button-icon-size-sm` | `var(--control-icon-size-sm)` | control | density | role |
| `--control-padding-x-field` | `var(--control-padding-x-md)` | field | density | role |
| `--control-padding-y-field` | `2px` | field | density | role |
| `--control-font-size-field` | `var(--control-font-size-md)` | field | type | role |
| `--control-line-height-field` | `var(--control-line-height-md)` | field | type | role |
| `--control-letter-spacing-field` | `var(--control-letter-spacing)` | field | type | role |
| `--toggle-gap` | `var(--control-gap-md)` | control | density | alias |
| `--toggle-group-joined-radius` | `var(--control-radius)` | control | texture | alias |
| `--switch-thumb-width-md` | `var(--switch-thumb-size-md)` | indicator | density | alias |
| `--switch-thumb-width-sm` | `var(--switch-thumb-size-sm)` | indicator | density | alias |
| `--switch-radius` | `9999px` | indicator | texture | own value |
| `--label-font-weight` | `var(--ui-font-weight)` | label | type | role |
| `--ui-label-text-transform` | `initial` | type ramp | type | role |
| `--ui-label-letter-spacing` | `var(--ui-letter-spacing)` | type ramp | type | role |
| `--title-text-transform` | `initial` | type ramp | type | role |
| `--title-letter-spacing` | `var(--ui-letter-spacing)` | type ramp | type | role |
| `--table-head-text-transform` | `initial` | label | type | neutral |
| `--table-head-letter-spacing` | `var(--ui-letter-spacing)` | label | type | alias |
| `--menu-separator-margin-inline` | `calc(var(--menu-padding) * -1)` | separator | density | role |
| `--menu-separator-margin-block` | `var(--menu-padding)` | separator | density | role |
| `--menu-label-padding-y` | `var(--menu-item-padding-y-check)` | label | density | role |
| `--menu-label-text-transform` | `initial` | label | type | role |
| `--menu-label-letter-spacing` | `var(--ui-letter-spacing)` | label | type | role |
| `--menu-item-text-transform` | `initial` | item | type | role |
| `--menu-item-letter-spacing` | `var(--ui-letter-spacing)` | item | type | role |
| `--menu-item-font-weight` | `initial` | item | type | role |
| `--menu-narrow-min-width` | `var(--menu-min-width)` | popup | density | role |
| `--command-item-radius` | `var(--menu-item-radius)` | item | texture | alias |
| `--command-item-gap` | `var(--menu-item-gap)` | item | density | alias |
| `--select-item-gap` | `var(--menu-item-gap)` | item | density | alias |
| `--menubar-padding` | `var(--menu-padding)` | popup | density | alias |
| `--menubar-gap` | `normal` | popup | density | neutral |
| `--menubar-item-padding-inset` | `var(--menu-item-padding-inset)` | item | density | alias |
| `--card-radius` | `var(--surface-radius)` | surface | texture | alias |
| `--bubble-radius` | `var(--surface-radius)` | surface | texture | alias |
| `--bubble-padding-x` | `var(--surface-padding-sm)` | surface | density | alias |
| `--bubble-padding-y` | `6px` | surface | density | own value |
| `--bubble-line-height` | `var(--ui-line-height-md)` | surface | type | alias |
| `--chart-tooltip-radius` | `var(--surface-radius)` | popup | texture | alias |
| `--empty-radius` | `var(--surface-radius-lg)` | surface | texture | alias |
| `--questionnaire-choice-padding-x` | `12px` | surface | density | own value |
| `--questionnaire-choice-padding-y` | `10px` | surface | density | own value |
| `--questionnaire-choice-gap` | `10px` | surface | density | own value |
| `--questionnaire-choice-radius` | `var(--surface-radius-lg)` | surface | texture | alias |
| `--questionnaire-choice-min-height` | `44px` | surface | density | own value |
| `--questionnaire-gap` | `16px` | surface | density | own value |
| `--questionnaire-item-gap` | `12px` | surface | density | own value |
| `--questionnaire-choice-checked-border` | `var(--ring)` | surface | texture | alias |
| `--sheet-padding` | `var(--surface-padding-lg)` | popup | density | alias |
| `--accordion-border-width` | `var(--surface-border-width)` | surface | texture | alias |
| `--tabs-list-height` | `var(--control-height-lg)` | surface | density | alias |
| `--tabs-list-padding` | `3px` | surface | density | own value |
| `--tabs-trigger-gap` | `6px` | control | density | own value |
| `--tabs-trigger-padding-x` | `6px` | control | density | own value |
| `--tabs-trigger-padding-y` | `2px` | control | density | own value |
| `--tabs-trigger-active-shadow` | `none` | control | depth | neutral |
| `--item-gap` | `var(--menu-item-gap)` | item | density | role |
| `--item-media-icon-size` | `var(--control-icon-size-lg)` | item | density | role |
| `--slider-track-thickness` | `4px` | indicator | density | own value |
| `--avatar-font-size` | `var(--ui-text-lg)` | indicator | type | alias |
| `--avatar-line-height` | `var(--ui-line-height-lg)` | indicator | type | alias |
| `--sidebar-surface-padding` | `var(--menu-item-padding-x)` | surface | density | alias |
| `--sidebar-surface-gap` | `var(--menu-item-gap)` | surface | density | alias |
| `--sidebar-input-height` | `var(--control-height-lg)` | surface | density | alias |
| `--sidebar-item-padding-y` | `var(--sidebar-item-padding-x)` | item | density | alias |
| `--sidebar-separator-margin-inline` | `var(--sidebar-item-padding-x)` | separator | density | alias |
| `--sidebar-badge-font-weight` | `var(--ui-font-weight)` | indicator | type | alias |
| `--sidebar-part-radius` | `var(--sidebar-item-radius)` | surface | texture | alias |
| `--sidebar-pane-gap` | `0px` | surface | density | neutral |
| `--sidebar-pane-radius` | `0px` | surface | texture | neutral |
| `--sidebar-pane-ring-width` | `0px` | surface | texture | neutral |
| `--input-group-addon-padding-x` | `var(--control-padding-x-grouped)` | field | density | alias |
| `--input-group-addon-padding-x-block` | `var(--input-group-addon-padding-x)` | field | density | alias |
| `--toggle-group-item-padding-x` | `var(--control-padding-x-grouped)` | control | density | alias |
| `--input-group-button-radius` | `var(--control-radius-sm)` | field | texture | alias |
| `--toggle-group-joined-radius-sm` | `var(--toggle-group-joined-radius)` | control | texture | alias |
| `--toggle-group-item-radius` | `var(--toggle-group-joined-radius)` | control | texture | alias |
| `--select-trigger-padding-start` | `var(--control-padding-x-field)` | field | density | alias |
| `--select-trigger-padding-end` | `var(--select-trigger-padding-start)` | field | density | alias |
| `--native-select-padding-y` | `var(--control-padding-y-field)` | field | density | alias |
| `--tag-height` | `var(--badge-height)` | indicator | density | role |
| `--accordion-item-border-width` | `var(--accordion-border-width)` | surface | texture | alias |
| `--card-part-radius` | `var(--card-radius)` | surface | texture | alias |
| `--card-image-radius` | `var(--card-radius)` | surface | texture | alias |
| `--card-shadow` | `var(--shadow-card)` | surface | depth | alias |
