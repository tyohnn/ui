import type { ReactNode } from "react";

import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTitle,
} from "@tyohnn/components/attachment";

export type AttachmentFile = {
    name: string;
    /** Under the name: kind and size */
    detail?: ReactNode;
    icon: ReactNode;
    /** The file's one action: download it, remove it. `label` names the button ("Download notes.pdf") */
    action?: { label: string; icon: ReactNode; onClick?: () => void };
};

/** Files as a group of attachment chips, each with an icon, its name, a detail line and one action: `sm` under a message, `xs` in a composer. */
export const AttachmentList = ({ files, size = "sm", className }: { files: readonly AttachmentFile[]; size?: "sm" | "xs"; className?: string }) => (
    <AttachmentGroup className={className}>
        {files.map((file) => (
            <Attachment key={file.name} size={size}>
                <AttachmentMedia>{file.icon}</AttachmentMedia>
                <AttachmentContent>
                    <AttachmentTitle>{file.name}</AttachmentTitle>
                    {file.detail !== undefined && <AttachmentDescription>{file.detail}</AttachmentDescription>}
                </AttachmentContent>
                {file.action !== undefined && (
                    <AttachmentActions>
                        <AttachmentAction aria-label={file.action.label} onClick={file.action.onClick}>{file.action.icon}</AttachmentAction>
                    </AttachmentActions>
                )}
            </Attachment>
        ))}
    </AttachmentGroup>
);
