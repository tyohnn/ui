import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The started system's fonts (system.json fonts → registry/fonts → fontsource / npm CSS), self-hosted.
import "virtual:tyohnn-fonts";
import { iconLibrary, system } from "virtual:tyohnn-system";

import { templates } from "./templates";

document.documentElement.dataset.iconLibrary = iconLibrary;

// Framed (the site embeds every template), nothing inside a frame may move the page around it:
// - an open dialog or menu focuses itself, and focus inside a frame scrolls the page to the frame;
// - a menu or list scrolls its highlighted item into view, which scrolls every ancestor, the page included;
// - a coverage frame's own document must not scroll either, or a wheel over it scrolls an invisible page
//   instead of reaching the site (the site sizes those frames to what they draw; screens keep their scroll).
if (window.self !== window.top)
{
    const focus = HTMLElement.prototype.focus;

    HTMLElement.prototype.focus = function (options?: FocusOptions)
    {
        focus.call(this, { ...options, preventScroll: true });
    };

    Element.prototype.scrollIntoView = function (arg?: boolean | ScrollIntoViewOptions)
    {
        // Scroll the nearest scrollable ancestor inside this document only.
        const alignTop = arg === true || (typeof arg === "object" && arg.block === "start");

        for (let node = this.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement)
        {
            const { overflowY } = getComputedStyle(node);

            if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight)
            {
                const item = this.getBoundingClientRect();
                const box = node.getBoundingClientRect();

                if (alignTop || item.top < box.top) node.scrollTop += item.top - box.top;
                else if (item.bottom > box.bottom) node.scrollTop += item.bottom - box.bottom;

                return;
            }
        }
    };

    if (new URLSearchParams(location.search).get("template") === "coverage") document.documentElement.style.overflow = "hidden";
}

const params = new URLSearchParams(location.search);
const name = params.get("template") ?? "component-sheet";
const Template = templates[name];
const requested = document.documentElement.dataset.system;

/**
 * Fonts and the icon library are fixed when the dev server or build starts; `?system=` only swaps the
 * stylesheet. A mismatch renders the other system's CSS with this system's fonts, so say so. Fixed
 * position, so the template's layout is unchanged.
 */
const Mismatch = () => (
    <div
        role="alert"
        data-preview-banner="system-mismatch"
        style={{ position: "fixed", insetInline: 0, top: 0, zIndex: 2147483647, padding: "6px 12px", background: "#facc15", color: "#111", font: "500 12px/16px system-ui, sans-serif" }}
    >
        ?system={requested} but this preview was started for “{system}”: fonts and icons ({iconLibrary}) are {system}’s. Restart with SYSTEM={requested}.
    </div>
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {requested !== system && <Mismatch />}
        {Template ? <Template /> : <p>Unknown template “{name}”. Known: {Object.keys(templates).join(", ")}</p>}
    </StrictMode>,
);
