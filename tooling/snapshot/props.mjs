// The computed properties every snapshot comparison reads, and the displays whose `width` is layout
// (a block fills its container, so its width says nothing about the component).

export const PROPS = [
    "color", "background-color", "background-image",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
    "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
    "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
    "box-shadow",
    "padding-top", "padding-right", "padding-bottom", "padding-left",
    "margin-top", "margin-right", "margin-bottom", "margin-left",
    "row-gap", "column-gap",
    "height", "width",
    "font-size", "font-weight", "line-height", "letter-spacing",
    "opacity",
    "outline-color", "outline-style", "outline-width", "outline-offset",
    "text-transform",
];

export const BLOCK_DISPLAYS = ["block", "flex", "grid", "table", "list-item", "flow-root"];
