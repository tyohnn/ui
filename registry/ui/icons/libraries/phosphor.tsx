// Semantic icons drawn with phosphor (@phosphor-icons/react). Generated from the shadcn IconPlaceholder mappings;
// 24px box (phosphor defaults to 1em) and the regular weight; strokeWidth 2 is passed like shadcn's CLI, though phosphor glyphs are filled outlines.
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
    ActivityIcon,
    AddressBookIcon,
    ApertureIcon,
    ArrowDownIcon,
    BellIcon,
    BriefcaseIcon,
    BuildingsIcon,
    CalendarBlankIcon,
    CaretDownIcon,
    CaretLeftIcon,
    CaretRightIcon,
    CaretUpIcon,
    ChartLineIcon,
    CheckCircleIcon,
    CheckIcon,
    CreditCardIcon,
    DotsThreeIcon,
    DownloadIcon,
    EnvelopeSimpleIcon,
    GridFourIcon,
    HeadsetIcon,
    InfoIcon,
    KanbanIcon,
    MagnifyingGlassIcon,
    MinusIcon,
    PlusIcon,
    QuestionIcon,
    SidebarIcon,
    SpinnerIcon,
    TrendDownIcon,
    TrendUpIcon,
    UserPlusIcon,
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

export const Activity = icon(ActivityIcon);
export const ArrowDown = icon(ArrowDownIcon);
export const Bell = icon(BellIcon);
export const BrandMark = icon(ApertureIcon);
export const Briefcase = icon(BriefcaseIcon);
export const Building = icon(BuildingsIcon);
export const Calendar = icon(CalendarBlankIcon);
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
export const CircleHelp = icon(QuestionIcon);
export const Contact = icon(AddressBookIcon);
export const CreditCard = icon(CreditCardIcon);
export const Download = icon(DownloadIcon);
export const Headset = icon(HeadsetIcon);
export const Info = icon(InfoIcon);
export const Kanban = icon(KanbanIcon);
export const LayoutGrid = icon(GridFourIcon);
export const Loader = icon(SpinnerIcon);
export const Mail = icon(EnvelopeSimpleIcon);
export const Minus = icon(MinusIcon);
export const MoreHorizontal = icon(DotsThreeIcon);
export const OctagonX = icon(XCircleIcon);
export const PanelLeft = icon(SidebarIcon);
export const Plus = icon(PlusIcon);
export const Search = icon(MagnifyingGlassIcon);
export const SelectIndicator = icon(CaretDownIcon);
export const TrendingDown = icon(TrendDownIcon);
export const TrendingUp = icon(TrendUpIcon);
export const TriangleAlert = icon(WarningIcon);
export const UserPlus = icon(UserPlusIcon);
export const Users = icon(UsersIcon);
export const X = icon(XIcon);
