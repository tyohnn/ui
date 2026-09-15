// Semantic icons drawn with radix (@radix-ui/react-icons). Generated from the shadcn IconPlaceholder mappings;
// shadcn has no radix mappings: these glyphs are tyohnn's closest choices (DESIGN.md, Icons). 24px box (radix draws a 15px viewBox at 15px by default); filled glyphs, no stroke width.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { IconProps as RadixIconProps } from "@radix-ui/react-icons/dist/types";
import {
    ArrowDownIcon,
    BarChartIcon,
    BellIcon,
    CaretSortIcon,
    CheckCircledIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    Cross2Icon,
    CrossCircledIcon,
    DashboardIcon,
    DotsHorizontalIcon,
    DownloadIcon,
    ExclamationTriangleIcon,
    InfoCircledIcon,
    MagnifyingGlassIcon,
    MinusIcon,
    PersonIcon,
    PlusIcon,
    ReloadIcon,
    ViewVerticalIcon,
} from "@radix-ui/react-icons";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import type { IconProps } from "../names";

const icon = (Glyph: ForwardRefExoticComponent<RadixIconProps & RefAttributes<SVGSVGElement>>) =>
{
    const Icon = (props: IconProps) => <Glyph width={24} height={24} {...(props as RadixIconProps)} />;

    return Icon;
};

export const ArrowDown = icon(ArrowDownIcon);
export const Bell = icon(BellIcon);
export const CalendarChevronDown = icon(ChevronDownIcon);
export const CalendarChevronLeft = icon(ChevronLeftIcon);
export const CalendarChevronRight = icon(ChevronRightIcon);
export const ChartLine = icon(BarChartIcon);
export const Check = icon(CheckIcon);
export const ChevronDown = icon(ChevronDownIcon);
export const ChevronLeft = icon(ChevronLeftIcon);
export const ChevronRight = icon(ChevronRightIcon);
export const ChevronUp = icon(ChevronUpIcon);
export const CircleCheck = icon(CheckCircledIcon);
export const Download = icon(DownloadIcon);
export const Info = icon(InfoCircledIcon);
export const LayoutGrid = icon(DashboardIcon);
export const Loader = icon(ReloadIcon);
export const Minus = icon(MinusIcon);
export const MoreHorizontal = icon(DotsHorizontalIcon);
export const OctagonX = icon(CrossCircledIcon);
export const PanelLeft = icon(ViewVerticalIcon);
export const Plus = icon(PlusIcon);
export const Search = icon(MagnifyingGlassIcon);
export const SelectIndicator = icon(CaretSortIcon);
export const TriangleAlert = icon(ExclamationTriangleIcon);
export const Users = icon(PersonIcon);
export const X = icon(Cross2Icon);
