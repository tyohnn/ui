# Reading a request into a concept

A concept is the person's words plus one line per axis. It is short (five to eight lines) and every line names
something you can set. It ends up in `concept.md` beside the system's files, where the next agent reads it before
building a screen.

## Shape

```
<What the person asked for, in their words.>

Colour: <palette mood, accent, how much contrast, what is coloured and what stays neutral>
Density: <how much air: control and row heights, surface padding>
Depth: <how far surfaces lift: flat, hairline, soft shadow, layered glass>
Texture: <what surfaces are made of: corners, edges, fills, blur, sheen>
Typography: <stacks, weight, tracking, how labels speak>
```

## Words to axes

People describe a feel in moods and metaphors. Read each word for every axis it touches.

| They say | Colour | Density | Depth | Texture | Typography |
|---|---|---|---|---|---|
| calm, quiet | low chroma, one accent | airy | flat or hairline | soft corners | regular weight |
| pro, power user, dashboard | neutral greys, status colours | dense | flat | small radius, hairline borders | small sizes, medium weight, mono for numbers |
| playful, friendly | saturated accent, warm | roomy | soft lift | round, pill controls | rounded or geometric sans, bolder |
| editorial, magazine | ink on paper, few colours | roomy | flat | square corners | serif headings, uppercase labels |
| glass, Apple-like | light neutrals, vivid accent | roomy | layered, soft shadows | blur, sheen, large radius | system or SF-like sans, tight tracking on titles |
| tactile, clay, physical | warm mid-tones | roomy | contact + ambient shadow | inner highlight, pressed state | medium weight |
| brutalist, raw | black, white, one loud colour | either | none | 0 radius, thick borders | mono or grotesk, uppercase |
| luxury, premium | deep darks or creams, metal accent | airy | subtle | thin borders, small radius | light weights, wide tracking |
| nature words (forest, moss, sea, sand) | the palette of the place | from the mood | from the mood | the material (bark is matte, water is glossy) | from the mood |

A metaphor with two halves ("Apple's glass meets a forest") splits by axis: one half usually brings the material
(texture, depth), the other the palette and mood (colour, density). Say which half drives which axis.

## Worked example

> "Apple's glass, but in a forest."

```
Apple's glass, but in a forest.

Colour: moss and fern greens on a pale lichen ground; one bright leaf accent for primary actions; dark mode is the forest at night, deep green-black rather than grey.
Density: roomy, like iOS settings: controls 36px, rows 36px, surface padding 24px.
Depth: layered panes: surfaces float with a soft, wide shadow; popups lift further.
Texture: frosted glass surfaces (backdrop blur and a light sheen), large 16px surface corners, 10px controls, hairline light edges.
Typography: a clean system-like sans, medium weight for controls, slightly tight titles.
```

Base: a glass system (halo or cirrus) is closest on depth and texture; the greens are a palette change.

## When the request is thin

"Make it look modern" names no axis. Pick a direction, write it as a concept and say it is your reading. Do not
ask a menu of questions; the System view lets the person react to something concrete.
