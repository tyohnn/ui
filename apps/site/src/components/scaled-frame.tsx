"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@tyohnn/lib/utils";

/**
 * A preview iframe rendered at a desktop viewport (`width` × `height` CSS px) and scaled down to the
 * width of its box, so a template looks the same in every card. `interactive={false}` makes it a picture:
 * no pointer events, not focusable, hidden from assistive tech.
 */
export const ScaledFrame = ({
    src,
    title,
    width = 1440,
    height = 900,
    interactive = false,
    className,
}: {
    src: string;
    title: string;
    width?: number;
    height?: number;
    interactive?: boolean;
    className?: string;
}) =>
{
    const box = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0);

    useEffect(() =>
    {
        const element = box.current;

        if (!element) return;

        const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));

        observer.observe(element);

        return () => observer.disconnect();
    }, [width]);

    return (
        <div
            ref={box}
            data-frame=""
            className={cn("relative w-full overflow-hidden bg-muted", className)}
            style={{ aspectRatio: `${width} / ${height}` }}
        >
            {scale > 0 && (
                <iframe
                    src={src}
                    title={title}
                    loading="lazy"
                    tabIndex={interactive ? undefined : -1}
                    aria-hidden={interactive ? undefined : true}
                    className={cn("absolute top-0 left-0 origin-top-left border-0", !interactive && "pointer-events-none")}
                    style={{ width, height, transform: `scale(${scale})` }}
                />
            )}
        </div>
    );
};
