# Depth

How far a surface sits off the ground: outer shadows, rings and the steps between planes.

| Token | Role | What it lifts |
|---|---|---|
| `--surface-shadow` | surface | raised surfaces: cards and every `data-role="surface"` |
| `--popup-shadow-lg` | popup | sheets and large popups |
| `--shadow-raised`, `--shadow-recessed` | surface | the raised and inset steps |
| `--shadow-control`, `--shadow-control-primary`, `--shadow-control-pressed` | control | buttons at rest, the primary button, while pressed |
| `--field-shadow` | field | inputs (usually none, or an inner shadow for a recessed field) |
| `--focus-ring-width` | shared | how loud focus is |

## Steps

| Feel | `--surface-shadow` | Controls |
|---|---|---|
| flat | `none` (let `--surface-ring`, a layer-1 colour, draw the edge) | `--shadow-control: none` |
| hairline | `0 0 0 1px color-mix(in oklab, var(--foreground) 8%, transparent)` | none |
| soft | `0 1px 2px rgb(0 0 0 / .06), 0 4px 12px rgb(0 0 0 / .06)` | `0 1px 2px rgb(0 0 0 / .08)` |
| lifted | `0 2px 4px rgb(0 0 0 / .08), 0 12px 32px rgb(0 0 0 / .14)` | soft |
| tactile (clay) | contact + ambient pair, plus an inner highlight on texture | raised with an inset highlight |

Popups sit one step above surfaces. In dark mode shadows read weakly: lean on a lighter plane colour (`card` a step
above `background`) and a faint light edge instead of a darker shadow.

A shadow value may use colour names: `0 8px 24px color-mix(in oklab, var(--foreground) 12%, transparent)` follows
both modes by itself.
