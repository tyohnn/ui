import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./fonts/fonts.css";

import { templates } from "./templates";

const params = new URLSearchParams(location.search);
const name = params.get("template") ?? "component-sheet";
const Template = templates[name];

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {Template ? <Template /> : <p>Unknown template “{name}”. Known: {Object.keys(templates).join(", ")}</p>}
    </StrictMode>,
);
