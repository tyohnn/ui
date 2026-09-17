/**
 * The coverage sections by group, in page order: data only (no React), so the site can list them without
 * importing the components. coverage/index.tsx checks this list against the sections it renders and throws
 * on any difference, so the two cannot drift.
 */
export const COVERAGE_GROUPS = [
    { id: "basics", label: "Basics", sections: ["button", "badge", "kbd-spinner-separator", "toggle", "button-group", "direction"] },
    { id: "forms", label: "Forms", sections: ["input-textarea", "checkbox-radio-switch", "field", "input-group", "input-otp", "native-select", "select"] },
    {
        id: "display",
        label: "Display",
        sections: ["alert", "avatar", "card", "empty", "item", "marker", "table", "scroll-area", "accordion-collapsible", "tabs", "breadcrumb-pagination"],
    },
    { id: "data", label: "Data", sections: ["calendar", "chart", "carousel", "resizable", "sidebar"] },
    {
        id: "overlays",
        label: "Overlays",
        sections: ["dialog", "alert-dialog", "alert-dialog-sm", "sheet", "sheet-left", "sheet-top", "sheet-bottom", "drawer", "drawer-right", "popover", "hover-card", "tooltip"],
    },
    {
        id: "menus",
        label: "Menus",
        sections: ["dropdown-menu", "context-menu", "menubar", "combobox", "combobox-groups", "combobox-chips", "command", "command-dialog", "navigation-menu"],
    },
    { id: "chat", label: "Chat", sections: ["bubble", "message", "message-scroller", "attachment", "questionnaire", "toast", "sonner"] },
] as const;

/** Sections that open a popup (portalled outside the section) when rendered alone */
export const COVERAGE_POPUP_SECTIONS: readonly string[] = [
    "select", "dialog", "alert-dialog", "alert-dialog-sm", "sheet", "sheet-left", "sheet-top", "sheet-bottom", "drawer", "drawer-right", "popover",
    "hover-card", "tooltip", "dropdown-menu", "context-menu", "menubar", "combobox", "combobox-groups", "combobox-chips", "command-dialog",
    "navigation-menu", "toast", "sonner",
];
