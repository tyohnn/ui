# Roles

Each role dresses like the primitive it is named after, so a crafted part sits next to real primitives without a
seam. The role rules read role tokens and theme colours only.

| data-role | Dresses like | Attributes | States it styles |
|---|---|---|---|
| `control` | button | `data-variant` = primary (default when absent) · secondary · outline · ghost · destructive; `data-size` = xs · sm · md (default) · lg; `data-icon` = square icon button | hover, `:active` press, `:focus-visible` ring, `disabled` / `aria-disabled` / `data-disabled`; ghost and outline show `aria-pressed="true"`, `aria-selected="true"`, `data-active`, `data-checked` as on |
| `field` | input | `data-size` = sm · md | focus ring, `aria-invalid="true"`, disabled |
| `surface` | card | `data-level` = raised (default) · ground · inset; `data-density` = compact · tight | glass in systems that use it (raised, no `data-level`) |
| `popup` | menu content | | |
| `item` | menu item | `data-size` = sm (default) · md · lg | `:focus-visible` / `data-highlighted` (hover colour), `data-active` / `aria-selected` / `aria-current="page"` (current), disabled |
| `indicator` | badge | `data-shape` = (none: badge) · pill · square; `data-size` = sm · md · lg (a round avatar-sized dot); `data-variant` = primary · secondary · outline | |
| `label` | a surface title or group label | `data-tone="muted"` | |
| `meta` | the description under a title | | |
| `separator` | separator | `data-orientation` = horizontal · vertical | |
| `track` | the tab list | holds `control`s; controls inside it step down a size and show their on state | `aria-selected`, `aria-pressed`, `data-active`, `data-checked` on the inner control |

## Choosing a role

- Can you press it? `control`. Type into it or pick from it? `field`.
- Does it hold other things on a plane? `surface` (raised on the page, `inset` for a well or a window cut into a
  surface, `ground` for a plane level with the page).
- Does it float above the page? `popup`.
- Is it one of many rows? `item`.
- Does it show a state or a number? `indicator`.
- Is it words that name or describe? `label` or `meta`.

A part can be both a headless part and a role: `<Toolbar.Button data-role="control" data-variant="ghost">` in Base UI,
`<ToolbarButton data-role="control" data-variant="ghost">` in UI SDK.

## Specificity

Role rules sit in the base layer. A utility in `className` wins over them, which is right for layout and wrong for
feel: `rounded-xl` on a `data-role="control"` freezes its corners in every system. Leave feel to the role.
