import type { ReactNode } from "react";

import { Progress, ProgressLabel, ProgressValue } from "@tyohnn/components/progress";
import { META } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

/**
 * One part of a whole as a progress bar: its name, how many it is and the share that makes: a step of a funnel,
 * a channel's part of the traffic. Stack a few in a column. For a single "used of total" bar use UsageMeter.
 */
export const ShareMeter = ({ label, count, value }: { label: ReactNode; /** The absolute figure, already formatted ("6,367") */ count: ReactNode; /** 0–100 */ value: number }) => (
    <Progress value={value} className="items-center">
        <ProgressLabel>{label}</ProgressLabel>
        <span className={cn(META, "ml-auto")}>{count}</span>
        <ProgressValue className={META} />
    </Progress>
);
