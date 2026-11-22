# Texture

What surfaces are made of: corners, edges, fills, blur, sheen.

| Token | Role | Notes |
|---|---|---|
| `--control-radius`, `--control-radius-sm` · `-xs` | control | `9999px` makes pill buttons |
| `--field-radius` | field | inputs; often the control radius, sometimes smaller |
| `--surface-radius`, `--surface-radius-sm` · `-lg`, `--surface-raised-radius` | surface | cards and panels; raised surfaces read `--surface-raised-radius` |
| `--item-radius` | item | menu and list rows |
| `--indicator-radius`, `--indicator-radius-pill` · `-sm` | indicator | badges (default shape), pills, keycaps |
| `--control-border-width`, `--surface-border-width`, `--indicator-border-width` | | 0, 1 or 2px |
| `--surface-control`, `--surface-primary` (+ `-hover`) | control | the fill of secondary and primary buttons: a colour or a gradient |
| `--surface-sheen` | surface (layer 1) | a gradient laid over raised surfaces (`none`, or a soft top light) |
| `--surface-glass-fill`, `--surface-glass-filter`, `--surface-glass-sheen` | surface | frosted surfaces where the browser supports backdrop blur |
| `--overlay-backdrop-blur` | popup | blur behind dialogs and sheets |

## Radii keep a relation

Nested corners look right when inner radius ≈ outer radius − padding. Keep control ≤ surface, item ≤ popup.
Square systems set all of them to 0; pill systems set controls and indicators to `9999px` and keep surfaces
moderate.

## Glass

Glass is three tokens together:

```
--surface-glass-fill:   color-mix(in oklab, var(--card) 62%, transparent)
--surface-glass-filter: blur(20px) saturate(1.4)
--surface-glass-sheen:  linear-gradient(180deg, color-mix(in oklab, white 14%, transparent), transparent 40%)
```

These reach every `data-role="surface"`. The base card component reads its own glass tokens only in the glass
systems (halo, cirrus): for a glass concept, start from one of those, or the primitives' cards stay opaque while
role surfaces turn to glass. Glass needs something behind it: a coloured or image ground (`background`) and depth
from a wide soft shadow, not a dark one.

## Fills

A gradient on `--surface-primary` (e.g. `linear-gradient(180deg, color-mix(in oklab, var(--primary) 92%, white), var(--primary))`)
gives buttons a material. Keep it subtle; colour still comes from `primary`.
