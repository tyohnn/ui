// Semantic icons drawn with hugeicons (@hugeicons/react HugeiconsIcon + @hugeicons/core-free-icons). Generated from the shadcn IconPlaceholder mappings;
// 24px box and strokeWidth 2 (hugeicons defaults to 1.5; shadcn's CLI passes 2).
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import {
    Activity01Icon,
    Alert02Icon,
    ApertureIcon,
    ArrowDown01Icon,
    ArrowDown02Icon,
    ArrowDownIcon,
    ArrowLeft01Icon,
    ArrowLeftIcon,
    ArrowRight01Icon,
    ArrowRightIcon,
    ArrowUp01Icon,
    Briefcase01Icon,
    Building03Icon,
    Calendar03Icon,
    Cancel01Icon,
    Chart03Icon,
    CheckmarkCircle02Icon,
    ContactBookIcon,
    CreditCardIcon,
    Download01Icon,
    GridIcon,
    HeadsetIcon,
    HelpCircleIcon,
    InformationCircleIcon,
    KanbanIcon,
    Loading03Icon,
    Mail01Icon,
    MinusSignIcon,
    MoreHorizontalCircle01Icon,
    MultiplicationSignCircleIcon,
    NotificationIcon,
    PlusSignIcon,
    SearchIcon,
    SidebarLeftIcon,
    Tick02Icon,
    TrendingDownIcon,
    TrendingUpIcon,
    UnfoldMoreIcon,
    UserAdd01Icon,
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

export const Activity = icon(Activity01Icon);
export const ArrowDown = icon(ArrowDown02Icon);
export const Bell = icon(NotificationIcon);
export const BrandMark = icon(ApertureIcon);
export const Briefcase = icon(Briefcase01Icon);
export const Building = icon(Building03Icon);
export const Calendar = icon(Calendar03Icon);
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
export const CircleHelp = icon(HelpCircleIcon);
export const Contact = icon(ContactBookIcon);
export const CreditCard = icon(CreditCardIcon);
export const Download = icon(Download01Icon);
export const Headset = icon(HeadsetIcon);
export const Info = icon(InformationCircleIcon);
export const Kanban = icon(KanbanIcon);
export const LayoutGrid = icon(GridIcon);
export const Loader = icon(Loading03Icon);
export const Mail = icon(Mail01Icon);
export const Minus = icon(MinusSignIcon);
export const MoreHorizontal = icon(MoreHorizontalCircle01Icon);
export const OctagonX = icon(MultiplicationSignCircleIcon);
export const PanelLeft = icon(SidebarLeftIcon);
export const Plus = icon(PlusSignIcon);
export const Search = icon(SearchIcon);
export const SelectIndicator = icon(UnfoldMoreIcon);
export const TrendingDown = icon(TrendingDownIcon);
export const TrendingUp = icon(TrendingUpIcon);
export const TriangleAlert = icon(Alert02Icon);
export const UserPlus = icon(UserAdd01Icon);
export const Users = icon(UserGroupIcon);
export const X = icon(Cancel01Icon);
