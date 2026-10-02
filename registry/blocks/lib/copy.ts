/**
 * Text recipes for running text and labels, next to the one-line recipes of `text.ts`. Each reads system tokens
 * only (the UI type scale and the semantic colours). Unlike META these do not force one line or tabular figures:
 * add `whitespace-nowrap` or `tabular-nums` where the text needs it.
 */

/** Small secondary text that may wrap or be cut: a note, a hint, a recipient line, a caption with words in it */
export const NOTE = "text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] text-muted-foreground";

/** Text at the UI's base step: a comment, a name in a list */
export const BODY = "m-0 text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)]";

/** A sentence of supporting text under a heading */
export const LEAD = "m-0 text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)] text-muted-foreground";

/** The name of a row in a short list: a request, a service */
export const ROW_LABEL = "text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)] font-medium";

/** The smallest text, with figures that line up: an hour on an axis, a gutter label */
export const CAPTION = "text-[length:var(--ui-text-xs)] leading-[var(--ui-line-height-xs)] text-muted-foreground tabular-nums";

/** A line of text behind a small icon; goes with NOTE or BODY */
export const ICON_LINE = "flex items-center gap-1.5 [&_svg]:size-[14px] [&_svg]:shrink-0";
