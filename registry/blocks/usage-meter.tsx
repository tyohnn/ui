import type { ReactNode } from "react";

import { Progress, ProgressLabel, ProgressValue } from "@tyohnn/components/progress";

/** How much of something is used: a progress bar with what it measures on one side and the percentage on the other. */
export const UsageMeter = ({ label, value }: { label: ReactNode; /** 0–100 */ value: number }) => (
    <Progress value={value}>
        <ProgressLabel>{label}</ProgressLabel>
        <ProgressValue className="ml-auto" />
    </Progress>
);
