# Parts no role covers

A tape reel, a VU needle, a slider thumb, a waveform: some parts have no role. Dress them from role tokens by
meaning, in the component's own CSS or as Tailwind arbitrary values. Never a literal.

## Read the nearest role, by meaning

| The part is like | Read |
|---|---|
| a small thing you grab (thumb, knob) | size `var(--control-icon-size-lg)` or `var(--control-height-xs)`, fill `var(--surface-primary, var(--primary))`, shadow `var(--shadow-control)`, ring on focus `var(--focus-ring-width)` + `var(--ring)` |
| a groove or rail | fill `bg-muted`, corners `var(--indicator-radius-pill)` |
| a window cut into a plane | a `surface` with `data-level="inset"` |
| a disc or dial | border `var(--surface-border-width)` + `border-border`, fill `bg-card`, shadow `var(--shadow-recessed)` or `var(--surface-shadow)` |
| a lit segment, a fill amount | `bg-primary`; warnings `bg-warning`, `bg-destructive` |
| numbers that change | `font-[family-name:var(--font-mono)]` with `tabular-nums`, inside an `indicator` |

## Geometry follows density

When a part needs a size, derive it from a density token by ratio, so it grows and shrinks with the system:
`h-[calc(var(--control-height-md)/8)]` for a rail, `size-[calc(var(--control-height-md)*1.6)]` for a reel. A dense
system then gets a small reel and a roomy one a big reel, with no change to the component.

## Motion

Continuous motion (a spinning reel) is behaviour: give it a duration in the component and stop it under
`prefers-reduced-motion`. Transitions on state changes read `var(--motion-base)` and `var(--motion-ease)`.

## When a role step is missing

If the same look comes back across components (every slider thumb, every rail) and you keep composing it from the
same tokens, it wants to be a role step. In the app, write it once as the app's own token in the CSS entry, after
the system's imports, reading only role tokens:

```css
:root {
    --app-thumb-size: var(--control-icon-size-lg);
    --app-rail-height: calc(var(--control-height-md) / 8);
}
```

Then tell the person it is a candidate for a tyohnn role step, so a later system can set it on purpose. Do not add
it to the system's files.
