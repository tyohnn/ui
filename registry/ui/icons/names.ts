import type { ComponentProps, ReactNode } from "react";

/**
 * Semantic icon names: what an icon means where registry/ui (and the preview template) uses it, not
 * which glyph draws it. Every file in ./libraries exports each name as a component; the per-library
 * glyphs follow shadcn's IconPlaceholder mappings (apps/v4/registry/bases/base) except the radix
 * column, which shadcn does not map (see DESIGN.md, Icons).
 *
 * A name only exists because some call site needs a different glyph than another: `SelectIndicator`
 * and the `Calendar*` chevrons are separate because shadcn draws them differently in tabler/hugeicons.
 */
export const ICON_NAMES = [
    "ArrowDown", // scroll to the latest message
    "Bell", // notifications (preview template)
    "CalendarChevronDown", // calendar caption dropdown
    "CalendarChevronLeft", // calendar previous month
    "CalendarChevronRight", // calendar next month
    "ChartLine", // reports / analytics (preview template)
    "Check", // checked item or box
    "ChevronDown", // disclosure open / scroll down
    "ChevronLeft", // previous
    "ChevronRight", // next / submenu / breadcrumb separator
    "ChevronUp", // disclosure close / scroll up
    "CircleCheck", // success status
    "Download", // download / export (preview template)
    "Info", // info status
    "LayoutGrid", // overview / grid view (preview template)
    "Loader", // loading (spins)
    "Minus", // separator between OTP groups
    "MoreHorizontal", // more items / overflow
    "OctagonX", // error status
    "PanelLeft", // toggle the sidebar
    "Plus", // add / create (preview template)
    "Search", // search field
    "SelectIndicator", // select trigger (opens a list)
    "TriangleAlert", // warning status
    "Users", // people / team (preview template)
    "X", // close / clear
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** Every icon takes SVG props; `className` sizes it (CSS decides the size) and `strokeWidth` applies where the library draws strokes. */
export type IconProps = Omit<ComponentProps<"svg">, "children">;

export type IconComponent = (props: IconProps) => ReactNode;
