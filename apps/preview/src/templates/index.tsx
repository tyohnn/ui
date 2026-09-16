import type { ComponentType } from "react";

import { ComponentSheet } from "./component-sheet";
import { Coverage } from "./coverage";
import { IconSheet } from "./icons";

/** `?section=<name>` renders one coverage section with its popups open (see coverage/index.tsx). */
const CoverageTemplate = () => <Coverage section={new URLSearchParams(location.search).get("section")} />;

export const templates: Record<string, ComponentType> = {
    "component-sheet": ComponentSheet,
    coverage: CoverageTemplate,
    icons: IconSheet,
};
