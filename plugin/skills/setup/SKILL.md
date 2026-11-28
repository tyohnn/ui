---
name: setup
description: Puts a tyohnn design system into a repo and makes the repo keep it. Writes the system's folder, the CSS imports and tyohnn.json, then hands over to screen-rules, which writes the design-system rule, the blocks folder, the screen check with its ledger, the hook and one line in CLAUDE.md or AGENTS.md. Use when the person says "set up tyohnn", "use this design system in my app", "install the system we made", right after create-system or export_system, or when they want to build UI in a repo that has no tyohnn.json yet.
---

# Set a repo up with a tyohnn system

The result is a repo where the system is files the repo owns (no package, no CLI) and where any agent that opens
it is made to build UI from the system's parts and tokens: a rule that loads with UI files, a check in the test
pipeline that fails on written values, and a hook that reports them right after an edit.

This file is the route. Read a reference only when you reach its step.

## 1. Find the app and the UI folder

Look for the CSS file that imports Tailwind (`@import "tailwindcss";`). That is the CSS entry. In a monorepo, pick
the app the person is working in; if two apps qualify, pick the one with the most UI code and say which you chose.
Do not ask.

The UI folder, `<ui>` below, is where the parts, the system and the blocks live: `packages/ui/src` in a monorepo
(create the package if there is none), `src/ui` in a single app.

Note what is already there: an older `tyohnn.json`, a shadcn `components.json`, a `globals.css` with colour
variables. An existing tyohnn.json means this is a switch, not a first setup: keep its paths.

If the app has no Tailwind v4, stop and say so: tyohnn's rules are Tailwind v4 CSS.

## 2. Pick the system

- The person named a system, or create-system just drafted or published one: use it.
- Otherwise call `search_systems` with words from the product (what it is, who uses it, light or dark) and
  `read_system` on the best one or two. Propose one in a sentence with the reason drawn from its Character
  section, then go on with it unless they object.

## 3. Write the system

Call `export_system` with the system's name (or no name, for the system being shaped). The system folder is
`<ui>/systems/<system>/`: `concept.md` and `styles/`.

- If the tool can write (the local server), pass `dir` as the absolute path of that folder and `stylesDir` as the
  styles folder's path relative to the CSS entry.
- If it cannot (the hosted server), it returns every file: write each one under the system folder yourself, byte
  for byte. Do not reformat the CSS.

Then add the import lines it returns to the CSS entry, right after `@import "tailwindcss";`, in that order. The
last one carries `layer(base)` on purpose: the system's component rules sit in the base layer so utilities a
person writes in markup still win for layout.

Remove colour variables the old setup declared in the CSS entry (a shadcn `:root { --background … }` block) only
if the system's `theme.css` now declares the same names; say what you removed.

## 4. tyohnn.json at the repo root

Move the exported `tyohnn.json` to the repo root and make its paths relative to it. Read
`references/tyohnn-json.md` for the fields and an example.

## 5. Make the repo keep it

Read the `screen-rules` skill, then follow its `references/setup.md`. In a new repo that is its steps 3 to 7: the
folders and their CLAUDE.md files, `screen-rules.config.json`, the check and its ledger wired into the test
pipeline, the hook, the rule file `.claude/rules/design-system.md`, the CLAUDE.md or AGENTS.md line and the hashes
of what tyohnn owns in `tyohnn.json`. A repo with many screens runs every step. Write all of it; none of it is
optional.

## 6. Prove it

Start the app (or its build) and render one screen. Then render one element with `data-role="control"` and one
with `data-role="surface"` somewhere temporary, check they look like the system's button and card, and remove them.
Run `npm run check:screens` once. Report what you wrote, file by file, and the one thing the person should look at.

## Keep to

- Never install or mention the tyohnn CLI. The system is plain files.
- Do not edit `<ui>/systems/` or `<ui>/components/`. A change to the feel goes back through create-system (tokens)
  and a fresh export, so the next export does not undo it.
- Write nothing outside the repo's UI folder, the CSS entry, tyohnn.json and what screen-rules writes.
