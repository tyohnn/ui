/**
 * Text recipes for running copy and labels in the blocks, next to the one-line recipes of `text.ts`. Each reads
 * system tokens only (the UI type scale and the semantic colours).
 */

/** Small secondary text that may wrap: a note, a hint, a line of facts (META is the one-line kind with tabular figures) */
export const NOTE = "text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] text-muted-foreground";

/** A sentence of supporting text under a heading */
export const LEAD = "m-0 text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)] text-muted-foreground";

/** The name of a row in a short list: a request, a service */
export const ROW_LABEL = "text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)] font-medium";

/** The smallest text, with figures that line up: an hour on an axis, a gutter label */
export const CAPTION = "text-[length:var(--ui-text-xs)] leading-[var(--ui-line-height-xs)] text-muted-foreground tabular-nums";
