# mira — reference

This system ports the shadcn create preset `base-mira` (shadcn 4.21.0, shadcn-ui/ui commit
`7c9eaba1c0a6404c990c144a654792e3313c650d`, tag `shadcn@4.21.0`). Nothing from the sources is copied into
this folder; the links are the record.

| Preset field | Value |
|---|---|
| `description` | `Mira / Hugeicons / Inter` |
| `base` | `base` |
| `style` | `mira` |
| `baseColor` | `neutral` |
| `theme` | `neutral` |
| `chartColor` | `neutral` |
| `iconLibrary` | `hugeicons` |
| `font` | `inter` |
| `fontHeading` | `inherit` |
| `item` | `Item` |
| `rtl` | `false` |
| `menuAccent` | `subtle` |
| `menuColor` | `default` |
| `radius` | `default` |

## Sources

- Style rules: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/styles/style-mira.css
- Base colours and themes: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/base-colors.ts · https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/themes.ts
- Preset list: https://github.com/shadcn-ui/ui/blob/7c9eaba1c0a6404c990c144a654792e3313c650d/apps/v4/registry/config.ts
- Reference app: `node tooling/preset/make-reference.mjs mira` — `npx shadcn@4.21.0 init -t next -b base -p mira -n mira`
  plus `shadcn add` of every registry/ui component; its generated `app/globals.css` and `components/ui/*` are the answer key.

## How this port differs from the others

mira is the preset `registry/foundation` is built from, so there was nothing mechanical to port:
`node tooling/new-system mira --from foundation` copies foundation's styles unchanged and that **is** the
system. The work that would normally happen here happened in foundation instead — the correction against
this same reference app, recorded in `registry/foundation/reference/README.md` with the full iteration
table and a row per corrected value.

Two consequences worth knowing:

- This system and foundation must stay identical in `styles/`. If they drift, one of them is wrong.
- `compare-exclusions.json` is a copy of foundation's and must stay a copy. A row that is true here but not
  there (or the reverse) means the two folders have diverged.

## Results (2026-09-16)

```sh
node tooling/snapshot/compare-shadcn.mjs --system mira \
  --reference http://localhost:3101 --preview http://localhost:5182 --mode light|dark
```

Viewport 1440×900, template `coverage`: 57 sections, each opened alone so its popups render open,
2514 paired elements over 60 components.

| Iteration | What changed | Light | Dark |
|---|---|---|---|
| 0 | `new-system mira --from foundation`, straight after foundation's correction | **0** | **0** |

Exclusions: the seven rows of `registry/foundation/reference/compare-exclusions.json`, unchanged —
55 matches in light, 70 in dark. Their reasons are in that file and summarised in foundation's README.

Not covered by the comparison: nothing. The coverage template renders all 62 `registry/ui` components and the
comparison pairs every one that carries a `data-slot`.
