---
name: setup
description: Puts a tyohnn design system into an app and teaches the repo to keep it. Writes the system's styles folder, the CSS imports, tyohnn.json, a design-system rule for the agent and one line in CLAUDE.md or AGENTS.md. Use when the person says "set up tyohnn", "use this design system in my app", "install the system we made", right after create-system or export_system, or when they want to build UI in a repo that has no tyohnn.json yet.
---

# Set a repo up with a tyohnn system

The result is a repo where the system is files the app owns (no package, no CLI) and where any agent that opens
the repo knows to build UI from the system's roles and tokens instead of hard-coded values.

This file is the route. Read a reference only when you reach its step.

## 1. Find the app

Look for the CSS file that imports Tailwind (`@import "tailwindcss";`). That is the CSS entry, and the folder
around it is where the system goes. In a monorepo, pick the app the person is working in; if two apps qualify, pick
the one with the most UI code and say which you chose. Do not ask.

Note what is already there: an older `tyohnn.json`, a shadcn `components.json`, a `globals.css` with colour
variables. An existing tyohnn.json means this is a switch, not a first setup: keep its `styles` path.

If the app has no Tailwind v4, stop and say so: tyohnn's rules are Tailwind v4 CSS.

## 2. Pick the system

- The person named a system, or create-system just drafted or published one: use it.
- Otherwise call `search_systems` with words from the product (what it is, who uses it, light or dark) and
  `read_system` on the best one or two. Propose one in a sentence with the reason drawn from its Character
  section, then go on with it unless they object.

## 3. Write the files

Call `export_system` with the system's name (or no name, for the system being shaped).

- If the tool can write (the local server), pass `dir` as the absolute path of `<css entry folder>/tyohnn` and
  `stylesDir` as `./tyohnn/styles`.
- If it cannot (the hosted server), it returns every file: write each one under `<css entry folder>/tyohnn/`
  yourself, byte for byte. Do not reformat the CSS.

Then add the import lines it returns to the CSS entry, right after `@import "tailwindcss";`, in that order. The
last one carries `layer(base)` on purpose: the system's component rules sit in the base layer so utilities a
person writes in markup still win for layout.

Remove colour variables the old setup declared in the CSS entry (a shadcn `:root { --background … }` block) only
if the system's `theme.css` now declares the same names; say what you removed.

## 4. tyohnn.json at the app root

Move the exported `tyohnn.json` to the app root (next to `package.json`) and make its paths relative to that root.
Read `references/tyohnn-json.md` for the fields and an example.

## 5. Teach the repo

1. Write `.claude/rules/design-system.md` from `references/rules-template.md`, filling in the system name, the
   styles path and the components folder. Keep the `paths` header so it loads only when UI files are touched.
2. Add one line to the repo's `CLAUDE.md` (or `AGENTS.md` if that is what the repo uses; create `CLAUDE.md` if
   neither exists): see `references/rules-template.md` for the line.
3. If the repo has a lint or check step, add the token check from `references/check-script.md` to it. If it has
   none, add the script and an npm script `check:design` but do not wire it into CI.

## 6. Prove it

Start the app (or its build) and render one screen. Then render one element with `data-role="control"` and one
with `data-role="surface"` somewhere temporary, check they look like the system's button and card, and remove them.
Report what you wrote, file by file, and the one thing the person should look at.

## Keep to

- Never install or mention the tyohnn CLI. The system is plain files.
- Do not edit the files under `tyohnn/styles/components/`. A change to the feel goes back through create-system
  (tokens) and a fresh export, so the next export does not undo it.
- Write nothing outside the app, the rule file and the CLAUDE.md line.
