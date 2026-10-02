"use client";

import { Checkbox } from "@tyohnn/components/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { cn } from "@tyohnn/lib/utils";

export type CheckboxMatrixRow = {
    label: string;
    /** One value per column: whether the box starts checked */
    checked: readonly boolean[];
};

/**
 * A grid of checkboxes in an outlined table: one row per thing, one narrow column per option, a box where they
 * meet — which notification goes to which channel, which role may do what. `cellLabel` names each box for
 * assistive technology from its row and its column.
 */
export const CheckboxMatrix = ({
    rowHeader,
    columns,
    rows,
    cellLabel,
    onCheckedChange,
    className,
}: {
    /** The heading of the first column: what the rows are */
    rowHeader: string;
    columns: readonly string[];
    rows: readonly CheckboxMatrixRow[];
    cellLabel: (row: string, column: string) => string;
    onCheckedChange?: (row: string, column: string, checked: boolean) => void;
    className?: string;
}) => (
    <div className={cn("overflow-hidden rounded-[var(--radius-lg)] border border-border", className)}>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{rowHeader}</TableHead>
                    {columns.map((column) => <TableHead key={column} className="w-20 text-center">{column}</TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.label}>
                        <TableCell>{row.label}</TableCell>
                        {columns.map((column, index) => (
                            <TableCell key={column} className="text-center">
                                <Checkbox
                                    defaultChecked={row.checked[index]}
                                    onCheckedChange={onCheckedChange && ((checked) => onCheckedChange(row.label, column, checked))}
                                    aria-label={cellLabel(row.label, column)}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
