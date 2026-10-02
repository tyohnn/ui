/**
 * Text recipes for the blocks of a detail page (a project, a record), next to the ones in `text.ts`. Each reads
 * system tokens only.
 */

/** Small secondary text that may wrap and sets no figures: a description under a title, a line of detail in a card */
export const NOTE = "text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] text-muted-foreground";

/** Body-size text on the UI scale: a row's title, a column's name */
export const BODY = "text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)]";

/**
 * The size of a title or a figure that leads a detail page: a quarter over the largest UI text size. The systems
 * have no token for this step yet, so it is derived from `--ui-text-lg` here, in one place.
 */
export const DISPLAY_SIZE = "text-[length:calc(var(--ui-text-lg)*1.25)]";
