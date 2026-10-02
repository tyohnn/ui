import type { ReactNode } from "react";

import { BIG_FIGURE, META } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/** A few figures side by side, each over its label: seats used, invited, available. */
export const FigureRow = ({ figures, className }: { figures: readonly { value: ReactNode; label: string }[]; className?: string }) => (
    <div className={cn("grid gap-2", className)} style={{ gridTemplateColumns: `repeat(${figures.length}, minmax(0, 1fr))` }}>
        {figures.map((figure) => (
            <div key={figure.label} className="flex flex-col">
                <span className={BIG_FIGURE}>{figure.value}</span>
                <span className={META}>{figure.label}</span>
            </div>
        ))}
    </div>
);
