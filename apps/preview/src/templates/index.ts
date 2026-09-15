import type { ComponentType } from "react";

import { ComponentSheet } from "./component-sheet";
import { IconSheet } from "./icons";

export const templates: Record<string, ComponentType> = {
    "component-sheet": ComponentSheet,
    icons: IconSheet,
};
