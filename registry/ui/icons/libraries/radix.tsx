// Semantic icons drawn with radix (@radix-ui/react-icons). Generated from the shadcn IconPlaceholder mappings;
// shadcn has no radix mappings: these glyphs are tyohnn's closest choices (DESIGN.md, Icons). 24px box (radix draws a 15px viewBox at 15px by default); filled glyphs, no stroke width.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { IconProps as RadixIconProps } from "@radix-ui/react-icons/dist/types";
import {
    ActivityLogIcon,
    ArrowBottomRightIcon,
    ArrowDownIcon,
    ArrowTopRightIcon,
    BackpackIcon,
    BarChartIcon,
    BellIcon,
    CalendarIcon,
    CardStackIcon,
    CaretSortIcon,
    ChatBubbleIcon,
    CheckCircledIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ColumnsIcon,
    ComponentInstanceIcon,
    Cross2Icon,
    CrossCircledIcon,
    DashboardIcon,
    DotsHorizontalIcon,
    DownloadIcon,
    EnvelopeClosedIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    IdCardIcon,
    InfoCircledIcon,
    MagnifyingGlassIcon,
    MinusIcon,
    PersonIcon,
    PlusCircledIcon,
    PlusIcon,
    QuestionMarkCircledIcon,
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

export const Activity = icon(ActivityLogIcon);
export const ArrowDown = icon(ArrowDownIcon);
export const Bell = icon(BellIcon);
export const BrandMark = icon(ComponentInstanceIcon);
export const Briefcase = icon(BackpackIcon);
export const Building = icon(HomeIcon);
export const Calendar = icon(CalendarIcon);
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
export const CircleHelp = icon(QuestionMarkCircledIcon);
export const Contact = icon(IdCardIcon);
export const CreditCard = icon(CardStackIcon);
export const Download = icon(DownloadIcon);
export const Headset = icon(ChatBubbleIcon);
export const Info = icon(InfoCircledIcon);
export const Kanban = icon(ColumnsIcon);
export const LayoutGrid = icon(DashboardIcon);
export const Loader = icon(ReloadIcon);
export const Mail = icon(EnvelopeClosedIcon);
export const Minus = icon(MinusIcon);
export const MoreHorizontal = icon(DotsHorizontalIcon);
export const OctagonX = icon(CrossCircledIcon);
export const PanelLeft = icon(ViewVerticalIcon);
export const Plus = icon(PlusIcon);
export const Search = icon(MagnifyingGlassIcon);
export const SelectIndicator = icon(CaretSortIcon);
export const TrendingDown = icon(ArrowBottomRightIcon);
export const TrendingUp = icon(ArrowTopRightIcon);
export const TriangleAlert = icon(ExclamationTriangleIcon);
export const UserPlus = icon(PlusCircledIcon);
export const Users = icon(PersonIcon);
export const X = icon(Cross2Icon);
