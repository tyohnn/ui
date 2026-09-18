// write-schema — regenerate registry/schema/theme.schema.json from the palette in @tyohnn/theme.
//
//   node tooling/theme/write-schema.mjs
//
// The palette is code, not a document: the schema is derived so the two can never drift. A base or an
// accent is a partial theme (`extends` fills the rest), so no colour is required by the schema itself —
// completeness is checked on the resolved theme by validate-system, which uses checkTheme().

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { repoRoot } from "@tyohnn/build-system/registry";
import { PALETTE, PALETTE_GROUPS } from "@tyohnn/theme";

const colours = {
    type: "object",
    additionalProperties: false,
    description: `A colour per palette name (${PALETTE.length} in a complete theme): ${Object.entries(PALETTE_GROUPS).map(([group, names]) => `${group} ${names.length}`).join(" · ")}`,
    properties: Object.fromEntries(PALETTE.map((name) => [name, { type: "string", minLength: 1 }])),
};

const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://tyohnn.dev/schema/theme.schema.json",
    title: "tyohnn theme",
    description: "registry/themes/<id>.json — one set of colour values, wearable by any system",
    type: "object",
    required: ["name", "title", "light", "dark"],
    additionalProperties: false,
    properties: {
        $schema: { type: "string" },
        name: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$", description: "Equals the file name without .json" },
        title: { type: "string", minLength: 1 },
        source: {
            type: "object",
            required: ["kind"],
            additionalProperties: false,
            properties: {
                kind: { enum: ["shadcn", "system", "custom"] },
                note: { type: "string" },
            },
        },
        extends: {
            type: "object",
            additionalProperties: false,
            description: "Layers applied before this theme's own values, in this order",
            properties: {
                base: { type: "string", description: "registry/themes/bases/<id>.json — the neutral ramp" },
                accent: { type: "string", description: "registry/themes/accents/<id>.json — primary, secondary and the sidebar accent" },
                chart: { type: "string", description: "registry/themes/accents/<id>.json — the chart ramp only" },
            },
        },
        light: colours,
        dark: colours,
        material: {
            type: "object",
            description: "Optional material tints (clay · glow). A system that draws flat surfaces ignores them.",
            additionalProperties: {
                type: "object",
                required: ["light", "dark"],
                additionalProperties: false,
                properties: { light: { type: "string" }, dark: { type: "string" } },
            },
        },
    },
};

const path = join(repoRoot, "registry/schema/theme.schema.json");

writeFileSync(path, `${JSON.stringify(schema, null, 4)}\n`);
console.log(`wrote registry/schema/theme.schema.json (${PALETTE.length} palette names)`);
