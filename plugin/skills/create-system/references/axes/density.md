# Density

How much air. Set role tokens; every control, row and surface follows.

| Token | Role | Typical range | Notes |
|---|---|---|---|
| `--control-height-xs` · `-sm` · `-md` · `-lg` | control | 20–28 · 24–32 · 28–40 · 32–48px | keep the steps 4px apart; `-md` is the default button and input |
| `--control-padding-x-*` | control | 6–24px | roughly a third of the height for text buttons |
| `--control-gap-*` | control | 4–8px | icon to label |
| `--item-height-sm` · `-md` · `-lg` | item | 24–32 · 28–40 · 36–48px | menu rows, list rows, sidebar rows, table heads |
| `--item-padding-x`, `--item-padding-y-sm` · `-lg` | item | 6–12px · 2–8px | |
| `--item-spacing` | item | 0–4px | gap between rows of one list |
| `--surface-padding-xs` · `-sm` · `-md` · `-lg` | surface | 6 · 12 · 16–24 · 24–32px | inside cards and panels |
| `--surface-raised-spacing` | surface | as `-md` | padding and gap of a raised surface (the card) |
| `--surface-gap` · `-lg` | surface | 8–24px | between blocks inside a surface |
| `--indicator-height`, `--indicator-padding-x*` | indicator | 18–24px | badges and tags |
| `--table-row-height` | (slot) | 32–48px | tables only; set it when the concept talks about data tables |

## Reading a mood

- **Dense** (tools, dashboards): control-md 28px, item-md 28–30px, surface-md 12–16px.
- **Default**: control-md 32px, item-md 32px, surface-md 16–20px.
- **Roomy** (consumer, iOS-like): control-md 36–40px, item-md 36px, surface-md 24px.

Move a whole ramp together (xs to lg) so sizes keep their order. Change type sizes on the typography axis, not here.
