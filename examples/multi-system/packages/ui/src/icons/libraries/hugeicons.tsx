// Semantic icons drawn with hugeicons (@hugeicons/react HugeiconsIcon + @hugeicons/core-free-icons). Generated from the shadcn IconPlaceholder mappings;
// 24px box and strokeWidth 2 (hugeicons defaults to 1.5; shadcn's CLI passes 2).
// Keep one export per name in ../names.ts, sorted. tooling/validate-system checks the set.

import {
    Activity01Icon,
    Alert02Icon,
    ApertureIcon,
    Archive02Icon,
    ArchiveIcon,
    ArrowDown01Icon,
    ArrowDown02Icon,
    ArrowDownIcon,
    ArrowLeft01Icon,
    ArrowLeft02Icon,
    ArrowLeftIcon,
    ArrowRight01Icon,
    ArrowRight02Icon,
    ArrowRightIcon,
    ArrowUp01Icon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    ArrowUpRightIcon,
    AtIcon,
    Attachment01Icon,
    AudioWave01Icon,
    BookOpen02Icon,
    Bookmark01Icon,
    BracesIcon,
    Briefcase01Icon,
    Bug01Icon,
    Building03Icon,
    CalendarIcon,
    Call02Icon,
    Cancel01Icon,
    ChartHistogramIcon,
    ChartIcon,
    ChartRingIcon,
    CheckmarkBadgeIcon,
    CheckmarkCircle02Icon,
    CheckmarkSquare02Icon,
    CircleIcon,
    Clock01Icon,
    CommandIcon,
    Comment01Icon,
    ComputerIcon,
    ComputerTerminalIcon,
    ContactBookIcon,
    Copy01Icon,
    CpuIcon,
    CreditCardIcon,
    CropIcon,
    CubeIcon,
    DashboardSquare01Icon,
    DashedLineCircleIcon,
    Database01Icon,
    Delete02Icon,
    DeleteIcon,
    DeliveryTruck01Icon,
    DollarCircleIcon,
    Download01Icon,
    File01Icon,
    FileIcon,
    FilterIcon,
    Flag01Icon,
    FlashIcon,
    FolderIcon,
    GitBranchIcon,
    GitCommitIcon,
    GitMergeIcon,
    GitPullRequestIcon,
    Globe02Icon,
    GridIcon,
    HashtagIcon,
    Heading01Icon,
    HeadsetIcon,
    HelpCircleIcon,
    HomeIcon,
    Image01Icon,
    InboxIcon,
    InformationCircleIcon,
    Invoice01Icon,
    KanbanIcon,
    Key01Icon,
    KeyboardIcon,
    Layers01Icon,
    LayoutBottomIcon,
    LayoutThreeColumnIcon,
    LeftToRightListBulletIcon,
    LeftToRightListNumberIcon,
    LinkIcon,
    Loading03Icon,
    Location01Icon,
    LogoutIcon,
    Mail01Icon,
    MailReply01Icon,
    MailReplyAll01Icon,
    MapsIcon,
    Megaphone01Icon,
    Menu09Icon,
    MessageIcon,
    MessageQuestionIcon,
    Mic01Icon,
    MinusSignIcon,
    Moon02Icon,
    MoreHorizontalCircle01Icon,
    MoreVerticalCircle01Icon,
    MultiplicationSignCircleIcon,
    NotificationIcon,
    PackageIcon,
    PaintBoardIcon,
    PencilEdit01Icon,
    PieChartIcon,
    PinIcon,
    PlusSignIcon,
    QuoteDownIcon,
    RecordIcon,
    RedoIcon,
    RefreshIcon,
    RoboticIcon,
    Rocket01Icon,
    SearchIcon,
    SecurityCheckIcon,
    SentIcon,
    Settings05Icon,
    SettingsIcon,
    Share03Icon,
    ShieldIcon,
    ShoppingCart01Icon,
    SidebarLeftIcon,
    SlidersHorizontalIcon,
    SmartPhone01Icon,
    SmileIcon,
    SourceCodeIcon,
    SparklesIcon,
    StarIcon,
    StarOffIcon,
    StopIcon,
    Sun03Icon,
    Table01Icon,
    Tag01Icon,
    TextBoldIcon,
    TextItalicIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    Tick02Icon,
    TrendingDownIcon,
    TrendingUpIcon,
    UndoIcon,
    UnfoldMoreIcon,
    Upload01Icon,
    UserAdd01Icon,
    UserGroupIcon,
    ViewIcon,
    WebhookIcon,
    WorkHistoryIcon,
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

export const Account = icon(CheckmarkBadgeIcon);
export const Activity = icon(Activity01Icon);
export const Archive = icon(Archive02Icon);
export const ArchiveX = icon(ArchiveIcon);
export const ArrowDown = icon(ArrowDown02Icon);
export const ArrowLeft = icon(ArrowLeft02Icon);
export const ArrowRight = icon(ArrowRight02Icon);
export const ArrowUp = icon(ArrowUpIcon);
export const ArrowUpDown = icon(ArrowUpDownIcon);
export const AtSign = icon(AtIcon);
export const Bell = icon(NotificationIcon);
export const Blocks = icon(CubeIcon);
export const Bold = icon(TextBoldIcon);
export const BookOpen = icon(BookOpen02Icon);
export const Bookmark = icon(Bookmark01Icon);
export const Bot = icon(RoboticIcon);
export const Braces = icon(BracesIcon);
export const BrandMark = icon(ApertureIcon);
export const Briefcase = icon(Briefcase01Icon);
export const Bug = icon(Bug01Icon);
export const Building = icon(Building03Icon);
export const Calendar = icon(CalendarIcon);
export const CalendarChevronDown = icon(ArrowDownIcon);
export const CalendarChevronLeft = icon(ArrowLeftIcon);
export const CalendarChevronRight = icon(ArrowRightIcon);
export const ChartBar = icon(ChartHistogramIcon);
export const ChartLine = icon(ChartIcon);
export const Check = icon(Tick02Icon);
export const ChevronDown = icon(ArrowDown01Icon);
export const ChevronLeft = icon(ArrowLeft01Icon);
export const ChevronRight = icon(ArrowRight01Icon);
export const ChevronUp = icon(ArrowUp01Icon);
export const ChevronsUpDown = icon(UnfoldMoreIcon);
export const Circle = icon(CircleIcon);
export const CircleCheck = icon(CheckmarkCircle02Icon);
export const CircleDashed = icon(DashedLineCircleIcon);
export const CircleHelp = icon(HelpCircleIcon);
export const Clock = icon(Clock01Icon);
export const Code = icon(SourceCodeIcon);
export const Columns = icon(LayoutThreeColumnIcon);
export const Contact = icon(ContactBookIcon);
export const Copy = icon(Copy01Icon);
export const Cpu = icon(CpuIcon);
export const CreditCard = icon(CreditCardIcon);
export const Database = icon(Database01Icon);
export const DeletedPages = icon(DeleteIcon);
export const DollarSign = icon(DollarCircleIcon);
export const Download = icon(Download01Icon);
export const Export = icon(ArrowDownIcon);
export const ExternalLink = icon(ArrowUpRightIcon);
export const Eye = icon(ViewIcon);
export const File = icon(FileIcon);
export const FileText = icon(File01Icon);
export const Filter = icon(FilterIcon);
export const Flag = icon(Flag01Icon);
export const Folder = icon(FolderIcon);
export const Forward = icon(ArrowRightIcon);
export const Frame = icon(CropIcon);
export const GitBranch = icon(GitBranchIcon);
export const GitCommit = icon(GitCommitIcon);
export const GitMerge = icon(GitMergeIcon);
export const GitPullRequest = icon(GitPullRequestIcon);
export const Globe = icon(Globe02Icon);
export const Hash = icon(HashtagIcon);
export const Heading = icon(Heading01Icon);
export const Headset = icon(HeadsetIcon);
export const History = icon(WorkHistoryIcon);
export const Home = icon(HomeIcon);
export const Image = icon(Image01Icon);
export const Inbox = icon(InboxIcon);
export const Info = icon(InformationCircleIcon);
export const Italic = icon(TextItalicIcon);
export const Kanban = icon(KanbanIcon);
export const Key = icon(Key01Icon);
export const Keyboard = icon(KeyboardIcon);
export const Layers = icon(Layers01Icon);
export const LayoutDashboard = icon(DashboardSquare01Icon);
export const LayoutGrid = icon(GridIcon);
export const LifeBuoy = icon(ChartRingIcon);
export const Link = icon(LinkIcon);
export const List = icon(LeftToRightListBulletIcon);
export const ListOrdered = icon(LeftToRightListNumberIcon);
export const Loader = icon(Loading03Icon);
export const Lock = icon(ShieldIcon);
export const LogOut = icon(LogoutIcon);
export const LogoCommand = icon(CommandIcon);
export const LogoGallery = icon(LayoutBottomIcon);
export const LogoWaveform = icon(AudioWave01Icon);
export const Mail = icon(Mail01Icon);
export const Map = icon(MapsIcon);
export const MapPin = icon(Location01Icon);
export const Megaphone = icon(Megaphone01Icon);
export const Menu = icon(Menu09Icon);
export const MessageCircle = icon(MessageIcon);
export const MessageCircleQuestion = icon(MessageQuestionIcon);
export const MessageSquare = icon(Comment01Icon);
export const Mic = icon(Mic01Icon);
export const Minus = icon(MinusSignIcon);
export const Monitor = icon(ComputerIcon);
export const Moon = icon(Moon02Icon);
export const MoreActions = icon(MoreHorizontalCircle01Icon);
export const MoreHorizontal = icon(MoreHorizontalCircle01Icon);
export const MoreVertical = icon(MoreVerticalCircle01Icon);
export const MoveTo = icon(RedoIcon);
export const OctagonX = icon(MultiplicationSignCircleIcon);
export const Package = icon(PackageIcon);
export const Paintbrush = icon(PaintBoardIcon);
export const PanelLeft = icon(SidebarLeftIcon);
export const Paperclip = icon(Attachment01Icon);
export const Pencil = icon(PencilEdit01Icon);
export const Phone = icon(Call02Icon);
export const PieChart = icon(PieChartIcon);
export const Pin = icon(PinIcon);
export const Plus = icon(PlusSignIcon);
export const Quote = icon(QuoteDownIcon);
export const Receipt = icon(Invoice01Icon);
export const RefreshCw = icon(RefreshIcon);
export const Reply = icon(MailReply01Icon);
export const ReplyAll = icon(MailReplyAll01Icon);
export const Rocket = icon(Rocket01Icon);
export const Search = icon(SearchIcon);
export const SelectIndicator = icon(UnfoldMoreIcon);
export const Send = icon(SentIcon);
export const Settings = icon(Settings05Icon);
export const SettingsAdvanced = icon(SettingsIcon);
export const Share = icon(Share03Icon);
export const ShieldCheck = icon(SecurityCheckIcon);
export const ShoppingCart = icon(ShoppingCart01Icon);
export const SiteHeaderSidebarToggle = icon(SidebarLeftIcon);
export const SlidersHorizontal = icon(SlidersHorizontalIcon);
export const Smartphone = icon(SmartPhone01Icon);
export const Smile = icon(SmileIcon);
export const Sparkles = icon(SparklesIcon);
export const Square = icon(StopIcon);
export const SquareCheck = icon(CheckmarkSquare02Icon);
export const Star = icon(StarIcon);
export const StarOff = icon(StarOffIcon);
export const Sun = icon(Sun03Icon);
export const Table = icon(Table01Icon);
export const Tag = icon(Tag01Icon);
export const Terminal = icon(ComputerTerminalIcon);
export const ThumbsDown = icon(ThumbsDownIcon);
export const ThumbsUp = icon(ThumbsUpIcon);
export const Trash = icon(Delete02Icon);
export const TrendingDown = icon(TrendingDownIcon);
export const TrendingUp = icon(TrendingUpIcon);
export const TriangleAlert = icon(Alert02Icon);
export const Truck = icon(DeliveryTruck01Icon);
export const Undo = icon(UndoIcon);
export const Upload = icon(Upload01Icon);
export const UserPlus = icon(UserAdd01Icon);
export const Users = icon(UserGroupIcon);
export const Video = icon(RecordIcon);
export const Webhook = icon(WebhookIcon);
export const X = icon(Cancel01Icon);
export const Zap = icon(FlashIcon);
