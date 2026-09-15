// Semantic icons drawn with hugeicons (@hugeicons/react HugeiconsIcon + @hugeicons/core-free-icons). Generated from the shadcn IconPlaceholder mappings;
// 24px box and strokeWidth 2 (hugeicons defaults to 1.5; shadcn's CLI passes 2).
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import {
    Alert02Icon,
    ArrowDown01Icon,
    ArrowDown02Icon,
    ArrowDownIcon,
    ArrowLeft01Icon,
    ArrowLeftIcon,
    ArrowRight01Icon,
    ArrowRightIcon,
    ArrowUp01Icon,
    Cancel01Icon,
    Chart03Icon,
    CheckmarkCircle02Icon,
    Download01Icon,
    GridIcon,
    InformationCircleIcon,
    Loading03Icon,
    MinusSignIcon,
    MoreHorizontalCircle01Icon,
    MultiplicationSignCircleIcon,
    NotificationIcon,
    PlusSignIcon,
    SearchIcon,
    SidebarLeftIcon,
    Tick02Icon,
    UnfoldMoreIcon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import type { IconProps } from "../names";

const icon = (glyph: IconSvgElement) =>
{
    const Icon = ({ strokeWidth, ...props }: IconProps) => (
        <HugeiconsIcon icon={glyph} size={24} strokeWidth={strokeWidth === undefined ? 2 : Number(strokeWidth)} {...props} />
    );

    return Icon;
};

export const ArrowDown = icon(ArrowDown02Icon);
export const Bell = icon(NotificationIcon);
export const CalendarChevronDown = icon(ArrowDownIcon);
export const CalendarChevronLeft = icon(ArrowLeftIcon);
export const CalendarChevronRight = icon(ArrowRightIcon);
export const ChartLine = icon(Chart03Icon);
export const Check = icon(Tick02Icon);
export const ChevronDown = icon(ArrowDown01Icon);
export const ChevronLeft = icon(ArrowLeft01Icon);
export const ChevronRight = icon(ArrowRight01Icon);
export const ChevronUp = icon(ArrowUp01Icon);
export const CircleCheck = icon(CheckmarkCircle02Icon);
export const Download = icon(Download01Icon);
export const Info = icon(InformationCircleIcon);
export const LayoutGrid = icon(GridIcon);
export const Loader = icon(Loading03Icon);
export const Minus = icon(MinusSignIcon);
export const MoreHorizontal = icon(MoreHorizontalCircle01Icon);
export const OctagonX = icon(MultiplicationSignCircleIcon);
export const PanelLeft = icon(SidebarLeftIcon);
export const Plus = icon(PlusSignIcon);
export const Search = icon(SearchIcon);
export const SelectIndicator = icon(UnfoldMoreIcon);
export const TriangleAlert = icon(Alert02Icon);
export const Users = icon(UserGroupIcon);
export const X = icon(Cancel01Icon);
