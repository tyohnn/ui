import { CircleCheck, TriangleAlert } from "@tyohnn/icons";

import { ROW_LABEL } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

export type Service = {
    name: string;
    /** `ok` reads as muted text behind a check, `degraded` in the destructive colour behind a warning sign */
    state: "ok" | "degraded";
    /** The state in words ("Operational") */
    label: string;
};

const STATE = { ok: "text-muted-foreground", degraded: "text-destructive" } as const;

/** The state of each service, one per row: its name on one side, the state in words behind an icon on the other. Use it for a status card or a list of health checks. */
export const ServiceStatus = ({ services, className }: { services: readonly Service[]; className?: string }) => (
    <div className={cn("flex flex-col gap-2", className)}>
        {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between gap-2">
                <span className={ROW_LABEL}>{service.name}</span>
                <span className={cn("flex items-center gap-1.5 text-[length:var(--ui-text-sm)] leading-[var(--ui-line-height-sm)] [&_svg]:size-[var(--control-icon-size-md)] [&_svg]:shrink-0", STATE[service.state])}>
                    {service.state === "ok" ? <CircleCheck /> : <TriangleAlert />}
                    {service.label}
                </span>
            </div>
        ))}
    </div>
);
