# Moving components onto UI SDK

From `SKILL.md`. The order for a repo whose components sit on Radix or Base UI and are moving to UI SDK
(`@ui-sdk/react`). One repo moved five apps and 140 screens from Base UI to UI SDK in a day this way, with every
photo matching its baseline.

## Order

1. **Photograph first.** With `templates/visual/` (`references/setup.md` step 2), photograph every screen of every
   app on a production build. Per screen, open one menu, select, dialog and tooltip, and for a list open the first
   row's sheet. Closed screens alone say nothing when the popup engine changes. Take before and after on the same
   day (screens that print "today" change overnight).
2. **Shrink the target.** Count the users of each component and block; delete the unused ones first. Compare
   photos that day too.
3. **Pin the version exactly.** No `^`, above all on a beta.
4. **Make sure the names styles and tests hang on are ours** (`SKILL.md` rule 4). Layer 3 CSS hung on the library's
   `data-slot` moves to `cn-*` first. Where UI SDK overwrites `data-slot`, list the part in `headlessParts` of
   `screen-rules.config.json` so screens cannot hang names there (`lib-slot`).
5. **Swap popup components first, one at a time.** Dialog, Sheet, AlertDialog, Popover, Tooltip, Menu, Select,
   Combobox, Toast, then the rest (Button, Input, Tabs, Switch, Checkbox, Radio, Accordion …). Popups break most.
   Keep each component's public API (prop names, callback shapes) so screen code does not change.
6. **Compare photos and run e2e after each group.** e2e finds elements by role and name, so watch components whose
   role changes.
7. **Remove the old library** from every `package.json`.
8. **Fix the instructions.** Differences such as "`render` instead of `asChild`" go once in `<ui>/CLAUDE.md`;
   delete the same sentence anywhere else.
9. **Write down the traps found that day,** in the repo's memory or the component's comments. They differ by
   version, so they do not belong in this skill.

## What tends to break

A list to check, not a list of facts about every version:

- **Popups that render in the top layer in place, without a portal**: a parent's child selectors (`*:w-full`, `>`,
  `~`) reach the popup too. Rules that fill children's width or trim corners must step around it
  (`not-[[popover]]`).
- A popup longer than the space above and below overflows. Clip it with the remaining-height variable
  (`--available-height`) and scroll inside; check whether that variable is a registered, non-inheriting property,
  and if so copy it onto the popup as a plain variable.
- State attribute names differ (`data-active` → `data-selected`, `data-panel-open` → `data-open`). Change layer 3 CSS
  and e2e selectors together.
- A Select item may render only text children; an element shows its value raw.
- A component that keeps form values in a hidden input (a `textarea`) breaks tests that count inputs.
- A dialog rendered on the server leaves a hidden copy for a moment after reload, so `getByLabel` finds two. Search
  inside the dialog.
- A closing modal makes the page inert briefly. e2e waits for the dialog to go before the next click.
- A button rendered as a link may keep the link role or become a button. Check `getByRole("link")` in e2e.
- An `onClick` returning a Promise may block presses or add other behaviour. English default announcements change in
  the wrapper.
- Components with a different API shape (Toast, Checkbox `indeterminate`, Input that takes only strings) keep the
  old shape in the wrapping layer.

## What comes with it

Components that show up in the accessibility tree as buttons and fields make it easy to build an agent that reads
and presses the screen (an in-app helper panel). Where a card title or a table row must not look like a button,
put an unstyled button there (a hidden "Open") so the agent can find it.
