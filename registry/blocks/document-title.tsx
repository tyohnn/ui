import type { ReactNode } from "react";

const HEADLINE = "font-heading text-[length:var(--heading-font-size-xl)] leading-[var(--heading-line-height-xl)] tracking-[var(--heading-letter-spacing)] font-bold text-foreground";

/**
 * The title of a document page — a brief, a page of notes — at twice the size of a screen's title, with an
 * optional cover (an emoji, a small picture) over it. For the title of an app screen use PageHeading.
 */
export const DocumentTitle = ({ title, cover }: { title: ReactNode; /** Decorative; hidden from assistive technology */ cover?: ReactNode }) => (
    cover === undefined ? <h1 className={HEADLINE}>{title}</h1> : (
        <div className="flex flex-col gap-3">
            <span className="text-[length:calc(var(--heading-font-size-xl)*1.25)] leading-none" aria-hidden>{cover}</span>
            <h1 className={HEADLINE}>{title}</h1>
        </div>
    )
);
