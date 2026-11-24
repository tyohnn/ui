# registry/objects

Objects: one-off interfaces with a material of their own — a thermostat's dial, a hardware switch, a ticket, a
device face. A component (`registry/ui`) and a block (`registry/blocks`) take every value from the system, so
every product looks of a piece. An object does not: what makes it worth looking at is the material no system
token describes (black glass, a ribbed metal thumb, an LCD's green), and that material stays literal.

An object still wears the system. A few values are **anchors**: they read system tokens, so the same object looks
like it belongs to clover in a clover app and to graphite in a graphite app. Change the system, and the object's
face, ink, signal colour, type and timing follow; its material stays.

## The contract

1. **Behaviour comes from UI SDK.** An object imports the primitive directly (`@ui-sdk/react/switch`, `…/slider`,
   `…/select`) for keyboard, focus and ARIA, and styles it from scratch. It does not wrap `registry/ui`'s
   components: their `cn-*` rules would fight the material.
2. **Material is local.** The object's root declares its own custom properties, `--<object>-*`
   (`--frost-glass`, `--frost-segment`), and the rules read those. Literal colours, gradients, inset shadows,
   noise and SVG textures (`url("data:image/svg+xml,…")`) belong here and nowhere else in the registry.
3. **Anchors read the system.** Each object binds at least these to system tokens, on its root:

   | Anchor | Token | What it is on the object |
   | --- | --- | --- |
   | face | `var(--primary)` | the body: the colour a person names the object by |
   | ink | `var(--primary-foreground)` | type and marks printed on the face |
   | signal | `var(--destructive)` (or `--chart-*`) | the one alarm or state colour |
   | type | `var(--font-heading)` | every `font-family` |
   | focus | `var(--ring)` | the focus outline |
   | timing | `var(--motion-*)` | every transition and animation duration and easing |

   Highlights and shades of the face are `color-mix()` of the face anchor, never a second literal of its hue.
4. **The system's switches still work.** Durations come from `--motion-*`, so a system's reduced-motion block zeroes
   them; JavaScript that animates (frame stepping, a blink) checks `prefers-reduced-motion` itself and shows the
   final frame. Focus is visible (`:focus-visible` with the ring anchor). Labels are real text a person can read
   and a screen reader can reach.
5. **Words are props.** The object's own words (a legend, the ends of a switch) are props with English defaults,
   the way a block's are, so a product passes its language.

`check_object` in the plugin (`packages/mcp/src/object.ts`) checks rules 2–4 on an object's CSS:
a literal `font-family`, a literal duration or easing, no `:focus-visible`, a literal focus colour, or no anchor at
all is an error; a literal colour outside a custom-property declaration is a warning (it is material that should be
named on the root).

## Objects

| Object | Behaviour | From |
| --- | --- | --- |
| `frost-alarm` | `Switch` | UI SDK's ui-feed design "Frost alarm": an outdoor thermometer whose LCD draws the overnight curve and a switch that arms the alarm |

The preview draws every object in the started system (`?template=objects`), so `build --system=<name>` for two
systems is the proof that the anchors move and the material stays.
