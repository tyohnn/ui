// Semantic icons drawn with remixicon (@remixicon/react). Generated from the shadcn IconPlaceholder mappings;
// 24px box (remix's default); filled glyphs, so there is no stroke width to set.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { RemixiconComponentType } from "@remixicon/react";
import {
    RiAddLine,
    RiArrowDownLine,
    RiArrowDownSLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiArrowUpSLine,
    RiCheckLine,
    RiCheckboxCircleLine,
    RiCloseCircleLine,
    RiCloseLine,
    RiDownloadLine,
    RiErrorWarningLine,
    RiGridLine,
    RiGroupLine,
    RiInformationLine,
    RiLineChartLine,
    RiLoaderLine,
    RiMoreLine,
    RiNotificationLine,
    RiSearchLine,
    RiSideBarLine,
    RiSubtractLine,
} from "@remixicon/react";

import type { IconProps } from "../names";

const icon = (Glyph: RemixiconComponentType) =>
{
    // Remix owns width, height, fill and color (from size and color).
    const Icon = ({ width: _width, height: _height, fill: _fill, color, ...props }: IconProps) => (
        <Glyph size={24} color={color} {...props} />
    );

    return Icon;
};

export const ArrowDown = icon(RiArrowDownLine);
export const Bell = icon(RiNotificationLine);
export const CalendarChevronDown = icon(RiArrowDownSLine);
export const CalendarChevronLeft = icon(RiArrowLeftSLine);
export const CalendarChevronRight = icon(RiArrowRightSLine);
export const ChartLine = icon(RiLineChartLine);
export const Check = icon(RiCheckLine);
export const ChevronDown = icon(RiArrowDownSLine);
export const ChevronLeft = icon(RiArrowLeftSLine);
export const ChevronRight = icon(RiArrowRightSLine);
export const ChevronUp = icon(RiArrowUpSLine);
export const CircleCheck = icon(RiCheckboxCircleLine);
export const Download = icon(RiDownloadLine);
export const Info = icon(RiInformationLine);
export const LayoutGrid = icon(RiGridLine);
export const Loader = icon(RiLoaderLine);
export const Minus = icon(RiSubtractLine);
export const MoreHorizontal = icon(RiMoreLine);
export const OctagonX = icon(RiCloseCircleLine);
export const PanelLeft = icon(RiSideBarLine);
export const Plus = icon(RiAddLine);
export const Search = icon(RiSearchLine);
export const SelectIndicator = icon(RiArrowDownSLine);
export const TriangleAlert = icon(RiErrorWarningLine);
export const Users = icon(RiGroupLine);
export const X = icon(RiCloseLine);
