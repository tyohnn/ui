/**
 * The steps a frame picks from (page.tsx, page-split.tsx). A frame decides which step a screen stands at; the value
 * of the step is a token. Each class reads the token and carries its default, so a system — or a product, in its
 * own CSS — declares a name only when it wants another value:
 *
 *     :root { --page-gutter-sm: 1.5rem; }      every screen at the small gutter moves, in every template
 *
 * Whole strings, picked from a table: Tailwind reads classes, not expressions.
 *
 * | Token                                      | Default                 | What stands at it                          |
 * |--------------------------------------------|-------------------------|--------------------------------------------|
 * | --page-gutter-sm · md · lg · xl            | 1 · 1.5 · 2 · 2.5rem    | the room between a page and its edge       |
 * | --page-gap-xs · sm · md · lg · xl          | .75 · 1 · 1.5 · 2 · 2.5 | the room between the blocks of a page      |
 * | --page-measure-sm · md · lg                | 48 · 52 · 64rem         | a reading column                           |
 * | --page-aside-xs · sm · md · lg · xl        | 14 · 18 · 20 · 26 · 30  | the narrower pane of a split               |
 * | --page-document-padding-start · -end       | 2 · 4rem                | above and below a document's column        |
 */

export type Gutter = "none" | "sm" | "md" | "lg" | "xl";
export type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type Measure = "sm" | "md" | "lg";
export type AsideWidth = "xs" | "sm" | "md" | "lg" | "xl";

/** The gutter on every side */
export const GUTTER: Record<Gutter, string> = {
    none: "",
    sm: "p-[var(--page-gutter-sm,1rem)]",
    md: "p-[var(--page-gutter-md,1.5rem)]",
    lg: "p-[var(--page-gutter-lg,2rem)]",
    xl: "p-[var(--page-gutter-xl,2.5rem)]",
};

/** The gutter on the two sides only: the block padding comes from somewhere else (a document's own padding) */
export const GUTTER_INLINE: Record<Gutter, string> = {
    none: "",
    sm: "px-[var(--page-gutter-sm,1rem)]",
    md: "px-[var(--page-gutter-md,1.5rem)]",
    lg: "px-[var(--page-gutter-lg,2rem)]",
    xl: "px-[var(--page-gutter-xl,2.5rem)]",
};

export const GAP: Record<Gap, string> = {
    none: "",
    xs: "gap-[var(--page-gap-xs,0.75rem)]",
    sm: "gap-[var(--page-gap-sm,1rem)]",
    md: "gap-[var(--page-gap-md,1.5rem)]",
    lg: "gap-[var(--page-gap-lg,2rem)]",
    xl: "gap-[var(--page-gap-xl,2.5rem)]",
};

/** The widest a reading column gets. Put it on the column itself, or on a block that is the column (Prose). */
export const MEASURE: Record<Measure, string> = {
    sm: "max-w-[var(--page-measure-sm,48rem)]",
    md: "max-w-[var(--page-measure-md,52rem)]",
    lg: "max-w-[var(--page-measure-lg,64rem)]",
};

/** The width of the narrower pane of a split. Put it on a PageAside, or on a block that is the pane (FieldPanel, DetailSections). */
export const ASIDE_WIDTH: Record<AsideWidth, string> = {
    xs: "w-[var(--page-aside-xs,14rem)]",
    sm: "w-[var(--page-aside-sm,18rem)]",
    md: "w-[var(--page-aside-md,20rem)]",
    lg: "w-[var(--page-aside-lg,26rem)]",
    xl: "w-[var(--page-aside-xl,30rem)]",
};

/** The same widths for a pane that stacks under the main column below `xl` and takes the full width there */
export const ASIDE_WIDTH_STACKED: Record<AsideWidth, string> = {
    xs: "w-full xl:w-[var(--page-aside-xs,14rem)]",
    sm: "w-full xl:w-[var(--page-aside-sm,18rem)]",
    md: "w-full xl:w-[var(--page-aside-md,20rem)]",
    lg: "w-full xl:w-[var(--page-aside-lg,26rem)]",
    xl: "w-full xl:w-[var(--page-aside-xl,30rem)]",
};

/** Above and below a document's column */
export const DOCUMENT_PADDING = "pt-[var(--page-document-padding-start,2rem)] pb-[var(--page-document-padding-end,4rem)]";
