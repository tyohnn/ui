// Semantic icons drawn with tabler (@tabler/icons-react). Generated from the shadcn IconPlaceholder mappings;
// 24px box and stroke 2 like lucide; tabler names stroke width `stroke`, and a `strokeWidth` prop still overrides it.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { Icon as TablerIcon } from "@tabler/icons-react";
import {
    IconAlertOctagon,
    IconAlertTriangle,
    IconArrowDown,
    IconBell,
    IconChartLine,
    IconCheck,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
    IconCircleCheck,
    IconDots,
    IconDownload,
    IconInfoCircle,
    IconLayoutGrid,
    IconLayoutSidebar,
    IconLoader,
    IconMinus,
    IconPlus,
    IconSearch,
    IconSelector,
    IconUsers,
    IconX,
} from "@tabler/icons-react";

import type { IconProps } from "../names";

const icon = (Glyph: TablerIcon) =>
{
    const Icon = ({ stroke: _stroke, ...props }: IconProps) => <Glyph size={24} stroke={2} {...props} />;

    return Icon;
};

export const ArrowDown = icon(IconArrowDown);
export const Bell = icon(IconBell);
export const CalendarChevronDown = icon(IconChevronDown);
export const CalendarChevronLeft = icon(IconChevronLeft);
export const CalendarChevronRight = icon(IconChevronRight);
export const ChartLine = icon(IconChartLine);
export const Check = icon(IconCheck);
export const ChevronDown = icon(IconChevronDown);
export const ChevronLeft = icon(IconChevronLeft);
export const ChevronRight = icon(IconChevronRight);
export const ChevronUp = icon(IconChevronUp);
export const CircleCheck = icon(IconCircleCheck);
export const Download = icon(IconDownload);
export const Info = icon(IconInfoCircle);
export const LayoutGrid = icon(IconLayoutGrid);
export const Loader = icon(IconLoader);
export const Minus = icon(IconMinus);
export const MoreHorizontal = icon(IconDots);
export const OctagonX = icon(IconAlertOctagon);
export const PanelLeft = icon(IconLayoutSidebar);
export const Plus = icon(IconPlus);
export const Search = icon(IconSearch);
export const SelectIndicator = icon(IconSelector);
export const TriangleAlert = icon(IconAlertTriangle);
export const Users = icon(IconUsers);
export const X = icon(IconX);
