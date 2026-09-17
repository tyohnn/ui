// Semantic icons drawn with remixicon (@remixicon/react). Generated from the shadcn IconPlaceholder mappings;
// 24px box (remix's default); filled glyphs, so there is no stroke width to set.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { RemixiconComponentType } from "@remixicon/react";
import {
    RiAddLine,
    RiArrowDownLine,
    RiArrowDownSLine,
    RiArrowLeftSLine,
    RiArrowRightDownLine,
    RiArrowRightSLine,
    RiArrowRightUpLine,
    RiArrowUpSLine,
    RiBankCardLine,
    RiBriefcaseLine,
    RiBuilding2Line,
    RiCalendarLine,
    RiCameraLensLine,
    RiCheckLine,
    RiCheckboxCircleLine,
    RiCloseCircleLine,
    RiCloseLine,
    RiContactsBook2Line,
    RiCustomerService2Line,
    RiDownloadLine,
    RiErrorWarningLine,
    RiGridLine,
    RiGroupLine,
    RiInformationLine,
    RiKanbanView,
    RiLineChartLine,
    RiLoaderLine,
    RiMailLine,
    RiMoreLine,
    RiNotificationLine,
    RiPulseLine,
    RiQuestionLine,
    RiSearchLine,
    RiSideBarLine,
    RiSubtractLine,
    RiUserAddLine,
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

export const Activity = icon(RiPulseLine);
export const ArrowDown = icon(RiArrowDownLine);
export const Bell = icon(RiNotificationLine);
export const BrandMark = icon(RiCameraLensLine);
export const Briefcase = icon(RiBriefcaseLine);
export const Building = icon(RiBuilding2Line);
export const Calendar = icon(RiCalendarLine);
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
export const CircleHelp = icon(RiQuestionLine);
export const Contact = icon(RiContactsBook2Line);
export const CreditCard = icon(RiBankCardLine);
export const Download = icon(RiDownloadLine);
export const Headset = icon(RiCustomerService2Line);
export const Info = icon(RiInformationLine);
export const Kanban = icon(RiKanbanView);
export const LayoutGrid = icon(RiGridLine);
export const Loader = icon(RiLoaderLine);
export const Mail = icon(RiMailLine);
export const Minus = icon(RiSubtractLine);
export const MoreHorizontal = icon(RiMoreLine);
export const OctagonX = icon(RiCloseCircleLine);
export const PanelLeft = icon(RiSideBarLine);
export const Plus = icon(RiAddLine);
export const Search = icon(RiSearchLine);
export const SelectIndicator = icon(RiArrowDownSLine);
export const TrendingDown = icon(RiArrowRightDownLine);
export const TrendingUp = icon(RiArrowRightUpLine);
export const TriangleAlert = icon(RiErrorWarningLine);
export const UserPlus = icon(RiUserAddLine);
export const Users = icon(RiGroupLine);
export const X = icon(RiCloseLine);
