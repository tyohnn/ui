import type { ReactNode } from "react";

const HEADLINE = "font-heading text-[length:calc(var(--ui-text-lg)*2)] leading-[1.2] font-bold text-foreground";

/**
 * The title of a document page — a brief, a page of notes — at twice the size of a screen's title, with an
 * optional cover (an emoji, a small picture) over it. For the title of an app screen use PageHeading.
 */
export const DocumentTitle = ({ title, cover }: { title: ReactNode; /** Decorative; hidden from assistive technology */ cover?: ReactNode }) => (
    cover === undefined ? <h1 className={HEADLINE}>{title}</h1> : (
        <div className="flex flex-col gap-3">
            <span className="text-[length:calc(var(--ui-text-lg)*2.5)] leading-none" aria-hidden>{cover}</span>
            <h1 className={HEADLINE}>{title}</h1>
        </div>
    )
);
