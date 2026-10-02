import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Progress } from "@tyohnn/components/progress";
import { DISPLAY_SIZE, NOTE } from "@tyohnn/blocks/lib/prose";
import { cn } from "@tyohnn/lib/utils";

export type Stat = {
    id: string;
    label: string;
    /** A figure or a few words, in the large size */
    value: ReactNode;
    /** 0–100: draws a progress bar under the value */
    progress?: number;
    /** One line of detail under it; it may wrap */
    detail?: ReactNode;
};

/**
 * A row of small cards that say where something stands: a label, the value in the large size, a progress bar
 * when the value is part of a whole, and a line of detail. For figures that change against a period (with a trend
 * badge) use MetricCards.
 */
export const StatCards = ({ stats, className }: { stats: readonly Stat[]; className?: string }) => (
    <div className={cn("grid grid-cols-4 gap-4", className)}>
        {stats.map((stat) => (
            <Card key={stat.id} size="sm">
                <CardHeader>
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className={cn(DISPLAY_SIZE, "tabular-nums")}>{stat.value}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {stat.progress !== undefined && <Progress value={stat.progress} aria-label={stat.label} />}
                    {stat.detail !== undefined && <span className={NOTE}>{stat.detail}</span>}
                </CardContent>
            </Card>
        ))}
    </div>
);
