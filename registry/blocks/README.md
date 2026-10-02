# registry/blocks

Blocks: screen pieces composed from the components of `registry/ui` — a page heading, a row of metric cards, a
table in a card. The preview's templates (`apps/preview/src/templates`) are built from them, so the template
gallery is the proof that every block renders with every design system.

## Rules

1. **Only the system changes.** A block reads system tokens and `registry/ui` components and decides no colour,
   radius, type size or density of its own. Token reads go through utilities
   (`text-[length:var(--ui-text-sm)]`, `text-muted-foreground`, `border-border`); shared text recipes are in
   `lib/text.ts`. A value no token expresses is a missing token in the systems, not a literal in the block.
   `node tooling/scan-tokens` fails when a block reads a token a system does not define.
2. **The template is the quality bar.** A block is cut out of a template and has to draw the same picture. Shoot the
   template before and after with `tooling/snapshot/check-templates.mjs --shots <dir>` and compare the folders with
   `tooling/snapshot/diff-shots.mjs`: every system, both modes, zero differing pixels.
3. **One block, one shape.** A concept may have several blocks (a table in a card with tabs and bulk actions is
   one; a members table with inline role selects is another). Do not grow one block's props to cover another
   shape — cut a second block.
4. **Data comes from the caller.** A block fetches nothing and knows no domain type: rows, callbacks and the
   product's words (titles, column names, statuses) are props. What belongs to the product (which statuses exist,
   which columns, which actions) stays in the screen that uses the block.
5. **A block's own words come from `@tyohnn/strings`.** The few things a block says by itself — "Today", "Viewed",
   "Search", the name of a "more" button or of a select-all checkbox — are `strings.blocks.*`
   (`registry/ui/strings`: `names.ts` and every locale), so a project gets them in its language. Each is still a
   prop, and a screen should pass the specific name where there is one ("Actions for #1042", "Previous week"): a
   default repeated on every row tells a screen reader nothing.

## Waiting faces

A block that shows values that come from data takes `loading`: it draws the same frame with bars where the values
go, so the screen does not jump when the data arrives. There is no separate skeleton component.

- **Which blocks.** Headings, cards, tables, lists, figures, people — anything that shows a title, a name, a
  number or rows the caller fetches. Not controls and inputs (a select, a search field, a composer), not layout
  bands, not text the caller writes in place (`Prose`).
- **What changes.** Only the value slots: `PendingText` (`pending.tsx`) in place of a title, a figure, a
  name. What waits for nothing — actions, column headers, tabs, icons, the frame, its paddings and dividers —
  stays as it is. An avatar keeps its circle without initials; a badge, a progress bar or a chart is left out or
  drawn empty, whichever keeps the frame's height.
- **How many.** A block that maps over data takes a count for its waiting face (`loadingRows`, `count`); the
  data props become optional and are set aside while loading.
- **The frame.** The block's root spreads `pendingFrame(loading)`: `data-loading` and `aria-busy` while it waits.
  A block that contains another loading block passes `loading` down; only the outer one need not repeat the bars.
- **A cell's own face.** A table column's `pending` is what its cell draws while loading — `<Person loading detail />`
  for a two-line person — so the row is as tall as it will be.
- **Nothing the caller does not know yet decides the frame.** If a part appears only with the data (a selection
  bar), the waiting face follows what the caller already passed (a known selection keeps its bar).

What a waiting face cannot do:

- **A bar does not wrap.** Where the real text runs over two lines (a description in a narrow card, a table cell
  of prose, a long title that pushes the actions under it) the frame is shorter while waiting. Blocks with such a
  slot take a line count where one was needed (`InfoCard` `descriptionLines`, `ChatReply` `lines`); otherwise the
  screen leaves that use unwired rather than jump.
- **It does not know what only the data knows.** A row is as tall as its tallest cell: a badge after one name, an
  icon on one item. `LinkItemList` and `ActionItemList` therefore keep the icon and the badge's place of the
  items the caller already passed; with none passed the rows are plain.
- **Bars on a muted surface** take the page background (`BARS_ON_MUTED`): a system without a `--skeleton` of its
  own draws a bar in `--muted`.

In the preview every template passes `loading={LOADING}` (`apps/preview/src/templates/loading.ts`), so
`?template=<id>&loading` shows the screen's waiting face. `node tooling/snapshot/check-loading.mjs --templates <id>`
compares every `data-loading` frame with the same element once the data is there and fails when one moves or
changes size.

## Cutting a block out of a template

A template's own stylesheet (`XX_STYLE`, rules under `[data-template="…"]`) becomes utilities on the block's
elements; the template keeps no stylesheet. Translate each declaration literally, so the picture does not move:

- A token read stays the same token: `font-size: var(--ui-text-sm)` → `text-[length:var(--ui-text-sm)]`,
  `border-radius: var(--radius-md)` → `rounded-[var(--radius-md)]`. Do not swap it for a named utility that looks
  equal (`rounded-md` is not `var(--radius-md)` in every system). Semantic colours do have utilities
  (`text-muted-foreground`, `bg-muted`, `border-border`, `bg-success`), and so do `font-heading` · `font-mono` ·
  `font-semibold` · `tabular-nums`.
- A weight from a token goes in `style` (`style={{ fontWeight: "var(--ui-font-weight)" }}`): `font-[…]` cannot
  tell a weight from a family.
- A rule on descendants (`.x svg { width: 14px }`) becomes a variant on the parent (`[&_svg]:size-[14px]`).
- A rule keyed on a data attribute (`[data-tone="warning"]`) becomes a class picked in the component from a
  lookup table, so every class is a whole string Tailwind can read.
- The geometry of a data graphic (tick, bar and dot sizes) may stay literal; it is not a look a system tunes.
- Where the system already has a token for what the template derived by hand (a title size, an icon size), read
  the token, even though the picture moves: the system decides ("What reads which token" below).
- Keep the DOM the template had: the same elements in the same order, text in the same text nodes
  (`{a} of {b}` and `` `${a} of ${b}` `` kern differently), the same classes on the same `registry/ui` components.

- With `cn`, class order matters: a font-size class after `leading-*` drops the line height. Put the size first.

Then prove it: `check-templates.mjs --shots` before and after, `diff-shots.mjs`, zero differing pixels in every
system and both modes. Two things to know when reading the result:

- The raster is not perfectly repeatable. The same code, shot twice, can differ by one or two levels of one
  channel on a few dozen antialiased pixels (avatar edges, rounded corners). Re-shoot a pair that differs like
  that; a difference that stays, or is larger, is real.
- The shot is the viewport. A page that scrolls is compared above the fold only; shoot a tall viewport as well
  when the change is below it.

## Layout

    registry/blocks/<name>.tsx     one block (kebab-case file, PascalCase export)
    registry/blocks/lib/           what blocks share, as plain `.ts` modules (class recipes, colours): a monorepo exports
                                   this folder as `./blocks/lib/*` → `*.ts`, so a module with JSX belongs one level up

Blocks import each other and their helpers as `@tyohnn/blocks/*`, and components as `@tyohnn/components/*`.

## Blocks

Frames

A frame holds blocks and decides only where they stand: how far from the edge, how far from each other, what
scrolls, what sits beside what. It has no content of its own. The steps it picks from are tokens with their
defaults written in the read (`lib/frame.ts`), so changing one value moves every screen that stands at that step.
`frames.md` has the measurements behind them.

To try the values, open any template in the preview with `&frames=1`: a panel lists the tokens, outlines the
frames on the screen, marks the tokens that screen reads, and moves them live; "Copy CSS" gives the declarations.

| Block | File | What it is |
|---|---|---|
| `Page` | `page.tsx` | The content under the bar: the gutter and gap, and whether the page scrolls or is pinned so a region scrolls |
| `PagePane` | `page.tsx` | A region of a pinned page that scrolls by itself |
| `PageContent` | `page.tsx` | A column of blocks inside something that scrolls: gutter, gap, an optional reading measure, a document's own padding |
| `PageSplit` | `page-split.tsx` | Two panes side by side while the page is at least 56rem wide; below that the aside stacks, becomes a sheet, or hides (`narrow`) |
| `PageMain` · `PageAside` | `page-split.tsx` | The pane that takes the room, and the narrower one at an aside width |
| `PageAsideTrigger` | `page-split.tsx` | The button that opens an aside that became a sheet; drawn only while the page is narrow |

| Token (default in `lib/frame.ts`) | Default | Read by |
|---|---|---|
| `--page-gutter-sm` · `-md` · `-lg` · `-xl` | 1 · 1.5 · 2 · 2.5rem | `gutter` on Page · PagePane · PageContent |
| `--page-gap-xs` · `-sm` · `-md` · `-lg` · `-xl` | 0.75 · 1 · 1.5 · 2 · 2.5rem | `gap` on every frame |
| `--page-measure-sm` · `-md` · `-lg` | 48 · 52 · 64rem | `measure` on PageContent, `MEASURE` on a block that is the column |
| `--page-aside-xs` · `-sm` · `-md` · `-lg` · `-xl` | 14 · 18 · 20 · 26 · 30rem | `width` on PageAside, `ASIDE_WIDTH` on a block that is the pane |
| `--page-document-padding-start` · `-end` | 2 · 4rem | `document` on PageContent |

Pages and sections

| Block | File | What it is |
|---|---|---|
| `PageHeading` | `page-heading.tsx` | A list page's title, one meta line, and the page actions on the other side |
| `DetailHeading` | `detail-heading.tsx` | The head of a page about one thing: large title with a status badge, a description that may wrap, people and actions |
| `RecordHeading` | `record-heading.tsx` | The head of one record's page: title with a muted number, a status line under it, people and actions |
| `PageBar` | `page-bar.tsx` | The bar at the top of a page in an app window: title, status badge, global actions, a divider |
| `PageTabs` | `page-tabs.tsx` | A page's underlined tab strip with icons and count badges |
| `SectionHeading` | `section-heading.tsx` | A section's title over a sentence, with one action at the other end |
| `SectionTitle` | `section-title.tsx` | A section's title with a short meta at the end of the line |
| `SearchHero` | `search-hero.tsx` | A centred band around one large search field: badge, title, sentence, suggested searches |
| `DetailSections` | `detail-sections.tsx` | The side column of a record's page: short titled sections with hairlines between |

Cards

| Block | File | What it is |
|---|---|---|
| `InfoCard` | `info-card.tsx` | A small titled card for a side column: title, description, corner action, content, footer buttons |
| `SectionCard` | `section-card.tsx` | A default-size titled card for the main column, with a footer note |
| `ListCard` | `list-card.tsx` | A card that fills its height: title and controls over a divider, a list scrolling edge to edge |
| `FieldPanel` | `field-panel.tsx` | A full-height settings card: header, fields scrolling inside, a footer that stays |
| `TabCard` | `tab-card.tsx` | A card of panels behind tabs, with toolbar controls and a footer |
| `CardToolbar` | `card-toolbar.tsx` | The band at the top of a workspace card: a picker and a badge, actions at the other end |
| `MetricCards` | `metric-cards.tsx` | A row of small cards: label, figure, change as a trend badge, one line of context |
| `StatCards` | `stat-cards.tsx` | A row of small cards: label, large value, optional progress bar, a line of detail |
| `TopicCards` | `topic-cards.tsx` | A grid of small cards that lead somewhere: icon tile, name, description, a footer meta line |
| `PagerCards` | `pager-cards.tsx` | Previous and next page as two cards |
| `FileTiles` | `file-tiles.tsx` | A grid of small outlined tiles: icon, name, one line of detail |

Tables

| Block | File | What it is |
|---|---|---|
| `DataTable` | `data-table.tsx` | The bare table from columns and rows: typed cells, sortable headers, column widths, a checkbox column |
| `DataTableCard` | `data-table-card.tsx` | A DataTable in a card that scrolls inside: filter tabs, toolbar controls, a bulk-action bar, summary and pages |
| `TableFrame` | `table-frame.tsx` | An outline with the system's corners around a bare DataTable on a page or in an article |
| `ParameterTable` | `parameter-table.tsx` | A framed table of parameters: name, type, required badge, description with a note |
| `CheckboxMatrix` | `checkbox-matrix.tsx` | An outlined table of checkboxes, rows by narrow columns |
| `FilterBar` | `filter-bar.tsx` | The band over a table: filters on one side, actions on the other |
| `SummaryBar` | `summary-bar.tsx` | The band under a table: equal cells with a figure or an icon and a label |
| `TableSearch` | `table-search.tsx` | The search field of a table toolbar |
| `RowMenu` | `row-menu.tsx` | One row's actions behind a "more" button, in groups |

Lists

| Block | File | What it is |
|---|---|---|
| `ActionItemList` | `action-item-list.tsx` | Outlined items with an icon, title, description, an extra line and stacked actions |
| `LinkItemList` | `link-item-list.tsx` | Outlined items that are links: optional icon, title with a badge, one line of detail, a chevron or an arrow |
| `ContactOptions` | `contact-options.tsx` | Stacked outlined items, each with an icon, a name, what to expect and one button |
| `TicketList` | `ticket-list.tsx` | Titles over a line of number, status badge and time, with hairlines between |
| `ServiceStatus` | `service-status.tsx` | One row per service: its name and its state in words behind an icon |
| `StatusLine` | `status-line.tsx` | One row of a side list: an avatar or a toned state icon, a name, a badge or a note |
| `TaskList` | `task-list.tsx` | Rows with a checkbox, a title over a meta line and the caller's end of row |
| `Checklist` | `checklist.tsx` | Checkbox and label rows; a done item is struck through and muted |
| `Agenda` | `agenda.tsx` | An outlined numbered agenda: checkbox, index, title, owner, timebox |
| `StepList` | `step-list.tsx` | Numbered steps: a number in a circle, a title, a body, optional content |
| `DefinitionList` | `definition-list.tsx` | An outlined list with hairlines: a badge, its name, what it means |
| `PropertyList` · `PropertyText` | `property-list.tsx` | Property rows: icon and name in a fixed column, the value beside it |
| `ActivityFeed` | `activity-feed.tsx` | Who did what and when, one entry per row |
| `AttachmentList` | `attachment-list.tsx` | Files as chips: icon, name, detail, one action |
| `CalloutList` | `callout-list.tsx` | A callout that lists points under its title |
| `RuleSteps` | `rule-steps.tsx` | A rule read as When / If / Then rows |

People and small pieces

| Block | File | What it is |
|---|---|---|
| `Person` | `person.tsx` | An avatar with a name and one line of detail; presence badge, badges after the name, avatar tone |
| `AvatarStack` | `avatar-stack.tsx` | People as overlapping avatars with a count for the rest and an optional label |
| `Byline` | `byline.tsx` | Authors and post actions in a band between two hairlines |
| `TwoLineLabel` | `two-line-label.tsx` | A name over a caption, each on one line |
| `IconMeta` | `icon-meta.tsx` | One line of meta behind a small icon, tabular and unbroken |
| `IconNote` | `icon-note.tsx` | A short note behind a small icon that may wrap |
| `InlineFacts` | `inline-facts.tsx` | A few short facts on one line behind an icon, with hairlines between |
| `ToneDot` | `tone-dot.tsx` | A dot in a status colour |
| `RefChip` | `ref-chip.tsx` | A reference in mono on a muted chip |

Figures and charts

| Block | File | What it is |
|---|---|---|
| `FigureRow` | `figure-row.tsx` | A few figures side by side, each over its label |
| `UsageMeter` | `usage-meter.tsx` | A progress bar with what it measures and the percentage |
| `ShareMeter` | `share-meter.tsx` | One part of a whole as a progress bar: name, count, percentage |
| `SegmentMeter` | `segment-meter.tsx` | A percentage as ticks running destructive → warning → success, with the figure |
| `ActivityBars` | `activity-bars.tsx` | A trend as a row of small bars at levels 0–4 |
| `TrendAreaChart` | `trend-area-chart.tsx` | A trend over time as filled areas with a legend |
| `CategoryBarChart` | `category-bar-chart.tsx` | One figure across a few categories as horizontal bars |
| `TimelineBars` | `timeline-bars.tsx` | A plan on a time scale: a row per project with a placed bar carrying progress |

Forms and controls

| Block | File | What it is |
|---|---|---|
| `CompactSelect` | `compact-select.tsx` | A small select for a toolbar or a cell: visible label, icon, a heading over the options |
| `SegmentedControl` | `segmented-control.tsx` | A few choices as one joined control with exactly one on |
| `SelectField` | `select-field.tsx` | A label over a full-width select |
| `SwitchField` | `switch-field.tsx` | One setting as a switch with its name and description |
| `SwitchRow` | `switch-row.tsx` | One setting on a single line: name, hint, switch |
| `SliderField` | `slider-field.tsx` | One number set with a slider, its value on the label line |
| `HintField` | `hint-field.tsx` | A field whose label line ends in a hint or the current value |
| `RadioCards` | `radio-cards.tsx` | A choice where each option is a card with a name and a sentence |
| `SettingsSection` | `settings-section.tsx` | One fieldset of a settings form: legend, sentence, fields |
| `FormFooter` | `form-footer.tsx` | The sticky foot of a scrolling form: a note and the buttons |
| `IconToolbar` | `icon-toolbar.tsx` | A toolbar of icon buttons with tooltips over a divider |

Reading and writing

| Block | File | What it is |
|---|---|---|
| `Prose` | `prose.tsx` | Written text on the system's typeset, as a tool or a document, optionally at a UI text step |
| `ArticleHeading` | `article-heading.tsx` | How an article opens: eyebrow, title, lead, a meta line |
| `DocumentTitle` | `document-title.tsx` | The large title of a document page, with an optional cover |
| `OnThisPage` | `on-this-page.tsx` | The sticky table of contents with the active link |
| `CodeBlock` | `code-block.tsx` | Code under a title bar with an action slot |
| `CodeTabs` | `code-tabs.tsx` | The same code in several forms behind tabs |
| `EndpointHeader` | `endpoint-header.tsx` | An API endpoint's method badge, mono path and title |

Conversations and review

| Block | File | What it is |
|---|---|---|
| `MailHeader` | `mail-header.tsx` | An open message's subject, labels, sender, recipients and date |
| `CollapsedThread` | `collapsed-thread.tsx` | The earlier messages of a thread, one row each |
| `ReplyComposer` | `reply-composer.tsx` | The reply box under a message: who it goes to, text, tools, send |
| `ChatPrompt` | `chat-prompt.tsx` | What the person sent: avatar and a bubble on the end side |
| `ChatReply` | `chat-reply.tsx` | What the assistant answered: avatar, name, prose, actions and a run meta line |
| `ChatNotice` | `chat-notice.tsx` | A system note inside a conversation, in a dashed outline |
| `PromptInput` | `prompt-input.tsx` | The one-field message box: attached files, text, tools, send |
| `CommentThread` | `comment-thread.tsx` | Comments on one spot with a reply field |
| `DiffFile` | `diff-file.tsx` | One changed file: fold button, path, counts, a "viewed" checkbox, the diff inside |
| `DiffView` | `diff-view.tsx` | A unified diff: hunks, two line-number gutters, a slot under each line |
| `DiffStat` | `diff-stat.tsx` | An added or removed count in mono in the success or destructive colour |

Planning

| Block | File | What it is |
|---|---|---|
| `CalendarToolbar` | `calendar-toolbar.tsx` | The bar over a calendar: today, previous and next, the range, tools, the view choice, the main action |
| `WeekView` | `week-view.tsx` | Day headings, the all-day row and the hour grid with events placed by time and the "now" line |
| `KanbanBoard` | `kanban-board.tsx` | Columns side by side, each with its name, count, add button and its cards scrolling inside |
| `KanbanCard` | `kanban-card.tsx` | One board item: key, title, menu, badges, progress, people and facts |

Shared: `lib/frame.ts` (the steps a frame picks from and their tokens) · `pending.tsx` (the bar a waiting value is, and the frame's attributes) · `lib/text.ts` (one-line recipes: title, meta, figure, code) · `lib/copy.ts` (running text: note, body, lead,
caption, inline code, the display size) · `lib/bands.ts` (a card's toolbar and footer bands) · `lib/chart.ts` (the
chart colours in series order).

## What reads which token

- Titles read the system's heading scale (`lib/copy.ts`): `HEADING_LG` — `--heading-font-size-lg`, its line height,
  `--heading-letter-spacing`, the heading stack — for a route's or a record's title (DetailHeading, RecordHeading,
  MailHeader); `HEADING_XL` for the title of a screen that stands on its own (SearchHero, EndpointHeader,
  DocumentTitle). A stat card's value takes the `lg` size and line height (`FIGURE_LG`).
- Small icons in meta lines, notes and hints read the control icon scale: `--control-icon-size-sm` · `-md` · `-lg`.
- `ListCard`'s bordered header takes the systems' own rule for a card header over a divider.

## Values the systems have no token for yet

These stay literals in the blocks; each is a candidate for a token in the systems:

- Code line heights 1.6 (CodeBlock) and 1.7 (DiffView); the diff's gutter grid and paddings. (The typeset's own
  `pre` uses a literal 1.5 too.)
- Reading measures (`72ch`, `80ch`, `52rem`) passed by templates; the typeset has `--typeset-*-measure`, which
  `Prose` sets aside.
- The 18px icon in `TopicCards`' icon tile, and the document cover at 1.25 × the title.
- `WeekView`'s event corner `min(var(--control-radius), 8px)`, its primary tints and its grid geometry.
- Chart stroke width, fill opacities and bar radius.

The CLI installs the blocks as one set: `tyohnn init --blocks`, or `tyohnn blocks` in a project that is set up
(`packages/cli/README.md`, "Blocks"). Every `.ts` and `.tsx` file under this folder is copied, so a new block needs no
manifest entry.
