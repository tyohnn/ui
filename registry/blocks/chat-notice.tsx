import type { ReactNode } from "react";

import { NOTE } from "@tyohnn/blocks/lib/copy";
import { cn } from "@tyohnn/lib/utils";

/** A note from the system in the middle of a conversation, in a dashed outline: when the session started, what changed between two messages. */
export const ChatNotice = ({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) => (
    <div className={cn(NOTE, "flex items-center gap-2 self-center rounded-[var(--radius-lg)] border border-dashed border-border px-3 py-2 [&_svg]:size-[14px]", className)}>
        {icon}
        <span>{children}</span>
    </div>
);
