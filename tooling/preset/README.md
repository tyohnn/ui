# Porting a shadcn create preset

This procedure turns one shadcn create preset (`nova` · `vega` · `maia` · `lyra` · `mira` · `luma` · `sera` ·
`rhea`) into a tyohnn design system, `registry/systems/<preset>`, and proves it against the real shadcn
output. It was first run for **vega** on 2026-09-15 (`registry/systems/vega/reference/README.md` has that
run's record). Every command takes the preset name; nothing else changes between presets.

The pinned shadcn version is `SHADCN_VERSION` in `shared.mjs` (4.21.0). Bump it for all presets together.

## Tools

| File | Does |
|---|---|
| `make-reference.mjs <preset>` | the reference Next app (the answer key): `shadcn init` with the preset on Base UI, `shadcn add` of every `registry/ui` component, the component sheet copied in, type-check |
| `port.mjs <preset>` | `new-system` from foundation plus everything mechanical: `system.json` fonts · icons · source, layer-1 shadcn colours and radius scale from the reference app, `reference/` |
| `style-diff.mjs <from> <to>` | utility-level difference of two `style-<name>.css` files, per `cn-*` selector |
| `specimen-text.json` | the component sheet's Korean strings in English (see Text) |
| `../snapshot/compare-shadcn.mjs --system <preset>` | computed-style comparison of the tyohnn preview against the reference app |

Downloads and generated apps live in a work directory outside the repository: `--workdir <dir>`, else
`TYOHNN_PRESET_WORKDIR`, else `<os tmpdir>/tyohnn-preset`. Use the same one for every step.

```sh
export TYOHNN_PRESET_WORKDIR=/path/to/scratch/shadcn-ref
PRESET=sera
```

## 1. Reference app

```sh
node tooling/preset/make-reference.mjs $PRESET
(cd $TYOHNN_PRESET_WORKDIR/$PRESET && npm run dev -- -p 3100)   # keep running (second terminal)
```

The script:

1. sparse-checks out `shadcn-ui/ui` at tag `shadcn@<version>` (`apps/v4/registry/*.ts` and `styles/`) into
   `<workdir>/ui-<version>`;
2. runs `npx shadcn@<version> init -t next -b base -p <preset> -n <preset> --no-monorepo -y` (a Next app with
   the preset's style, base colour, theme, icon library, fonts through `next/font`, radius);
3. runs `npx shadcn@<version> add <every registry/ui component> --overwrite -y`;
4. copies `apps/preview/src/templates/component-sheet` to `components/component-sheet` with
   `@tyohnn/components/*` → `@/components/ui/*`, `@tyohnn/icons` → a copy of `registry/ui/icons` for the
   preset's icon library, Korean → English, comments removed, `"use client"` added; `app/page.tsx` renders it;
5. type-checks the app and prints any error: an error is an API difference between `registry/ui` and the
   shadcn component. Record it in the system's `reference/README.md` and exclude that part (step 4);
6. writes `<app>/tyohnn-reference.json` (config, version, commit, command, missing components, type errors).

`data-tone` and `data-shape` stay in the copy. shadcn ignores them, and the comparison then checks that the
system's slots make them change nothing (a preset has no tones or shapes) — or record their removal.

## 2. Rules (the sources)

Read, do not paste: the sources are third-party. Take values with `style-diff.mjs` and grep.

- **Style rules** — `apps/v4/registry/styles/style-<style>.css`. foundation is mira, so the port is the
  difference: `node tooling/preset/style-diff.mjs mira $PRESET` (add `--only .cn-button,.cn-card` to narrow).
  To see a whole rule of either style, grep the file in `<workdir>/ui-<version>`.
- **Colours** — the reference app's `app/globals.css` is the generated answer (base colour + theme + chart
  colours + radius); `base-colors.ts` / `themes.ts` are the source.
- **Baked components** — `<app>/components/ui/*.tsx` hold the utilities as the CLI wrote them, including
  what the style file leaves to the component (layout, sizes the style does not override).
- `port.mjs` writes the source URLs pinned to the commit into `reference/README.md`.

## 3. System

```sh
node tooling/preset/port.mjs $PRESET
node tooling/build-system $PRESET
```

`port.mjs` does, and may be re-run (it only rewrites what it owns):

- `node tooling/new-system <preset> --from foundation` when the folder does not exist;
- `system.json`: `fonts` (`font` · `fontHeading` as catalog ids, mono `system`, `hangulFallback` `pretendard`),
  `icons.library`, `tags` + `shadcn-preset`, `source { kind: "shadcn-preset", preset, shadcnVersion, commit }`,
  a placeholder description;
- layer 1 in place: the three font stacks, every shadcn standard colour of the reference `globals.css` in
  `:root` and `.dark`, the `@theme inline` radius scale; it prints the non-standard tokens that hold literal
  colours — those are derived from the style's alpha utilities and must be reviewed by hand;
- `reference/README.md`, `reference/preset.json`, an empty `reference/compare-exclusions.json`.

A preset font missing from `registry/fonts` stops the script: add `registry/fonts/<id>.json` first.

Then by hand (or by an agent), in this order:

1. **Layer 1 derived colours** — the tokens `port.mjs` listed (`--primary-hover`, `--input-fill`,
   `--ring-focus`, `--border-subtle`, `--overlay-backdrop`, `--sidebar-group-label-foreground`, tag and
   avatar tones …): recompute each from the preset's utilities and base colour, in `:root` and `.dark`.
2. **Layer 2 values** — the axes the diff moves as a whole: control heights · paddings · gaps · font sizes ·
   icon sizes · radii, `--focus-ring-width`, `--ui-text-*`, `--menu-*`, `--sidebar-*`, `--table-*`,
   `--tabs-line-*`, `--shadow-*`, `--avatar-*`, `--switch-*`, letter-spacing.
3. **Layer 3 rules** — only where no value gets there: a rule that reads the wrong step of an axis (a card
   that is `rounded-xl` while the axis gives 10px), a declaration the preset adds (shadow-xs), a literal the
   preset changes. Mark each changed declaration with a `<preset>: <utility>` comment. When light and dark
   need different values and no slot exists, add a system-only layer-1 token in both scopes and read it
   (scan-tokens warns; list it as a foundation slot candidate) rather than splitting `.dark` in layer 3.
4. `DESIGN.md` from the template: character, key values, combination rules, do-nots. `system.json`
   description in mood terms, tags.

## 4. Compare

```sh
node tooling/build-system $PRESET
(cd apps/preview && SYSTEM=$PRESET node scripts/vite-system.mjs --port 5190 --strictPort)   # keep running (third terminal)
node tooling/snapshot/compare-shadcn.mjs --system $PRESET --preview http://localhost:5190 --mode light
node tooling/snapshot/compare-shadcn.mjs --system $PRESET --preview http://localhost:5190 --mode dark
```

- Both pages: 1440×900, DPR 1, reduced motion, the same colour scheme and `dark` class on `<html>`.
- Pairs by `data-slot` and order (an element without a slot is keyed under its nearest slotted ancestor),
  so a DOM difference inside one component shifts only that component.
- Compares the properties of `tooling/snapshot/props.mjs` plus box height; `<svg>` by box only.
- Normalises what paints the same: colours as rendered 8-bit pixels, Tailwind's empty ring/shadow layers,
  zero-width border sides, pill radii (`rounded-full` vs 9999px).
- After the sheet it opens the Specimen's second select, its dropdown menu and its dialog and compares the
  popups (`select:` · `dropdown:` · `dialog:` keys); `--states closed` skips them.
- Prints pairs, mismatches grouped by component and property, exclusions with reasons, and crops both sides
  of the first mismatching element per component into `tooling/snapshot/out/shadcn-<preset>-<mode>/`
  (gitignored) plus one screenshot per open popup.
- Exits 0 when only exclusions remain. Exclusions go in `registry/systems/<preset>/reference/compare-exclusions.json`:
  `[{ "key": "<regex>", "props": [...] | "*", "reason": "…" }]` — one reason each, never a system value.

## 5. Iterate

Fix → `build-system` → compare, until 0 or only explained exclusions. Record each iteration's count in
`reference/README.md`. Then:

```sh
npx turbo typecheck
node tooling/scan-tokens
node tooling/validate-system
```

The comparison covers the component sheet and three popups. Components it does not render are ported by
reading `style-diff.mjs`; list them as "not covered" in `reference/README.md`.

## Text

Korean in the sheet falls back to Pretendard on tyohnn and to a system font in the Next app, so text metrics
would differ for no system reason. `specimen-text.json` maps every Korean string to English:
`make-reference.mjs` writes the reference copy with it, `compare-shadcn.mjs` swaps the same strings on the
tyohnn page before measuring. The tyohnn Specimen itself stays Korean. Both scripts fail on leftover
Hangul — add the new string to the map.

## Pitfalls (from the vega run)

- **Preset flag.** `-p base-vega` is rejected; the preset is `-p vega` and the base is `-b base`.
- **Passing the component list** through a zsh variable sends one argument (`add "accordion alert …"`); the
  script passes an array.
- **Ports.** Another local app may hold 3000 and another session may hold the preview's 5173: run the reference on 3100
  and the preview with `--port`, and pass `--preview` to the comparison.
- **foundation is not exactly mira.** Porting "the diff from mira" leaves foundation's own deviations in the
  new system. vega's comparison found: letter-spacing `-0.01em` (Pretendard-era) where shadcn has none;
  avatar fallback type inherited instead of text-sm / text-xs; sidebar section label colour opaque
  `--sidebar-icon` instead of `sidebar-foreground/70`; dialogs with a drop shadow (shadcn: ring only); menu
  items without their vertical padding (hidden by min-height); chart colours from the legacy coloured ramp
  (every 4.21 preset uses `chartColor` of its base colour). Expect them in every preset.
- **Shared tokens move several components.** `--control-height-xs` also sizes badges and kbd,
  `--menu-item-radius` also rounds `Item`, `--surface-radius` is read by a dozen rules, `--ui-text-md` by most
  text. After changing a token, `grep -rl "var(--<token>" registry/systems/$PRESET/styles/components` and
  check each reader against the preset.
- **min-height vs height.** shadcn's `h-9 py-2` select trigger is a fixed height with padding inside;
  tyohnn's `min-height` grows to 38px.
- **Tailwind serialisation.** `border-0` keeps `border-style: solid`; `rounded-full` is `calc(infinity * 1px)`;
  ring and shadow utilities compose into a five-layer `box-shadow`. The comparison normalises these; a
  hand-written rule does not need to imitate them.
- **Fractional values** such as vega's 18.4px switch track are the preset's; scan-tokens' fractional-px
  warning is expected.
- **TSX drift is not a system value.** `registry/ui` follows the shadcn 4.21.0 base sources (synced 2026-09-15)
  except where a visual utility would beat a layer-3 rule: no `text-sm`/`text-xs` on `AvatarFallback`, no
  `text-xs` on `ChartContainer`, `cn-separator` instead of `bg-border h-px …` on `Separator`, `cn-calendar-weekday` ·
  `cn-calendar-week-number` instead of `text-[0.8rem]`, no `[&_svg]:size-4` on `SidebarMenuButton`, and
  `InputGroupButton` passing `size` to `Button`. A preset reproduces those values in its layer 3. Any other
  difference from the shadcn component is drift: exclude it with the reason and fix it in `registry/ui`.
- **Regression baselines.** A second checkout of main with a symlinked `node_modules` serves no fonts (Vite
  `server.fs.allow` stops at the checkout), so its text widths differ. Dump the same checkout before and after
  (`compare-computed.mjs --dump` / `--diff`), compare `dist/systems/<name>/compiled.css` hashes, or install that
  checkout's own dependencies.

## Remaining presets

Selectors that differ from mira (`style-diff.mjs mira <preset>`, of 422) give the size of each port; vega was 250.

| Preset | Diff | style · base colour | icons | fonts | Watch for |
|---|---|---|---|---|---|
| nova | 247 | nova · neutral | lucide | geist | h-8 controls; inputs `rounded-lg` while buttons stay `rounded-md` (split the control radius); disabled inputs get a fill |
| maia | 249 | maia · neutral | hugeicons | figtree | h-9 with px-3; cards `rounded-2xl`; hugeicons compare by box only |
| lyra | 245 | lyra · neutral | phosphor | jetbrains-mono (sans) | `rounded-none` nearly everywhere, text-xs controls, 1px focus rings; a monospace **sans**: the sans stack takes the mono platform fallbacks and every text width changes |
| mira | — | mira · neutral | hugeicons | inter | the port of foundation itself: its comparison is the list of foundation's own deviations (pitfalls above) |
| luma | 274 | luma · neutral | lucide | inter | h-9 px-3; cards `rounded-4xl` with shadow-md and a `foreground/5` ring (10% in dark) |
| rhea | 272 | rhea · neutral | lucide | inter | h-8 px-3; cards `min(radius-4xl, 24px)` with shadow-sm and `--spacing(5)` |
| sera | 293 | sera · **taupe** | lucide | noto-sans + **playfair-display** heading | the largest diff; every derived layer-1 literal is neutral grey and must be recomputed from taupe; `fonts.heading` is a catalog id, so `--font-heading` gets its own stack and `cn-font-heading` titles change metrics |
