import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The started system's fonts (system.json fonts → registry/fonts → fontsource / npm CSS), self-hosted.
import "virtual:tyohnn-fonts";
import { system } from "virtual:tyohnn-system";

import { templates } from "./templates";

const params = new URLSearchParams(location.search);
const name = params.get("template") ?? "component-sheet";
const Template = templates[name];
const requested = document.documentElement.dataset.system;

/**
 * Fonts are fixed when the dev server or build starts; `?system=` only swaps the
 * stylesheet. A mismatch renders the other system's CSS with this system's fonts, so say so. Fixed
 * position, so the template's layout is unchanged.
 */
const Mismatch = () => (
    <div
        role="alert"
        data-preview-banner="system-mismatch"
        style={{ position: "fixed", insetInline: 0, top: 0, zIndex: 2147483647, padding: "6px 12px", background: "#facc15", color: "#111", font: "500 12px/16px system-ui, sans-serif" }}
    >
        ?system={requested} but this preview was started for “{system}”: fonts are {system}’s. Restart with SYSTEM={requested}.
    </div>
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {requested !== system && <Mismatch />}
        {Template ? <Template /> : <p>Unknown template “{name}”. Known: {Object.keys(templates).join(", ")}</p>}
    </StrictMode>,
);
