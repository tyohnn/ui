"use client";

import { type ReactNode, useState } from "react";

import { ArrowUpDown } from "@tyohnn/icons";

import { Button } from "@tyohnn/components/button";
import { Card, CardContent } from "@tyohnn/components/card";
import { Checkbox } from "@tyohnn/components/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { Tabs, TabsList, TabsTrigger } from "@tyohnn/components/tabs";
import { CODE, META } from "@tyohnn/blocks/lib/text";
import { cn } from "@tyohnn/lib/utils";

export type DataTableColumn<Row> = {
    id: string;
    /** The column's name. `hidden` keeps it for assistive technology only (a column of row actions). */
    header: string;
    hidden?: boolean;
    /** `number` right-aligns with tabular figures · `code` sets an identifier in the mono stack · `nowrap` keeps a short value on one line */
    kind?: "text" | "nowrap" | "code" | "number";
    /** Draws the header as a sort button and reports the press */
    onSort?: () => void;
    cell: (row: Row) => ReactNode;
};

export type DataTableTab = { value: string; label: string; count?: ReactNode };

export type DataTableSelection<Row> = {
    /** Row ids selected at first; the block keeps the selection from then on and reports each change */
    defaultSelected?: readonly string[];
    onChange?: (selected: string[]) => void;
    /** Names for the checkboxes: the one in the header and each row's */
    selectAllLabel: string;
    selectRowLabel: (row: Row) => string;
    /** The line in the selection bar ("2 selected") */
    summary: (count: number) => ReactNode;
    /** Bulk actions in the selection bar */
    actions?: ReactNode;
};

const CELL: Record<NonNullable<DataTableColumn<unknown>["kind"]>, string> = {
    text: "",
    nowrap: "whitespace-nowrap",
    code: CODE,
    number: "text-right tabular-nums whitespace-nowrap",
};

/**
 * A table in a card that fills the height it is given and scrolls inside: views as tabs with counts and the
 * filters in the toolbar, a bar of bulk actions while rows are selected, and the summary with the pages in the
 * footer. The rows and what to do with a change come from the caller; the block fetches nothing.
 */
export const DataTableCard = <Row,>({
    columns,
    rows,
    rowId,
    tabs,
    defaultTab,
    onTabChange,
    controls,
    selection,
    summary,
    pagination,
    className,
}: {
    columns: readonly DataTableColumn<Row>[];
    rows: readonly Row[];
    rowId: (row: Row) => string;
    tabs?: readonly DataTableTab[];
    defaultTab?: string;
    onTabChange?: (value: string) => void;
    /** The toolbar's right side: search, filters, column and filter buttons */
    controls?: ReactNode;
    selection?: DataTableSelection<Row>;
    /** The footer's left side ("Showing 1–12 of 2,184 orders") */
    summary?: ReactNode;
    /** The footer's right side */
    pagination?: ReactNode;
    className?: string;
}) =>
{
    const [selected, setSelected] = useState<readonly string[]>(selection?.defaultSelected ?? []);
    const ids = rows.map(rowId);
    const here = ids.filter((id) => selected.includes(id));
    const update = (next: string[]) =>
    {
        setSelected(next);
        selection?.onChange?.(next);
    };

    return (
        <Card className={cn("min-h-0 flex-1 gap-0 py-0", className)}>
            {(tabs !== undefined || controls !== undefined) && (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border px-4 py-3">
                    {tabs !== undefined && (
                        <Tabs defaultValue={defaultTab ?? tabs[0]?.value} onValueChange={onTabChange && ((value) => onTabChange(String(value)))}>
                            <TabsList>
                                {tabs.map((tab) => (
                                    <TabsTrigger key={tab.value} value={tab.value}>
                                        {tab.label}
                                        {tab.count !== undefined && <span className={META}>{tab.count}</span>}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    )}
                    {controls !== undefined && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
                </div>
            )}
            {selection !== undefined && here.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted px-4 py-2">
                    <span className={META}>{selection.summary(here.length)}</span>
                    {selection.actions}
                </div>
            )}
            <CardContent className="min-h-0 flex-1 overflow-y-auto px-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {selection !== undefined && (
                                <TableHead>
                                    <Checkbox
                                        checked={ids.length > 0 && here.length === ids.length}
                                        indeterminate={here.length > 0 && here.length < ids.length}
                                        onCheckedChange={(checked) => update(checked ? [...new Set([...selected, ...ids])] : selected.filter((id) => !ids.includes(id)))}
                                        aria-label={selection.selectAllLabel}
                                    />
                                </TableHead>
                            )}
                            {columns.map((column) => (
                                <TableHead key={column.id} className={column.kind === "number" ? CELL.number : undefined}>
                                    {column.hidden ? <span className="sr-only">{column.header}</span> : column.onSort ? (
                                        <Button variant="ghost" size="xs" className="-ml-2" onClick={column.onSort}>
                                            {column.header}
                                            <ArrowUpDown data-icon="inline-end" />
                                        </Button>
                                    ) : column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) =>
                        {
                            const id = rowId(row);
                            const isSelected = selected.includes(id);

                            return (
                                <TableRow key={id} data-state={isSelected ? "selected" : undefined}>
                                    {selection !== undefined && (
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => update(checked ? [...selected, id] : selected.filter((other) => other !== id))}
                                                aria-label={selection.selectRowLabel(row)}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell key={column.id} className={CELL[column.kind ?? "text"] || undefined}>{column.cell(row)}</TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            {(summary !== undefined || pagination !== undefined) && (
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-4 py-3">
                    {summary !== undefined && <span className={META}>{summary}</span>}
                    {pagination}
                </div>
            )}
        </Card>
    );
};
