# sales-crm reference

- `crm-spec.md` — the written specification extracted from the reference screenshot
  (scale, CSS-pixel measurements, palette, type ramp, anatomy). Written in Korean.
- `style.css` — the canvas stylesheet built from that specification (the design canvas the system
  values were read from).

The original screenshot (a 2000×1511 PNG of a dark "Sales CRM / Companies" dashboard, provided by
the owner on 2026-09-15) is **not** stored here: it was only ever shared in a conversation and never
existed as a file. The specification above is the durable record of it.

## Axis contract v4, stage 2 (2026-09-17)

`tooling/preset/slot-migration.md` § graphite. graphite has no reference app (it is a screenshot system),
so the check is a computed-value dump of the coverage template — every section opened alone, popups
included — before and after, in both modes.

The layer-3 rules were taken back from foundation wherever they read a v4 slot: 140 declaration sites (the
list's 129 plus the menu and select rings, the separator insets, the field-family borders that now read
`--input-border`) and 31 declarations foundation gained in v4 (label · title · button · toggle · table-head
case and tracking, the field's bottom edge, the command row's radius and gap, the button and select-trigger
`sm` corner, the avatar fallback type, the checked switch edge, the sidebar row's vertical padding, the
menubar gap, the questionnaire choice fill, the disabled field fill, the active tab shadow).

**Values now in slots** (`tokens.css`, in place, backfilled defaults deleted):

- `--menu-label-padding-y: 6px` — graphite's rows have no vertical padding (`--menu-item-padding-y-check: 0px`),
  but the label band keeps mira's py-1.5.
- `--avatar-font-size: initial` · `--avatar-line-height: initial` — graphite's md/lg initials set no type of
  their own and inherit; foundation's v4 rule now declares it.
- `--table-head-letter-spacing: initial` — the head inherits the table's tracking.

The other six listed rows (accordion borders, badge border and icon size, keycap min-width) equal
foundation's default.

**Not moved — resolved in v5:** `.cn-input` has no `padding-block` in graphite (its height is a `min-height`, and the input
group's control inherits from it), while `--control-padding-y-field` is also read by the native select, which
keeps foundation's 2px. One slot cannot hold both, so graphite's input rule stays without that declaration.

**Layer-3 files:** 39 of 62 are byte-identical to foundation (20 before). The remaining 23 differ by graphite's
own rules (`min-height` controls, the field label, toggle and calendar details, the chart tooltip, the
translucent menu) and by rules graphite forked before foundation's mira reference correction; none of them
is a v4 slot.

**Check:** coverage-template dumps before and after: **0 differences** in light and dark (2530 elements
each). `scan-tokens` · `validate-system` pass.

## Axis contract v5 (2026-09-17)

The input row above is a value now. Measured before the change, graphite's input **and** its native select both
compute `padding-block: 0` (neither rule declared one), so the v4 note that the native select kept 2px was not
what rendered. graphite sets `--control-padding-y-field: 0px`; `.cn-input` and `.cn-native-select` take
foundation's declarations, the native select reading `--native-select-padding-y` at its default.

**Check:** coverage-template dumps before and after, **0 differences** in light and dark (2530 elements each).
