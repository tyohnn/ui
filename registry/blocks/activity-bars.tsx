import { cn } from "@tyohnn/lib/utils";

const LEVEL = [
    "h-[2px] bg-[color-mix(in_oklab,var(--success)_35%,transparent)]",
    "h-[4px] bg-success",
    "h-[6px] bg-success",
    "h-[9px] bg-success",
    "h-[12px] bg-success",
] as const;

/**
 * A trend as a row of small bars, one per period, each at a level from 0 (a faint dot: nothing happened) to 4.
 * Decorative: say the trend in words next to it when it matters. The bar sizes are the graphic's own geometry.
 */
export const ActivityBars = ({ levels, className }: { levels: readonly number[]; className?: string }) => (
    <span className={cn("flex h-[12px] items-end gap-[2px]", className)} aria-hidden="true">
        {levels.map((level, index) => <i key={index} className={cn("block w-[2px] rounded-[1px]", LEVEL[Math.max(0, Math.min(4, level))])} />)}
    </span>
);
