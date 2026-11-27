# Pattern index

Generated from tyohnn's `registry/blocks` by `node packages/mcp/scripts/pattern-index.mjs`; do not edit. With the
tyohnn MCP server connected, call `list_patterns` and `get_pattern` instead: they return the source.

| Pattern | What it is | Composes |
|---|---|---|
| `action-item-list` | A short list of outlined items, each with an icon, a title, a description and its own actions. | badge, item |
| `activity-bars` | A trend as a row of small bars, one per period, each at a level from 0 (a faint dot: nothing happened) to 4. |  |
| `activity-feed` | What happened lately, newest first. | avatar, item |
| `agenda` | A meeting's agenda as an outlined, numbered list. | badge, checkbox |
| `article-heading` | How an article opens. |  |
| `attachment-list` | Files as a group of attachment chips, each with an icon, its name, a detail line and one action. | attachment |
| `avatar-stack` | The people on something as overlapping avatars. | avatar |
| `byline` | Who wrote a post, as a band between two hairlines under its title. | avatar |
| `calendar-toolbar` | The bar over a calendar view. | button, button-group |
| `callout-list` | A callout that lists a few points under its title. | alert |
| `card-toolbar` | The band at the top of a card that is a workspace rather than a table. |  |
| `category-bar-chart` | One figure compared across a few categories as horizontal bars, the category names down the side. | chart |
| `chat-notice` | A note from the system in the middle of a conversation, in a dashed outline. |  |
| `chat-prompt` | What the person sent in a conversation with an assistant. | avatar, bubble, message |
| `chat-reply` | What the assistant answered. | avatar, button, message |
| `checkbox-matrix` | A grid of checkboxes in an outlined table. | checkbox, table |
| `checklist` | A list of things to tick off. | checkbox, label |
| `code-block` | A block of code under a title bar. |  |
| `code-tabs` | The same code in several forms behind tabs, one code block per tab. | tabs |
| `collapsed-thread` | The earlier messages of a thread, folded to one row each. | avatar |
| `comment-thread` | A thread of comments on one spot — a line of a diff, a paragraph, a pin on a design. | avatar, textarea |
| `compact-select` | A small select for a toolbar filter or a cell. | select |
| `contact-options` | A few ways to do one thing, stacked. | item |
| `data-table` | A table drawn from columns and rows. | button, checkbox, table |
| `data-table-card` | A table in a card that fills the height it is given and scrolls inside. | card, tabs |
| `definition-list` | An outlined list of short definitions with a hairline between them. | badge |
| `detail-heading` | The head of a page about one thing — a project, an account, a release. |  |
| `detail-sections` | The side column of a record's page. | separator |
| `diff-file` | One changed file of a review. | button, checkbox, label |
| `diff-stat` | A count of added or removed lines in mono, in the system's success or destructive colour ("+17", "−6"). |  |
| `diff-view` | A unified diff. |  |
| `document-title` | The title of a document page — a brief, a page of notes — at twice the size of a screen's title, with an optional cover (an emoji, a small picture) over it. |  |
| `endpoint-header` | The head of one endpoint in an API reference. | badge |
| `field-panel` | A panel of settings beside the thing they apply to. | card, field |
| `figure-row` | A few figures side by side, each over its label. |  |
| `file-tiles` | A grid of small outlined tiles, each an icon with a name and one line of detail cut to the tile's width. | item |
| `filter-bar` | The band over a table or a board. |  |
| `form-footer` | The foot of a form that scrolls. |  |
| `hint-field` | A field whose label line ends in a short hint or the current value ("200k · tools", "0.4"), with the control under it. | field |
| `icon-meta` | One line of meta text behind a small icon. |  |
| `icon-note` | A short note behind a small icon, in running text that may wrap. |  |
| `icon-toolbar` | A toolbar of icon buttons over a divider. | button, separator, tooltip |
| `info-card` | A small titled card for a side column. | card |
| `inline-facts` | A few short facts on one line behind an icon, with a hairline between them. |  |
| `kanban-board` | A board of columns side by side, one per state, each a muted surface with its name and count on top and its cards scrolling inside. | badge, button |
| `kanban-card` | One item on a board (KanbanBoard). | card, progress, badge |
| `link-item-list` | A list of outlined items that each open something. | badge, item |
| `list-card` | A card that fills the height it is given and holds a list. | card |
| `mail-header` | The head of an open message. | avatar |
| `metric-cards` | A row of small metric cards. | badge, card |
| `on-this-page` | The table of contents beside a long page. | separator |
| `page` | The frame of a page. |  |
| `page-bar` | The bar at the top of a page inside an app window. |  |
| `page-heading` | The head of a page body. |  |
| `page-split` | Two panes side by side. | button, sheet |
| `page-tabs` | The tabs of a page as an underlined strip over a divider, each with an icon and a count. | badge, tabs |
| `pager-cards` | The end of a page in a series. | card |
| `parameter-table` | The parameters of an endpoint, a command or a function as a framed table. | badge |
| `pending` | The place of a text value before the value arrives. |  |
| `person` | A person in a row or a cell. | avatar |
| `prompt-input` | The message box of a conversation with an assistant, all in one field. | input-group, kbd |
| `property-list` | The properties of a document or a record as rows. |  |
| `prose` | Written text on the system's typeset. |  |
| `radio-cards` | A choice among a few options, each a card with its name and what it means; the whole card selects it. | field, radio-group |
| `record-heading` | The head of one record's page — a pull request, an issue, a ticket. |  |
| `ref-chip` | A reference in mono type on a muted chip. |  |
| `reply-composer` | The reply box under an open message, over a divider. | button, textarea |
| `row-menu` | The actions of one row behind a "more" button. | button, dropdown-menu |
| `rule-steps` | A rule read as a sentence per step — when this happens, if that holds, then do this — each in its own outlined row. | badge |
| `search-hero` | The band at the top of a help center or a directory, centred on one large search field. | badge, input-group, kbd |
| `section-card` | A titled card for a section of a page's main column. | card |
| `section-heading` | The head of a section inside a page. |  |
| `section-title` | A section's title in a page of notes or a document, with a short meta at the end of the line. |  |
| `segment-meter` | A percentage as a row of ticks with the figure beside it. |  |
| `segmented-control` | A few choices side by side as one joined control, exactly one of them on. | toggle-group |
| `select-field` | A select as a form field. | field, select |
| `service-status` | The state of each service, one per row. |  |
| `settings-section` | One section of a settings form. | field |
| `share-meter` | One part of a whole as a progress bar. | progress |
| `slider-field` | One number set with a slider. | slider |
| `stat-cards` | A row of small cards that say where something stands. | card, progress |
| `status-line` | One row of a short list in a side column. |  |
| `step-list` | Numbered steps to follow in order. |  |
| `summary-bar` | The band under a table that sums it up, in equal cells with a hairline between them. |  |
| `switch-field` | One setting as a switch. | field, switch |
| `switch-row` | One setting on a single line. | field, switch |
| `tab-card` | A card of panels behind tabs. | card, tabs |
| `table-frame` | An outline with the system's corners around a bare table (DataTable) that stands on the page or in an article instead of in a card. |  |
| `table-search` | The search field of a table's toolbar. | input-group |
| `task-list` | A list of things to do, one per row with a hairline between. | checkbox |
| `ticket-list` | A short list of open things with a hairline between them. | badge, separator |
| `timeline-bars` | A plan on a time scale. | progress |
| `tone-dot` | A coloured dot that marks a state or a category in the system's status colours. |  |
| `topic-cards` | A grid of small cards that each lead into a topic. | card |
| `trend-area-chart` | A trend over time as filled areas, one per series, with a legend under it. | chart |
| `two-line-label` | A name over a caption, each on one line. |  |
| `usage-meter` | How much of something is used. | progress |
| `week-view` | A week of a calendar. |  |
