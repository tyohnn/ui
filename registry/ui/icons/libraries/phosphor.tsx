// Semantic icons drawn with phosphor (@phosphor-icons/react). Generated from the shadcn IconPlaceholder mappings;
// 24px box (phosphor defaults to 1em) and the regular weight; strokeWidth 2 is passed like shadcn's CLI, though phosphor glyphs are filled outlines.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
    ArrowDownIcon,
    BellIcon,
    CaretDownIcon,
    CaretLeftIcon,
    CaretRightIcon,
    CaretUpIcon,
    ChartLineIcon,
    CheckCircleIcon,
    CheckIcon,
    DotsThreeIcon,
    DownloadIcon,
    GridFourIcon,
    InfoIcon,
    MagnifyingGlassIcon,
    MinusIcon,
    PlusIcon,
    SidebarIcon,
    SpinnerIcon,
    UsersIcon,
    WarningIcon,
    XCircleIcon,
    XIcon,
} from "@phosphor-icons/react";

import type { IconProps } from "../names";

const icon = (Glyph: PhosphorIcon) =>
{
    const Icon = (props: IconProps) => <Glyph size={24} weight="regular" strokeWidth={2} {...props} />;

    return Icon;
};

export const ArrowDown = icon(ArrowDownIcon);
export const Bell = icon(BellIcon);
export const CalendarChevronDown = icon(CaretDownIcon);
export const CalendarChevronLeft = icon(CaretLeftIcon);
export const CalendarChevronRight = icon(CaretRightIcon);
export const ChartLine = icon(ChartLineIcon);
export const Check = icon(CheckIcon);
export const ChevronDown = icon(CaretDownIcon);
export const ChevronLeft = icon(CaretLeftIcon);
export const ChevronRight = icon(CaretRightIcon);
export const ChevronUp = icon(CaretUpIcon);
export const CircleCheck = icon(CheckCircleIcon);
export const Download = icon(DownloadIcon);
export const Info = icon(InfoIcon);
export const LayoutGrid = icon(GridFourIcon);
export const Loader = icon(SpinnerIcon);
export const Minus = icon(MinusIcon);
export const MoreHorizontal = icon(DotsThreeIcon);
export const OctagonX = icon(XCircleIcon);
export const PanelLeft = icon(SidebarIcon);
export const Plus = icon(PlusIcon);
export const Search = icon(MagnifyingGlassIcon);
export const SelectIndicator = icon(CaretDownIcon);
export const TriangleAlert = icon(WarningIcon);
export const Users = icon(UsersIcon);
export const X = icon(XIcon);
