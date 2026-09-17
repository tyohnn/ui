// Semantic icons drawn with tabler (@tabler/icons-react). Generated from the shadcn IconPlaceholder mappings;
// 24px box and stroke 2 like lucide; tabler names stroke width `stroke`, and a `strokeWidth` prop still overrides it.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { Icon as TablerIcon } from "@tabler/icons-react";
import {
    IconActivity,
    IconAddressBook,
    IconAlertOctagon,
    IconAlertTriangle,
    IconAperture,
    IconArrowDown,
    IconBell,
    IconBriefcase,
    IconBuilding,
    IconCalendar,
    IconChartLine,
    IconCheck,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
    IconCircleCheck,
    IconCreditCard,
    IconDots,
    IconDownload,
    IconHeadset,
    IconHelpCircle,
    IconInfoCircle,
    IconLayoutGrid,
    IconLayoutKanban,
    IconLayoutSidebar,
    IconLoader,
    IconMail,
    IconMinus,
    IconPlus,
    IconSearch,
    IconSelector,
    IconTrendingDown,
    IconTrendingUp,
    IconUserPlus,
    IconUsers,
    IconX,
} from "@tabler/icons-react";

import type { IconProps } from "../names";

const icon = (Glyph: TablerIcon) =>
{
    const Icon = ({ stroke: _stroke, ...props }: IconProps) => <Glyph size={24} stroke={2} {...props} />;

    return Icon;
};

export const Activity = icon(IconActivity);
export const ArrowDown = icon(IconArrowDown);
export const Bell = icon(IconBell);
export const BrandMark = icon(IconAperture);
export const Briefcase = icon(IconBriefcase);
export const Building = icon(IconBuilding);
export const Calendar = icon(IconCalendar);
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
export const CircleHelp = icon(IconHelpCircle);
export const Contact = icon(IconAddressBook);
export const CreditCard = icon(IconCreditCard);
export const Download = icon(IconDownload);
export const Headset = icon(IconHeadset);
export const Info = icon(IconInfoCircle);
export const Kanban = icon(IconLayoutKanban);
export const LayoutGrid = icon(IconLayoutGrid);
export const Loader = icon(IconLoader);
export const Mail = icon(IconMail);
export const Minus = icon(IconMinus);
export const MoreHorizontal = icon(IconDots);
export const OctagonX = icon(IconAlertOctagon);
export const PanelLeft = icon(IconLayoutSidebar);
export const Plus = icon(IconPlus);
export const Search = icon(IconSearch);
export const SelectIndicator = icon(IconSelector);
export const TrendingDown = icon(IconTrendingDown);
export const TrendingUp = icon(IconTrendingUp);
export const TriangleAlert = icon(IconAlertTriangle);
export const UserPlus = icon(IconUserPlus);
export const Users = icon(IconUsers);
export const X = icon(IconX);
