"use client";

import type { ReactNode } from "react";

import { DataTable, type DataTableColumn } from "@tyohnn/blocks/data-table";
import { INLINE_CODE, NOTE } from "@tyohnn/blocks/lib/copy";
import { TableFrame } from "@tyohnn/blocks/table-frame";
import { Badge } from "@tyohnn/components/badge";
import { cn } from "@tyohnn/lib/utils";
import { strings } from "@tyohnn/strings";

export type Parameter = {
    name: string;
    type: string;
    required: boolean;
    description: ReactNode;
    /** A line under the description: the values it accepts, its default */
    note?: ReactNode;
};

export type ParameterTableLabels = {
    /** The four column names */
    name: string;
    type: string;
    required: string;
    description: string;
    /** The badge of a parameter that must be sent, and of one that may be left out */
    requiredBadge: string;
    optionalBadge: string;
};

/**
 * The parameters of an endpoint, a command or a function as a framed table: the name and its type in the mono
 * stack, whether it is required as a badge, and what it does with an optional note under it.
 */
export const ParameterTable = ({ parameters, labels: given, className }: { parameters: readonly Parameter[]; /** Any of the words, in place of the locale's own */ labels?: Partial<ParameterTableLabels>; className?: string }) =>
{
    const labels: ParameterTableLabels = { ...strings.blocks.parameters, ...given };

    const columns: DataTableColumn<Parameter>[] = [
        { id: "name", header: labels.name, cell: (parameter) => <code className={cn(INLINE_CODE, "font-semibold whitespace-nowrap")}>{parameter.name}</code> },
        { id: "type", header: labels.type, cell: (parameter) => <code className={cn(INLINE_CODE, "whitespace-nowrap text-muted-foreground")}>{parameter.type}</code> },
        {
            id: "required",
            header: labels.required,
            cell: (parameter) => parameter.required ? <Badge>{labels.requiredBadge}</Badge> : <Badge variant="outline">{labels.optionalBadge}</Badge>,
        },
        {
            id: "description",
            header: labels.description,
            kind: "wrap",
            cell: (parameter) => (
                <span className="flex flex-col gap-1">
                    {parameter.description}
                    {parameter.note !== undefined && <span className={NOTE}>{parameter.note}</span>}
                </span>
            ),
        },
    ];

    return (
        <TableFrame className={className}>
            <DataTable columns={columns} rows={parameters} rowId={(parameter) => parameter.name} />
        </TableFrame>
    );
};
