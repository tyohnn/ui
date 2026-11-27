---
name: screen-rules
description: How screens are built on a tyohnn system and how screen decisions are kept. Read before building or changing a screen, a form or a block, when a screen decision or a repeated review comment arrives, or when setting up a repo's screen rules (blocks folder, promotion thresholds, the check, the ledger and the hook). Triggers include "build this screen", "set up screen rules", "the same screen comment keeps coming back", "tidy the design system", "make a new block". setup runs it at its end.
---

# Screen rules

tyohnn decides how one part looks: tokens, three CSS layers, roles. This skill decides how screens are put together
from those parts and how a screen decision stays kept. It assumes a React + Tailwind v4 repo whose parts sit on
UI SDK (`@ui-sdk/react`). Read `DESIGN.md` in tyohnn for the part contract; this file builds on it.

The five rules below apply to every screen task. Then open the one file the table at the end names.

## Words

| Word | Means | Who owns it |
|---|---|---|
| components | tyohnn's parts (Button, Dialog, Sheet …), copied in with `get_primitive` | tyohnn. Never edited in the repo |
| patterns | tyohnn's worked compositions of those parts (a list with filters, a form sheet, a settings page). They are a reference: read them through `list_patterns` and `get_pattern`; no copy lives in the repo | tyohnn |
| blocks | the repo's own compositions in `<ui>/blocks/`: a pattern copied as is, one adapted, or one written from scratch | the repo. Edited freely |

## Always

### 1. Put a decision where it is kept hardest

When a screen decision (UX or UI) arrives, put it in the strongest of these four places. Prose is the last resort.

| Place | Strength | Examples |
|---|---|---|
| Code | cannot be broken | token values, a part's default, a variant that does not exist, a part whose position is fixed |
| Check | breaking it fails | `check:screens`, a copy scan, a dependency check |
| Exemplar screen | copying it gets it right | one real screen per kind; a new screen starts as a copy of it |
| Prose | known if read | only judgement none of the above can hold, in `.claude/rules/design-system.md` |

Why: a rule written in prose is read by agents and still not kept. In one repo the rule file banned literal radii
and 76 files wrote them anyway; 45 files imported an icon library directly; five of six review comments filed as
"ignored the instruction" quoted that file. When people no longer read all the code, only a machine can keep it
consistent.

How decisions from one product were placed (the decisions are that product's, the placement is the point):

| Decision | Place |
|---|---|
| Radii are fixed per field, card and sheet; shadows only on surfaces | code (tokens) + check (`rounded-*`, `shadow-*`) |
| Icons only by semantic name | code (one icons module) + check (direct library imports) |
| Emphasis stays light; no solid filled buttons; one-of-many is a segmented control | code (the variant does not exist) |
| Save is one button fixed at the bottom of the sheet | code (the sheet's footer) + exemplar |
| A long description scrolls inside its field | code (once, in the textarea's CSS) |
| Palette colours, written sizes, z-index, `space-*`, SVG drawn on a screen | check |
| One sheet per record; no editing inside a table | exemplar + prose |

- In the turn that receives a screen comment, say in one line where the decision went. When the same comment comes
  twice, move it one place stronger.
- A decision lives in one place. A ban that moved into the check is deleted from prose; two copies drift.
- Screen rules the person set are written with their date and not reverted. Why they were set goes in one decision
  record (`docs/decisions/`) when the repo keeps them.

### 2. Close the shape, open the layout

| In screen code | Example | Rule |
|---|---|---|
| Layout | `grid grid-cols-2 gap-4`, `col-span-2`, `w-full` | free, inline |
| Kind of shape | `<Button variant="outline" size="sm">`, `<Badge tone="danger">` | only values the part offers |
| Shape values | `rounded-lg`, `bg-blue-500`, `h-[42px]`, `z-50`, `style={{ color }}` | never; the check stops them |
| Reaching into a part | `[&_textarea]:max-h-[40svh]` | never |

For anything new, ask **"is this a meaning, or this screen's layout?"** A meaning becomes one more variant value on
the part (`tone="hold"`, its colour from a token) and every screen gets the same shape. Layout is written inline on
that screen and shared code is left alone.

- No boolean shape props (`compact`, `flat`, `noBorder`). Two of them make four combinations nobody looks at.
- A size name is a height. To make something smaller, pass `size="sm"`; do not write a number.
- When a value looks wrong, change the token chain (layer 1 value → layer 2 part token → layer 3 rule) through
  `create-system`, not the screen.

Why: kinds of shape are few. In one repo 556 Buttons used almost only outline, ghost and destructive.

### 3. One UI package, and promotion goes by how many places use it

Components and blocks live in one UI folder (`packages/ui/src/` in a monorepo, `src/ui/` in a single app). Two
packages mean every screen has to decide where to look and where a new block goes.

| Used by | Lives in |
|---|---|
| one screen | beside it (`<feature>/_components/`) |
| several screens of one app | the app's shared folder (`(app)/_components/`) |
| several apps | `<ui>/blocks/` |

The thresholds are the repo's, in `promote` of `screen-rules.config.json`. The default for a monorepo is **two
screens of one app → app shared; two apps and three places → blocks**. Two apps alone lifts a shape two apps each
used once by chance; three places alone fills the package with one app's combinations; together only repetition
across apps rises. With one app, the third row becomes "three places across feature areas".

Build a screen from blocks first; reach for patterns next; compose from components only when neither fits. Do not
promote early: a block with one user sets its props to that screen's needs. Show a new block's shape to the person
before making it.

### 4. We own the names styles and tests hang on

A component carries two kinds of hook and no values:

- **`cn-*` classes** (`cn-button`, `cn-button-variant-outline`): what layer 3 CSS styles. tyohnn owns them.
- **`data-*` attributes** for state and variants: UI SDK's state (`data-open`, `data-selected`, `data-disabled`;
  follow its names), variants that are not props (`data-shape`, `data-tone`, `data-icon`, read by layer 3), and
  names a screen gives a part (`data-panel`).

`data-slot` is a label UI SDK writes with its own values, overwriting ours on some parts. CSS hung on it loses its
style without an error when the library renames a slot. Style on `cn-*`, follow UI SDK only for state selectors,
and give screen names on `data-panel`. The check's `lib-slot` rule stops a screen writing `data-slot` on the parts
the repo lists in `headlessParts`.

### 5. When children differ in kind, compose pieces instead of passing config

A shared component does not take its children as config (arrays, objects) and branch on them. It exports pieces and
the caller arranges them as children. The test is **"do the elements share one shape?"**

| Elements | How it takes them | Examples |
|---|---|---|
| all one shape | a data array plus config props; open only the slots that vary as `ReactNode` | table rows, list items, kanban cards |
| a different shape each | export pieces; the screen places them | form fields, a toolbar (button, search, filter), a card's head, body and foot |

An array of different shapes grows `kind: "text" | "amount" | "custom"`, and every caller carries every branch
added for someone else. The same signal: `render: () => …` escape hatches, `withHeader` / `compact` booleans, a
screen overriding a shared component's inside through className (`[&_textarea]:…`).

```tsx
// ❌ fields differ in shape but arrive as an array
<FormSheet fields={[{ name: "name", label: "Name" }, { name: "state", kind: "custom", render: () => <StateSegmented /> }]} />

// ✅ the screen places the pieces; className holds only layout
<FormSheet title="New plan" footer={<SubmitButton />}>
    <FormFields>
        <FormField label="Name" required error={errors.name} className="col-span-2"><Input name="name" /></FormField>
        <FormField label="State"><Segmented name="state" options={STATES} /></FormField>
    </FormFields>
</FormSheet>
```

- **UX decisions live inside the pieces.** "Save is fixed at the bottom of the sheet" is the sheet's footer; "a long
  description scrolls in its field" is the textarea's CSS. Screens show no trace and every screen follows.
- A new kind of input is one input part (`AmountInput`, `DatePicker`) the screen places, not a branch in the form.
- A combination that holds a UX decision may stay one component. A confirm dialog that holds "never
  `window.confirm`, close after the result, keep the text while closing" loses those decisions if every screen
  rebuilds it.
- Do not make a compound component (`Table.Root` around the rest) before a caller needs to arrange the pieces. The
  arrangement becomes a contract and the component can no longer change its own layout.
- The general rules of the same family (variants over booleans, compound components, children over render props,
  context interfaces) are in `vercel-composition-patterns` when the repo has it. This section adds "same shape is
  data, different shape is pieces" and "UX decisions inside the pieces".

Patterns show these rules worked through. Before writing a block, look for the pattern that does the same job
(`references/patterns.md`).

## What you are doing now

| Task | Open |
|---|---|
| Setting the rules up in a repo (config, blocks folder, check, ledger, hook, exemplar screens, visual baseline), or arriving from setup | `references/setup.md` |
| Finding a pattern for a screen, copying or adapting it into blocks | `references/patterns.md` |
| Making or changing a block, adding a variant to one | `references/blocks.md` |
| Making or changing a component | the `craft-component` skill |
| Moving a repo's components onto UI SDK from Radix or Base UI | `references/engine-swap.md` |
| Building a screen or a form, or receiving a screen comment or decision | the rules above; place the decision with rule 1 |

After a wide change (components, tokens, blocks), photograph every screen and compare, and show the person the
screens that changed. `references/setup.md` sets the tool up.
