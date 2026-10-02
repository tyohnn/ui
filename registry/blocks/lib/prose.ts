/**
 * Text recipes for running text and for what is set in it: an article, a document, a page of notes. Like
 * `text.ts` each reads system tokens only. These wrap like prose and keep proportional figures; the one-line,
 * tabular recipes for tables and cards are in `text.ts`.
 */

/** The small step of the UI type scale */
export const SMALL = "text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)]";

/** The body step of the UI type scale */
export const BODY = "text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)]";

/** Small secondary text that may wrap: a line of meta under a title, a note under a list */
export const NOTE = "text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] text-muted-foreground";

/** Secondary text at the body size: the sentence under a section title, a caption beside a control */
export const MUTED_BODY = "text-[length:var(--ui-text-md)] leading-[var(--ui-line-height-md)] text-muted-foreground";

/** An identifier inside text or a table cell, in the mono stack at the small size */
export const INLINE_CODE = "font-mono text-[length:var(--ui-text-sm)]";

/** A bulleted list outside the typeset: in a callout, in a card */
export const BULLETS = "list-disc pl-[1.1rem]";

/** A component set in the flow of Prose: it leaves the typeset rules and takes the flow's space above it */
export const IN_PROSE = "not-typeset mt-5";
