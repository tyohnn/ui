# Setting the rules up in a repo

From `SKILL.md`, or from the last step of the `setup` skill. Paths below use `<ui>` for the UI folder:
`packages/ui/src` in a monorepo, `src/ui` in a single app.

- **A new repo** (setup just ran, few or no screens): steps 3 to 7. Steps 1, 2 and 8 have nothing to count or move.
- **A repo with many screens**: every step in order. Steps 1 to 5 change no screen. If the components sit on Radix
  or Base UI, run `references/engine-swap.md` after step 3.

Write every file below without asking. What tyohnn owns is recorded in `tyohnn.json` (`files`, step 6) and replaced
when setup runs again; what the repo owns is written once and never overwritten.

## 1. Count

Count, per component and per block, how many files use it, and how many files write values (`rounded-*`, palette
colours, px, direct icon-library imports). Put the numbers in the decision record and the report to the person.
Blocks nobody uses go in step 3.

## 2. Visual baseline (optional, recommended before step 3 in a repo with screens)

Copy `templates/visual/` to `scripts/visual/`. It reads the screen list from the route folders and, per screen,
opens one menu, select, dialog and tooltip, and for a list the first row's sheet.

- Fill in `PORTS` in `run.mjs` (a server port per app) and `ACCOUNTS` in `visual.spec.ts` (local seed accounts and
  the login field names).
- `node scripts/visual/run.mjs --update` takes the baseline; `node scripts/visual/run.mjs` compares. A screen that
  differs leaves baseline, now and diff in `~/visual/_results/<app>/`.
- Photos stay out of the repo. Take before and after on the same day.

From step 3 on, photograph before changing.

## 3. Shape the folders

```
<ui>/                                one UI package (monorepo: packages/ui/src)
  CLAUDE.md                          from templates/ui-CLAUDE.md                     (tyohnn)
  systems/<system>/                  one folder per system the apps wear, from export_system (tyohnn)
    concept.md                       what the system is for
    styles/
      globals.css · theme.css        layer 1
      tokens.css · typeset*.css      layer 2
      style.css · components/*.css   layer 3, rules on cn-* classes
  components/                        parts from get_primitive                        (tyohnn)
  blocks/                            the repo's compositions                         (repo)
    CLAUDE.md                        from templates/blocks-CLAUDE.md                 (tyohnn)
    <name>/                          index.ts · <name>.tsx · <name>.ts
  icons/                             semantic names; the only place an icon library is imported
apps/<app>/src/app/                  (single app: src/app/)
  globals.css                        imports layers 1 → 2 → 3, the last with layer(base)
  (app)/_components/                 combinations two screens of one app share
  (app)/<feature>/
    page.tsx
    _components/                     what only that screen uses; most code lives here
screen-rules.config.json             step 5                                           (repo)
screens-baseline.json                step 5                                           (repo)
scripts/check-screens.mjs            step 5                                           (tyohnn)
scripts/report-screens.mjs           step 5                                           (tyohnn)
.claude/rules/design-system.md       step 6                                           (tyohnn)
scripts/visual/                      step 2
docs/decisions/                      step 9, when the repo keeps decision records
```

- Moving an existing repo: the repo's shared screen pieces (often `packages/blocks`, `components/shared`) go to
  `<ui>/blocks/`. Only import paths change. Delete the unused ones from step 1. Compare photos afterwards.
- Blocks a CLI installed from tyohnn earlier (`<ui>/blocks/` with hashes in `tyohnn.json`) become the repo's: keep
  the ones screens import, drop their hashes, delete the rest.
- A move of a component into `components/` is the `craft-component` skill's work, not this one.

## 4. Folder instructions

- `templates/ui-CLAUDE.md` → `<ui>/CLAUDE.md`. It loads when files in the UI folder are read.
- `templates/blocks-CLAUDE.md` → `<ui>/blocks/CLAUDE.md`.

Fill the placeholders (the package name, the icons module). Component usage comes from UI SDK's own docs for its
version; these files hold only what the repo does differently.

## 5. Config, check, ledger and hook

1. Write `screen-rules.config.json` next to `tyohnn.json` (the repo root in a monorepo):

    ```json
    {
        "include": ["apps/*/src/**/*.{ts,tsx}", "packages/ui/src/blocks/**/*.{ts,tsx}"],
        "exclude": ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/*.d.ts", "packages/ui/src/components/**"],
        "baseline": "screens-baseline.json",
        "iconsModule": "@acme/ui/icons",
        "allow": {
            "svg": ["packages/ui/src/blocks/*-mark/**"],
            "color": ["packages/ui/src/blocks/*-mark/**"],
            "icon-lib": ["packages/ui/src/icons/**"]
        },
        "headlessParts": [],
        "promote": { "appShared": { "screens": 2 }, "blocks": { "apps": 2, "places": 3 } },
        "exemplars": [
            { "kind": "list + record sheet", "path": "apps/web/src/app/(app)/orders" },
            { "kind": "settings + form sheet", "path": "apps/web/src/app/(app)/settings/plans" }
        ]
    }
    ```

    | Field | Means |
    |---|---|
    | `include` · `exclude` | the files the check reads. Screens and blocks yes; tyohnn's components and tests no |
    | `baseline` | the ledger's path |
    | `iconsModule` | the module screens import icons from, named in the check's messages |
    | `allow` | per rule, the paths allowed to break it on purpose (brand marks draw SVG; the icons module imports the library) |
    | `headlessParts` | UI SDK parts that overwrite `data-slot`; empty turns `lib-slot` off |
    | `promote` | the thresholds of `SKILL.md` rule 3 |
    | `exemplars` | step 7 |

    `allow` only shrinks once the check is on. Never widen it to make the check pass.

2. Copy `scripts/check-screens.mjs` and `scripts/report-screens.mjs` from this skill to the repo's `scripts/`.
3. Run `node scripts/check-screens.mjs --init`. It writes today's violations as the ledger (`{}` in a new repo).
4. Add `"check:screens": "node scripts/check-screens.mjs"` to the root `package.json` and run it from the test
   pipeline (`"test": "… && npm run check:screens"`, or a turbo task). It fails when a count grows.
5. Merge this hook into `.claude/settings.json` (create it if missing):

    ```json
    {
        "hooks": {
            "PostToolUse": [
                {
                    "matcher": "Edit|MultiEdit|Write",
                    "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/scripts/report-screens.mjs\"" }]
                }
            ]
        }
    }
    ```

What the check keeps:

- **It counts only written values.** Circles, no-radius, no-shadow and token reads pass.
- **Comments are not scanned.**
- **The ledger only shrinks.** A count above it fails; a count below it fails until `--write` lowers it. There is no
  way to grow it. Turning the check on with every old violation fixed first would mean never turning it on; a
  check without a ledger cannot stop new ones.
- **The check blocks, the hook reports.** The hook speaks right after an edit and stays quiet on its own errors.
- Each rule's `why` and `instead` live in the check. The rule file does not repeat them.

## 6. The rule file

Write `.claude/rules/design-system.md` from `references/rules-template.md`: one file, parts and screens. Then:

- Record each tyohnn-owned file's SHA-256 in `tyohnn.json` under `files` (path → hash): the rule file,
  `<ui>/CLAUDE.md`, `<ui>/blocks/CLAUDE.md`, both scripts. A changed hash means someone edited a tyohnn file; say
  so and put the change in the repo's config or its own rule file instead.
- Add one line to `AGENTS.md` (create it only if the repo uses Codex) pointing at the rule file, since Codex does
  not read `.claude/rules/`.
- Delete from the repo's other rule files every ban the check now holds. Keep judgement the check cannot make and
  the person's dated screen rules. Those go in the repo's own `.claude/rules/screens.md`, which tyohnn never
  overwrites.

## 7. Exemplar screens

Pick one real screen per kind (list + record sheet, settings + form sheet, a list outsiders see). Show the person
a photo of each, then write them in `exemplars`. When an exemplar changes, remember other screens copy it.

## 8. Config-shaped forms

Forms that take their fields as an array move to the pieces of `SKILL.md` rule 5.

1. Move one exemplar form first (a create or edit sheet on a settings screen) and confirm it with a photo.
2. Ask the person whether to move the rest now or when each screen is next touched. Moving all of them deletes the
   shared form's branches.
3. Open every form sheet before and after and compare photos with step 2's tool.

## 9. Decision record

When the repo keeps decision records, write what was decided and step 1's numbers in
`docs/decisions/<date>-<decision>.md`, one decision per file ("screen rules are kept by a check, not prose", "one
UI package").
