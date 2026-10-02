import type { ReactNode } from "react";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@tyohnn/components/item";
import { cn } from "@tyohnn/lib/utils";

export type FileTile = {
    id: string;
    /** The icon of the file's kind */
    icon: ReactNode;
    name: string;
    /** One line under the name: type, size, who added it */
    meta?: ReactNode;
};

/** A grid of small outlined tiles, each an icon with a name and one line of detail cut to the tile's width: recent files, attachments. */
export const FileTiles = ({ files, className }: { files: readonly FileTile[]; className?: string }) => (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
        {files.map((file) => (
            <Item key={file.id} variant="outline" size="xs" className="min-w-0">
                <ItemMedia variant="icon">{file.icon}</ItemMedia>
                <ItemContent className="min-w-0">
                    <ItemTitle className="w-full truncate">{file.name}</ItemTitle>
                    {file.meta !== undefined && <ItemDescription className="truncate">{file.meta}</ItemDescription>}
                </ItemContent>
            </Item>
        ))}
    </div>
);
