import type { ReactNode } from "react";

import { TrendingDown, TrendingUp } from "@tyohnn/icons";

import { Badge } from "@tyohnn/components/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { FIGURE, META } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

export type Metric = {
    label: string;
    value: ReactNode;
    /** The change against the comparison period, already formatted ("+12.4%") */
    change?: string;
    trend?: "up" | "down";
    /** One line under the figure: what it is compared with, or what stands out */
    note?: ReactNode;
};

/**
 * A row of small metric cards: label, figure, the change as a trend badge and one line of context.
 * `changeVariant` picks the badge the change is written in: outlined, or filled where the cards are the page's subject.
 */
export const MetricCards = ({ metrics, changeVariant = "outline", className }: { metrics: readonly Metric[]; changeVariant?: "outline" | "secondary"; className?: string }) => (
    <div className={cn("grid grid-cols-2 gap-4 xl:grid-cols-4", className)}>
        {metrics.map((metric) =>
        {
            const TrendIcon = metric.trend === "down" ? TrendingDown : TrendingUp;

            return (
                <Card key={metric.label} size="sm">
                    <CardHeader>
                        <CardDescription>{metric.label}</CardDescription>
                        <CardTitle className={FIGURE}>{metric.value}</CardTitle>
                        {metric.change !== undefined && (
                            <CardAction>
                                <Badge variant={changeVariant}>
                                    {metric.trend !== undefined && <TrendIcon data-icon="inline-start" />}
                                    {metric.change}
                                </Badge>
                            </CardAction>
                        )}
                    </CardHeader>
                    {metric.note !== undefined && (
                        <CardFooter>
                            <span className={META}>{metric.note}</span>
                        </CardFooter>
                    )}
                </Card>
            );
        })}
    </div>
);
