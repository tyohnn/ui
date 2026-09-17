import { type ReactNode, useEffect } from "react";

/**
 * One coverage section: the registry/ui components it renders, the selectors of the popups it opens
 * (portalled outside the section, measured as extra roots) and the markup. `open` is true only when the
 * section is rendered alone (`?section=<name>`), so popups never stack on the full page.
 */
export type CoverageSection = {
    name: string;
    components: string[];
    portals?: string[];
    render: (open: boolean) => ReactNode;
};

/**
 * Animations and transitions off, so a measurement never catches a popup mid-enter, a skeleton
 * mid-pulse or a spinner mid-turn. Neither property is compared.
 */
export const NO_MOTION = "*,*::before,*::after{animation:none!important;transition:none!important}";

/**
 * Motion is on, as in an app. Tooling that measures or screenshots opens a page with `&motion=off`, and then
 * the NO_MOTION style goes into <head> after mount (an effect, so server-rendered copies such as the shadcn
 * reference apps hydrate without a mismatch).
 */
export const NoMotion = () =>
{
    useEffect(() =>
    {
        if (new URLSearchParams(location.search).get("motion") !== "off") return;

        const style = document.createElement("style");

        style.dataset.noMotion = "";
        style.textContent = NO_MOTION;
        document.head.append(style);

        return () => style.remove();
    }, []);

    return null;
};

/** A labelled row of states. Layout only; the label is plain text. */
export const Row = ({ label, children, className }: { label: string; children: ReactNode; className?: string }) => (
    <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={className ?? "flex flex-wrap items-center gap-3"}>{children}</div>
    </div>
);
